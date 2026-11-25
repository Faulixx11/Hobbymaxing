import {esc,icon,route,link,normalize,pageHead,empty} from './ui.js';
import {attempt,mastery,recordLesson,markActivity} from './state.js';

export const stepTypes = {
  choice:'Antwort auswählen',multi:'Mehrere Antworten auswählen',text:'Antwort eingeben',order:'Reihenfolge herstellen',reflect:'Praxisaufgabe'
};

export function orderSeed(size, expected) {
  const order = Array.from({length:size},(_,index) => index);
  if (order.every((item,index) => item === expected[index])) order.reverse();
  return order;
}

export function verifyStep(step, response) {
  switch (step.type) {
    case 'choice': return Number.isInteger(response) && response === step.answer;
    case 'multi': return Array.isArray(response) && [...new Set(response)].sort().join('|') === [...step.answer].sort().join('|');
    case 'order': return Array.isArray(response) && response.join('|') === step.answer.join('|');
    case 'text': return typeof response === 'string' && step.answer.some(valid => normalize(valid) === normalize(response));
    case 'reflect': return typeof response?.note === 'string' && response.note.trim().length >= 8 && response.checks === step.criteria.length;
    default: return false;
  }
}

function exercise(step, order) {
  if (step.type === 'choice' || step.type === 'multi') {
    return `<div class="choice-list" role="${step.type === 'choice' ? 'radiogroup' : 'group'}" aria-labelledby="step-title">${step.options.map((option,index) => `<label class="choice"><input name="answer" type="${step.type === 'choice' ? 'radio' : 'checkbox'}" value="${index}"><span>${esc(option)}</span></label>`).join('')}</div>`;
  }
  if (step.type === 'text') return '<label class="field">Deine Antwort<input name="text" maxlength="200" autocomplete="off" required></label>';
  if (step.type === 'order') {
    return `<ol class="reorder-list">${order.map((original,index) => `<li class="list-row" draggable="true" data-drag="${index}"><span>${esc(step.options[original])}</span><span class="reorder-controls"><button type="button" class="button compact outline" data-move="-1" data-index="${index}" aria-label="${esc(step.options[original])} nach oben" ${index ? '' : 'disabled'}>↑</button><button type="button" class="button compact outline" data-move="1" data-index="${index}" aria-label="${esc(step.options[original])} nach unten" ${index < order.length - 1 ? '' : 'disabled'}>↓</button></span></li>`).join('')}</ol><p class="small muted">Verschiebe die Zeilen mit den Tasten ↑ und ↓ oder ziehe sie mit der Maus.</p>`;
  }
  return `<div class="choice-list" role="group" aria-label="Praxiskriterien">${step.criteria.map(item => `<label class="choice"><input name="criterion" type="checkbox"><span>${esc(item)}</span></label>`).join('')}</div><label class="field">Was hast du beobachtet?<textarea name="note" minlength="8" maxlength="2000" required></textarea></label>`;
}

function readAnswer(form, step, order) {
  const data = new FormData(form);
  if (step.type === 'choice') return data.has('answer') ? Number(data.get('answer')) : null;
  if (step.type === 'multi') return data.getAll('answer').map(Number);
  if (step.type === 'text') return String(data.get('text') || '');
  if (step.type === 'order') return order;
  return {checks:data.getAll('criterion').length,note:String(data.get('note') || '')};
}

function describeAnswer(step,response) {
  if (step.type === 'choice') return step.options[response];
  if (step.type === 'multi' || step.type === 'order') return response.map(index => step.options[index]).join(' / ');
  if (step.type === 'text') return response;
  return 'Kriterien noch offen';
}

export function mountLesson(root,{hobby,index,mode,stepIndex,state,save,go,notify}) {
  const lesson = hobby?.lessons?.[index];
  if (!lesson) {
    root.innerHTML = empty('Lektion nicht gefunden','Wähle einen verfügbaren Lernpfad.',link('Entdecken','explore','primary'));
    return;
  }
  const placement = mode === 'placement';
  const review = mode === 'review';
  const sequence = placement ? lesson.steps.map((step,index) => ({step,index})).filter(({step}) => step.type !== 'reflect').slice(0,3)
    : review ? lesson.steps.map((step,index) => ({step,index})).filter(item => item.index === stepIndex)
      : lesson.steps.map((step,index) => ({step,index}));
  if ((placement && sequence.length < 2) || !sequence.length) {
    root.innerHTML = empty('Diese Übung ist nicht verfügbar','Öffne den Lernpfad für passende Aufgaben.',link('Zum Lernpfad','hobby/'+hobby.id,'primary'));
    return;
  }
  let cursor = review || placement ? 0 : -1;
  let order = [];
  let result = '';
  let dragging = -1;
  let first = false;
  let mistake = false;
  const start = Date.now();
  const lessonKey = hobby.id + ':' + index;
  const back = review ? 'review' : 'hobby/' + hobby.id;

  function display() {
    const item = sequence[cursor];
    const complete = cursor >= sequence.length;
    const percent = Math.max(0,Math.min(100,Math.round((cursor + (result === 'good' ? 1 : 0)) / sequence.length * 100)));
    root.innerHTML = `<div class="lesson"><div class="lesson-top"><a class="icon-button" href="${route(back)}" aria-label="Zurück">${icon('close')}</a><div class="progress" role="progressbar" aria-label="Lektionsfortschritt" aria-valuenow="${percent}"><span style="width:${percent}%"></span></div><span class="small muted">${complete ? sequence.length : Math.max(0,cursor+1)} / ${sequence.length}</span></div>
      ${complete ? `<section class="surface exercise"><span class="round-icon">${icon('check',27)}</span><h1 tabindex="-1">${placement ? (mistake ? 'Einstufung ausgewertet' : 'Grundlage beherrscht') : review ? 'Wiederholt!' : 'Lektion abgeschlossen!'}</h1><p>${placement ? (mistake ? 'Die Grundlagenlektion ist ein guter nächster Schritt.' : 'Du kannst diese Einstiegslektion überspringen. Dein Ergebnis bleibt als Einstufung gespeichert.') : esc(lesson.goal)}</p><div class="tags">${first && state.settings.xpVisible ? '<span class="tag accent">+25 XP</span>' : ''}<span class="tag">${placement ? 'Einstufung' : review ? 'Neue Wiederholung geplant' : 'Fortschritt gespeichert'}</span></div><div class="actions">${link(review ? 'Zum Wiederholungszentrum' : 'Zum Lernpfad',back,'primary')}${!review ? link('Zur Übersicht','dashboard','outline') : ''}</div></section>`
      : cursor < 0 ? `<section class="surface exercise"><span class="eyebrow">${esc(hobby.name)} · Lernziel</span><h1 tabindex="-1">${esc(lesson.title)}</h1><p><strong>${esc(lesson.goal)}</strong></p><p>${esc(lesson.intro)}</p><button class="button primary" type="button" data-learn="next">${icon('play',16)}Übung starten</button></section>`
      : `<section class="surface exercise"><span class="eyebrow">${placement ? 'Einstufung' : review ? 'Wiederholung' : ['Geführte Interaktion','Eigenständige Übung','Transfer'][Math.min(cursor,2)]} · ${esc(stepTypes[item.step.type])}</span><h1 id="step-title" tabindex="-1">${esc(item.step.prompt)}</h1>
      <form id="lesson-form">${exercise(item.step,order)}<div id="exercise-feedback" class="feedback" tabindex="-1" role="status" hidden></div><div class="actions"><button type="submit" class="button primary" id="answer-submit">${item.step.type === 'reflect' ? 'Reflexion speichern' : 'Antwort prüfen'}</button><button type="button" class="button outline" data-learn="hint" aria-controls="lesson-hint" aria-expanded="false">${icon('help',17)} Hinweis</button><button type="button" class="button primary" data-learn="next" id="lesson-next" hidden>Weiter</button></div><div id="lesson-hint" class="feedback" hidden><strong>Lernbegleiter</strong><p>${esc(item.step.hint || lesson.intro)}</p>${(state.skills[lessonKey+':'+item.index]?.errors?.length ?? 0) > 1 && item.step.type !== 'reflect' ? `<p class="small">Bisherige Fehlversuche: ${esc(state.skills[lessonKey+':'+item.index].errors.join(' · '))}</p>` : ''}</div></form></section>`}</div>`;
    root.querySelector('[draggable]')?.parentElement.addEventListener('dragstart',event => {
      const target = event.target.closest('[data-drag]');
      if (!target || result === 'good') return;
      dragging = Number(target.dataset.drag);
      event.dataTransfer?.setData('text/plain',String(dragging));
    });
    root.querySelector('.reorder-list')?.addEventListener('dragover',event => event.preventDefault());
    root.querySelector('.reorder-list')?.addEventListener('drop',event => {
      event.preventDefault();
      const target = event.target.closest('[data-drag]');
      if (target && dragging >= 0 && result !== 'good') move(dragging,Number(target.dataset.drag));
      dragging = -1;
    });
    root.querySelector('#lesson-form')?.addEventListener('submit',submit);
  }

  function prepare(focus = true) {
    result = '';
    const step = sequence[cursor]?.step;
    order = step?.type === 'order' ? orderSeed(step.options.length,step.answer) : [];
    display();
    if (focus) root.querySelector('h1')?.focus({preventScroll:true});
  }
  function move(from,to) {
    if (to < 0 || to >= order.length || from === to) return;
    order.splice(to,0,order.splice(from,1)[0]);
    result = '';
    display();
    const buttons = root.querySelectorAll(`button[data-index="${to}"]:not([disabled])`);
    buttons[0]?.focus();
  }
  function feedback(message,kind) {
    const panel = root.querySelector('#exercise-feedback');
    panel.className = 'feedback ' + kind;
    panel.textContent = message;
    panel.hidden = false;
    panel.focus({preventScroll:true});
  }
  function submit(event) {
    event.preventDefault();
    if (result === 'good') return;
    const {step,index:originalIndex} = sequence[cursor];
    const form = event.currentTarget;
    const answer = readAnswer(form,step,order);
    if (answer === null || (step.type === 'multi' && !answer.length)) {
      feedback('Wähle zuerst eine Antwort aus.','wrong');
      return;
    }
    const correct = verifyStep(step,answer);
    attempt(state,lessonKey + ':' + originalIndex,correct,describeAnswer(step,answer));
    save();
    result = correct ? 'good' : 'wrong';
    if (correct) {
      feedback(step.feedback || (step.type === 'reflect' ? 'Deine Kriterien und Reflexion sind gespeichert.' : 'Richtig.'),'good');
      if (step.type === 'reflect') {
        state.hobbyNotes[hobby.id] = {...state.hobbyNotes[hobby.id],note:answer.note};
        save();
      }
      for (const field of form.querySelectorAll('input,textarea,[data-move]')) field.disabled = true;
      root.querySelector('#answer-submit').hidden = true;
      root.querySelector('#lesson-next').hidden = false;
    } else {
      mistake = true;
      feedback(step.type === 'reflect' ? 'Prüfe die offenen Kriterien und ergänze deine Beobachtung.' : 'Noch nicht richtig. ' + (step.hint || 'Lies die Einführung noch einmal und versuche es erneut.'),'wrong');
    }
  }
  function onClick(event) {
    const button = event.target.closest('[data-learn],[data-move]');
    if (!button || !root.contains(button)) return;
    if (button.hasAttribute('data-move')) {
      const from = Number(button.dataset.index);
      move(from,from + Number(button.dataset.move));
      return;
    }
    if (button.dataset.learn === 'hint') {
      const help = root.querySelector('#lesson-hint');
      help.hidden = !help.hidden;
      button.setAttribute('aria-expanded',String(!help.hidden));
      return;
    }
    if (cursor >= 0 && result !== 'good') return;
    cursor++;
    if (cursor === sequence.length) {
      if (placement) {
        if (!mistake) {
          state.placements[hobby.id] = new Date().toISOString();
          state.evidence['placement:'+hobby.id] = {title:lesson.goal,date:state.placements[hobby.id],kind:'Einstufung'};
        }
      } else if (review) {
        markActivity(state,{hobby:hobby.id,kind:'Wiederholung',title:lesson.title,minutes:Math.max(1,Math.round((Date.now()-start)/60000))});
      } else {
        first = recordLesson(state,hobby,index,lesson,(Date.now()-start)/1000);
        if (first) notify('Fortschritt gespeichert.');
      }
      save();
    }
    prepare();
  }
  prepInitial();
  function prepInitial(){ prepare(false); root.addEventListener('click',onClick); }
  return () => root.removeEventListener('click',onClick);
}

export function reviewPage(state,hobbies) {
  const byId = new Map(hobbies.map(hobby => [hobby.id,hobby]));
  const now = new Date();
  const cards = Object.entries(state.skills).map(([key,skill]) => {
    const [id,lesson,step] = key.split(':');
    const hobby = byId.get(id);
    const active = hobby?.lessons?.[Number(lesson)]?.steps?.[Number(step)];
    return active ? {id,lesson,step,skill,hobby,active,due:+new Date(skill.next) <= +now} : null;
  }).filter(Boolean).sort((a,b) => Number(b.due)-Number(a.due) || a.skill.correct / a.skill.tries - b.skill.correct / b.skill.tries);
  const due = cards.filter(item => item.due).length;
  return pageHead('Wissen festigen','Wiederholen',due ? `${due} fällige Übungen. Wiederhole sie im eigenen Tempo.` : 'Nach deinen ersten Übungen findest du hier Aufgaben zum Auffrischen.') +
    (cards.length ? `<div class="row-list">${cards.map(record => `<div class="list-row"><div><span class="tag ${record.due ? 'accent' : ''}">${esc(mastery(record.skill,now))}</span><strong>${esc(record.hobby.name)}</strong><p class="small muted">${esc(record.active.prompt)}</p><p class="small muted">${record.skill.correct} von ${record.skill.tries} Versuchen korrekt${record.skill.errors.length >= 2 ? ' · Schau dir die bisherigen Fehler im Lernbegleiter an' : ''}</p></div>${link('Wiederholen','lesson/'+record.id+'/'+record.lesson+'/review/'+record.step,'outline','repeat')}</div>`).join('')}</div>` : empty('Noch keine Übungen gespeichert','Bearbeite eine Lektion, um deinen persönlichen Wiederholungsplan zu beginnen.',link('Hobbys entdecken','explore','primary'),'repeat'));
}

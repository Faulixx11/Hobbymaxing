import {action,icon,link,esc,pageHead,empty,dateLabel,localDay,normalize,uid} from './ui.js';
import {allHobbies,hobbyFor,hobbyOptions,field,area,selectMenu,recommendations} from './pages.js';
import {award,markActivity} from './state.js';

export const quests = [
  {id:'photo-light',type:'Einstieg',title:'Drei Richtungen, ein Motiv',hobby:'fotografie',minutes:16,level:'Einstieg',goal:'Erkenne, wie die Lichtrichtung Oberfläche und Form betont.',steps:['Suche einen Gegenstand mit Struktur und nutze ein Fenster als Lichtquelle.','Fotografiere das Motiv mit Licht von vorne, von der Seite und von hinten.','Vergleiche die Schatten und notiere, wo die Struktur am deutlichsten sichtbar ist.'],xp:20},
  {id:'draw-form',type:'Kreativ',title:'Formen mit einer Lichtquelle',hobby:'zeichnen',minutes:20,level:'Grundlagen',goal:'Nutze Schlagschatten für räumliche Skizzen.',steps:['Skizziere eine Kugel, einen Würfel und einen Zylinder.','Markiere eine gemeinsame Lichtrichtung.','Ergänze pro Körper einen Schlagschatten und überprüfe die Richtung.'],xp:20},
  {id:'rhythm',type:'Woche',title:'Ein Takt, zwei Tempi',hobby:'rhythmustraining',minutes:15,level:'Einstieg',goal:'Halte gleichmäßige Abstände in zwei Tempi.',steps:['Klatsche einen Vierertakt und zähle laut mit.','Spiele denselben Takt bei 60 und bei 90 Schlägen pro Minute.','Halte fest, in welchem Tempo dein Rhythmus stabiler war.'],xp:20},
  {id:'discover',type:'Entdeckung',title:'Etwas ganz Neues ausprobieren',hobby:'',minutes:15,level:'Einstieg',goal:'Prüfe, ob ein neuer Themenbereich zu dir passt.',steps:['Wähle im Explorer eine Kategorie, die du selten ausprobierst.','Bearbeite eine Einstiegslektion.','Notiere, welche Anwendung dich besonders interessiert.'],xp:15},
  {id:'retrieve',type:'Wiederholung',title:'Mit Abstand abrufen',hobby:'',minutes:10,level:'Einstieg',goal:'Rufe einen Lerninhalt aus dem Gedächtnis ab.',steps:['Öffne eine Aufgabe im Wiederholungszentrum.','Versuche sie zunächst ohne Hinweis.','Formuliere deine wichtigste Erkenntnis in eigenen Worten.'],xp:15},
  {id:'project-start',type:'Projekt',title:'Mach den ersten Schritt sichtbar',hobby:'',minutes:20,level:'Aufbau',goal:'Plane ein Projekt mit einem überprüfbaren ersten Ergebnis.',steps:['Wähle ein kleines Projekt für ein Hobby.','Lege drei Aufgaben an, die jeweils ein sichtbares Ergebnis haben.','Beginne die erste Aufgabe und dokumentiere den Zwischenstand.'],xp:20}
];
export const templates = [
  {id:'photo-series',title:'Eine Fotoserie entwickeln',steps:['Motiv und verbindende Bildidee auswählen','Drei Perspektiven ausprobieren','Drei Bilder auswählen und Reihenfolge begründen']},
  {id:'first-site',title:'Eine kleine Website bauen',steps:['Seitenstruktur und Ziel aufschreiben','Inhalt und Layout umsetzen','Seite mit Tastatur und am schmalen Bildschirm prüfen']},
  {id:'short-story',title:'Eine Kurzgeschichte schreiben',steps:['Figur, Wunsch und Hindernis festlegen','Eine Schlüsselszene schreiben','Rückmeldung prüfen und den Text überarbeiten']},
  {id:'mini-score',title:'Ein kurzes Musikstück erarbeiten',steps:['Ein Motiv aus vier bis acht Tönen gestalten','Einen Kontrastteil hinzufügen','Beide Teile aufnehmen oder nacheinander spielen']},
  {id:'new-hobby',title:'Ein Hobby ausprobieren',steps:['Ein Thema und Einstiegsmaterial auswählen','Eine Lektion und eine Praxisaufgabe bearbeiten','Entscheiden, was du als Nächstes lernen willst']}
];

const checklist = (items,checked,actionName,id) => `<div class="stack">${items.map((text,index) => `<label class="checkbox"><input type="checkbox" data-check="${actionName}" data-id="${esc(id)}" data-index="${index}" ${checked[index] ? 'checked' : ''}> ${esc(text)}</label>`).join('')}</div>`;
export function questsPage(state) {
  return pageHead('Kleine Etappen','Quests','Konkrete Aufgaben für deine Lernvorhaben. Setze zusätzlich eigene Wochenziele.',action('Wochenziel anlegen','goal-new','primary','plus'))+
  `<div class="stack"><section class="surface"><h2>Wochenziele</h2>${state.goals.length ? `<div class="row-list">${state.goals.map(goal=>`<div class="list-row"><div><strong>${esc(goal.title)}</strong><span class="small muted">${goal.count} / ${goal.target} Einheiten${goal.paused ? ' · Pausiert' : ''}</span></div><div class="actions">${!goal.paused && goal.count<goal.target ? action('Einheit eintragen','goal-progress','outline compact','plus',goal.id) : ''}${action('Bearbeiten','goal-new','outline compact','pen',goal.id)}</div></div>`).join('')}</div>` : '<p class="muted">Trage ein freiwilliges Wochenziel ein. Du kannst es jederzeit pausieren.</p>'}</section><div class="columns">
  ${quests.map(quest=>{const current = state.quest[quest.id] ?? {checks:[]}; const complete = quest.steps.every((_,index) => current.checks[index]);return `<section class="surface stack"><div class="tags"><span class="tag">${esc(quest.type)}</span><span class="tag">Ca. ${quest.minutes} Min.</span><span class="tag">${esc(quest.level)}</span></div><h2>${esc(quest.title)}</h2><p class="muted">${esc(quest.goal)}</p>${checklist(quest.steps,current.checks,'quest',quest.id)}<div class="actions">${quest.hobby ? link('Zum Hobby','hobby/'+quest.hobby,'outline compact') : ''}${current.done ? '<span class="tag accent">Abgeschlossen</span>' : `<button type="button" data-action="quest-done" data-value="${quest.id}" class="button primary compact" ${complete ? '' : 'disabled'}>Quest abschließen</button>`}</div></section>`;}).join('')}</div></div>`;
}
export const goalForm = goal => `<form data-form="goal" class="stack"><input type="hidden" name="id" value="${esc(goal?.id || '')}">${field('Was möchtest du tun?','title',goal?.title,'text','maxlength="120" required')}${field('Einheiten pro Woche','target',goal?.target || 2,'number','min="1" max="99" required')}${goal ? `<label class="checkbox"><input name="paused" type="checkbox" ${goal.paused ? 'checked' : ''}> Ziel pausieren</label>` : ''}<div class="actions"><button class="button primary" type="submit">Speichern</button>${goal ? action('Fortschritt zurücksetzen','goal-restart','outline','repeat',goal.id) : ''}</div></form>`;
export function finishQuest(state,id) {
  const current = state.quest[id];
  const quest = quests.find(item => item.id===id);
  if (!current || !quest || current.done || !quest.steps.every((_,index) => current.checks[index])) return false;
  current.done = true;
  award(state,'quest:'+id,quest.xp,{kind:'Quest',title:quest.title,hobby:quest.hobby});
  return true;
}
export function challengesPage(state) {
  return pageHead('In Etappen arbeiten','Challenges','Wähle eine freiwillige Herausforderung und passe deine Etappen an.',action('Eigene Challenge','challenge-edit','primary','plus'))+
  `<div class="stack">${state.challenges.length ? `<div class="columns">${state.challenges.map(item=>`<section class="surface stack"><div class="tags"><span class="tag ${item.done?'accent':''}">${item.done ? 'Abgeschlossen' : item.paused ? 'Pausiert' : 'Aktiv'}</span>${item.day ? `<span class="tag">Bis ${esc(dateLabel(item.day))}</span>` : ''}</div><h2>${esc(item.title)}</h2><p class="muted">${item.tasks.filter(x=>x.done).length} / ${item.tasks.length} Etappen</p>${checklist(item.tasks.map(t=>t.title),item.tasks.map(t=>t.done),'challenge',item.id)}<div class="actions">${action('Bearbeiten','challenge-edit','outline compact','pen',item.id)}${!item.done && !item.paused && item.tasks.length && item.tasks.every(t=>t.done) ? action('Abschließen','challenge-done','primary compact','check',item.id) : ''}</div></section>`).join('')}</div>` : ''}<section class="surface"><h2>Ideen für deine nächste Challenge</h2><div class="row-list">${templates.map(item=>`<div class="list-row"><div><strong>${esc(item.title)}</strong><p class="small muted">${esc(item.steps[0])}</p></div>${action('Starten','challenge-template','outline compact','play',item.id)}</div>`).join('')}</div></section></div>`;
}
export const taskLines = list => list?.map(item=>item.title).join('\n') || '';
export const taskList = (value,previous = []) => [...new Set(String(value || '').split('\n').map(item=>item.trim().slice(0,255)).filter(Boolean))].slice(0,60).map(title=>({title,done:previous.find(t=>t.title===title)?.done===true}));
export const challengeForm = item => `<form data-form="challenge" class="stack"><input name="id" type="hidden" value="${esc(item.id || '')}">${field('Titel','title',item.title,'text','maxlength="180" required')}${field('Optionales Zieldatum','day',item.day,'date')}${area('Etappen, je eine Zeile','tasks',taskLines(item.tasks),8000)}<label class="checkbox"><input name="paused" type="checkbox" ${item.paused?'checked':''}> Challenge pausieren</label><div class="actions"><button class="button primary" type="submit">Speichern</button>${item.id ? action('Löschen','delete-row','danger','close','challenges:'+item.id) : ''}</div></form>`;
export function projectsPage(state) {
  return pageHead('Ideen verwirklichen','Projekte','Plane eigene Vorhaben, sammle Material und hake deine Arbeitsschritte ab.',action('Neues Projekt','project-new','primary','plus'))+
  (state.projects.length ? `<div class="columns">${state.projects.map(item=>{
    const done = item.tasks.filter(t=>t.done).length;
    const progress = item.tasks.length ? Math.round(done/item.tasks.length*100) : (item.status==='done'?100:0);
    return `<section class="surface stack"><div class="tags"><span class="tag ${item.status==='done'?'accent':''}">${{done:'Abgeschlossen',active:'Aktiv',paused:'Pausiert'}[item.status]}</span>${item.hobby ? `<span class="tag">${esc(hobbyFor(state,item.hobby)?.name || '')}</span>` : ''}</div><h2>${esc(item.title)}</h2>${item.description ? `<p>${esc(item.description)}</p>` : ''}${item.day ? `<p class="small muted">Zieltermin · ${esc(dateLabel(item.day))}</p>` : ''}<div class="progress" role="progressbar" aria-valuenow="${progress}" aria-label="Projektfortschritt"><span style="width:${progress}%"></span></div>${checklist(item.tasks.map(t=>t.title),item.tasks.map(t=>t.done),'project',item.id)}${item.materials ? `<p class="small muted">Material · ${esc(item.materials)}</p>` : ''}${item.notes ? `<p class="small muted">Notiz · ${esc(item.notes)}</p>` : ''}<div class="actions">${action('Bearbeiten','project-edit','outline compact','pen',item.id)}${item.status==='active' && item.tasks.length && item.tasks.every(t=>t.done) ? action('Abschließen','project-done','primary compact','check',item.id) : ''}</div></section>`;
  }).join('')}</div>` : empty('Was möchtest du ausprobieren?','Deine Projekte erscheinen hier mit Aufgaben, Materialien und Fortschritt.',action('Projekt anlegen','project-new','primary','plus'),'folder'));
}
export const projectForm = (state,item) => `<form class="stack" data-form="project"><input name="id" type="hidden" value="${esc(item.id || '')}">${field('Titel','title',item.title,'text','required maxlength="180"')}${area('Beschreibung','description',item.description)}<div class="form-grid">${selectMenu('Hobby','hobby',hobbyOptions(state),item.hobby)}${field('Optionales Zieldatum','day',item.day,'date')}${field('Material','materials',item.materials,'text','maxlength="1000"')}${selectMenu('Status','status',[['active','Aktiv'],['paused','Pausiert']],item.status==='done'?'active':item.status || 'active')}</div>${area('Aufgaben und Meilensteine, je eine Zeile','tasks',taskLines(item.tasks),8000)}${area('Notizen','notes',item.notes)}<div class="actions"><button class="button primary" type="submit">Speichern</button>${item.id ? action('Löschen','delete-row','danger','close','projects:'+item.id) : ''}</div></form>`;
export function completeProject(state,item) {
  if (item.status !== 'active' || !item.tasks.length || !item.tasks.every(task=>task.done)) return false;
  item.status = 'done';
  award(state,'project:'+item.id,40,{title:item.title,hobby:item.hobby,kind:'Projekt'});
  state.evidence['project:'+item.id] = {title:item.title,date:new Date().toISOString(),kind:'Abgeschlossenes Projekt'};
  return true;
}

function shifted(date,days) {
  const d = new Date(date+'T12:00:00');
  d.setDate(d.getDate()+days);
  return localDay(d);
}
const monday = value => shifted(value,-((new Date(value+'T12:00:00').getDay()+6)%7));
export function calendarShift(date,view,direction) {
  if (view !== 'month') return shifted(date,direction*(view==='week'?7:1));
  const next = new Date(date+'T12:00:00');
  next.setDate(1);
  next.setMonth(next.getMonth()+direction);
  return localDay(next);
}
export function eventsOn(events,date) {
  return events.filter(item=>item.day===date || (item.repeat && item.day<date && (Date.parse(date)-Date.parse(item.day))%604800000===0)).sort((a,b)=>a.time.localeCompare(b.time));
}
export function calendarPage(state,{day,view}) {
  const dates = view === 'day' ? [] : Array.from({length:view==='month'?42:7},(_,index)=>shifted(monday(view==='month'?day.slice(0,7)+'-01':day),index));
  const when = view==='month' ? dateLabel(day,{month:'long',year:'numeric'}) : view==='week' ? dateLabel(dates[0])+' bis '+dateLabel(dates.at(-1)) : dateLabel(day);
  const events = eventsOn(state.events,day);
  const suggestion = recommendations(state)[0];
  return pageHead('Deine freie Zeit','Kalender','Plane Lernzeiten und Projekte in deinem eigenen Rhythmus.',action('Termin anlegen','event-new','primary','plus',day))+
    `<div class="stack"><section class="surface"><div class="cal-toolbar"><div class="actions">${action('Zurück','cal-shift','outline compact','','-1')}${action('Heute','cal-today','outline compact')}${action('Weiter','cal-shift','outline compact','','1')}</div><strong>${esc(when)}</strong><div class="chip-row">${[['month','Monat'],['week','Woche'],['day','Tag']].map(([key,text])=>`<button class="chip" data-action="cal-view" data-value="${key}" type="button" aria-pressed="${view===key}">${text}</button>`).join('')}</div></div>
    ${dates.length ? `<div class="calendar">${['Mo','Di','Mi','Do','Fr','Sa','So'].map(label=>`<div class="weekday">${label}</div>`).join('')}${dates.map(date=>`<button type="button" class="day${date.slice(0,7)!==day.slice(0,7) && view==='month' ? ' off' : ''}" data-action="cal-select" data-value="${date}" aria-label="${esc(dateLabel(date))}, ${eventsOn(state.events,date).length} Termine" aria-pressed="${date===day}"><strong>${Number(date.slice(-2))}</strong>${eventsOn(state.events,date).slice(0,2).map(event=>`<small>${esc(event.title)}</small>`).join('')}</button>`).join('')}</div>` : ''}
    </section><div class="columns"><section class="surface"><h2>${esc(dateLabel(day))}</h2>${events.length ? `<div class="row-list">${events.map(item=>`<div class="list-row"><div><strong>${esc(item.title)}</strong><span class="small muted">${esc(item.time || 'Ganztägig')}${item.repeat ? ' · Wöchentlich' : ''}${item.hobby ? ' · '+esc(hobbyFor(state,item.hobby)?.name || '') : ''}</span></div>${action('Bearbeiten','event-edit','outline compact','pen',item.id)}</div>`).join('')}</div>` : '<p class="muted">Für diesen Tag sind noch keine Aktivitäten geplant.</p>'}</section>
    ${suggestion ? `<section class="surface"><h2>Ein Vorschlag für dich</h2><p>${esc(suggestion.name)} · ca. ${suggestion.minutes} Minuten</p><div class="actions">${action('Einplanen','event-suggestion','outline','calendar',suggestion.id)}</div></section>` : ''}</div></div>`;
}
export const eventForm = (state,item) => `<form class="stack" data-form="event"><input name="id" type="hidden" value="${esc(item.id || '')}">${field('Titel','title',item.title,'text','maxlength="180" required')}<div class="form-grid">${field('Datum','day',item.day,'date','required')}${field('Uhrzeit','time',item.time,'time')}</div>${selectMenu('Hobby','hobby',hobbyOptions(state),item.hobby)}<label class="checkbox"><input name="repeat" type="checkbox" ${item.repeat?'checked':''}> Wöchentlich wiederholen</label><div class="actions"><button type="submit" class="button primary">Speichern</button>${item.id ? action('Löschen','delete-row','danger','close','events:'+item.id) : ''}</div></form>`;
export function journalPage(state,query) {
  const entries = state.journal.filter(item=>normalize(item.title+' '+item.body+' '+(hobbyFor(state,item.hobby)?.name || '')).includes(normalize(query))).sort((a,b)=>b.day.localeCompare(a.day));
  return pageHead('Notizen und Erkenntnisse','Journal','Halte fest, was du ausprobiert hast und was dir als Nächstes einfällt.',action('Neuer Eintrag','journal-new','primary','plus')+action('Journal exportieren','journal-export','outline','folder'))+
    `<div class="stack">${field('Einträge durchsuchen','journal-search',query,'search','id="journal-search"')}<div id="journal-entries">${journalEntries(entries,state)}</div></div>`;
}
export function journalEntries(filtered,state) {
  return filtered.length ? `<div class="columns">${filtered.map(item=>`<article class="surface stack"><div class="tags"><span class="tag">${esc(dateLabel(item.day))}</span>${item.hobby ? `<span class="tag">${esc(hobbyFor(state,item.hobby)?.name || '')}</span>` : ''}</div><h2>${esc(item.title)}</h2><p style="white-space:pre-wrap">${esc(item.body)}</p>${item.image ? `<img class="journal-image" src="${esc(item.image)}" alt="Bild zu ${esc(item.title)}" loading="lazy">` : ''}<div class="actions">${action('Bearbeiten','journal-edit','outline compact','pen',item.id)}</div></article>`).join('')}</div>` : empty('Keine Einträge gefunden','Du kannst einen neuen Eintrag anlegen oder nach einem anderen Begriff suchen.',action('Eintrag schreiben','journal-new','outline','pen'),'pen');
}
export const journalForm = (state,item) => `<form class="stack" data-form="journal"><input name="id" type="hidden" value="${esc(item.id || '')}">${field('Titel','title',item.title,'text','required maxlength="180"')}<div class="form-grid">${field('Datum','day',item.day,'date','required')}${selectMenu('Hobby','hobby',hobbyOptions(state),item.hobby)}</div>${area('Dein Eintrag','body',item.body,8000)}<label class="field">Optionales Bild (JPEG, PNG oder WebP)<input type="file" name="image" accept="image/jpeg,image/png,image/webp"></label>${item.image ? '<label class="checkbox"><input name="removeImage" type="checkbox"> Vorhandenes Bild entfernen</label>' : ''}<p class="small muted" data-form-status role="status"></p><div class="actions"><button type="submit" class="button primary">Speichern</button>${item.id ? action('Löschen','delete-row','danger','close','journal:'+item.id) : ''}</div></form>`;
export async function journalImage(file) {
  if (!file?.size) return '';
  if (!['image/jpeg','image/png','image/webp'].includes(file.type) || file.size>12000000) throw new Error('Wähle ein JPEG-, PNG- oder WebP-Bild bis 12 MB.');
  const bitmap = await createImageBitmap(file).catch(()=>{throw new Error('Das Bild konnte nicht geöffnet werden.');});
  const canvas = document.createElement('canvas');
  const scale = Math.min(1,1000/Math.max(bitmap.width,bitmap.height));
  canvas.width = Math.max(1,Math.round(bitmap.width*scale)); canvas.height = Math.max(1,Math.round(bitmap.height*scale));
  const context = canvas.getContext('2d');
  context.fillStyle = '#fff'; context.fillRect(0,0,canvas.width,canvas.height);
  context.drawImage(bitmap,0,0,canvas.width,canvas.height);
  bitmap.close();
  return canvas.toDataURL('image/jpeg',.76);
}
export function upsert(list,data) {
  const index = list.findIndex(item=>item.id===data.id);
  if (index >= 0) list[index] = data;
  else list.push({...data,id:uid()});
}
export function logPlanActivity(state,title,kind,hobby) {
  markActivity(state,{title,kind,hobby});
}

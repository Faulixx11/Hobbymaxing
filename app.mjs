import {groups,hobbies,byHobby,quests,challenges,journeys} from './catalog.mjs';
import {key,load,localDate,shift,monday,weekGoal,activeDays,streaks,completed,unlocks,level,nextQuest,totalXp,record,badges,leaderboard,encode,decode,validShare,rankId,canPlan} from './state.mjs';

const main=document.querySelector('#main');
const nav=document.querySelector('#nav');
const top=document.querySelector('#top');
const modal=document.querySelector('#modal');
let state=load(localStorage);
let filter={group:'all',query:'',place:'',gear:'',time:'',stage:''};
let toastTimer;
const featured=['fussball','fotografie','kochen','zeichnen','wandern','tennis'];
const groupNames=Object.fromEntries(groups.map(([id,name])=>[id,name]));
const art={wandern:'mountain',fussball:'football',fotografie:'photo',kochen:'cooking'};
const navigation=[['heute','Heute','home'],['entdecken','Entdecken','compass'],['challenges','Challenges','trophy'],['profil','Profil','user']];
const vectors={
  home:'M3 10.5 12 3l9 7.5V21h-6v-6H9v6H3z',compass:'M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0ZM16 8l-2 6-6 2 2-6z',
  trophy:'M7 4h10v6a5 5 0 0 1-10 0zM7 6H3v2a4 4 0 0 0 4 4m10-6h4v2a4 4 0 0 1-4 4m-5 3v5m-5 0h10',
  user:'M16 8a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM4 21v-2a5 5 0 0 1 5-5h6a5 5 0 0 1 5 5v2',
  time:'M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0ZM12 6v6l4 2',
  bolt:'m13 2-9 12h7l-1 8 10-12h-7z', calendar:'M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Zm-2 5h18M8 3v4m8-4v4',
  search:'M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-2 6 5 5', lock:'M7 11V8a5 5 0 0 1 10 0v3M5 11h14v10H5z',check:'m4 12 5 5L20 6'
};
const svg=id=>`<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="${vectors[id]}"/></svg>`;
const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const link=(label,hash,kind='button')=>`<a class="${kind}" href="#${hash}">${label}</a>`;
const btn=(label,action,value='',kind='button')=>`<button type="button" class="${kind}" data-action="${action}" data-value="${esc(value)}">${label}</button>`;
const chip=text=>`<span class="chip">${text}</span>`;
const dateLabel=(day,options={weekday:'short',day:'numeric',month:'short'})=>new Intl.DateTimeFormat('de-DE',options).format(new Date(day+'T12:00:00'));
const named=()=>state.name.trim()||'Du';
const weekRange=week=>`${dateLabel(week,{day:'numeric',month:'short'})} – ${dateLabel(shift(week,6),{day:'numeric',month:'short'})}`;
const dateInput=(value=localDate())=>`<label>Datum <input type="date" name="day" min="${localDate()}" required value="${value}"></label>`;
const titleBlock=(label,title,sub)=>`<div class="page-heading"><p class="eyebrow"><span>✳</span> ${label}</p><h1>${title}</h1><p>${sub}</p></div>`;
const empty=text=>`<p class="empty">${text}</p>`;
function alertUser(message) {
  const toast=document.querySelector('#toast');
  toast.textContent=message;
  toast.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>toast.classList.remove('visible'),3800);
}
function save(change) {
  const latest=load(localStorage);
  const updated=change(latest);
  if (updated===false) return false;
  try { localStorage.setItem(key,JSON.stringify(latest)); }
  catch { alertUser('Der Browser konnte die Änderung nicht speichern.'); return false; }
  state=latest;
  render();
  return true;
}
function pathCard(hobby,{image=false}={}) {
  const hits=hobby.quests.filter(quest=>completed(state,quest.id)).length;
  return `<a class="hobby-card surface" href="#pfad/${hobby.id}">
    <div class="card-art ${hobby.group} ${image&&art[hobby.id]?art[hobby.id]:''}"><span>${hobby.icon}</span></div>
    <div class="card-content"><p class="eyebrow">${groupNames[hobby.group]}</p><h3>${hobby.name}</h3><p>${hobby.skill}</p>
    <div class="card-meta"><span>${svg('time')} ${hobby.quests[0].minutes} Min.</span><span>${hits?hits+' / '+hobby.quests.length+' erledigt':'Level '+level(state,hobby)}</span></div></div></a>`;
}
function weekCard() {
  const today=localDate(), week=monday(today), days=activeDays(state,week), goal=weekGoal(state,week);
  const marks=['Mo','Di','Mi','Do','Fr','Sa','So'].map((label,index)=>{
    const day=shift(week,index), done=days.has(day);
    return `<div class="day"><small>${label}</small><span class="${done?'done':''} ${day===today?'today':''}" aria-label="${dateLabel(day)}${done?', aktiv':''}">${done?'✓':Number(day.slice(-2))}</span></div>`;
  }).join('');
  const plans=state.plans.filter(plan=>plan.day<=shift(week,6)&&!plan.done).sort((a,b)=>a.day.localeCompare(b.day)).slice(0,3);
  return `<section class="surface week"><div class="card-heading"><div class="tile-icon lilac">${svg('calendar')}</div><div><h2>Deine Woche</h2><p>${weekRange(week)}</p></div></div>
    <div class="days">${marks}</div><div class="progress-label"><strong>${days.size} von ${goal} Tagen aktiv</strong><span>${Math.round(Math.min(1,days.size/goal)*100)} %</span></div>
    <progress value="${Math.min(days.size,goal)}" max="${goal}">${days.size}</progress>
    ${plans.length?`<div class="mini-plans">${plans.map(plan=>`<div><a href="#quest/${plan.quest}">${dateLabel(plan.day)} · ${quests[plan.quest].title}</a>${btn('Verschieben','reschedule',plan.id,'text-button')}</div>`).join('')}</div>`:''}
    ${link('Woche planen','woche','button secondary full')}</section>`;
}
function todayPage() {
  const active=state.active.map(id=>byHobby[id]).filter(Boolean);
  const recommended=active.map(hobby=>nextQuest(state,hobby)).find(Boolean);
  const suggested=recommended?byHobby[recommended.hobby]:byHobby.wandern;
  const heroLink=recommended?'quest/'+recommended.id:'entdecken';
  return `<div class="dashboard"><div class="dash-main"><section class="hero mountain">
    <div class="hero-content"><p class="eyebrow"><span>✳</span> ${recommended?'DEIN NÄCHSTER SCHRITT':'DEIN ABENTEUER BEGINNT'}</p><h1>${recommended?esc(recommended.title):'Raus aus dem Alltag.<br><em>Rein ins Abenteuer.</em>'}</h1>
    <p>${recommended?esc(suggested.name+' · '+recommended.minutes+' Min. · '+recommended.steps[0]):'Entdecke neue Hobbys, meistere echte Quests und sammle Erlebnisse.'}</p>
    ${link(recommended?'Quest fortsetzen':'Hobbys entdecken',heroLink,'button primary')}</div><div class="hero-place"><span>✦</span> ${recommended?'DEIN LERNPFAD':'ECHTE ERLEBNISSE'}</div></section>
    <section class="bubble-row" aria-label="Schnellauswahl">${btn(svg('time')+' 10 Minuten','quick','time','pill')}${btn('⌂ &nbsp; Zu Hause','quick','home','pill')}${btn('✦ &nbsp; Etwas Neues','quick','new','pill')}</section>
    <section class="section"><div class="section-title"><div><p class="eyebrow"><span>✦</span> HOBBY-KATALOG</p><h2>${active.length?'Deine Hobbys':'Was willst du heute machen?'}</h2></div>${link('Alle '+hobbies.length+' Hobbys','entdecken','text-button')}</div>
    <div class="hobby-grid">${(active.length?active.slice(0,3):featured.slice(0,3).map(id=>byHobby[id])).map(hobby=>pathCard(hobby,{image:true})).join('')}</div></section>
    </div><aside class="dashboard-aside" aria-label="Woche und Challenge">${weekCard()}
    <section class="challenge-teaser surface"><p class="eyebrow"><span>✦</span> WOCHEN-CHALLENGE</p><div class="challenge-ball" aria-hidden="true">⚽</div><h2>Die Pass-Challenge</h2><p>Zehn Versuche. Wie oft triffst du das Ziel?</p>${link('Challenge ansehen','challenge/challenge-pass','button dark full')}</section></aside></div>`;
}
function filterSelect(name,label,options) {
  return `<label>${label}<select name="${name}"><option value="">Alle</option>${options.map(([value,word])=>`<option value="${value}" ${filter[name]===value?'selected':''}>${word}</option>`).join('')}</select></label>`;
}
function catalogResults() {
  const query=filter.query.trim().toLocaleLowerCase('de');
  const matches=hobbies.filter(hobby=>
    (!query||[hobby.name,hobby.skill,groupNames[hobby.group],hobby.materials,...hobby.quests.map(quest=>quest.title)].join(' ').toLocaleLowerCase('de').includes(query)) &&
    (filter.group==='all'||hobby.group===filter.group) && (!filter.place||hobby.place===filter.place) && (!filter.gear||hobby.gear===filter.gear) &&
    hobby.quests.some(quest=>(!filter.time||quest.minutes<=Number(filter.time))&&(!filter.stage||quest.type===filter.stage)));
  return `<p class="result-count" role="status">${matches.length} ${matches.length===1?'Hobby':'Hobbys'}</p>${matches.length?`<div class="hobby-grid catalog-grid">${matches.map(hobby=>pathCard(hobby)).join('')}</div>`:empty('Keine passenden Hobbys. Ändere einen Filter oder suche nach einem anderen Begriff.') }`;
}
function discoverPage() {
  return `${titleBlock('ENTDECKEN','Finde dein nächstes Hobby.','Wähle etwas, das in deinen Tag passt. Jede Aktivität beginnt mit einer machbaren Quest.')}
    <form id="filters" class="surface filters"><label class="search-label">Suche nach Hobby, Material oder Quest <span class="search-input">${svg('search')}<input type="search" name="query" value="${esc(filter.query)}" placeholder="Zum Beispiel Fotografie oder Papier"></span></label>
    <div class="filters-grid">${filterSelect('time','Zeit',[['10','Bis 10 Min.'],['15','Bis 15 Min.'],['25','Bis 25 Min.']])}${filterSelect('place','Ort',['Zu Hause','Draußen','Drinnen'].map(x=>[x,x]))}${filterSelect('gear','Ausrüstung',['Ohne Ausrüstung','Alltagsmaterial','Mit Ausrüstung'].map(x=>[x,x]))}${filterSelect('stage','Quest-Typ',['Einstieg','Training','Meilenstein','Projekt','Erlebnis'].map(x=>[x,x]))}</div></form>
    <div class="bubble-row category-row">${[['all','Alle'],...groups].map(([id,name])=>`<button class="pill" type="button" aria-pressed="${filter.group===id}" data-action="category" data-value="${id}">${name}</button>`).join('')}</div>
    <section id="results" aria-label="Suchergebnisse">${catalogResults()}</section>`;
}
function pathPage(id) {
  const hobby=byHobby[id];
  if(!hobby) return missing();
  const first=hobby.quests[0], next=nextQuest(state,hobby);
  const active=state.active.includes(id);
  return `<p>${link('Hobby-Katalog','entdecken','text-button')}</p><div class="path-banner surface ${hobby.group}"><span class="path-emoji">${hobby.icon}</span><div><p class="eyebrow">${groupNames[hobby.group]}</p><h1>${hobby.name}</h1><p>${hobby.skill} · Level ${level(state,hobby)}</p></div>${btn(active?'Aus meinen Hobbys entfernen':'Hobby merken','active',id,'button secondary')}</div>
    <section class="section narrow"><div class="section-title"><div><h2>Dein Lernpfad</h2><p>${hobby.quests.length} Quests · ${esc(hobby.materials)}</p></div></div>
    <ol class="path-list">${hobby.quests.map((quest,index)=>{
      const done=completed(state,quest.id), open=unlocks(state,quest), fork=index>1 && hobby.quests.length===4 && index<3;
      return `<li class="path-step ${open?'':'locked'} ${fork?'fork':''}">
        <div class="path-node ${done?'done':''} ${next?.id===quest.id?'next':''}">${done?svg('check'):open?'✦':svg('lock')}</div>
        <div class="surface path-body"><p class="eyebrow">${fork?'ALTERNATIVES TRAINING':quest.type} · ${quest.minutes} Min.</p><h3>${quest.title}</h3><p>${open?esc(quest.result):'Schließe '+(quest.any?'eines der Trainings davor':'die vorherige Quest')+' ab.'}</p>
        ${open?link(done?'Erneut üben':quest===first?'Erste Quest ansehen':'Quest ansehen','quest/'+quest.id,'button '+(quest===next?'primary':'secondary')):''}</div></li>`;
    }).join('')}</ol></section>`;
}
function questPage(id, inviteCode='') {
  const quest=quests[id];
  if(!quest) return missing();
  const hobby=byHobby[quest.hobby];
  const locked=!unlocks(state,quest);
  const planned=state.invites.find(invite=>invite.code===inviteCode&&invite.quest===id);
  if(quest.type==='Challenge'&&!planned) return challengePage(id);
  return `<p>${link('Lernpfad ansehen','pfad/'+hobby.id,'text-button')}</p>${titleBlock(hobby.name+' · '+quest.type,quest.title,quest.steps[0])}
  ${planned?`<div class="notice">Gemeinsame Quest für ${dateLabel(planned.day)}. ${planned.friendDone?'Die andere Person hat sie schon abgeschlossen.':''}</div>`:''}
  <div class="detail-grid"><section class="surface mission">
    ${questInformation(quest,hobby)}
    ${locked?`<div class="notice">Diese Quest wird im Lernpfad freigeschaltet. ${link('Zum Lernpfad','pfad/'+hobby.id,'text-button')}</div>`:
      `${btn('Ergebnis eintragen','finish',id+(planned?'~'+planned.code:''),'button primary')} ${btn('Einplanen','plan',id,'button secondary')} ${btn('Gemeinsam machen','invite',id,'text-button') }`}
  </section><aside class="surface utility"><div class="tile-icon lilac">✦</div><h2>Dein Ergebnis</h2><p>${quest.result}</p><h3>So passt du es an</h3><p>${quest.adapt}</p><h3>Danach</h3><p>${quest===hobby.quests.at(-1)?'Halte deinen Meilenstein fest und wiederhole eine Übung mit denselben Bedingungen.':'Schließe die Übung ab und wähle die nächste verfügbare Quest im Lernpfad.'}</p>${btn('Quest-Link kopieren','copy-quest',quest.id,'text-button')}</aside></div>`;
}
function questInformation(quest,hobby) {
  return `<div class="tags">${chip(svg('time')+' '+quest.minutes+' Min.') }${chip(svg('bolt')+' +'+quest.xp+' XP') }${chip(quest.type)}</div>
  <h2>Was du brauchst</h2><p>${quest.materials||hobby.materials}</p>
  <h2>Was du übst</h2><p>${hobby.skill}. Am Ende hältst du dein Ergebnis fest.</p>
  <h2>So geht’s</h2><ol class="steps">${quest.steps.map(step=>`<li>${esc(step.replace(/[.!?]$/,'')+'.')}</li>`).join('')}</ol>`;
}
function missing() {
  return titleBlock('HOBBYMAXING','Seite nicht gefunden.','Entdecke einen anderen Lernpfad.')+link('Zum Hobby-Katalog','entdecken','button primary');
}

function challengeIndex() {
  return `${titleBlock('CHALLENGES','Zusammen macht’s mehr Spaß.','Wähle eine Wochenaufgabe, sammle ein Ergebnis und vergleiche es mit deinen Freunden.')}
    <p class="notice">${weekRange(monday())} · Trage eigene Ergebnisse ein und importiere Beiträge über geteilte Links. Alle Ergebnisse sind Selbstauskünfte.</p>
    <div class="hobby-grid catalog-grid">${challenges.map(quest=>`<a class="hobby-card surface" href="#challenge/${quest.id}"><div class="card-art ${quest.group}"><span>${quest.icon}</span></div><div class="card-content">
    <p class="eyebrow">${quest.max?'RANGLISTE':'GALERIE'}</p><h3>${quest.title}</h3><p>${quest.result}</p><div class="card-meta"><span>${quest.minutes} Min.</span><span>+${quest.xp} XP</span></div></div></a>`).join('')}</div>
    <section class="section"><h2>Gemeinsame Quests</h2>${invitesList()}</section>`;
}
function challengePage(id) {
  const quest=challenges.find(item=>item.id===id);
  if(!quest) return missing();
  const rows=leaderboard(state,quest);
  const ranking=quest.max>0;
  const previous=rows.length?rows.map((row,index)=>{
    const tied=ranking?rows.findIndex(other=>other.score===row.score)+1:null;
    const value=ranking?row.score+(quest.max===10?' / 10':''):row.result;
    return `<li><span class="rank-number">${ranking?tied:'✦'}</span><strong>${esc(row.name)}${row.mine?' <small>(du)</small>':''}</strong><span>${esc(value)}</span>${row.mine?btn('Teilen','share',row.id,'text-button'):btn('Entfernen','remove-score',rankId(row),'text-button')}</li>`;
  }).join(''):'';
  return `<p>${link('Alle Challenges','challenges','text-button')}</p>${titleBlock('WOCHEN-CHALLENGE',quest.title,weekRange(monday()))}
  <div class="detail-grid"><section class="surface mission">${questInformation(quest,byHobby[quest.hobby])}${btn('Ergebnis eintragen','finish',id,'button primary')} ${btn('Gemeinsam machen','invite',id,'button secondary')}
  <h3>So passt du es an</h3><p>${quest.adapt}</p></section>
  <aside class="surface utility"><div class="tile-icon lilac">${svg('trophy')}</div><h2>${ranking?'Deine private Rangliste':'Deine private Galerie'}</h2><p>${ranking?'Gleiche Bedingungen für alle. Pro Person zählt das beste Ergebnis dieser Woche.':'Hier sammelst du deine eigenen und importierte Beiträge aus dieser Woche.'}</p>
  ${rows.length?`<ol class="ranking">${previous}</ol>`:empty('Hier ist noch Platz für dein erstes Ergebnis.') }${btn('Ergebnislink importieren','import','','button secondary')} ${btn('Challenge-Link kopieren','copy-quest',id,'text-button')}</aside></div>`;
}
function invitesList() {
  return state.invites.length?`<div class="stack">${state.invites.map(invite=>`<article class="surface list-row"><div><h3>${quests[invite.quest].title}</h3><p>${dateLabel(invite.day)} · ${invite.done&&invite.friendDone?'Gemeinsam erledigt':invite.done?'Du bist fertig':invite.friendDone?'Dein Gegenüber ist fertig':'Geplant'}</p></div><div class="actions">${link('Quest ansehen','quest/'+invite.quest+'/'+invite.code,'button secondary')}${btn('Einladung teilen','share-invite',invite.code,'text-button')}${btn('Entfernen','remove-invite',invite.code,'text-button')}</div></article>`).join('')}</div>`:empty('Öffne eine Quest und wähle „Gemeinsam machen“, um einen Einladungslink zu erstellen.');
}
function weekPage() {
  const week=monday(), upcoming=state.plans.slice().sort((a,b)=>a.day.localeCompare(b.day));
  const horizon=weekGoal(state,shift(week,7));
  return `${titleBlock('DEINE WOCHE','Mach Platz für Erlebnisse.','Plane einzelne Quests oder kombiniere Hobbys in einem Wochenvorhaben.')}
    <div class="detail-grid"><section class="surface mission"><h2>Geplante Quests</h2>${upcoming.length?`<ul class="plain-list">${upcoming.map(item=>`<li><div><a href="#quest/${item.quest}">${quests[item.quest].title}</a><p>${dateLabel(item.day)}${item.done?' · erledigt':''}</p></div><div class="actions">${item.done?'':btn('Verschieben','reschedule',item.id,'text-button')}${btn('Entfernen','remove-plan',item.id,'text-button')}</div></li>`).join('')}</ul>`:empty('Noch nichts geplant. Du kannst jede freigeschaltete Quest einplanen.') }${link('Quest finden','entdecken','button secondary')}</section>
    <aside>${weekCard()}<section class="surface utility goal"><h2>Wochenziel</h2><p>Änderungen gelten ab Montag der nächsten Woche.</p><form data-form="goal"><label>Aktive Tage pro Woche<input name="goal" type="number" min="1" max="7" required value="${horizon}"></label><button class="button secondary">Ziel speichern</button></form></section></aside></div>
    <section class="section"><h2>Wochenvorhaben</h2><div class="hobby-grid">${journeys.map(journey=>{
      const started=state.journeys.includes(journey.id);
      const hits=journey.quests.filter(id=>completed(state,id)).length;
      return `<article class="surface utility"><div class="tile-icon lilac">${journey.icon}</div><h3>${journey.title}</h3><p>${journey.text}</p>${started?`<p><strong>${hits} / ${journey.quests.length} erledigt</strong></p><ul>${journey.quests.map(id=>`<li><a href="#quest/${id}">${quests[id].title}</a> ${completed(state,id)?'✓':''}</li>`).join('')}</ul>`:btn('Vorhaben starten','journey',journey.id,'button secondary')}</article>`;
    }).join('')}</div></section>`;
}
function profilePage() {
  const {running,best}=streaks(state);
  const bests=new Map();
  for(const entry of state.entries) {
    if(entry.score===null) continue;
    const id=[entry.quest,entry.version,entry.condition].join('|');
    if(!bests.has(id)||bests.get(id).score<entry.score) bests.set(id,entry);
  }
  return `${titleBlock('DEIN PROFIL',state.name?'Hi, '+esc(state.name)+'.':'Dein Projektbuch.','Hier findest du die Quests, Projekte und persönlichen Bestleistungen, die du gesammelt hast.')}
    <div class="stat-grid"><div class="surface stat"><span>${svg('bolt')} Erfahrung</span><strong>${totalXp(state)} XP</strong></div><div class="surface stat"><span>✦ Aktuelle Wochenserie</span><strong>${running} Wo.</strong></div><div class="surface stat"><span>${svg('trophy')} Beste Wochenserie</span><strong>${best} Wo.</strong></div></div>
    <div class="detail-grid section"><section class="surface mission"><h2>Projektbuch</h2>${state.entries.length?`<ul class="plain-list timeline">${state.entries.map(entry=>`<li><div><small>${dateLabel(entry.day)} · ${quests[entry.quest].type}</small><h3><a href="#quest/${entry.quest}">${quests[entry.quest].title}</a></h3><p>${entry.score==null?'':entry.score+' · '}${esc(entry.result)}</p>${entry.note?`<p>${esc(entry.note)}</p>`:''}</div>${btn('Erfolgskarte','card',entry.id,'text-button')}</li>`).join('')}</ul>`:empty('Schließe deine erste Quest ab. Dann taucht sie hier auf.') }
    <h2>Abgeschlossene Wochenvorhaben</h2>${state.journeys.map(id=>journeys.find(journey=>journey.id===id)).filter(journey=>journey.quests.every(id=>completed(state,id))).map(journey=>`<p>${journey.icon} ${journey.title}</p>`).join('')||empty('Deine fertigen Wochenvorhaben erscheinen hier.')}</section>
    <aside class="surface utility"><h2>Deine Hobbys</h2>${state.active.length?`<ul class="levels">${state.active.map(id=>`<li><a href="#pfad/${id}">${byHobby[id].icon} ${byHobby[id].name}</a><strong>Level ${level(state,byHobby[id])}</strong></li>`).join('')}</ul>`:empty('Noch keine Hobbys gemerkt.')}
    <h2>Abzeichen</h2><ul class="badges">${badges(state).map(([icon,label,has])=>`<li class="${has?'earned':''}"><span>${icon}</span><span>${label}</span><small>${has?'Erhalten':'Offen'}</small></li>`).join('')}</ul>
    <h2>Bestleistungen</h2>${bests.size?`<ul class="levels">${[...bests.values()].map(entry=>`<li><span>${quests[entry.quest].title}<small>${entry.condition==='standard'?'Standardregeln':esc(entry.condition)}</small></span><strong>${entry.score}</strong></li>`).join('')}</ul>`:empty('Messbare Ergebnisse werden nach Bedingungen und Quest-Version verglichen.') }</aside></div>
    <section class="surface utility section narrow"><h2>Profileinstellungen</h2><p>Dein Fortschritt bleibt in diesem Browser. Wenn du eine Erfolgskarte teilst, enthält sie deinen gewählten Anzeigenamen und das Ergebnis. Deine private Notiz bleibt hier.</p><form data-form="profile"><label>Anzeigename <input name="name" maxlength="28" value="${esc(state.name)}" placeholder="Optional"></label><button class="button secondary">Speichern</button></form></section>`;
}
const sources=[
  ['University of Minnesota Extension','4-H-Projektübersicht für die Bandbreite des Katalogs','https://extension.umn.edu/4-h-and-youth/minnesota-4-h/4-h-member-resources/4-h-projects'],
  ['University of Tennessee Extension','Projektbereiche für Küche, Medien, Technik und Ehrenamt','https://4h.tennessee.edu/what-interests-you/'],
  ['Oregon State University Extension','Projektbereiche für Tanz, Handwerk und Outdoor-Aktivitäten','https://extension.oregonstate.edu/4h/baker/projects'],
  ['NABU','Vogelbeobachtung und vergleichbares Zählen','https://www.nabu.de/so-funktioniert-die-teilnahme'],
  ['NASA Science','Mond und Sternbilder beobachten','https://science.nasa.gov/skywatching/faq/'],
  ['Royal Horticultural Society','Küchenkräuter im Topf pflegen','https://www.rhs.org.uk/herbs/containers'],
  ['Scratch','Offizielle Starterprojekte','https://scratch.mit.edu/help/starter_projects/']
];
function sourcesPage() {
  return `${titleBlock('QUELLEN & HINWEISE','Weiterlernen.','Die Quests sind eigene Einsteigerübungen. Diese Quellen haben den Katalog und ausgewählte Übungen inspiriert.')}
  <section class="surface mission narrow"><ul class="plain-list">${sources.map(([name,summary,url])=>`<li><div><a href="${url}" target="_blank" rel="noopener noreferrer">${name}</a><p>${summary}</p></div></li>`).join('')}</ul>
  <h2>Beta-Daten</h2><p>Hobbys, Fortschritt, Pläne und importierte Ergebnisse bleiben in der lokalen Speicherung dieses Browsers. Die Beta hat kein Konto und keinen gemeinsamen Server. Inhalte in geteilten Links sind für alle lesbar, die den jeweiligen Link erhalten.</p></section>`;
}
function sharedPage(code) {
  const data=decode(code||'');
  if(!validShare(data)) return missing();
  const quest=quests[data.quest];
  if(data.mode==='invite') return `${titleBlock('EINLADUNG',quest.title,esc(data.name)+' hat diese Quest für '+dateLabel(data.day)+' geplant.')}
    <section class="surface mission narrow"><p>${data.done?'Die einladende Person hat die Quest bereits erledigt.':'Ihr könnt die Quest separat abschließen und euren Status danach per Link teilen.'}</p>${btn('Einladung übernehmen','join',code,'button primary')} ${link('Quest ansehen','quest/'+data.quest,'button secondary')}</section>`;
  return `${titleBlock('ERFOLGSKARTE',quest.title,esc(data.name)+' hat diese Quest abgeschlossen.')}
    <section class="surface mission narrow"><div class="tile-icon lilac">✦</div><h2>${data.score!==null?data.score+' · ':''}${esc(data.result)}</h2><p>Selbst eingetragenes Ergebnis · Woche ${weekRange(data.week)}</p>
    ${quest.type==='Challenge'?btn('Zur Rangliste oder Galerie hinzufügen','accept-score',code,'button primary'):''} ${link('Quest ausprobieren','quest/'+data.quest,'button secondary')}</section>`;
}
function render() {
  const [page,id,param]=location.hash.slice(1).split('/');
  const selected=({pfad:'entdecken',quest:'entdecken',challenge:'challenges',woche:'heute'})[page]||page||'heute';
  nav.innerHTML=navigation.map(([route,label,icon])=>`<a href="#${route}" ${route===selected?'aria-current="page"':''}>${svg(icon)}<span>${label}</span></a>`).join('');
  top.innerHTML=`<div class="top-left"><span class="mobile-mark mark">✳</span><div><p>${new Intl.DateTimeFormat('de-DE',{weekday:'long',day:'numeric',month:'long'}).format(new Date())}</p><strong>${state.name?'Hi, '+esc(state.name):'Willkommen bei Hobbymaxing'}</strong></div></div><div class="top-stats"><a class="xp-chip" href="#profil">${svg('bolt')} <strong>${totalXp(state)} XP</strong></a><a class="avatar" href="#profil" aria-label="Profil">${state.name?esc(Array.from(state.name)[0].toLocaleUpperCase('de')):svg('user')}</a></div>`;
  const views={heute:todayPage,entdecken:discoverPage,pfad:pathPage,quest:questPage,challenges:challengeIndex,challenge:challengePage,woche:weekPage,profil:profilePage,quellen:sourcesPage,teilen:sharedPage};
  main.innerHTML=(Object.hasOwn(views,page||'heute')?views[page||'heute']:missing)(id,param);
}
function openModal(title,contents) {
  modal.innerHTML=`<div class="modal-header"><h2 id="dialog-title">${title}</h2>${btn('Schließen','close','','text-button')}</div>${contents}`;
  modal.setAttribute('aria-labelledby','dialog-title');
  if(!modal.open) modal.showModal();
}
const modalForm=(name,id,contents,label)=>`<form data-form="${name}" data-value="${esc(id)}">${contents}<button class="button primary" type="submit">${label}</button></form>`;
function finishDialog(id) {
  const [questId,invite]=id.split('~');
  const quest=quests[questId];
  if(!quest||!unlocks(state,quest)) return;
  const result=quest.max?
    `<label>${quest.result}<input name="score" type="number" inputmode="numeric" required min="0" max="${quest.max}"></label>`:
    `<label>${quest.result}<input name="result" required maxlength="160" placeholder="Dein Ergebnis in einem Satz"></label>`;
  const condition=quest.max&&quest.type!=='Challenge'?`<label>Vergleichsbedingungen<input name="condition" required maxlength="100" placeholder="z. B. 3 m, linker Fuß, gleiches Ziel"></label>`:'';
  const prior=state.entries.some(entry=>entry.quest===questId&&(quest.type!=='Challenge'||entry.week===monday()));
  openModal('Quest abschließen',modalForm('finish',id,
    `<p>${quest.title} · ${prior?'Wiederholung':'+'+quest.xp+' XP'}</p>${result}${condition}
      <label>Private Notiz <textarea name="note" maxlength="420" placeholder="Was hat gut geklappt?"></textarea></label>
      ${invite?'<p class="notice">Der Abschluss zählt auch für eure gemeinsame Quest.</p>':''}`,'Ergebnis speichern'));
}
function cardDialog(entry) {
  if(!entry) return;
  const quest=quests[entry.quest];
  const hobby=byHobby[quest.hobby];
  const options=hobby.quests.filter(item=>item.requires.includes(quest.id)&&unlocks(state,item)&&!completed(state,item.id));
  const wasBest=entry.score!==null&&(entry.best===null||entry.score>entry.best);
  openModal('Deine Erfolgskarte',`<div class="success-card ${hobby.group}"><div class="tile-icon">${hobby.icon}</div><p class="eyebrow">${esc(hobby.name)} · ${entry.xp?('+'+entry.xp+' XP'):'Wiederholung'}</p><h3>${quest.title}</h3><p>${entry.score===null?'':entry.score+' · '}${esc(entry.result||quest.result)}</p>
  ${entry.previous!==null?`<p>Letzter vergleichbarer Versuch: ${entry.previous}</p>`:''}${wasBest?'<p><strong>Persönliche Bestleistung</strong></p>':''}</div>
  <p>Der geteilte Link enthält Anzeigename und Ergebnis. Deine private Notiz bleibt hier.</p>
  <div class="actions">${btn('Erfolgskarten-Link kopieren','share',entry.id,'button primary')}${options.map(item=>link(item.title,'quest/'+item.id,'button secondary')).join('')}</div>`);
}
function urlFor(hash) { return new URL('#'+hash,location.href).href; }
function resultLink(entry) {
  return urlFor('teilen/'+encode({mode:'result',quest:entry.quest,version:entry.version,week:entry.week,name:state.name||'Mitspieler',score:entry.score,result:entry.result||quests[entry.quest].result}));
}
function inviteLink(invite) {
  return urlFor('teilen/'+encode({mode:'invite',quest:invite.quest,code:invite.code,day:invite.day,name:state.name||'Mitspieler',done:invite.done}));
}
async function copy(value,message='Link kopiert.') {
  try { await navigator.clipboard.writeText(value); alertUser(message); }
  catch { openModal('Link kopieren',`<label>Link<input value="${esc(value)}" readonly autofocus></label>`); modal.querySelector('input').select(); }
}
function acceptResult(data) {
  if(!validShare(data)||data.mode!=='result'||quests[data.quest].type!=='Challenge') return false;
  return save(latest=>{
    const old=latest.scores.find(row=>rankId(row)===rankId(data));
    if(old&&old.score!==null&&old.score>data.score) return false;
    latest.scores=latest.scores.filter(row=>rankId(row)!==rankId(data));
    latest.scores.push(data);
  });
}
document.addEventListener('click',event=>{
  const action=event.target.closest('[data-action]');
  if(!action) return;
  const {action:kind,value}=action.dataset;
  switch(kind) {
    case 'close': modal.close(); break;
    case 'quick':
      filter={group:'all',query:'',place:value==='home'?'Zu Hause':'',gear:'',time:value==='time'?'10':'',stage:value==='new'?'Einstieg':''};
      location.hash='entdecken';
      break;
    case 'category':
      filter.group=value;
      document.querySelectorAll('[data-action="category"]').forEach(button=>button.setAttribute('aria-pressed',String(button===action)));
      document.querySelector('#results').innerHTML=catalogResults();
      break;
    case 'active':
      save(latest=>{latest.active=latest.active.includes(value)?latest.active.filter(id=>id!==value):[...latest.active,value];});
      break;
    case 'finish': finishDialog(value); break;
    case 'plan':
    case 'invite':
      openModal(kind==='plan'?'Quest einplanen':'Gemeinsam machen',modalForm(kind,value,
        `<p>${quests[value].title}</p>${dateInput()}`,kind==='plan'?'Quest einplanen':'Einladung erstellen'));
      break;
    case 'reschedule': {
      const plan=state.plans.find(item=>item.id===value);
      if(plan) openModal('Quest verschieben',modalForm('reschedule',value,dateInput(plan.day<localDate()?localDate():plan.day),'Datum speichern'));
      break;
    }
    case 'remove-plan': save(latest=>{latest.plans=latest.plans.filter(item=>item.id!==value);}); break;
    case 'remove-invite': save(latest=>{latest.invites=latest.invites.filter(item=>item.code!==value);}); break;
    case 'remove-score': save(latest=>{latest.scores=latest.scores.filter(item=>rankId(item)!==value);}); break;
    case 'journey':
      save(latest=>{if(!latest.journeys.includes(value)) latest.journeys.push(value);});
      break;
    case 'card': cardDialog(state.entries.find(item=>item.id===value)); break;
    case 'copy-quest': copy(urlFor('quest/'+value)); break;
    case 'share': {
      const entry=state.entries.find(item=>item.id===value);
      if(entry) copy(resultLink(entry));
      break;
    }
    case 'share-invite': {
      const invite=state.invites.find(item=>item.code===value);
      if(invite) copy(inviteLink(invite));
      break;
    }
    case 'import':
      openModal('Ergebnis importieren',modalForm('import','','<label>Ergebnislink <input name="link" type="url" required maxlength="4200"></label>','Ergebnis übernehmen'));
      break;
    case 'accept-score': {
      const data=decode(value);
      if(acceptResult(data)) {
        location.hash='challenge/'+data.quest;
        alertUser('Ergebnis hinzugefügt.');
      } else alertUser('Dieses Ergebnis lässt sich nicht übernehmen.');
      break;
    }
    case 'join': {
      const data=decode(value);
      if(!validShare(data)||data.mode!=='invite') return;
      if(save(latest=>{
        const existing=latest.invites.find(invite=>invite.code===data.code);
        if(existing&&existing.quest!==data.quest) return false;
        if(existing) existing.friendDone=existing.friendDone||data.done;
        else latest.invites.unshift({code:data.code,quest:data.quest,day:data.day,done:false,friendDone:data.done});
      })) location.hash='quest/'+data.quest+'/'+data.code;
      break;
    }
  }
});
document.addEventListener('submit',event=>{
  const form=event.target;
  event.preventDefault();
  const values=new FormData(form);
  const id=form.dataset.value;
  switch(form.dataset.form) {
    case 'finish': {
      const [questId,invite='']=id.split('~');
      const quest=quests[questId];
      let saved;
      const ok=save(latest=>{
        saved=record(latest,quest,{score:Number(values.get('score')),condition:values.get('condition'),note:values.get('note'),result:values.get('result'),invite});
        if(!saved) return false;
        const plan=latest.plans.find(item=>item.quest===questId&&!item.done&&item.day<=saved.day);
        if(plan) plan.done=true;
      });
      if(ok) cardDialog(saved);
      else alertUser('Dieser Versuch lässt sich heute nicht erneut speichern.');
      break;
    }
    case 'profile':
      if(save(latest=>{latest.name=values.get('name').trim().slice(0,28);})) alertUser('Profil gespeichert.');
      break;
    case 'goal':
      if(save(latest=>{latest.goals[shift(monday(),7)]=Number(values.get('goal'));})) alertUser('Ziel für nächste Woche gespeichert.');
      break;
    case 'invite':
    case 'plan':
    case 'reschedule': {
      const day=values.get('day');
      const kind=form.dataset.form;
      let invite;
      if(!/^\d{4}-\d{2}-\d{2}$/.test(day)||day<localDate()) return;
      if(!save(latest=>{
        if(kind==='reschedule') {
          const plan=latest.plans.find(item=>item.id===id);
          if(!plan) return false;
          plan.day=day;
        } else if(canPlan(id)&&kind==='plan') {
          if(latest.plans.some(item=>!item.done&&item.day===day&&item.quest===id)) return false;
          latest.plans.push({id:crypto.randomUUID(),quest:id,day,done:false});
        } else if(canPlan(id)) {
          invite={quest:id,day,code:crypto.randomUUID(),done:false,friendDone:false};
          latest.invites.unshift(invite);
        }
      })) { alertUser('Die Quest ist bereits für diesen Tag geplant.'); return; }
      if(invite) openModal('Deine Einladung',`<p>Teile den Link, damit die andere Person eure Quest übernehmen kann.</p>${btn('Einladungslink kopieren','share-invite',invite.code,'button primary')}`);
      else { modal.close(); alertUser('Quest eingeplant.'); }
      break;
    }
    case 'import': {
      let data;
      try {
        const url=new URL(values.get('link'));
        if(url.hash.startsWith('#teilen/')) data=decode(url.hash.slice(8));
      } catch { /* Invalid links are handled below. */ }
      if(!acceptResult(data)) { alertUser('Der Link enthält kein neues gültiges Challenge-Ergebnis.'); return; }
      modal.close();
      location.hash='challenge/'+data.quest;
      alertUser('Ergebnis hinzugefügt.');
      break;
    }
  }
});
document.addEventListener('input',event=>{
  if(event.target.form?.id!=='filters') return;
  filter[event.target.name]=event.target.value;
  document.querySelector('#results').innerHTML=catalogResults();
});
window.addEventListener('hashchange',()=>{
  if(location.hash==='#main') { main.focus(); return; }
  if(modal.open) modal.close();
  render();
  window.scrollTo(0,0);
  main.focus({preventScroll:true});
});
window.addEventListener('storage',event=>{if(event.key===key) {state=load(localStorage); render();}});
render();

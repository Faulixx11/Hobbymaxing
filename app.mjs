import {gameMapPage} from './game-map.mjs';
import {groups,hobbies,byHobby,quests,challenges,journeys} from './catalog.mjs?v=06';
import {key,load,localDate,shift,monday,weekGoal,activeDays,streaks,completed,unlocks,level,nextQuest,totalXp,record,badges,leaderboard,encode,decode,validShare,rankId,canPlan,earnPractice,dailyStreak,validDay,validResult,changeEntry,updatePlan,inviteJoin,friendFinished,firstPrerequisite,takeRestDay} from './state.mjs?v=08';
import {lessons} from './lessons.mjs';
import {resourcesForStage,reviewedResources,resourcesReviewedOn} from './resources.mjs?v=08';
import {stages,questionOptions,helpTopics,coachReply,blocks,experiments,runBlocks} from './learning.mjs';
import {studios,studioCell,checkStudio,playBeat} from './studios.mjs';
import {languages,selectSpeechVoice,moods,moodQuests,starterGuides,preferences,questMatches,recommend,featuredChallenge,profileBackup,parseBackup,mergeBackup,searchKey,matchingGear} from './play.mjs?v=08';
import {preparePhoto,putPhoto,deletePhoto,clearPhotos,showPhotos} from './photos.mjs?v=08';
import {expeditionContent} from './expedition-content.mjs';
import {practiceStudios,practiceStudioPage,mountPracticeStudio,unmountPracticeStudio,sanitizePracticeDraft} from './expedition-studios.mjs';
import {budgetLabel,expeditionNext,milestoneMinutes,readingChoices,reviewQuest,routeSummary,seasons,shortQuest,skillHistory,timeChoices} from './expedition.mjs';
import {roomSupported,callRoom,roomToken,knownRoomToken} from './rooms.mjs';

const main=document.querySelector('#main');
const nav=document.querySelector('#nav');
const top=document.querySelector('#top');
const modal=document.querySelector('#modal');
let state=load(localStorage);
let pendingBackup=null;
try { document.documentElement.dataset.theme=localStorage.getItem('hobbymaxing-theme')==='light'?'light':'dark'; } catch { document.documentElement.dataset.theme='dark'; }
let filter={group:'all',query:'',place:'',gear:'',time:'',stage:'',cost:''};
let toastTimer;
let coachHistory=[];
let language=Object.hasOwn(languages,state.language)?state.language:'en';
let importedRank='';
let onlineRooms=false;
let sharesView=null;
let roomTimer;
let roomLoading=false;
let roomWriting=false;
let currentRoom=null;
let labDrafts=structuredClone(state.labDrafts);
const labRuns={};
const quizReplies={};
let studioDrafts=structuredClone(state.studioDrafts);
const studioReplies={};
let hiddenTranslations=false;
let discoveryPick=null;
let focusTimer=readFocusTimer();
let focusTicker;
const featured=['fussball','fotografie','kochen','zeichnen','wandern','tennis'];
const groupNames=Object.fromEntries(groups.map(([id,name])=>[id,name]));
const art={wandern:'mountain',fussball:'football',fotografie:'photo',kochen:'cooking'};
const navigation=[['heute','Heute','home'],['entdecken','Entdecken','compass'],['karte','Karte','map'],['challenges','Challenges','trophy'],['profil','Profil','user'],['hilfe','Hilfe','help']];
const vectors={
  map:'M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3V6zm6-3v15m6-12v15',
  home:'M3 10.5 12 3l9 7.5V21h-6v-6H9v6H3z',compass:'M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0ZM16 8l-2 6-6 2 2-6z',
  trophy:'M7 4h10v6a5 5 0 0 1-10 0zM7 6H3v2a4 4 0 0 0 4 4m10-6h4v2a4 4 0 0 1-4 4m-5 3v5m-5 0h10',
  user:'M16 8a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM4 21v-2a5 5 0 0 1 5-5h6a5 5 0 0 1 5 5v2',
  time:'M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0ZM12 6v6l4 2',
  bolt:'m13 2-9 12h7l-1 8 10-12h-7z', calendar:'M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Zm-2 5h18M8 3v4m8-4v4',
  search:'M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-2 6 5 5', lock:'M7 11V8a5 5 0 0 1 10 0v3M5 11h14v10H5z',check:'m4 12 5 5L20 6',
  help:'M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0ZM9 9a3 3 0 0 1 6 1c0 2-3 2-3 4m0 3v.1',
  flame:'M13 2c1 4 7 7 7 12a8 8 0 1 1-16 0c0-3 2-5 4-7 0 3 2 4 3 4 2-3 2-5 2-9Z'
};
const svg=id=>`<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="${vectors[id]}"/></svg>`;
const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const link=(label,hash,kind='button')=>`<a class="${kind}" href="#${hash}">${label}</a>`;
const btn=(label,action,value='',kind='button')=>`<button type="button" class="${kind}" data-action="${action}" data-value="${esc(value)}">${label}</button>`;
const chip=text=>`<span class="chip">${text}</span>`;
const questTime=quest=>quest.minutes+' Min.'+(quest.elapsedDays?' insgesamt · über '+quest.elapsedDays+' Tage':'');
const dateLabel=(day,options={weekday:'short',day:'numeric',month:'short'})=>new Intl.DateTimeFormat('de-DE',options).format(new Date(day+'T12:00:00'));
const named=()=>state.name.trim()||'Du';
const pointLabel=points=>points+' '+(points===1?'Punkt':'Punkte');
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
function readFocusTimer() {
  try {
    const value=JSON.parse(sessionStorage.getItem('hobbymaxing-focus-timer')||'null');
    return value&&quests[value.quest]&&Number.isInteger(value.remaining)&&value.remaining>=0&&Number.isFinite(value.deadline)?value:null;
  } catch { return null; }
}
function storeFocusTimer() {
  try {
    if(focusTimer) sessionStorage.setItem('hobbymaxing-focus-timer',JSON.stringify(focusTimer));
    else sessionStorage.removeItem('hobbymaxing-focus-timer');
  } catch { /* The timer still works for this page if session storage is unavailable. */ }
}
function focusRemaining(id) {
  const timer=focusTimer?.quest===id?focusTimer:null;
  if(!timer) return (quests[id]?.minutes||0)*60;
  return timer.deadline?Math.max(0,Math.ceil((timer.deadline-Date.now())/1000)):timer.remaining;
}
function focusTimerText(seconds) {
  return `${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;
}
function updateFocusTimer() {
  const timer=focusTimer;
  if(!timer?.deadline) return;
  const remaining=focusRemaining(timer.quest);
  const output=main.querySelector('#focus-time');
  const progress=main.querySelector('#focus-progress');
  if(output) output.textContent=focusTimerText(remaining);
  if(progress) progress.value=(quests[timer.quest].minutes*60)-remaining;
  if(remaining===0) {
    focusTimer={quest:timer.quest,remaining:0,deadline:0};
    storeFocusTimer();
    clearInterval(focusTicker);
    alertUser('Deine Fokuszeit ist um. Atme kurz durch und notiere dein Ergebnis.');
    if(location.hash==='#fokus/'+timer.quest) render();
  }
}
function startFocusTicker(page) {
  clearInterval(focusTicker);
  if(page==='fokus'&&focusTimer?.deadline) {
    updateFocusTimer();
    if(focusTimer?.deadline) focusTicker=setInterval(updateFocusTimer,1000);
  }
}
function save(change,{refresh=true}={}) {
  const latest=load(localStorage);
  const updated=change(latest);
  if (updated===false) return false;
  try { localStorage.setItem(key,JSON.stringify(latest)); }
  catch { alertUser('Der Browser konnte die Änderung nicht speichern.'); return false; }
  state=latest;
  if(refresh) render();
  return true;
}
function awardPractice(id,xp) {
  const today=localDate();
  if(state.practiceDays[today]&&state.practice[id]) return;
  let first;
  if(save(latest=>{first=earnPractice(latest,id,xp,today);},{refresh:false})) {
    alertUser(first?'+'+xp+' XP · Übung bestanden':'Wiederholung zählt für deine Streak.');
  }
}
function pathCard(hobby,{image=false}={}) {
  const hits=hobby.quests.filter(quest=>completed(state,quest.id)).length;
  return `<a class="hobby-card surface" href="#pfad/${hobby.id}">
    <div class="card-art ${hobby.group} ${image&&art[hobby.id]?art[hobby.id]:''}"><span>${hobby.icon}</span></div>
    <div class="card-content"><p class="eyebrow">${groupNames[hobby.group]}</p><h3>${hobby.name}</h3><p>${esc(lessons[hobby.id].intro.split(/(?<=[.!?])\s/)[0])}</p>
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
    <div class="days">${marks}</div><div class="progress-label"><strong>${days.size} von ${goal} Tagen mit Praxisquest</strong><span>${Math.round(Math.min(1,days.size/goal)*100)} %</span></div>
    <progress value="${Math.min(days.size,goal)}" max="${goal}">${days.size}</progress>
    ${plans.length?`<div class="mini-plans">${plans.map(plan=>`<div><a href="#quest/${plan.quest}">${dateLabel(plan.day)} · ${quests[plan.quest].title}</a>${btn('Verschieben','reschedule',plan.id,'text-button')}</div>`).join('')}</div>`:''}
    ${link('Woche planen','woche','button secondary full')}</section>`;
}
function streakCard() {
  const streak=dailyStreak(state);
  const restUsed=state.restDays?.some(day=>monday(day)===monday())||false;
  const restAvailable=streak.running>0&&!streak.doneToday&&!restUsed;
  return `<section class="surface streak-card"><div class="tile-icon ember">${svg('flame')}</div><div><h2>${streak.running} ${streak.running===1?'Tag':'Tage'} in Folge</h2><p>${state.restDays?.includes(localDate())?'Heute ist dein Erholungstag. Deine Serie bleibt erhalten.':streak.doneToday?'Heute geschafft.':streak.running?'Eine Quest, App-Übung oder Wiederholung hält deine Tagesstreak.':'Schließe eine Quest oder App-Übung ab.'}</p>${restUsed&&!state.restDays?.includes(localDate())?'<small>Der Erholungstag dieser Woche ist bereits genutzt.</small>':''}${restAvailable?btn('Heute pausieren','rest-day','','text-button'):''}</div></section>`;
}
function todayPage() {
  const active=state.active.map(id=>byHobby[id]).filter(Boolean);
  const suggestion=recommend(state);
  const quickQuest=shortQuest(state);
  const paused=state.expedition.paused.map(id=>byHobby[id]).filter(Boolean);
  const recommended=active.length?suggestion?.quest:undefined;
  const suggested=suggestion?.hobby;
  const newSuggestion=recommended&&!state.active.includes(suggested.id);
  const challenge=featuredChallenge();
  const heroLink=recommended?'quest/'+recommended.id:'entdecken';
  return `<div class="dashboard"><div class="dash-main"><section class="hero mountain">
    <div class="hero-content"><p class="eyebrow"><span>✳</span> ${recommended?'DEIN NÄCHSTER SCHRITT':'DEIN ABENTEUER BEGINNT'}</p><h1>${recommended?esc(recommended.title):'Raus aus dem Alltag.<br><em>Rein ins Abenteuer.</em>'}</h1>
    <p>${recommended?esc(suggested.name+' · '+questTime(recommended)+' · '+recommended.steps[0]):'Entdecke neue Hobbys, meistere echte Quests und sammle Erlebnisse.'}</p>
    ${newSuggestion?'<p>Aus deinen gemerkten Hobbys passt aktuell keine offene Quest zu deinen Einstellungen. Hier ist etwas Neues zum Ausprobieren.</p>':''}
    ${link(recommended?(newSuggestion?'Vorschlag ansehen':'Quest fortsetzen'):'Hobbys entdecken',heroLink,'button primary')}</div><div class="hero-place"><span>✦</span> ${recommended?'DEIN LERNPFAD':'ECHTE ERLEBNISSE'}</div></section>
    ${quickQuest?`<section class="surface utility section expedition-panel"><h2>Heute 10 Minuten</h2><p>${esc(byHobby[quickQuest.hobby].name)} · ${esc(quickQuest.title)} · ${questTime(quickQuest)}</p>${link('Kurze Quest starten','quest/'+quickQuest.id,'button secondary')}</section>`:''}
    ${paused.length?`<section class="surface utility section expedition-panel"><h2>Wenn du wieder einsteigen willst</h2><div class="actions">${paused.map(hobby=>link(esc(hobby.name),'pfad/'+hobby.id,'button secondary')).join('')}</div></section>`:''}
    <section class="bubble-row" aria-label="Schnellauswahl"><a class="pill" href="#karte">✦ Spielkarte öffnen</a>${btn(svg('time')+' Kurze Quests','quick','time','pill')}${btn('⌂ &nbsp; Zu Hause','quick','home','pill')}${btn('✦ &nbsp; Etwas Neues','quick','new','pill')}</section>
    <section class="section"><div class="section-title"><div><p class="eyebrow"><span>✦</span> HOBBY-KATALOG</p><h2>${active.length?'Deine Hobbys':'Was willst du heute machen?'}</h2></div>${link('Alle '+hobbies.length+' Hobbys','entdecken','text-button')}</div>
    <div class="hobby-grid">${(active.length?active.slice(0,3):featured.slice(0,3).map(id=>byHobby[id])).map(hobby=>pathCard(hobby,{image:true})).join('')}</div></section>
    <section class="section surface practice-promo"><div class="tile-icon lilac">⌘</div><div><h2>Teste dein Können direkt hier</h2><p>Programmiere deine erste Figur im Scratch-Blocklabor oder mache einen Wissenscheck in deinem Lernpfad.</p></div>${link('Blocklabor öffnen','labor','button secondary')}</section>
    </div><aside class="dashboard-aside" aria-label="Woche und Challenge">${streakCard()}${weekCard()}
    <section class="challenge-teaser surface"><p class="eyebrow"><span>✦</span> WOCHEN-CHALLENGE</p><div class="challenge-ball" aria-hidden="true">${challenge.icon}</div><h2>${challenge.title}</h2><p>${challenge.result} · ${challenge.minutes} Min.</p>${link('Challenge ansehen','challenge/'+challenge.id,'button dark full')}</section></aside></div>`;
}
function filterSelect(name,label,options) {
  return `<label>${label}<select name="${name}"><option value="">Alle</option>${options.map(([value,word])=>`<option value="${value}" ${filter[name]===value?'selected':''}>${word}</option>`).join('')}</select></label>`;
}
function catalogResults() {
  if(filter.time||filter.place||filter.gear||filter.stage||filter.cost) {
    const matches=hobbies.flatMap(hobby=>hobby.quests.filter(quest=>questMatches(hobby,quest,filter,state)).map(quest=>({hobby,quest})));
    return `<p class="result-count" role="status">${matches.length} direkt spielbare ${matches.length===1?'Quest':'Quests'}</p>
    ${matches.length?`<div class="hobby-grid catalog-grid">${matches.map(({hobby,quest})=>`<a class="hobby-card surface" href="#quest/${quest.id}"><div class="card-art ${hobby.group}"><span>${hobby.icon}</span></div><div class="card-content"><p class="eyebrow">${hobby.name}</p><h3>${quest.title}</h3><div class="card-meta"><span>${questTime(quest)}</span><span>${quest.elapsedDays?'Heute starten':quest.type}</span></div></div></a>`).join('')}</div>`:empty('Keine freigeschaltete Quest passt zu den Filtern und deiner gespeicherten Ausrüstung. Passe sie im Lernpfad an oder wähle ein anderes Hobby.') }`;
  }
  const query=searchKey(filter.query);
  const matches=hobbies.filter(hobby=>(filter.group==='all'||hobby.group===filter.group)&&(!query||searchKey([hobby.name,hobby.skill,groupNames[hobby.group],hobby.materials,...hobby.quests.map(quest=>quest.title)].join(' ')).includes(query)));
  return `<p class="result-count" role="status">${matches.length} ${matches.length===1?'Hobby':'Hobbys'}</p>${matches.length?`<div class="hobby-grid catalog-grid">${matches.map(hobby=>pathCard(hobby)).join('')}</div>`:empty('Keine passenden Hobbys. Ändere einen Filter oder suche nach einem anderen Begriff.')+searchSuggestions(query) }`;
}
function searchSuggestions(query) {
  if(query.length<4||query.length>36) return '';
  const omissions=new Set(Array.from(query,(_,i)=>query.slice(0,i)+query.slice(i+1)));
  omissions.add(query);
  const options=hobbies.filter(hobby=>searchKey(hobby.name).split(/[\s&-]+/).some(word=>
    omissions.has(word)||Array.from(word,(_,i)=>word.slice(0,i)+word.slice(i+1)).some(part=>omissions.has(part))
  )).slice(0,3);
  return options.length?`<p>Meintest du eines davon?</p><div class="actions">${options.map(hobby=>link(hobby.name,'pfad/'+hobby.id,'button secondary')).join('')}</div>`:'';
}
function moodPicker() {
  const pick=discoveryPick;
  const option=moods[pick?.mood];
  const result=pick?.choice;
  return `<section class="surface mood-picker" aria-label="Hobby nach Stimmung finden"><div><p class="eyebrow">DEINE KLEINE HOBBY-EXPEDITION</p><h2>Was würde sich gerade gut anfühlen?</h2><p>Wähle eine Stimmung und entdecke eine kurze, passende nächste Quest.</p></div>
  <div class="mood-options">${Object.entries(moods).map(([id,mood])=>btn(`<span aria-hidden="true">${mood.icon}</span> ${mood.label}`,'pick-mood',id,'pill')).join('')}</div>
  ${pick?`<div class="mood-result" tabindex="-1" role="status" aria-live="polite">${result?`<span class="mood-result-icon" aria-hidden="true">${result.hobby.icon}</span><div><p class="eyebrow">${option?.label||'Dein Zufallstreffer'} · ${result.quest.minutes} Min.</p><h3>${esc(result.hobby.name)}: ${esc(result.quest.title)}</h3><p>Passt zu „${esc(option?.label||'Zufall')}“ und dauert ${result.quest.minutes} Minuten. ${esc(result.quest.steps[0])}</p><p class="mood-materials"><strong>Ort:</strong> ${esc(result.hobby.place)} · <strong>Material:</strong> ${esc(result.quest.materials||result.hobby.materials)}</p><div class="actions">${link('Los geht’s','quest/'+result.quest.id,'button primary')}${btn('Passt heute nicht','pick-mood',pick.mood,'button secondary')}</div></div>`:`<div><strong>Diese Stimmung hast du schon gemeistert.</strong><p>Wähle eine andere Stimmung für eine neue Idee.</p></div>`}</div>`:''}</section>`;
}
function discoverPage() {
  return `${titleBlock('ENTDECKEN','Finde dein nächstes Hobby.','Wähle etwas, das in deinen Tag passt. Jede Aktivität beginnt mit einer machbaren Quest.')}
    ${worldMap()}
    <details><summary>Quest nach Stimmung finden</summary>${moodPicker()}</details>
    <form id="filters" class="surface filters"><label class="search-label">Suche nach Hobby, Material oder Quest <span class="search-input">${svg('search')}<input type="search" name="query" value="${esc(filter.query)}" placeholder="Zum Beispiel Fotografie oder Papier"></span></label>
    <div class="filters-grid">${filterSelect('time','Zeit',[['10','Bis 10 Min.'],['15','Bis 15 Min.'],['25','Bis 25 Min.']])}${filterSelect('place','Ort',['Zu Hause','Draußen','Drinnen'].map(x=>[x,x]))}${filterSelect('gear','Ausrüstung',['Ohne Ausrüstung','Alltagsmaterial','Mit Ausrüstung'].map(x=>[x,x]))}${filterSelect('cost','Kostenrahmen',['Ohne Anschaffung','Alltagsmaterial','Ausrüstung leihen oder kaufen'].map(x=>[x,x]))}${filterSelect('stage','Quest-Typ',['Einstieg','Training','Meilenstein','Projekt','Erlebnis'].map(x=>[x,x]))}</div></form>
    <div class="bubble-row category-row">${[['all','Alle'],...groups].map(([id,name])=>`<button class="pill" type="button" aria-pressed="${filter.group===id}" data-action="category" data-value="${id}">${name}</button>`).join('')}</div>
    <section id="results" tabindex="-1" aria-label="Suchergebnisse">${catalogResults()}</section>`;
}
function studioLink(id) {
  const studio=Object.hasOwn(practiceStudios,id)?practiceStudios[id]:null;
  return studio?link(esc(studio.title),'praxis/'+id,'button secondary'):'';
}
function routeSteps(hobby,route,next) {
  return `<ol class="expedition-route academy-path">${route.map(({stage,tasks,done,available,lead})=>{
    const current=!done&&available.includes(next);
    const locked=!done&&!available.length;
    const status=done?'done':current?'current':locked?'locked':'available';
    const content=expeditionContent(hobby,lead);
    const options=tasks.map(quest=>`<li><strong>${esc(quest.title)}</strong><p>${questTime(quest)} · ${esc(quest.result)}</p>
       ${unlocks(state,quest)?link(completed(state,quest.id)?'Erneut üben':'Quest öffnen','quest/'+quest.id,'button secondary'):''}</li>`).join('');
    return `<li class="expedition-station ${status}" data-status="${status}">
      <div class="stage-heading"><h3>Level ${stage} · ${stages[stage-1]}</h3><span>${done?'Erreicht':current?'Als Nächstes':locked?'Gesperrt':'Freigeschaltet'}</span></div>
      <p>${esc(content.rationale)}</p>
      ${locked?`<small>${esc(lead.title)} · ${questTime(lead)} · ${esc(lead.skill||lead.result)}</small>`:`<details ${current?'open':''}><summary>${tasks.length===1?'Quest ansehen':tasks.length+' Quests ansehen'}</summary><ul class="plain-list">${options}</ul></details>`}
    </li>`;
  }).join('')}</ol>`;
}
function companion(done) {
  if(!done) return '';
  const earned=[['✦','Wegfunke'],['◆','Spurenfinder'],['✺','Kompass'],['✶','Meisterstern']][done-1];
  return `<p class="tags">${chip('<span aria-hidden="true">'+earned[0]+'</span> Wegbegleiter: '+earned[1])}</p>`;
}
function pathPage(id) {
  const hobby=byHobby[id];
  if(!hobby) return missing();
  const lesson=lessons[id], content=expeditionContent(hobby);
  const route=routeSummary(state,hobby), next=expeditionNext(state,hobby);
  const paused=state.expedition.paused.includes(id), active=state.active.includes(id);
  const done=route.filter(station=>station.done).length;
  const remaining=milestoneMinutes(state,hobby);
  const review=reviewQuest(state,hobby);
  const checked=state.expedition.materials[id]||[];
  return `<p>${link('Zur Hobbywelt','entdecken','text-button')}</p>
  <div class="path-banner surface ${hobby.group}"><span class="path-emoji" aria-hidden="true">${hobby.icon}</span><div><p class="eyebrow">${groupNames[hobby.group]}</p><h1>${hobby.name}</h1><p>${esc(content.appeal)}</p></div>${btn(active?'Aus meinen Hobbys entfernen':'Hobby merken','active',id,'button secondary')}</div>
  <div class="academy-layout section"><div>
    <section class="surface mission expedition-panel expedition-progress"><h2>${paused?'Dein Wiedereinstieg':next?'Dein nächster Schritt':'Expedition abgeschlossen'}</h2>
      <p><strong>${done} von 4 Etappen erreicht</strong></p><progress aria-label="Erreichte Etappen" value="${done}" max="4">${done} von 4</progress>${companion(done)}
      ${paused?'<p>Dein Fortschritt ist gespeichert. Steig mit einer vertrauten Übung wieder ein, wenn es passt.</p>':''}
      ${next?`<h3>${esc(next.title)}</h3><p>${questTime(next)} · ${esc(next.result)}</p>`:'<p>Dein Meisterstück steht im privaten Projektbuch. Die Übungen kannst du jederzeit wiederholen.</p>'}
      ${remaining?`<p><small>Ca. ${remaining} Min. aktive Übungszeit bis ${done<3?'zum Meilenstein':'zum Meisterstück'}. Pausen bei mehrtägigen Quests kommen dazu.</small></p>`:''}
      <div class="actions expedition-actions">
        ${next?link('Quest öffnen','quest/'+next.id,'button primary'):link('Projektgalerie','galerie','button primary')}
        ${review||paused?link('Kurz wiederholen','quest/'+(review||hobby.quests[0]).id,'button secondary'):''}
        ${active||paused?btn(paused?'Lernpfad fortsetzen':'Lernpfad pausieren','pause-path',id,'text-button'):''}
      </div>
    </section>
    <section class="section" aria-label="Lernpfad"><h2>Dein Lernpfad</h2>${routeSteps(hobby,route,next)}</section>
    <section class="surface mission section expedition-panel"><h2>Worum geht’s?</h2><p>${lesson.intro}</p><p>${lesson.technique}</p>
      <p><strong>Sicher starten</strong><br>${esc(content.safety)}</p>
      <details><summary>Einfach erklärt</summary><p>${esc(hobby.quests[0].steps[0])}</p><p>Dein erstes Ergebnis: ${esc(hobby.quests[0].result)}</p></details>
      <details ${state.expedition.diagnostic[id]?'open':''}><summary>Kurze Einstiegsprobe</summary><p>${esc(content.diagnosis.task)}</p><p>${esc(content.diagnosis.criteria)}</p>
      <form data-form="diagnostic" data-value="${id}"><label>Wie lief der Versuch? <select name="level"><option value="start" ${state.expedition.diagnostic[id]==='start'?'selected':''}>Mit Anleitung besser</option><option value="practice" ${state.expedition.diagnostic[id]==='practice'?'selected':''}>Selbstständig geschafft</option></select></label><button class="button secondary">Ergebnis merken</button></form>
      ${state.expedition.diagnostic[id]?`<p>${esc(state.expedition.diagnostic[id]==='practice'?content.diagnosis.ready:content.diagnosis.novice)}</p>`:''}</details>
      <div class="actions">${btn('Lernpfad drucken','print-path',id,'button secondary')}${btn('Offline-Karte laden','offline-card',next?.id||hobby.quests[0].id,'text-button')}${link('Wissenscheck','wissen/'+id,'button secondary')}${studioLink(id)}${Object.hasOwn(studios,id)?link('Übungsstudio öffnen','studio/'+id,'button secondary'):''}</div>
    </section>
  </div><aside class="academy-sidebar">
    <section class="surface utility expedition-panel"><h2>Was du brauchst</h2><p>${esc(hobby.materials)}</p><fieldset><legend>Material abhaken</legend>${content.materials.map(({item,alternative},index)=>`<label><input type="checkbox" data-material="${id}" value="${index}" ${checked.includes(index)?'checked':''}> ${esc(item)}<small> ${esc(alternative)}</small></label>`).join('')}</fieldset><p>${esc(hobby.place)} · ${esc(budgetLabel(hobby.quests[0]))}</p></section>
    <section class="surface utility expedition-panel"><h2>Dein Übungsplan</h2>${hobbyPreferences(hobby,content)}</section>
    <section class="surface utility expedition-panel"><h2>Deine Fähigkeiten</h2>${skillList(skillHistory(state).filter(item=>item.quest.hobby===id))}${link('Alle Fähigkeiten','faehigkeiten','text-button')}</section>
    ${resourceList(id)}
  </aside></div>`;
}
function hobbyPreferences(hobby,content=expeditionContent(hobby)) {
  const pref=state.preferences[hobby.id]||{};
  const plan=state.expedition.plans[hobby.id]||{};
  const fields={experience:'Deine Vorerfahrung',gear:'Deine Ausrüstung',goal:'Dein Ziel'};
  return `<details ${state.expedition.plans[hobby.id]?'open':''}><summary>Übungsplan anpassen</summary><form data-form="preferences" data-value="${hobby.id}" class="expedition-form">
  ${Object.entries(preferences).map(([field,choices])=>`<label>${fields[field]}<select name="${field}">${choices.map(([value,label])=>`<option value="${value}" ${pref[field]===value?'selected':''}>${label}</option>`).join('')}</select></label>`).join('')}
  <label>Zeit je Einheit<select name="minutes">${timeChoices.map(minutes=>`<option value="${minutes}" ${minutes===(plan.minutes||15)?'selected':''}>${minutes} Min.</option>`).join('')}</select></label>
  ${content.routes.length?`<label>Schwerpunkt<select name="route">${content.routes.map(({label},index)=>`<option value="${index}" ${(plan.route||0)===index?'selected':''}>${esc(label)}</option>`).join('')}</select></label>`:''}
  <label>Zieldatum für das Meisterstück <input type="date" name="deadline" value="${esc(plan.deadline)}"></label>
  <label>Was muss ich dafür vorbereiten? <textarea name="preparation" maxlength="240">${esc(plan.preparation)}</textarea></label>
  <button class="button secondary">Lernplan speichern</button></form></details>
  ${content.routes[plan.route||0]?`<p><strong>${esc(content.routes[plan.route||0].label)}</strong><br>${esc(content.routes[plan.route||0].description)}</p>`:''}
  ${plan.deadline?`<p>Meisterstück geplant für ${dateLabel(plan.deadline,{day:'numeric',month:'long',year:'numeric'})}.</p>`:''}
  <p>${link('Lerncoach fragen','hilfe/'+hobby.id,'text-button')}</p>`;
}
function skillList(skills) {
  return skills.length?`<ul class="plain-list expedition-skills">${skills.map(({skill,quest,day})=>`<li><a href="#quest/${quest.id}">${esc(skill)}</a><small>${esc(byHobby[quest.hobby].name)} · ${dateLabel(day)}</small></li>`).join('')}</ul>`:empty('Schließe eine Praxisquest ab. Die geübte Fähigkeit erscheint hier.');
}
function skillPage() {
  const skills=skillHistory(state);
  return `${titleBlock('DEIN PROFIL','Deine Fähigkeiten','Hier siehst du, was du praktisch geübt und festgehalten hast.')}
  <section class="surface mission">${skillList(skills)}${link('Hobby auswählen','entdecken','button secondary')}</section>`;
}
function galleryPage() {
  const cards=[...new Map(state.entries.filter(entry=>quests[entry.quest]?.stage===4).toReversed().map(entry=>[entry.quest,entry])).values()];
  return `${titleBlock('DEIN PROFIL','Meisterstück-Galerie','Deine abgeschlossenen Projekte bleiben in diesem Browser, bis du eine Karte ausdrücklich teilst.')}
  ${cards.length?`<div class="expedition-grid">${cards.map(entry=>{
    const quest=quests[entry.quest];
    return `<article class="surface utility expedition-project"><p>${byHobby[quest.hobby].icon} ${esc(byHobby[quest.hobby].name)}</p><h2>${esc(quest.title)}</h2><p>${esc(entry.result)}</p><p><small>${dateLabel(entry.day)}${entry.verified?' · Kriterien bestätigt':''}</small></p><div class="project-photo" data-photo="${esc(entry.id)}"></div>${btn('Projektkarte öffnen','card',entry.id,'button secondary')}</article>`;
  }).join('')}</div>`:`${empty('Schließe ein Meisterstück ab, um hier dein erstes Projekt zu sehen.')}${link('Lernpfad wählen','entdecken','button primary')}`}`;
}
function journalPage() {
  const notes=Object.entries(state.expedition.journal).sort((a,b)=>b[1].day.localeCompare(a[1].day));
  return `${titleBlock('DEIN PROFIL','Hobbyjournal','Vergleiche deine Erwartung mit dem Ergebnis einer Übung. Deine Einträge bleiben privat.')}
    ${notes.length?`<div class="expedition-grid">${notes.map(([id,note])=>`<article class="surface utility expedition-journal"><p>${dateLabel(note.day)} · ${esc(byHobby[quests[id].hobby].name)}</p><h2><a href="#quest/${id}">${esc(quests[id].title)}</a></h2>
    ${note.before?`<p><strong>Vorher</strong><br>${esc(note.before)}</p>`:''}<div class="project-photo" data-photo="journal-${id}-before" data-photo-alt="Dein privates Vorher-Foto"></div>
    ${note.after?`<p><strong>Nachher</strong><br>${esc(note.after)}</p>`:''}<div class="project-photo" data-photo="journal-${id}-after" data-photo-alt="Dein privates Nachher-Foto"></div></article>`).join('')}</div>`:`${empty('Öffne eine Quest und schreibe eine erste Notiz im privaten Hobbyjournal.')}${link('Quests entdecken','entdecken','button primary')}`}`;
}
function savedPage() {
  const saved=state.expedition.favorites.map(id=>quests[id]).filter(Boolean);
  return `${titleBlock('DEIN PROFIL','Für später','Quests, die du dir für eine spätere Übungsrunde gemerkt hast.')}
  <section class="surface mission">${saved.length?`<ul class="plain-list">${saved.map(quest=>`<li><a href="#quest/${quest.id}">${esc(quest.title)}</a><small>${questTime(quest)} · ${unlocks(state,quest)?'Freigeschaltet':'Gesperrt'}</small></li>`).join('')}</ul>`:empty('Öffne eine Quest und wähle „Für später merken“.')}${link('Quests entdecken','entdecken','button secondary')}</section>`;
}
function questLearning(quest,hobby) {
  const content=expeditionContent(hobby,quest);
  const note=state.expedition.journal[quest.id]||{};
  const plan=state.expedition.plans[hobby.id];
  const variant=content.variants;
  return `<h2>Wofür du das übst</h2><p>${esc(content.rationale)}</p><p>${esc(content.next)}</p>
    ${plan&&quest.minutes>plan.minutes?`<p class="notice">Für deine ${plan.minutes} Minuten heute: ${esc(variant.short)}</p>`:''}
    <details><summary>Einfach erklärt</summary><p>${esc(quest.steps[0])}</p><p>Vergleiche am Schluss mit diesem Ziel: ${esc(quest.result)}</p></details>
    <details><summary>Beispiel und häufiger Fehler</summary><p><strong>So sieht ein gutes Ergebnis aus</strong><br>${esc(content.example.good)}</p><p><strong>${esc(content.example.mistake)}</strong><br>${esc(content.example.repair)}</p></details>
    <details><summary>Zugängliche Varianten</summary>
      <ul><li><strong>Lesen statt hören</strong> · Schritte stehen als Text bereit. Bei Sprechübungen kannst du zunächst Satzkarten lesen und Situationen zuordnen.</li>
      <li><strong>Hören statt lesen</strong> · Nutze die Sprachausgabe deines Geräts oder bitte jemanden, die Schritte vorzulesen. Bei visuellen Aufgaben kann eine Person das Ergebnis anhand der Kriterien beschreiben.</li>
      <li><strong>Weniger Bewegung</strong> · Bereite die Übung am Tisch vor, zum Beispiel mit einer Skizze oder einer Materialliste. Lass den praktischen Teil offen, bis eine passende Ausführung möglich ist.</li>
      <li><strong>Weniger auf einmal</strong> · Hak einen Schritt im Fokusmodus ab und pausiere den Timer bei Bedarf.</li></ul>
    </details>
    <details><summary>Übung anpassen</summary><dl><dt>Ohne Spezialmaterial</dt><dd>${esc(variant.noGear)}</dd><dt>Kleines Budget</dt><dd>${esc(variant.budget)}</dd><dt>Wenig Zeit</dt><dd>${esc(variant.short)}</dd><dt>Anderer Ort</dt><dd>${esc(variant.place)}</dd></dl></details>
    ${quest.stage===4?`<details open class="expedition-project"><summary>So prüfst du dein Meisterstück</summary><ul>${content.rubric.map(item=>`<li>${esc(item)}</li>`).join('')}</ul></details>`:''}
    <details class="expedition-journal" ${note.before||note.after?'open':''}><summary>Privates Hobbyjournal${note.before||note.after?' · Eintrag vorhanden':''}</summary>
      <form data-form="journal" data-value="${quest.id}" class="expedition-form">
        <label>Vorher: Was willst du heute ausprobieren? <textarea name="before" maxlength="300">${esc(note.before)}</textarea></label>
        <label>Nachher: ${esc(content.reflection)} <textarea name="after" maxlength="300">${esc(note.after)}</textarea></label>
        <details><summary>Vorher- und Nachher-Fotos hinzufügen</summary><p>Fotos bleiben in diesem Browser und werden beim Profilexport ausgelassen. Ergänze eine kurze Notiz dazu.</p>
          <label>Vorher-Foto <input name="before-photo" type="file" accept="image/jpeg,image/png,image/webp"></label>
          <label>Nachher-Foto <input name="after-photo" type="file" accept="image/jpeg,image/png,image/webp"></label>
          <label><input name="remove-journal-photos" type="checkbox"> Gespeicherte Vergleichsfotos entfernen</label>
        </details>
        <button class="button secondary">Journal speichern</button>
      </form>
    </details>`;
}
function worldMap() {
  const seasonIndex=Math.floor((new Date().getMonth()+1)%12/3);
  const season=seasons[seasonIndex];
  return `<section aria-label="Hobbywelt" class="section"><h2>Hobbywelt</h2>
    <div class="expedition-world">${groups.map(([id,name,icon])=>{
      const region=hobbies.filter(hobby=>hobby.group===id);
      const started=region.filter(hobby=>state.active.includes(hobby.id)).length;
      return `<button type="button" class="expedition-region surface ${id}" aria-pressed="${filter.group===id}" data-action="category" data-value="${id}"><span aria-hidden="true">${icon}</span><strong>${name}</strong><small>${region.length} Pfade${started?' · '+started+' gemerkt':''}</small></button>`;
    }).join('')}</div>
    <details><summary>Saisonpfade · ${season.label}</summary><div class="actions">${[season,...seasons.filter(item=>item!==season)].map(item=>link(item.label,'saison/'+seasons.indexOf(item),'button secondary')).join('')}</div></details>
  </section>`;
}
function seasonPage(id) {
  const season=seasons[Number(id)];
  if(!season) return missing();
  return `${titleBlock('HOBBYWELT',season.label,'Diese Lernpfade kannst du zu jeder Jahreszeit öffnen.')}
    <div class="actions">${seasons.map((item,index)=>link(item.label,'saison/'+index,'button secondary')).join('')}</div>
    <div class="hobby-grid section">${season.groups.flatMap(group=>hobbies.filter(hobby=>hobby.group===group).slice(0,3)).map(hobby=>pathCard(hobby)).join('')}</div>`;
}
function expeditionWeek() {
  const week=monday();
  const selected=state.expedition.weeks[week]||[];
  const doneThisWeek=new Set(state.entries.filter(entry=>entry.week===week).map(entry=>entry.quest));
  const weekHits=selected.filter(id=>doneThisWeek.has(id)).length;
  const candidates=new Map();
  for(const id of selected) if(quests[id]) candidates.set(id,quests[id]);
  for(const hobby of [...state.active.map(id=>byHobby[id]).filter(Boolean),...featured.map(id=>byHobby[id])]) {
    if(state.expedition.paused.includes(hobby.id)) continue;
    const next=expeditionNext(state,hobby);
    if(next&&candidates.size<12) candidates.set(next.id,next);
  }
  const selection=[...candidates.values()];
  return `<section class="surface utility section expedition-panel"><h2>Deine Wochenexpedition</h2><p>Wähle bis zu drei Etappen, die du diese Woche üben willst.</p>
    ${selection.length?`<form data-form="expedition-week" class="expedition-form"><fieldset><legend>Etappen auswählen</legend>${selection.map(quest=>`<label><input type="checkbox" name="quest" value="${quest.id}" ${selected.includes(quest.id)?'checked':''}> ${esc(byHobby[quest.hobby].name)} · ${esc(quest.title)}${completed(state,quest.id)?' · erledigt':''}</label>`).join('')}</fieldset><button class="button secondary">Auswahl speichern</button></form>`:link('Lernpfad wählen','entdecken','button secondary')}
    ${selected.length?`<p><strong>${weekHits} von ${selected.length} diese Woche geübt</strong></p><ul class="plain-list">${selected.map(id=>`<li><a href="#quest/${id}">${esc(quests[id].title)}</a></li>`).join('')}</ul>`:''}
    <h3>Diese Woche geübt</h3>${skillList(skillHistory(state,week))}
    <h3>Letzte Woche geübt</h3>${skillList(skillHistory(state,shift(week,-7)))}
    ${selection.find(quest=>!completed(state,quest.id))?link('Nächste Übung öffnen','quest/'+selection.find(quest=>!completed(state,quest.id)).id,'button primary'):''}
  </section>`;
}
function resourceList(id,stage) {
  const hobby=byHobby[id];
  if(!hobby) return '';
  const levels=stage?[stage]:[1,2,3,4];
  const choices=levels.map(level=>({level,...resourcesForStage(hobby,level)}));
  const items=choices.flatMap(choice=>choice.items);
  const searches=choices.filter(choice=>choice.videoUrl).map(({level,quest,videoUrl})=>`<li><div><small>${stages[level-1]} · noch kein Video geprüft</small><a href="${videoUrl}" target="_blank" rel="noopener noreferrer">Passende YouTube-Videos suchen</a><p>Suchbegriff: ${esc(hobby.name+' · '+quest.title+' · Schritt für Schritt')}</p></div></li>`).join('');
  return `<section class="surface utility resource-list"><h2>Videos & Anleitungen</h2>${items.length?'<p>Externe Quellen</p>':''}<ul class="plain-list">${items.map(([level,name,source,url])=>{
    const review=reviewedResources[url];
    return `<li><div><small>${stages[level-1]} · ${esc(source)}</small><a href="${url}" target="_blank" rel="noopener noreferrer">${esc(name)}</a>${review?`<p>${esc(review[2])}<br><small>${esc(review.slice(0,2).join(' · '))} · geprüft am ${dateLabel(resourcesReviewedOn,{day:'numeric',month:'long',year:'numeric'})}</small></p>`:'<small>Übernommener Link · aktuell ungeprüft</small>'}</div></li>`;
  }).join('')}${searches}</ul><p class="resource-note">Für geprüfte Quellen siehst du Lernziel und Prüfdatum. YouTube-Suchvorschläge sind ungeprüft.</p></section>`;
}
function questPage(id, inviteCode='') {
  const quest=quests[id];
  if(!quest) return missing();
  const hobby=byHobby[quest.hobby];
  const locked=!unlocks(state,quest);
  const planned=state.invites.find(invite=>invite.code===inviteCode&&invite.quest===id);
  const preparation=state.invites.find(invite=>invite.code===inviteCode&&!invite.done&&invite.quest!==id);
  const prerequisite=locked?firstPrerequisite(state,quest):null;
  if(quest.type==='Challenge'&&!planned) return challengePage(id);
  return `<p>${link('Lernpfad ansehen','pfad/'+hobby.id,'text-button')}</p>${titleBlock(hobby.name+' · '+(stages[quest.stage-1]||quest.type),quest.title,quest.result)}
  ${planned?`<div class="notice">Gemeinsame Quest für ${dateLabel(planned.day).replace(/\.$/,'')}. ${friendFinished(state,planned)?'Die andere Person hat sie schon abgeschlossen.':''}</div>`:''}
  ${preparation?`<p class="notice">Du bereitest dich auf „${quests[preparation.quest].title}“ vor. ${link('Zur Einladung','quest/'+preparation.quest+'/'+preparation.code,'text-button')}</p>`:''}
  <div class="detail-grid"><section class="surface mission">
    ${locked?'':questInformation(quest,hobby)}
    ${!locked&&quest.stage?questLearning(quest,hobby):''}
    <div class="actions expedition-actions">${quest.stage?btn(state.expedition.favorites.includes(id)?'Von „Für später“ entfernen':'Für später merken','favorite',id,'button secondary'):''}${btn('Quest drucken','print-path',id,'button secondary')}${locked?'':btn('Offline-Karte laden','offline-card',id,'text-button')}${studioLink(hobby.id)}</div>
    ${locked?`<div class="notice">Schließe zuerst „${prerequisite?.title||'den Einstieg'}“ ab. ${prerequisite?link('Voraussetzung starten','quest/'+prerequisite.id+(planned?'/'+planned.code:''),'button primary'):link('Zum Lernpfad','pfad/'+hobby.id,'text-button')}</div>`:
      `${btn('Ergebnis eintragen','finish',id+(planned?'~'+planned.code:preparation?'~~'+preparation.code:''),'button primary')} ${btn('Quest im Fokusmodus starten','focus-open',id,'button secondary')} ${btn('Einplanen','plan',id,'button secondary')} ${quest.stage?btn('Für Wochenexpedition wählen','choose-expedition',id,'text-button'):''} ${btn('Gemeinsam machen','invite',id,'text-button') }`}
  </section><aside class="academy-sidebar"><section class="surface utility"><div class="tile-icon lilac">✦</div><h2>Dein Ergebnis</h2><p>${quest.result}</p><h3>So passt du es an</h3><p>${quest.adapt}</p><h3>Danach</h3><p>${quest.stage===4?'Halte fest, was du jetzt selbstständig kannst und was du beim nächsten Versuch ändern würdest.':'Schließe die Übung ab und wähle die nächste verfügbare Quest im Lernpfad.'}</p>${btn('Quest-Link kopieren','copy-quest',quest.id,'text-button')} ${link('Lerncoach zu dieser Quest fragen','hilfe/'+hobby.id+'/'+quest.id,'text-button')}</section>${resourceList(hobby.id,quest.stage)}</aside></div>`;
}
function focusPage(id) {
  const quest=quests[id];
  if(!quest) return missing();
  const hobby=byHobby[quest.hobby];
  if(!unlocks(state,quest)) return `${titleBlock('QUEST-MODUS','Dieser Schritt ist noch gesperrt.','Folge zuerst der Voraussetzung im Lernpfad.')}${link('Zum Lernpfad','pfad/'+hobby.id,'button primary')}`;
  const remaining=focusRemaining(id), total=quest.minutes*60;
  const timer=focusTimer?.quest===id?focusTimer:null;
  const running=Boolean(timer?.deadline&&remaining>0);
  const timerStatus=running?'Deine Fokuszeit läuft.':remaining===0?'Zeit ist um. Wenn du fertig bist, notiere dein Ergebnis.':'Starte den Timer, wenn du bereit bist.';
  const controls=running?`${btn('Pausieren','timer-pause',id,'button primary')} ${btn('Neu starten','timer-reset',id,'button secondary')}`:timer&&remaining>0?`${btn('Fortsetzen','timer-start',id,'button primary')} ${btn('Neu starten','timer-reset',id,'button secondary')}`:`${btn(remaining===0?'Noch eine Runde':'Timer starten','timer-start',id,'button primary')} ${btn('Zurücksetzen','timer-reset',id,'button secondary')}`;
  const checks=state.stepChecks[quest.id+':'+quest.version]||[];
  return `<p>${link('Zurück zur Quest','quest/'+id,'text-button')}</p>${titleBlock('QUEST-MODUS',quest.title,hobby.name+' · eine Sache nach der anderen.')}
    <section class="focus-clock surface" aria-label="Fokustimer"><div class="focus-clock-copy"><p class="eyebrow">DEIN FOKUS-SPRINT · ${quest.minutes} MIN.</p><time id="focus-time" aria-label="Verbleibende Zeit">${focusTimerText(remaining)}</time><p id="focus-timer-status" aria-live="polite">${timerStatus}</p></div><div class="focus-clock-controls">${controls}<progress id="focus-progress" max="${total}" value="${total-remaining}">${total-remaining}</progress></div></section>
    <section class="surface mission focus-mission"><div class="tags">${chip(hobby.icon+' '+esc(hobby.name))}${chip(esc(hobby.place))}${chip(esc(hobby.gear))}</div><h2>Was du brauchst</h2><p>${esc(quest.materials||hobby.materials)}</p>
    ${quest.id==='sprachen-1'?`<section class="phrase-section"><h2>Sprich die Sätze nach</h2><div id="phrase-cards">${phraseCards()}</div></section>`:''}
    ${hobby.id==='scratch'?`<div class="notice"><strong>Scratch gleich ausprobieren</strong><p>Verbinde die ersten Blöcke im interaktiven Labor, bevor du weiterübst.</p>${link('Blocklabor öffnen','labor/'+(experiments[quest.stage-1]?.id||'sammeln'),'button secondary')}</div>`:''}
    ${Object.hasOwn(studios,hobby.id)?`<div class="notice"><strong>${esc(studios[hobby.id].title)}</strong><p>${esc(studios[hobby.id].task)}</p>${link('Übungsstudio öffnen','studio/'+hobby.id,'button secondary')}</div>`:''}
    <h2>Deine Schritte</h2><p class="step-count" id="step-progress" aria-live="polite">${checks.length} / ${quest.steps.length} Schritte abgehakt</p>
    <ol class="steps guided-steps focus-steps">${quest.steps.map((step,index)=>`<li><label><input type="checkbox" data-quest-step="${quest.id}" value="${index}" ${checks.includes(index)?'checked':''}><span>${esc(/[.!?]$/.test(step)?step:step+'.')}</span></label>${quest.guided?.[index]?.tip||starterGuides[quest.id]?.tips[index]?`<details><summary>Wenn du einen Hinweis brauchst</summary><p>${quest.guided?.[index]?.tip||starterGuides[quest.id]?.tips[index]}</p>${(quest.guided?.[index]?.issues||[]).map(([problem,fix])=>`<p><strong>${esc(problem)}</strong><br>${esc(fix)}</p>`).join('')}</details>`:''}</li>`).join('')}</ol>
    ${quest.stage===4?questLearning(quest,hobby):''}${resourceList(hobby.id,quest.stage)}<div class="notice"><strong>Erfolg heißt:</strong> ${esc(starterGuides[quest.id]?.success||quest.result)}</div><div class="actions">${btn('Ergebnis festhalten','finish',id,'button primary')}${link('Lerncoach fragen','hilfe/'+hobby.id+'/'+id,'button secondary')}</div><p class="focus-privacy">Timer und Fortschritt bleiben in diesem Browser. Der Timer läuft nur in diesem Tab.</p></section>`;
}
function phraseCards() {
  const selected=languages[language];
  const voices=window.speechSynthesis?.getVoices?.()||[];
  const voice=selectSpeechVoice(voices,selected);
  const speechStatus=!window.speechSynthesis?'Dieser Browser bietet keine Sprachausgabe.':voice?`Gerätestimme: ${voice.name} · ${voice.lang}`:voices.length?`Keine passende Stimme gemeldet. Die Spracheinstellung ${selected.locale} wird beim Anhören an den Browser übergeben.`:'Die Stimmen werden vom Browser geladen. Gewünschte Aussprache: '+selected.locale+'.';
  return `<label class="language-choice">Übungssprache<select id="practice-language" name="language" aria-label="Übungssprache">${Object.entries(languages).map(([id,item])=>`<option value="${id}" ${id===language?'selected':''}>${item.name}</option>`).join('')}</select></label>
  <p class="speech-status" role="status">${esc(speechStatus)}</p><div class="phrase-practice-tools">${btn(hiddenTranslations?'Übersetzungen zeigen':'Übersetzungen abdecken','toggle-translations','','button secondary')}</div>
  <details open><summary>Fünf Sätze zum Nachsprechen</summary><ul class="plain-list">${selected.pairs.map(([phrase,meaning,pronunciation],index)=>`<li><div><strong lang="${selected.locale}">${phrase}</strong>${pronunciation?`<small class="pronunciation" lang="de">Lautschrift: ${esc(pronunciation)}</small>`:''}${hiddenTranslations?'':`<p>${meaning}</p>`}</div>${btn('Anhören','speak',language+'~'+index,'button secondary')}</li>`).join('')}</ul></details>`;
}
function questInformation(quest,hobby) {
  const checks=state.stepChecks[quest.id+':'+quest.version]||[];
  const open=unlocks(state,quest);
  const guide=starterGuides[quest.id];
  const days=state.checkpoints[quest.id]||[];
  const nextDay=days.length?shift(days.at(-1),quest.checkpointGap||1):localDate();
  return `<div class="tags">${chip(svg('time')+' '+questTime(quest)) }${chip(svg('bolt')+' +'+quest.xp+' XP') }${chip(quest.type)}</div>
  ${quest.elapsedDays&&open?`<div class="notice"><strong>Mehrere Tage einplanen</strong><p>${days.length} Tage dokumentiert. Nächster Kontrollpunkt: ${dateLabel(nextDay)}.</p>${nextDay>localDate()?'':btn(days.length?'Heutigen Kontrollpunkt speichern':'Heute starten', 'checkpoint',quest.id,'button secondary')}</div>`:''}
  <h2>Was du brauchst</h2><p>${quest.materials||hobby.materials}</p>
  <h2>Was du übst</h2><p>${lessons[hobby.id].technique}</p>
  ${guide?.intro?`<p class="notice">${guide.intro}</p>`:''}
  ${quest.id==='sprachen-1'?`<section class="phrase-section"><h2>Wähle deine Sprache</h2><p>Mit „Anhören“ liest dir dein Browser den Satz vor, wenn eine passende Stimme verfügbar ist.</p><div id="phrase-cards">${phraseCards()}</div></section>`:''}
  ${quest.id==='scratch-1'?`<ol class="program" aria-label="Beispiel für zwei verbundene Blöcke"><li><span class="block event">Wenn grüne Flagge angeklickt</span></li><li><span class="block move">Gehe 10er-Schritt</span></li></ol>`:''}
  ${hobby.id==='scratch'?`<p>${link('Im Blocklabor vorüben','labor/'+(experiments[quest.stage-1]?.id||'sammeln'),'button secondary')} <a class="text-button" href="https://scratch.mit.edu/projects/editor/" target="_blank" rel="noopener noreferrer">Scratch-Editor öffnen</a></p>`:''}
  <h2>Schritt für Schritt</h2>
  ${open?`<p class="step-count" id="step-progress" aria-live="polite">${checks.length} / ${quest.steps.length} Schritte abgehakt</p>`:''}
  <ol class="steps guided-steps">${quest.steps.map((step,index)=>{
    const sentence=esc(/[.!?]$/.test(step)?step:step+'.');
    return `<li>${open?`<label><input type="checkbox" data-quest-step="${quest.id}" value="${index}" ${checks.includes(index)?'checked':''}><span>${sentence}</span></label>`:sentence}
    ${open&&(quest.guided?.[index]?.tip||guide?.tips[index])?`<details><summary>Tipp zu Schritt ${index+1}</summary><p>${quest.guided?.[index]?.tip||guide.tips[index]}</p>${(quest.guided?.[index]?.issues||[]).map(([problem,fix])=>`<p><strong>${problem}</strong><br>${fix}</p>`).join('')}</details>`:''}</li>`;
  }).join('')}</ol>
  <h3>Woran du merkst, dass es geklappt hat</h3><p>${guide?.success||quest.result+'. Vergleiche dein Ergebnis mit dem Ziel der Quest.'}</p>`;
}
function missing() {
  return titleBlock('HOBBYMAXING','Seite nicht gefunden.','Entdecke einen anderen Lernpfad.')+link('Zum Hobby-Katalog','entdecken','button primary');
}

function quizPage(id) {
  const hobby=byHobby[id], lesson=lessons[id];
  if(!lesson) return missing();
  const response=quizReplies[id];
  const passed=Object.hasOwn(state.practice,'quiz-'+id);
  return `<p>${link('Zurück zum Lernpfad','pfad/'+id,'text-button')}</p>
  ${titleBlock('WISSENSCHECK · '+hobby.name,'Teste dein Wissen.','Wähle eine Antwort und erfahre, warum sie zur Situation passt.')}
  <section class="surface mission narrow quiz">
    <div class="tags">${chip('1 Min.')}${chip(passed?'20 XP erhalten':'+20 XP beim ersten Bestehen')}</div>
    <form data-form="quiz" data-value="${id}"><fieldset><legend>${lesson.question}</legend>
    ${questionOptions(id).map((option,index)=>`<label class="answer-option"><input type="radio" name="answer" value="${index}" required ${response?.index===index?'checked':''}><span>${option}</span></label>`).join('')}
    </fieldset><button class="button primary">Antwort prüfen</button></form>
    ${response?`<div id="quiz-feedback" class="feedback ${response.correct?'positive':'try-again'}" tabindex="-1"><strong>${response.correct?'Richtig!':'Versuch es noch einmal.'}</strong><p>${response.correct?lesson.feedback:lesson.trouble}</p>
    ${response.correct?link('Lernpfad fortsetzen','pfad/'+id,'button secondary'):''}</div>`:''}
    <details><summary>Techniktipp anzeigen</summary><p>${lesson.technique}</p></details>
  </section>`;
}
function board(frame) {
  return `<div class="lab-board" role="img" aria-label="Figur auf Feld ${frame.pos+1} von 5. ${pointLabel(frame.points)}.">
    ${Array.from({length:5},(_,i)=>`<div class="lab-cell ${i===frame.pos?'player-cell':''}"><span aria-hidden="true">${i===frame.pos?'●':i===3&&frame.star?'✦':''}</span></div>`).join('')}
  </div>`;
}
function labPage(id) {
  const exercise=id?experiments.find(item=>item.id===id):experiments.find(item=>!Object.hasOwn(state.practice,'lab-'+item.id))||experiments[0];
  if(!exercise) return missing();
  const index=experiments.indexOf(exercise);
  const draft=labDrafts[exercise.id]||[];
  const run=labRuns[exercise.id];
  const cleared=Object.hasOwn(state.practice,'lab-'+exercise.id);
  const available=experiments.slice(0,index).every(item=>Object.hasOwn(state.practice,'lab-'+item.id));
  const frame=run?.frames.at(-1)||{pos:2,points:0,star:exercise.id==='sammeln'};
  const eventNames={flag:'Start',rightKey:'Rechts',leftKey:'Links'};
  return `<p>${link('Zum Scratch-Lernpfad','pfad/scratch','text-button')}</p>
  ${titleBlock('SCRATCH-BLOCKLABOR','Programmiere deine Bühne.','Baue dein Programm aus Blöcken und starte einen Test. Die Bühne zeigt dir, wie deine Befehle wirken.')}
  <nav class="bubble-row lab-nav" aria-label="Blocklabor-Aufgaben">${experiments.map((item,i)=>`<a class="pill" href="#labor/${item.id}" ${item===exercise?'aria-current="page"':''}>${Object.hasOwn(state.practice,'lab-'+item.id)?'✓':i+1} · ${item.title}</a>`).join('')}</nav>
  ${!available?`<section class="surface mission narrow"><h2>${exercise.title}</h2><p>Schließe zuerst „${experiments[index-1].title}“ ab.</p>${link('Zu deiner nächsten Aufgabe','labor','button primary')}</section>`:
    `<div class="detail-grid lab-grid"><section class="surface mission"><div class="tags">${chip(cleared?'25 XP erhalten':'+25 XP beim ersten Bestehen')}</div><h2>${exercise.title}</h2><p>${exercise.goal}</p><p>${exercise.idea}</p>
    <div class="lab-palette"><h3>Blöcke hinzufügen</h3><div class="actions">${exercise.palette.map(key=>btn(blocks[key].label,'lab-add',exercise.id+'~'+key,'block '+blocks[key].kind)).join('')}</div></div>
    <h3>Dein Programm</h3>${draft.length?`<ol class="program">${draft.map(key=>`<li><span class="block ${blocks[key].kind}">${blocks[key].label}</span></li>`).join('')}</ol>`:empty('Wähle einen Ereignisblock, um dein Programm zu beginnen.')}
    <div class="actions">${btn('Programm testen','lab-run',exercise.id,'button primary')}${draft.length?btn('Letzten Block entfernen','lab-undo',exercise.id,'button secondary')+btn('Neu anfangen','lab-reset',exercise.id,'text-button'):''}</div>
    <details><summary>Tipp anzeigen</summary><p>${exercise.hint}</p></details></section>
    <aside class="surface utility stage"><div class="section-title"><h2>Bühne</h2>${chip(pointLabel(frame.points))}</div>${board(frame)}
    ${run?`<div id="lab-feedback" class="feedback ${run.pass?'positive':'try-again'}" tabindex="-1"><strong>${run.message}</strong>
    ${run.frames.length?`<ul>${run.frames.map(item=>`<li>${eventNames[item.event]} · Feld ${item.pos+1} · ${pointLabel(item.points)}</li>`).join('')}</ul>`:''}
    ${run.pass?link(index===experiments.length-1?'Zum Scratch-Lernpfad':'Nächste Laboraufgabe',index===experiments.length-1?'pfad/scratch':'labor/'+experiments[index+1].id,'button secondary'):''}</div>`:
    '<p class="stage-note">Beim Test lösen wir die Ereignisse für dich aus und zeigen jede Station.</p>'}</aside></div>`}`;
}
function studioPage(id) {
  if(!Object.hasOwn(studios,id||'')) return missing();
  const studio=studios[id], picked=studioDrafts[id]||[], reply=studioReplies[id];
  const already=Object.hasOwn(state.practice,'studio-'+id);
  const cells=Array.from({length:studio.rows*studio.size},(_,index)=>index);
  return `<p>${link('Zurück zum Lernpfad','pfad/'+id,'text-button')}</p>
  ${titleBlock('ÜBUNGSSTUDIO · '+byHobby[id].name,studio.title,studio.task)}
  <div class="detail-grid"><section class="surface mission">
  <div class="tags">${chip(already?'25 XP erhalten':'+25 XP beim ersten Bestehen')}</div><p>${studio.instruction}</p>
  <div class="studio-board ${id} grid-${studio.size}" role="group" aria-label="Übungsfeld">
  ${cells.map(index=>index===studio.origin?`<span class="studio-origin" aria-label="Weißer Springer auf d4">♘</span>`:`<button type="button" class="studio-cell" aria-label="${studioCell(id,index)}" aria-pressed="${picked.includes(index)}" data-action="studio-cell" data-value="${id}~${index}">${id==='schach'?studioCell(id,index):id==='beats'?(index<8?'K':'S'):''}</button>`).join('')}
  </div>
  <div class="actions studio-actions">${btn('Ergebnis prüfen','studio-check',id,'button primary')}${btn('Zurücksetzen','studio-reset',id,'button secondary')}${id==='beats'?btn('Beat abspielen','studio-play',id,'button secondary'):''}</div>
  ${reply?`<div id="studio-feedback" tabindex="-1" class="feedback ${reply.pass?'positive':'try-again'}"><strong>${reply.pass?'Aufgabe bestanden!':'Schau noch einmal hin.'}</strong><p>${reply.pass?'Alle Felder sind richtig gesetzt.':reply.missing+' fehlen, '+reply.extra+' zusätzlich markiert.'}</p></div>`:''}</section>
  ${studio.preview?`<aside class="surface utility"><h2>Vorlage</h2><div class="studio-board preview grid-5" role="img" aria-label="Pfeil nach oben aus elf Pixeln">${cells.map(index=>`<span class="studio-cell ${studio.solution.includes(index)?'filled':''}"></span>`).join('')}</div></aside>`:''}</div>`;
}
function supportPage(id,questId) {
  const hobby=byHobby[id];
  const focusQuest=quests[questId]?.hobby===id?quests[questId]:null;
  const starters=hobby?['Was brauche ich?','Wie starte ich?','Ich hänge fest','Gibt es ein Video?']:['Wie sammle ich XP?','Wie funktioniert die Streak?','Wie funktionieren Rankings?'];
  return `${titleBlock('HILFE & SUPPORT',hobby?'Lerncoach für '+hobby.name:'Wie können wir dir helfen?','Frage den Lerncoach zu deinem Hobby, einer Aufgabe oder deinem Spielfortschritt.')}
  <div class="detail-grid"><section class="surface mission coach-panel"><div class="section-title"><div><h2>Lerncoach</h2><p>Antworten aus den Hobby-Anleitungen und Spielregeln. Deine Fragen bleiben in diesem Tab.</p></div></div>
  ${focusQuest?`<p class="notice">Aktuelle Quest: ${focusQuest.title}</p>`:''}
  ${hobby&&!state.expedition.plans[hobby.id]?`<h3>Was passt zu dir?</h3><p>Hinterlege Übungszeit, Material und Ziel für persönliche Vorschläge.</p>${hobbyPreferences(hobby)}`:''}
  <form data-form="coach" data-quest="${focusQuest?.id||''}">
    <label>Hobby<select name="hobby"><option value="">Allgemeine Hilfe</option>${hobbies.map(item=>`<option value="${item.id}" ${item===hobby?'selected':''}>${item.name}</option>`).join('')}</select></label>
    <div class="actions coach-suggestions">${(focusQuest?['Tipp für Schritt 1','Tipp für Schritt 2','Tipp für Schritt 3']:starters).map(prompt=>btn(esc(prompt),'coach-prompt',prompt,'pill')).join('')}</div>
    <label>Deine Frage<textarea name="question" maxlength="300" required placeholder="Was möchtest du wissen?"></textarea></label><button class="button primary">Frage stellen</button>
  </form><div class="coach-log" aria-live="polite">${coachHistory.map(item=>`<article><p class="coach-question"><strong>Du${item.name?' · '+item.name:''}</strong><br>${esc(item.question)}</p><div class="coach-reply"><strong>Lerncoach</strong><p>${esc(item.text)}</p>${item.route?link('Passenden Bereich öffnen',item.route,'text-button'):''}</div></article>`).join('')}</div></section>
  <aside class="academy-sidebar"><section class="surface utility"><h2>Häufige Fragen</h2>${helpTopics.map(([question,answer])=>`<details><summary>${question}</summary><p>${answer}</p></details>`).join('')}</section>
  <section class="surface utility"><h2>Eine Frage ans Projekt stellen</h2><p>Fragen, Fehler und Vorschläge kannst du auf GitHub einreichen. Beiträge sind öffentlich und benötigen ein GitHub-Konto.</p>
  <a class="button secondary" href="https://github.com/Faulixx11/Hobbymaxing/issues/new" target="_blank" rel="noopener noreferrer">GitHub-Support öffnen</a></section></aside></div>`;
}
function rankingRows(rows,quest,{actions=false}={}) {
  if(!rows.length) return empty('Noch keine Ergebnisse in diesem Zeitraum.');
  return `<ol class="ranking">${rows.map(row=>{
    const position=quest.max?rows.findIndex(other=>other.score===row.score)+1:'✦';
    const result=quest.max?row.score+(quest.max<999?' / '+quest.max:''):row.result;
    return `<li class="${!row.mine&&rankId(row)===importedRank?'new-rank':''}"><span class="rank-number">${position}</span><strong>${esc(row.name)}${row.mine?' <small>(du)</small>':''}</strong><span>${esc(result)}</span>
    ${actions?(row.mine?btn('Teilen','share',row.id,'text-button'):btn('Entfernen','remove-score',rankId(row),'text-button')):''}</li>`;
  }).join('')}</ol>`;
}
function rankingPage(view,focused) {
  const current=monday();
  const known=[...new Set([current,...state.entries.filter(entry=>entry.quest.startsWith('challenge-')).map(entry=>entry.week),...state.scores.map(entry=>entry.week)])].sort().reverse();
  const week=view==='gesamt'?null:known.includes(view)?view:current;
  return `${titleBlock('RANGLISTEN','Miss dich bei derselben Aufgabe.','Wähle eine Rangliste und vergleiche Ergebnisse unter vergleichbaren Bedingungen. Bei Gleichstand teilen sich die Ergebnisse einen Platz.')}
  <section class="surface utility rank-controls"><form data-form="ranking">
    <label>Zeitraum<select name="period"><option value="gesamt" ${week===null?'selected':''}>Gesamtbestwerte</option>
    ${known.map(day=>`<option value="${day}" ${week===day?'selected':''}>${day===current?'Diese Woche · ':''}${weekRange(day)}</option>`).join('')}</select></label>
    <button class="button secondary">Zeitraum anzeigen</button></form><p>Diese Ranglisten zeigen deine Ergebnisse und manuell importierte Beiträge. Die Werte sind Selbstauskünfte.</p>${btn('Ergebnislink importieren','import','','button secondary')}</section>
  <div class="rank-grid section">${challenges.filter(quest=>quest.max||quest.id===focused).sort((a,b)=>Number(b.id===focused)-Number(a.id===focused)).map(quest=>`<section class="surface utility">
    <div class="tile-icon lilac">${quest.icon}</div><h2>${quest.title}</h2><p>${quest.result}</p>${rankingRows(leaderboard(state,quest,week),quest)}
    ${link('Regeln & Ergebnis','challenge/'+quest.id,'button secondary')}</section>`).join('')}</div>`;
}

function challengeIndex() {
  const highlight=featuredChallenge();
  return `${titleBlock('CHALLENGES','Zusammen macht’s mehr Spaß.','Wähle eine Wochenaufgabe, sammle ein Ergebnis und vergleiche es mit deinen Freunden.')}
    <p class="notice">${weekRange(monday())} · Trage eigene Ergebnisse ein und importiere Beiträge über geteilte Links. Alle Ergebnisse sind Selbstauskünfte.</p>
    <section class="surface utility"><p class="eyebrow">DIESE WOCHE EMPFOHLEN</p><h2>${highlight.icon} ${highlight.title}</h2><p>${highlight.result} · ${highlight.minutes} Min.</p>
    <div class="actions">${link('Mitmachen','challenge/'+highlight.id,'button primary')}${btn('An Freunde schicken','copy-quest',highlight.id,'button secondary')}${link('Alle Ranglisten','ranglisten','text-button')}</div></section>
    <div class="hobby-grid catalog-grid">${challenges.map(quest=>`<a class="hobby-card surface" href="#challenge/${quest.id}"><div class="card-art ${quest.group}"><span>${quest.icon}</span></div><div class="card-content">
    <p class="eyebrow">${quest.max?'RANGLISTE':'ERGEBNISLISTE'}</p><h3>${quest.title}</h3><p>${quest.result}</p><div class="card-meta"><span>${quest.minutes} Min.</span><span>+${quest.xp} XP</span></div></div></a>`).join('')}</div>
    ${onlineRooms?`<section class="section surface utility"><h2>Private Wochenräume</h2><p>Übt als Duo oder Team. Über den Einladungslink seht ihr freigegebene Praxistage für eine Woche.</p><div class="actions">${btn('Buddy-Ziel starten','create-room','buddy-week','button secondary')}${btn('Team-Raum starten','create-room','team-week','button secondary')}</div></section>`:''}
    <section class="section"><h2>Gemeinsame Quests</h2>${invitesList()}</section>`;
}
function challengePage(id) {
  const quest=challenges.find(item=>item.id===id);
  if(!quest) return missing();
  const rows=leaderboard(state,quest);
  const ranking=quest.max>0;
  return `<p>${link('Alle Challenges','challenges','text-button')}</p>${titleBlock('WOCHEN-CHALLENGE',quest.title,weekRange(monday()))}
  <div class="detail-grid"><section class="surface mission">${questInformation(quest,byHobby[quest.hobby])}${btn('Ergebnis eintragen','finish',id,'button primary')} ${btn('Gemeinsam machen','invite',id,'button secondary')} ${onlineRooms&&ranking?btn('Privaten Live-Raum erstellen','create-room',id,'button secondary'):''}
  <h3>So passt du es an</h3><p>${quest.adapt}</p></section>
  <aside class="surface utility"><div class="tile-icon lilac">${svg('trophy')}</div><h2>${ranking?'Deine private Rangliste':'Deine private Ergebnisliste'}</h2><p>${ranking?'Gleiche Bedingungen für alle. Pro Person zählt das beste Ergebnis dieser Woche.':'Hier sammelst du Titel und importierte Beiträge aus dieser Woche. Eigene Fotos bleiben privat im Projektbuch.'}</p>
  ${rankingRows(rows,quest,{actions:true})}${btn('Ergebnislink importieren','import','','button secondary')} ${btn('Challenge-Link kopieren','copy-quest',id,'text-button')} ${ranking?link('Zeiträume und Bestwerte','ranglisten','text-button'):''}</aside></div>`;
}
function roomRows(room) {
  const quest=quests[room.quest];
  if(quest) return rankingRows(room.rows,quest);
  return room.rows.length?`<ol class="plain-list">${room.rows.map(row=>`<li><span>${esc(row.name)}${row.mine?' · du':''}</span><strong>${row.score} / 7 Tage</strong></li>`).join('')}</ol>`:empty('Trage deinen ersten Praxisstand ein oder sende den Raumlink an deine Gruppe.');
}
function activityRoomPage(room) {
  const own=room.rows.find(row=>row.mine);
  const buddy=room.quest==='buddy-week';
  const total=room.rows.reduce((sum,row)=>sum+row.score,0);
  const week=monday(localDate(new Date(room.expires-7*86400000)));
  return `${titleBlock('PRIVATER WOCHENRAUM',buddy?'Buddy-Wochenziel':'Team-Challenge','Praxis zählt pro Person und Tag einmal. Jede Person kann ihren eigenen Beitrag aktualisieren.')}
  <div class="detail-grid"><section class="surface mission"><h2>Dein Beitrag</h2><p>Du teilst ausschließlich die Anzahl deiner Praxistage in der Woche ${weekRange(week)}. Der Raum verwendet automatisch einen neutralen Namen.</p>
  <form data-form="room-activity" data-value="${room.id}"><label>Praxistage der Woche <input name="score" type="number" required min="0" max="7" value="${own?.score??activeDays(state,week).size}"></label><button class="button primary">Beitrag freigeben</button></form>
  </section><section class="surface utility"><h2>${buddy?'Euer Fortschritt':'Beiträge nach Teilnahme'}</h2><p id="room-total">${total} Praxistage gemeinsam</p><div id="room-results">${roomRows(room)}</div><p>Bis zu ${buddy?'zwei':'zwanzig'} Personen · verfügbar bis ${dateLabel(localDate(new Date(room.expires)))}</p>${btn('Einladungslink kopieren','copy-room',room.id,'button secondary')}</section></div>`;
}
function roomPage(id) {
  if(!/^[A-Za-z0-9_-]{24}$/.test(id||'')) return missing();
  if(!roomSupported()) return titleBlock('PRIVATER RAUM','Dieser Raum braucht die Serverversion.','Öffne den ursprünglichen Einladungslink auf dem Server, auf dem der Raum erstellt wurde.');
  const room=currentRoom?.id===id?currentRoom:null;
  if(room?.error) return titleBlock('PRIVATER RAUM','Raum konnte nicht geöffnet werden.',esc(room.error))+btn('Erneut versuchen','refresh-room',id,'button secondary');
  if(!room) return titleBlock('PRIVATER RAUM','Raum wird geladen …','Wir holen die gemeinsame Ergebnisliste.');
  const quest=quests[room.quest];
  if(!quest) return activityRoomPage(room);
  const own=room.rows.find(row=>row.mine);
  return `${titleBlock('PRIVATER RAUM',quest.title,'Personen mit dem Einladungslink können die Ergebnisliste sehen und eigene Werte eintragen.')}
  <div class="detail-grid"><section class="surface mission"><h2>Ein Ergebnis eintragen</h2><p>Verwende einen Spitznamen. Raumwerte werden als Selbstauskunft gespeichert und ersetzen deine vorherige Wertung für diesen Raum.</p>
  <details><summary>Regeln für vergleichbare Versuche</summary><ol>${quest.steps.map(step=>`<li>${esc(step)}</li>`).join('')}</ol></details>
  <form data-form="room-score" data-value="${id}"><label>Spitzname<input name="name" maxlength="28" required value="${esc(own?.name||state.name)}"></label><label>${quest.result}<input name="score" type="number" required min="0" max="${quest.max}" value="${esc(own?.score)}"></label><button class="button primary">In gemeinsamer Liste speichern</button></form>
  </section><section class="surface utility"><h2>Gemeinsame Rangliste</h2><p>Aktualisiert sich automatisch. Der Raum bleibt bis ${dateLabel(localDate(new Date(room.expires)))} verfügbar.</p><div id="room-results">${rankingRows(room.rows,quest)}</div>${btn('Einladungslink kopieren','copy-room',id,'button secondary')}</section></div>`;
}
async function refreshRoom(id) {
  if(roomLoading||roomWriting||!roomSupported()) return;
  roomLoading=true;
  const route='raum/'+id;
  try {
    const data=await callRoom('/'+id,{token:knownRoomToken()});
    if(location.hash!=='#'+route) return;
    const list=main.querySelector('#room-results');
    currentRoom={id,...data};
    if(list) {
      list.innerHTML=roomRows(currentRoom);
      const total=main.querySelector('#room-total');
      if(total) total.textContent=data.rows.reduce((sum,row)=>sum+row.score,0)+' Praxistage gemeinsam';
    } else render();
  } catch(error) {
    if(location.hash!=='#'+route) return;
    if(main.querySelector('#room-results')) return;
    currentRoom={id,error:error.message};
    render();
  } finally {roomLoading=false;}
}
function watchRoom() {
  clearInterval(roomTimer);
  const [page,id]=location.hash.slice(1).split('/');
  if(page!=='raum'||!/^[A-Za-z0-9_-]{24}$/.test(id||'')||!roomSupported()) return;
  refreshRoom(id);
  roomTimer=setInterval(()=>refreshRoom(id),5000);
}
function invitesList() {
  return state.invites.length?`<div class="stack">${state.invites.map(invite=>`<article class="surface list-row"><div><h3>${quests[invite.quest].title}</h3><p>${dateLabel(invite.day)} · ${invite.done&&friendFinished(state,invite)?'Gemeinsam erledigt':invite.done?'Du bist fertig':friendFinished(state,invite)?'Dein Gegenüber ist fertig':'Geplant'}</p></div><div class="actions">${link('Quest ansehen','quest/'+invite.quest+'/'+invite.code,'button secondary')}${btn('Einladung teilen','share-invite',invite.code,'text-button')}${btn('Entfernen','remove-invite',invite.code,'text-button')}</div></article>`).join('')}</div>`:empty('Öffne eine Quest und wähle „Gemeinsam machen“, um einen Einladungslink zu erstellen.');
}
function weekPage() {
  const week=monday(), upcoming=state.plans.slice().sort((a,b)=>a.day.localeCompare(b.day));
  const horizon=weekGoal(state,shift(week,7));
  return `${titleBlock('DEINE WOCHE','Mach Platz für Erlebnisse.','Plane einzelne Quests oder kombiniere Hobbys in einem Wochenvorhaben.')}
    <div class="detail-grid"><section class="surface mission"><h2>Geplante Quests</h2>${upcoming.length?`<ul class="plain-list">${upcoming.map(item=>`<li><div><a href="#quest/${item.quest}">${quests[item.quest].title}</a><p>${dateLabel(item.day)}${item.done?' · erledigt':''}</p></div><div class="actions">${item.done?'':btn('Verschieben','reschedule',item.id,'text-button')}${btn('Entfernen','remove-plan',item.id,'text-button')}</div></li>`).join('')}</ul>`:empty('Noch nichts geplant. Du kannst jede freigeschaltete Quest einplanen.') }${link('Quest finden','entdecken','button secondary')}</section>
    <aside>${weekCard()}<section class="surface utility goal"><h2>Wochenziel</h2><p>Änderungen gelten ab Montag der nächsten Woche.</p><form data-form="goal"><label>Aktive Tage pro Woche<input name="goal" type="number" min="1" max="7" required value="${horizon}"></label><button class="button secondary">Ziel speichern</button></form></section></aside></div>
    ${expeditionWeek()}
    <section class="section"><h2>Wochenvorhaben</h2><div class="hobby-grid">${journeys.map(journey=>{
      const started=state.journeys.includes(journey.id);
      const hits=journey.quests.filter(id=>completed(state,id)).length;
      return `<article class="surface utility"><div class="tile-icon lilac">${journey.icon}</div><h3>${journey.title}</h3><p>${journey.text}</p>${started?`<p><strong>${hits} / ${journey.quests.length} erledigt</strong></p><ul>${journey.quests.map(id=>`<li><a href="#quest/${id}">${quests[id].title}</a> ${completed(state,id)?'✓':''}</li>`).join('')}</ul>`:btn('Vorhaben starten','journey',journey.id,'button secondary')}</article>`;
    }).join('')}</div></section>`;
}
function sharesPage(id) {
  if(!roomSupported()) return titleBlock('FREIGABEN','Für Freigaben wird die Serverversion benötigt.','Öffne den ursprünglichen Link auf dem Hobbymaxing-Server.');
  const current=sharesView?.id===id?sharesView:null;
  if(current?.error) return titleBlock('FREIGABEN','Link konnte nicht geladen werden.',esc(current.error));
  if(!current) return titleBlock('FREIGABEN','Wird geladen …','');
  if(id) {
    const {kind,stations,projects,days,quest}=current;
    return kind==='project'?titleBlock('GETEILTE PROJEKTKARTE',esc(quests[quest].title),'Erfolgreich abgeschlossen · Selbstauskunft')+link('Lernpfad ansehen','pfad/'+quests[quest].hobby,'button secondary'):
    titleBlock('GETEILTER FORTSCHRITT','Hobbymaxing-Fortschritt','Anonym freigegebener Stand zum Zeitpunkt der Erstellung.')+
    `<ul class="plain-list surface utility"><li>${stations} abgeschlossene Etappen</li><li>${projects} abgeschlossene Meisterstücke</li><li>${days} Praxistage in der damaligen Woche</li></ul>`;
  }
  return `${titleBlock('DEIN PROFIL','Geteilte Links','Widerrufe einen Link, um den Zugriff auf seinen Inhalt zu beenden. Links laufen nach 30 Tagen ab.')}
    <section class="surface utility">${btn('Fortschrittsseite freigeben','prepare-share','progress','button primary')}
    ${current.shares.length?`<ul class="plain-list">${current.shares.map(({code,kind,expires})=>`<li><div>${link(kind==='project'?'Projektkarte':'Fortschrittsseite','freigaben/'+code,'text-button')}<small>Bis ${dateLabel(localDate(new Date(expires)))}</small></div>${btn('Link widerrufen','revoke-share',code,'button secondary')}</li>`).join('')}</ul>`:empty('Du hast keine aktiven Freigaben.')}</section>`;
}
async function refreshShares(id) {
  if(!roomSupported()) return;
  const route='#freigaben'+(id?'/'+id:'');
  try {
    if(id&&!/^[A-Za-z0-9_-]{24}$/.test(id)) throw Error('Dieser Link ist ungültig.');
    const token=id?'':knownRoomToken();
    const data=id||token?await callRoom('/shares'+(id?'/'+id:''),{token}):{shares:[]};
    if(location.hash!==route) return;
    sharesView={id,...data};
  } catch(error) {
    if(location.hash!==route) return;
    sharesView={id,error:error.message};
  }
  render();
}
function profilePage() {
  const {running,best}=streaks(state);
  const daily=dailyStreak(state);
  const bests=new Map();
  for(const entry of state.entries) {
    if(entry.score===null) continue;
    const id=[entry.quest,entry.version,entry.condition].join('|');
    if(!bests.has(id)||bests.get(id).score<entry.score) bests.set(id,entry);
  }
  return `${titleBlock('DEIN PROFIL',state.name?'Hi, '+esc(state.name)+'.':'Dein Projektbuch.','Hier findest du die Quests, Projekte und persönlichen Bestleistungen, die du gesammelt hast.')}
    <div class="actions expedition-actions">${link('Meisterstück-Galerie','galerie','button secondary')}${link('Fähigkeiten','faehigkeiten','button secondary')}${link('Für später','gespeichert','button secondary')}${link('Hobbyjournal','journal','button secondary')}${onlineRooms?link('Freigaben verwalten','freigaben','button secondary'):''}</div>
    <div class="stat-grid"><div class="surface stat"><span>${svg('bolt')} Erfahrung</span><strong>${totalXp(state)} XP</strong></div><div class="surface stat"><span>${svg('flame')} Tagesstreak</span><strong>${daily.running} T.</strong><small>Bestwert: ${daily.best} ${daily.best===1?'Tag':'Tage'}</small></div><div class="surface stat"><span>✦ Aktuelle Wochenserie</span><strong>${running} Wo.</strong></div><div class="surface stat"><span>${svg('trophy')} Beste Wochenserie</span><strong>${best} Wo.</strong></div></div>
    <div class="detail-grid section"><section class="surface mission"><h2>Projektbuch</h2>${state.entries.length?`<ul class="plain-list timeline">${state.entries.map(entry=>`<li><div><small>${dateLabel(entry.day)} · ${quests[entry.quest].type}</small><h3><a href="#quest/${entry.quest}">${quests[entry.quest].title}</a></h3><p>${entry.score==null?'':entry.score+' · '}${esc(entry.result)}</p>${entry.note?`<p>${esc(entry.note)}</p>`:''}${(entry.quest==='challenge-foto'||quests[entry.quest].stage===4)?`<div class="project-photo" data-photo="${esc(entry.id)}"></div>`:''}</div>${btn('Erfolgskarte','card',entry.id,'text-button')}</li>`).join('')}</ul>`:empty('Schließe deine erste Quest ab. Dann taucht sie hier auf.') }
    <h2>Abgeschlossene Wochenvorhaben</h2>${state.journeys.map(id=>journeys.find(journey=>journey.id===id)).filter(journey=>journey.quests.every(id=>completed(state,id))).map(journey=>`<p>${journey.icon} ${journey.title}</p>`).join('')||empty('Deine fertigen Wochenvorhaben erscheinen hier.')}</section>
    <aside class="surface utility"><h2>Deine Hobbys</h2>${state.active.length?`<ul class="levels">${state.active.map(id=>`<li><a href="#pfad/${id}">${byHobby[id].icon} ${byHobby[id].name}</a><strong>Level ${level(state,byHobby[id])}</strong></li>`).join('')}</ul>`:empty('Noch keine Hobbys gemerkt.')}
    <h2>Abzeichen</h2><ul class="badges">${badges(state).map(([icon,label,has])=>`<li class="${has?'earned':''}"><span>${icon}</span><span>${label}</span><small>${has?'Erhalten':'Offen'}</small></li>`).join('')}</ul>
    <h2>Bestleistungen</h2>${bests.size?`<ul class="levels">${[...bests.values()].map(entry=>`<li><span>${quests[entry.quest].title}<small>${entry.condition==='standard'?'Standardregeln':esc(entry.condition)}</small></span><strong>${entry.score}</strong></li>`).join('')}</ul>`:empty('Messbare Ergebnisse werden nach Bedingungen und Quest-Version verglichen.') }</aside></div>
    <section class="surface utility section narrow"><h2>Profileinstellungen</h2><p>Dein Fortschritt liegt in diesem Browser. Wenn du eine Erfolgskarte teilst, enthält sie deinen gewählten Anzeigenamen und das Ergebnis. Deine private Notiz bleibt hier.</p><form data-form="profile"><label>Anzeigename <input name="name" maxlength="28" value="${esc(state.name)}" placeholder="Optional"></label><button class="button secondary">Speichern</button></form>
    <h2>Fortschritt sichern</h2><p>Die Sicherung enthält Ergebnisse und Notizen, Termine, Wochenvorhaben, Einladungen, importierte Ranglistenwerte, Einstellungen und Entwürfe. Fotos bleiben auf diesem Gerät.</p>
    <div class="actions">${btn('Fortschritt herunterladen','backup','','button secondary')}${btn('Sicherung importieren','restore','','button secondary')}${btn('Browserdaten löschen','delete-profile','','text-button')}</div>
    <h2>Darstellung</h2><form class="expedition-form" data-form="reading"><label>Lesemodus<select name="reading">${readingChoices.map(([value,label])=>`<option value="${value}" ${state.expedition.reading===value?'selected':''}>${label}</option>`).join('')}</select></label>
    <label><input type="checkbox" name="motion" ${state.expedition.reducedMotion?'checked':''}> Bewegung und Effekte reduzieren</label><button class="button secondary">Darstellung speichern</button></form>
    <h2>Übungserinnerung</h2><p>Die Erinnerung erscheint nur, wenn Hobbymaxing geöffnet ist. Du kannst sie hier jederzeit ausschalten.</p>
    <form data-form="reminder"><label>Rhythmus<select name="days">${[[0,'Pausiert'],[1,'Einmal täglich'],[7,'Einmal pro Woche']].map(([days,label])=>`<option value="${days}" ${state.expedition.reminder.days===days?'selected':''}>${label}</option>`).join('')}</select></label><button class="button secondary">Rhythmus speichern</button></form></section>`;
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
    ${quest.type==='Challenge'?btn('Zur Rangliste oder Ergebnisliste hinzufügen','accept-score',code,'button primary'):''} ${link('Quest ausprobieren','quest/'+data.quest,'button secondary')}</section>`;
}
function checkReminder() {
  const today=localDate();
  const {days,last}=state.expedition.reminder;
  if(!days||shift(last,days)>today||document.hidden) return;
  if(save(latest=>{
    const next=latest.expedition.reminder;
    if(!next.days||shift(next.last,next.days)>today) return false;
    next.last=today;
  },{refresh:false})) alertUser('Zeit für eine kleine Übung? Auf „Heute“ findest du deine nächste Quest.');
}
function render() {
  const {reading,reducedMotion}=state.expedition;
  document.documentElement.dataset.reading=reading;
  document.documentElement.dataset.motion=reducedMotion||reading==='text'?'reduced':'auto';
  const [page,id,param]=(location.hash==='#main'?'heute':location.hash.slice(1)).split('/');
  const selected=({pfad:'entdecken',quest:'entdecken',fokus:'entdecken',wissen:'entdecken',labor:'entdecken',studio:'entdecken',praxis:'entdecken',saison:'entdecken',faehigkeiten:'profil',galerie:'profil',gespeichert:'profil',journal:'profil',freigaben:'profil',challenge:'challenges',ranglisten:'challenges',raum:'challenges',woche:'heute'})[page]||page||'heute';
  nav.innerHTML=navigation.map(([route,label,icon])=>`<a href="#${route}" ${route===selected?'aria-current="page"':''}>${svg(icon)}<span>${label}</span></a>`).join('');
  const dark=document.documentElement.dataset.theme==='dark';
  top.innerHTML=`<div class="top-left"><span class="mobile-mark mark">✳</span><div><p>${new Intl.DateTimeFormat('de-DE',{weekday:'long',day:'numeric',month:'long'}).format(new Date())}</p><strong>${state.name?'Hi, '+esc(state.name):'Willkommen bei Hobbymaxing'}</strong></div></div><div class="top-stats"><button class="button secondary theme-toggle" type="button" data-action="toggle-theme" aria-pressed="${dark}" aria-label="${dark?'Helles':'Dunkles'} Design aktivieren">${dark?'☀ Helles Design':'☾ Dunkles Design'}</button><a class="xp-chip" href="#profil">${svg('bolt')} <strong>${totalXp(state)} XP</strong></a><a class="avatar" href="#profil" aria-label="Profil">${state.name?esc(Array.from(state.name)[0].toLocaleUpperCase('de')):svg('user')}</a></div>`;
  const views={heute:todayPage,entdecken:discoverPage,karte:id=>gameMapPage(totalXp(state),id),pfad:pathPage,quest:questPage,fokus:focusPage,wissen:quizPage,labor:labPage,studio:studioPage,praxis:id=>practiceStudioPage(id)||missing(),saison:seasonPage,faehigkeiten:skillPage,galerie:galleryPage,gespeichert:savedPage,journal:journalPage,freigaben:sharesPage,hilfe:supportPage,challenges:challengeIndex,challenge:challengePage,ranglisten:rankingPage,raum:roomPage,woche:weekPage,profil:profilePage,quellen:sourcesPage,teilen:sharedPage};
  unmountPracticeStudio();
  main.innerHTML=(Object.hasOwn(views,page||'heute')?views[page||'heute']:missing)(id,param);
  if(page==='praxis') mountPracticeStudio(main,id,{
    read:studio=>state.practiceDrafts[studio],
    write:(studio,data)=>save(latest=>{
      const draft=sanitizePracticeDraft(studio,data);
      if(draft==null) return false;
      latest.practiceDrafts[studio]=draft;
    },{refresh:false})
  });
  if(page==='profil'||page==='galerie'||page==='journal') showPhotos(main);
  startFocusTicker(page);
}
document.querySelector('.skip').addEventListener('click',event=>{
  event.preventDefault();
  main.focus();
  main.scrollIntoView({block:'start'});
});
function openModal(title,contents) {
  modal.innerHTML=`<div class="modal-header"><h2 id="dialog-title" tabindex="-1">${title}</h2>${btn('Schließen','close','','text-button')}</div>${contents}`;
  modal.setAttribute('aria-labelledby','dialog-title');
  if(!modal.open) modal.showModal();
  else modal.querySelector('h2')?.focus();
}
const modalForm=(name,id,contents,label)=>`<form data-form="${name}" data-value="${esc(id)}">${contents}<button class="button primary" type="submit">${label}</button></form>`;
function finishDialog(id,entry) {
  const [questId,invite]=id.split('~');
  const quest=quests[questId];
  if(!quest||(!entry&&!unlocks(state,quest))) return;
  const result=quest.max?
    `<label>${quest.result}<input name="score" type="number" inputmode="numeric" required min="0" max="${quest.max}" value="${esc(entry?.score)}"></label>`:
    `<label>${quest.result}<input name="result" required maxlength="160" placeholder="Dein Ergebnis in einem Satz" value="${esc(entry?.result)}"></label>`;
  const condition=quest.max&&quest.type!=='Challenge'?`<label>Vergleichsbedingungen<input name="condition" required maxlength="100" placeholder="z. B. 3 m, linker Fuß, gleiches Ziel" value="${esc(entry?.condition)}"></label>`:'';
  const prior=state.entries.some(entry=>entry.quest===questId&&(quest.type!=='Challenge'||entry.week===monday()));
  const rubric=quest.stage===4&&!entry?expeditionContent(byHobby[quest.hobby],quest).rubric:[];
  const checks=rubric.length?`<fieldset><legend>Prüfe dein Meisterstück</legend>${rubric.map((criterion,index)=>`<label><input type="checkbox" name="criterion" value="${index}" required> ${esc(criterion)}</label>`).join('')}</fieldset>`:'';
  openModal(entry?'Ergebnis korrigieren':quest.stage===4?'Meisterstück abschließen':'Quest abschließen',modalForm(entry?'edit-entry':'finish',entry?.id||id,
    `<p>${quest.title} · ${prior?'Wiederholung':'+'+quest.xp+' XP'}</p>${checks}${result}${condition}
      ${entry||quest.type==='Challenge'?'':`<label>Wie sicher fühlst du dich?<select name="confidence"><option value="">Noch offen</option><option value="retry">Ich möchte die Technik noch einmal üben</option><option value="ready">Ich bin bereit für den nächsten Schritt</option></select></label>`}
      <label>Private Notiz <textarea name="note" maxlength="420" placeholder="Was hat gut geklappt?">${esc(entry?.note)}</textarea></label>
      ${(quest.id==='challenge-foto'||quest.stage===4)?'<label>Privates Foto für dein Projektbuch (optional)<input type="file" name="photo" accept="image/jpeg,image/png,image/webp"></label>':''}
      <p id="result-error" role="alert" hidden></p>
      ${invite?'<p class="notice">Der Abschluss zählt auch für eure gemeinsame Quest.</p>':''}`,'Ergebnis speichern'));
}
function cardDialog(entry,{recent=false,returnInvite=''}={}) {
  if(!entry) return;
  const quest=quests[entry.quest];
  const hobby=byHobby[quest.hobby];
  const advanced=hobby.quests.filter(item=>item.requires.includes(quest.id)&&unlocks(state,item)&&!completed(state,item.id));
  const options=advanced.length?advanced:[nextQuest(state,hobby)].filter(Boolean);
  const retry=entry.confidence==='retry';
  const wasBest=entry.score!==null&&(entry.best===null||entry.score>entry.best);
  openModal(quest.stage===4?'Meisterstück abgeschlossen':'Deine Erfolgskarte',`<div class="success-card ${hobby.group}"><div class="tile-icon">${hobby.icon}</div><p class="eyebrow">${esc(hobby.name)} · ${entry.xp?('+'+entry.xp+' XP'):'Wiederholung'}</p><h3>${quest.title}</h3><p>${entry.score===null?'':entry.score+' · '}${esc(entry.result||quest.result)}</p>
  ${entry.previous!==null?`<p>Letzter vergleichbarer Versuch: ${entry.previous}</p>`:''}${wasBest?'<p><strong>Persönliche Bestleistung</strong></p>':''}</div>
  ${quest.stage===4?`<p>${entry.verified?'Du hast alle Projektkriterien bestätigt. ':''}${link('Zur privaten Meisterstück-Galerie','galerie','button primary')}</p>`:''}
  <p>${retry?'Wiederhole die Übung und achte auf eine einzige Änderung. In „Heute“ kann sie als Nächstes erscheinen.':resultFeedback(quest)}</p>
  <div class="actions">${retry?link('Übung wiederholen','quest/'+quest.id,'button primary'):''}${options.map((item,index)=>link(item.title,'quest/'+item.id,'button '+(!retry&&index===0?'primary':'secondary'))).join('')}
  ${returnInvite?`<p>${link('Zur gemeinsamen Quest','quest/'+quests[state.invites.find(invite=>invite.code===returnInvite).quest].id+'/'+returnInvite,'button primary')}</p>`:''}
  <div class="actions">${onlineRooms&&quest.stage===4?btn('Widerrufbare Projektkarte teilen','prepare-share',quest.id,'button secondary'):''}${btn(quest.type==='Challenge'?'Ergebnislink für Freunde kopieren':'Erfolgskarten-Link kopieren','share',entry.id,'button secondary')}${btn('Ergebnis korrigieren','edit-entry',entry.id,'text-button')}${recent?btn('Abschluss rückgängig','undo-entry',entry.id,'text-button'):''}</div>`);
}
function resultFeedback(quest) {
  const guide=starterGuides[quest.id];
  return guide?'Selbstcheck: '+esc(guide.success):'Vergleiche dein Ergebnis mit dem Ziel der Quest. Du kannst jederzeit den nächsten Schritt wählen.';
}
modal.addEventListener('close',()=>{pendingBackup=null;});
function resultValues(data,invite='') {
  const raw=data.get('score');
  return {score:typeof raw==='string'&&raw.trim()?Number(raw):NaN,condition:data.get('condition'),note:data.get('note'),result:data.get('result'),confidence:data.get('confidence'),invite};
}
function resultError(form,message) {
  const note=form.querySelector('#result-error');
  note.textContent=message;
  note.hidden=false;
  form.querySelector('[name="result"],[name="score"]')?.focus();
}
function download(contents,type,name) {
  const url=URL.createObjectURL(new Blob([contents],{type}));
  const file=document.createElement('a');
  file.href=url;
  file.download=name;
  file.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function saveDraft(kind,id,draft) {
  return save(latest=>{latest[kind][id]=[...draft];},{refresh:false});
}
function urlFor(hash) { return new URL('#'+hash,location.href).href; }
function resultLink(entry) {
  if(!state.playerId&&!save(latest=>{latest.playerId ||= crypto.randomUUID();})) return '';
  return urlFor('teilen/'+encode({mode:'result',quest:entry.quest,version:entry.version,week:entry.week,name:state.name||'Mitspieler',player:state.playerId,score:entry.score,result:entry.result||quests[entry.quest].result}));
}
function inviteLink(invite) {
  if(!state.playerId&&!save(latest=>{latest.playerId ||= crypto.randomUUID();})) return '';
  return urlFor('teilen/'+encode({mode:'invite',quest:invite.quest,code:invite.code,day:invite.day,name:state.name||'Mitspieler',sender:state.playerId,done:invite.done}));
}
async function copy(value,message='Link kopiert.') {
  try { await navigator.clipboard.writeText(value); alertUser(message); }
  catch { openModal('Link kopieren',`<label>Link<input value="${esc(value)}" readonly autofocus></label>`); modal.querySelector('input').select(); }
}
function acceptResult(data) {
  if(!validShare(data)||data.mode!=='result'||quests[data.quest].type!=='Challenge') return false;
  return save(latest=>{
    if(data.player&&data.player===latest.playerId) return false;
    const old=latest.scores.find(row=>rankId(row)===rankId(data));
    if(old&&old.score!==null&&old.score>data.score) return false;
    latest.scores=latest.scores.filter(row=>rankId(row)!==rankId(data));
    latest.scores.push(data);
  });
}
document.addEventListener('click',async event=>{
  const action=event.target.closest('[data-action]');
  if(!action) return;
  const {action:kind,value}=action.dataset;
  switch(kind) {
    case 'choose-expedition': {
      if(!quests[value]?.stage||!unlocks(state,quests[value])) break;
      const week=monday();
      if(save(latest=>{
        const selection=latest.expedition.weeks[week]??=[];
        if(selection.includes(value)||selection.length>=3) return false;
        selection.push(value);
      },{refresh:false})) alertUser('Quest für diese Wochenexpedition gewählt.');
      else alertUser('Die Quest ist schon gewählt oder die drei Plätze sind belegt. Du kannst deine Auswahl unter „Woche planen“ ändern.');
      break;
    }
    case 'favorite':
      if(quests[value]?.stage&&save(latest=>{
        const favorites=new Set(latest.expedition.favorites);
        if(favorites.has(value)) favorites.delete(value);
        else favorites.add(value);
        latest.expedition.favorites=[...favorites];
      },{refresh:false})) {
        const saved=state.expedition.favorites.includes(value);
        action.textContent=saved?'Von „Für später“ entfernen':'Für später merken';
        alertUser(saved?'Quest für später gemerkt.':'Quest aus „Für später“ entfernt.');
      }
      break;
    case 'pause-path':
      if(byHobby[value]&&save(latest=>{
        const paused=new Set(latest.expedition.paused);
        if(paused.has(value)) paused.delete(value);
        else paused.add(value);
        latest.expedition.paused=[...paused];
      })) {
        main.querySelector('[data-action="pause-path"]')?.focus();
        alertUser(state.expedition.paused.includes(value)?'Lernpfad pausiert.':'Lernpfad fortgesetzt.');
      }
      break;
    case 'delete-profile':
      openModal('Lokales Profil löschen?',modalForm('delete-profile','',`<p>Damit löschst du den Fortschritt, das Journal, gespeicherte Studioentwürfe und private Fotos dieses Browsers. Zuvor heruntergeladene Sicherungen und bereits geteilte Links bestehen weiter.</p><label><input type="checkbox" required> Ich möchte meine lokalen Profil- und Fotodaten löschen.</label>`,'Profil endgültig löschen'));
      break;
    case 'apply-backup': {
      if(!pendingBackup) break;
      let counts;
      if(save(latest=>{counts=mergeBackup(latest,pendingBackup);},{refresh:false})) {
        pendingBackup=null;
        language=state.language;
        labDrafts=structuredClone(state.labDrafts);
        studioDrafts=structuredClone(state.studioDrafts);
        render();
        openModal('Sicherung übernommen',`<p>${counts.added} Ergebnisse, Termine, Einladungen oder Ranglistenwerte hinzugefügt oder aktualisiert. ${counts.skipped} doppelte oder ungültige Einträge übersprungen.</p><p>Hobbys, Journal, Einstellungen, Studioentwürfe und Wochenvorhaben wurden zusammengeführt.</p>`);
      }
      break;
    }
    case 'toggle-theme': {
      const dark=document.documentElement.dataset.theme!=='dark';
      document.documentElement.dataset.theme=dark?'dark':'light';
      try { localStorage.setItem('hobbymaxing-theme',dark?'dark':'light'); }
      catch { alertUser('Der Browser konnte die Einstellung nicht speichern.'); }
      render();
      top.querySelector('.theme-toggle')?.focus();
      break;
    }
    case 'close': modal.close(); break;
    case 'pick-mood': {
      const options=moodQuests(state,value);
      const available=options.filter(item=>item.quest.id!==discoveryPick?.choice?.quest.id&&!state.expedition.paused.includes(item.hobby.id));
      const pool=available.length?available:options;
      discoveryPick={mood:value,choice:pool.length?pool[Math.floor(Math.random()*pool.length)]:null};
      render();
      main.querySelector('.mood-result')?.focus();
      break;
    }
    case 'focus-open':
      if(quests[value]&&unlocks(state,quests[value])) location.hash='fokus/'+value;
      break;
    case 'timer-start':
    case 'timer-pause':
    case 'timer-reset': {
      const quest=quests[value];
      if(!quest||!unlocks(state,quest)) break;
      const remaining=focusRemaining(value);
      if(kind==='timer-pause') focusTimer={quest:value,remaining,deadline:0};
      else if(kind==='timer-reset') focusTimer={quest:value,remaining:quest.minutes*60,deadline:0};
      else {
        const seconds=remaining||quest.minutes*60;
        focusTimer={quest:value,remaining:seconds,deadline:Date.now()+seconds*1000};
      }
      storeFocusTimer();
      render();
      startFocusTicker('fokus');
      break;
    }
    case 'prepare-share': {
      const quest=quests[value];
      if(!onlineRooms||(value!=='progress'&&(quest?.stage!==4||!completed(state,value)))) break;
      openModal('Link freigeben?',modalForm('publish-share',value,`<p>${quest?'Die Karte zeigt den Projekttitel und den Abschluss.':'Die Seite zeigt nur die Anzahl abgeschlossener Etappen und Projekte sowie deiner Praxistage in dieser Woche.'} Personen mit dem Link können diese Angaben abrufen. Der Link lässt sich im Profil widerrufen.</p><label><input type="checkbox" required> Ich stimme der Freigabe dieser Angaben zu.</label>`,'Link erstellen'));
      break;
    }
    case 'copy-snapshot':
      copy(urlFor('freigaben/'+value));
      break;
    case 'revoke-share':
      action.disabled=true;
      try {
        await callRoom('/shares/'+value,{method:'DELETE',token:knownRoomToken()});
        await refreshShares();
        main.querySelector('[data-action="prepare-share"]')?.focus();
        alertUser('Link widerrufen.');
      } catch(error) {alertUser(error.message);action.disabled=false;}
      break;
    case 'create-room':
      action.disabled=true;
      try {
        const room=await callRoom('',{method:'POST',body:{quest:value}});
        location.hash='raum/'+room.code;
      } catch(error) {alertUser(error.message);}
      finally {action.disabled=false;}
      break;
    case 'copy-room': copy(urlFor('raum/'+value)); break;
    case 'refresh-room':
      currentRoom=null;
      render();
      refreshRoom(value);
      break;
    case 'toggle-translations': {
      hiddenTranslations=!hiddenTranslations;
      const region=main.querySelector('#phrase-cards');
      if(region) {region.innerHTML=phraseCards();region.querySelector('[data-action="toggle-translations"]')?.focus();}
      break;
    }
    case 'checkpoint':
      if(quests[value]?.elapsedDays&&save(latest=>{
        if(!unlocks(latest,quests[value])) return false;
        const days=latest.checkpoints[value]??=[];
        if(days.length&&shift(days.at(-1),quests[value].checkpointGap||1)>localDate()) return false;
        days.push(localDate());
      })) alertUser('Kontrollpunkt gespeichert.');
      break;
    case 'edit-entry': {
      const entry=state.entries.find(item=>item.id===value);
      if(entry) finishDialog(entry.quest,entry);
      break;
    }
    case 'undo-entry':
      if(save(latest=>changeEntry(latest,value))) {deletePhoto(value).catch(()=>{});modal.close();alertUser('Abschluss rückgängig gemacht.');}
      break;
    case 'merge-plan': {
      const [id,day]=value.split('~');
      if(save(latest=>updatePlan(latest,id,day,true)==='done')) {modal.close();alertUser('Termine zusammengeführt.');}
      break;
    }
    case 'speak': {
      const [id,index]=value.split('~');
      const item=languages[id];
      const phrase=item?.pairs[Number(index)]?.[0];
      if(!phrase||!window.speechSynthesis||!window.SpeechSynthesisUtterance) {alertUser('Dein Browser unterstützt hier keine Sprachausgabe.'); break;}
      const voices=speechSynthesis.getVoices();
      const voice=selectSpeechVoice(voices,item);
      const utterance=new SpeechSynthesisUtterance(phrase);
      utterance.lang=item.locale;
      if(voice) utterance.voice=voice;
      utterance.rate=.85;
      utterance.onstart=()=>alertUser('Aussprache: '+(voice?voice.lang:item.locale));
      utterance.onerror=error=>{if(!['canceled','interrupted'].includes(error.error)) alertUser('Keine passende Stimme verfügbar. Prüfe, ob '+item.name+' in den Geräteeinstellungen installiert ist.');};
      speechSynthesis.cancel();
      speechSynthesis.speak(utterance);
      break;
    }
    case 'offline-card': {
      const quest=quests[value];
      if(!quest||!unlocks(state,quest)) break;
      const hobby=byHobby[quest.hobby], content=expeditionContent(hobby,quest);
      const card=[
        hobby.name+' · '+quest.title,
        questTime(quest)+' · '+quest.place,
        'Material: '+(quest.materials||hobby.materials),
        'Sicherheit: '+content.safety,
        '',
        ...quest.steps.map((step,index)=>(index+1)+'. '+step),
        '',
        'Ergebnis: '+quest.result,
        'Kurze Variante: '+content.variants.short,
        ...content.rubric.map(item=>'[ ] '+item)
      ].join('\n');
      download(card,'text/plain;charset=utf-8',quest.id+'.txt');
      break;
    }
    case 'backup':
      download(profileBackup(state),'application/json','hobbymaxing-fortschritt-'+localDate()+'.json');
      break;
    case 'restore':
      openModal('Fortschritt übernehmen',modalForm('restore','',`<p>Vorhandener Fortschritt bleibt erhalten. Wähle eine von Hobbymaxing exportierte Sicherungsdatei.</p><label>Sicherungsdatei<input name="backup" type="file" accept=".json,application/json" required></label>`,'Sicherung übernehmen'));
      break;
    case 'coach-prompt': {
      const form=action.closest('form');
      form.elements.question.value=value;
      form.requestSubmit();
      break;
    }
    case 'studio-cell':
    case 'studio-check':
    case 'studio-reset':
    case 'studio-play': {
      const [id,cell]=value.split('~');
      if(!Object.hasOwn(studios,id)) return;
      const draft=studioDrafts[id] ??= [];
      if(kind==='studio-play') {
        if(!draft.length) {alertUser('Setze zuerst mindestens einen Schlag.'); break;}
        action.disabled=true;
        playBeat([...draft]).catch(()=>alertUser('Dein Browser konnte die Audiospur nicht abspielen.')).finally(()=>{action.disabled=false;});
        break;
      }
      if(kind==='studio-cell') {
        const index=Number(cell), at=draft.indexOf(index);
        if(at===-1) draft.push(index);
        else draft.splice(at,1);
        saveDraft('studioDrafts',id,draft);
        delete studioReplies[id];
        action.setAttribute('aria-pressed',String(at===-1));
        main.querySelector('#studio-feedback')?.remove();
        break;
      }
      if(kind==='studio-reset') {
        saveDraft('studioDrafts',id,[]);
        studioDrafts[id]=[];
        delete studioReplies[id];
      } else {
        const reply=checkStudio(id,draft);
        studioReplies[id]=reply;
        if(reply.pass) awardPractice('studio-'+id,25);
      }
      render();
      if(kind==='studio-check') main.querySelector('#studio-feedback')?.focus();
      else main.querySelector('[data-action="studio-reset"]')?.focus();
      break;
    }
    case 'lab-add':
    case 'lab-undo':
    case 'lab-reset':
    case 'lab-run': {
      const [id,block]=value.split('~');
      const exercise=experiments.find(item=>item.id===id);
      if(!exercise||!experiments.slice(0,experiments.indexOf(exercise)).every(item=>Object.hasOwn(state.practice,'lab-'+item.id))) return;
      const draft=labDrafts[id] ??= [];
      if(kind==='lab-add') {
        if(draft.length===12) {alertUser('Bis zu zwölf Blöcke passen in diese Übung.'); break;}
        if(exercise.palette.includes(block)) draft.push(block);
      } else if(kind==='lab-undo') draft.pop();
      else if(kind==='lab-reset') draft.length=0;
      if(kind==='lab-run') {
        const run=runBlocks(draft,exercise);
        labRuns[id]=run;
        if(run?.pass) awardPractice('lab-'+id,25);
      } else {
        saveDraft('labDrafts',id,draft);
        delete labRuns[id];
      }
      render();
      if(kind==='lab-run') main.querySelector('#lab-feedback')?.focus();
      else {
        const matching=[...main.querySelectorAll('[data-action="'+kind+'"]')].find(button=>button.dataset.value===value);
        (matching||main.querySelector('[data-action="lab-run"]'))?.focus();
      }
      break;
    }
    case 'quick':
      filter={group:'all',query:'',place:value==='home'?'Zu Hause':'',gear:'',time:value==='time'?'10':'',stage:value==='new'?'Einstieg':'',cost:''};
      location.hash='entdecken';
      break;
    case 'category':
      filter.group=value;
      document.querySelectorAll('[data-action="category"]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.value===value)));
      document.querySelector('#results').innerHTML=catalogResults();
      if(action.classList.contains('expedition-region')) document.querySelector('#results').focus();
      break;
    case 'active':
      save(latest=>{latest.active=latest.active.includes(value)?latest.active.filter(id=>id!==value):[...latest.active,value];});
      break;
    case 'print-path': {
      const closed=[...main.querySelectorAll('details:not([open]):not(.expedition-journal):not(:has(form))')];
      for(const detail of closed) detail.open=true;
      try { window.print(); }
      finally { for(const detail of closed) detail.open=false; }
      break;
    }
    case 'rest-day':
      if(save(latest=>takeRestDay(latest))) alertUser('Erholungstag genutzt. Deine Tagesstreak bleibt erhalten.');
      else alertUser('Ein Erholungstag ist nur einmal pro Woche während einer aktiven Serie möglich.');
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
      if(entry) {
        const url=resultLink(entry);
        if(url) copy(url);
      }
      break;
    }
    case 'share-invite': {
      const invite=state.invites.find(item=>item.code===value);
      if(invite) {const url=inviteLink(invite); if(url) copy(url);}
      break;
    }
    case 'import':
      openModal('Ergebnis importieren',modalForm('import','','<label>Ergebnislink <input name="link" type="url" required maxlength="4200"></label>','Ergebnis übernehmen'));
      break;
    case 'accept-score': {
      const data=decode(value);
      if(acceptResult(data)) {
        importedRank=rankId(data);
        location.hash='ranglisten/'+data.week+'/'+data.quest;
        alertUser('Ergebnis hinzugefügt.');
      } else alertUser('Dieses Ergebnis lässt sich nicht übernehmen.');
      break;
    }
    case 'join': {
      const data=decode(value);
      if(!validShare(data)||data.mode!=='invite') return;
      if(save(latest=>inviteJoin(latest,data))) location.hash='quest/'+data.quest+'/'+data.code;
      else alertUser('Diese Einladung kann nicht übernommen werden.');
      break;
    }
  }
});
document.addEventListener('submit',async event=>{
  const form=event.target;
  event.preventDefault();
  const values=new FormData(form);
  const id=form.dataset.value;
  switch(form.dataset.form) {
    case 'publish-share': {
      if(!onlineRooms) break;
      const quest=quests[id];
      if(id!=='progress'&&(quest?.stage!==4||!completed(state,id))) break;
      const routes=hobbies.map(hobby=>routeSummary(state,hobby));
      const body=quest?{kind:'project',quest:quest.id}:{
        kind:'progress',
        stations:routes.flat().filter(station=>station.done).length,
        projects:routes.filter(route=>route[3].done).length,
        days:activeDays(state,monday()).size
      };
      const submit=form.querySelector('button[type="submit"]');
      submit.disabled=true;
      try {
        const data=await callRoom('/shares',{method:'POST',token:roomToken(),body});
        if(!form.isConnected) return;
        openModal('Dein Freigabelink',`<p>${link('Freigabeseite öffnen','freigaben/'+data.code,'text-button')}</p><div class="actions">${btn('Link kopieren','copy-snapshot',data.code,'button primary')}${link('Freigaben verwalten','freigaben','button secondary')}</div>`);
      } catch(error) {alertUser(error.message);}
      finally {submit.disabled=false;}
      break;
    }
    case 'room-score':
    case 'room-activity': {
      if(roomWriting) break;
      const name=values.get('name')?.trim(), score=Number(values.get('score'));
      if(form.dataset.form==='room-score'&&!name) {alertUser('Gib einen Spitznamen ein.');break;}
      roomWriting=true;
      try {
        const data=await callRoom('/'+id,{method:'PUT',token:roomToken(),body:{name,score}});
        if(location.hash==='#raum/'+id) {
          currentRoom={id,...data};
          main.querySelector('#room-results').innerHTML=roomRows(currentRoom);
          const total=main.querySelector('#room-total');
          if(total) total.textContent=data.rows.reduce((sum,row)=>sum+row.score,0)+' Praxistage gemeinsam';
          alertUser('In der gemeinsamen Rangliste gespeichert.');
        }
      } catch(error) {alertUser(error.message);}
      finally {roomWriting=false;}
      break;
    }
    case 'coach': {
      const selected=values.get('hobby');
      const question=values.get('question').trim().slice(0,300);
      if(!question) return;
      const focusQuest=quests[form.dataset.quest]?.hobby===selected?quests[form.dataset.quest]:null;
      const match=question.match(/schritt\s*(\d+)|(\d+)\.?\s*(?:ter\s*)?schritt/i);
      const index=match?Number(match[1]||match[2])-1:-1;
      const step=focusQuest&&Number.isInteger(index)?focusQuest.steps[index]:null;
      const guided=focusQuest?.guided?.[index];
      const advice=guided&&(guided.issues.find(([problem])=>searchKey(question).includes(searchKey(problem)))?.[1]||[guided.tip,...guided.issues.map(([problem,fix])=>problem+': '+fix)].join(' '));
      const reply=step?{text:advice||starterGuides[focusQuest.id]?.tips[index]||'Probier diesen Schritt in einer kleineren Variante: '+focusQuest.adapt,route:'quest/'+focusQuest.id}:coachReply(state,selected,question);
      coachHistory=[...coachHistory,{question,name:byHobby[selected]?.name,...reply}].slice(-12);
      const path='hilfe'+(byHobby[selected]?'/'+selected:'')+(focusQuest?'/'+focusQuest.id:'');
      if(location.hash==='#'+path) {
        render();
        main.querySelector('textarea[name="question"]')?.focus();
      } else location.hash=path;
      break;
    }
    case 'quiz': {
      const lesson=lessons[id];
      const index=Number(values.get('answer'));
      if(!lesson||!Number.isInteger(index)||index<0||index>2) return;
      const correct=questionOptions(id)[index]===lesson.correct;
      quizReplies[id]={index,correct};
      if(correct) awardPractice('quiz-'+id,20);
      render();
      main.querySelector('#quiz-feedback')?.focus();
      break;
    }
    case 'ranking':
      location.hash='ranglisten/'+values.get('period');
      break;
    case 'finish':
    case 'edit-entry': {
      const editing=form.dataset.form==='edit-entry';
      const [questId,invite='',returnInvite='']=id.split('~');
      const quest=quests[editing?state.entries.find(item=>item.id===id)?.quest:questId];
      if(!quest) return;
      const result=resultValues(values,invite);
      if(!editing&&quest.stage===4) {
        const rubric=expeditionContent(byHobby[quest.hobby],quest).rubric;
        const checked=new Set(values.getAll('criterion'));
        if(!rubric.every((_,index)=>checked.has(String(index)))) {resultError(form,'Bestätige die Projektkriterien, sobald du sie geprüft hast.');break;}
        result.verified=true;
      }
      if(!validResult(quest,result)) {resultError(form,quest.max?'Gib einen gültigen Wert und gegebenenfalls Vergleichsbedingungen ein.':'Beschreibe kurz dein Ergebnis. Leerzeichen allein reichen nicht.');return;}
      let photo;
      const file=values.get('photo');
      if(file?.size) {
        const submit=form.querySelector('button[type="submit"]');
        submit.disabled=true;
        try { photo=await preparePhoto(file); }
        catch(error) {resultError(form,error.message);return;}
        finally {submit.disabled=false;}
        if(!form.isConnected) return;
      }
      let saved;
      const ok=save(latest=>{
        if(editing) return changeEntry(latest,id,result);
        saved=record(latest,quest,result);
        if(!saved) return false;
        const plan=latest.plans.find(item=>item.quest===questId&&!item.done&&item.day<=saved.day);
        if(plan) {plan.done=true;plan.entry=saved.id;}
      });
      if(!ok) {resultError(form,'Das Ergebnis konnte nicht gespeichert werden. Pro Quest zählt ein regulärer Versuch am Tag.');break;}
      if(photo) try {await putPhoto(editing?id:saved.id,photo);} catch {alertUser('Das Ergebnis ist gespeichert. Das Foto konnte nicht gespeichert werden.');}
      if(editing) {modal.close();render();alertUser('Ergebnis korrigiert.');}
      else cardDialog(saved,{recent:true,returnInvite:state.invites.some(item=>item.code===returnInvite)?returnInvite:''});
      break;
    }
    case 'profile':
      if(save(latest=>{latest.name=values.get('name').trim().slice(0,28);})) alertUser('Profil gespeichert.');
      break;
    case 'journal': {
      if(!quests[id]?.stage||!unlocks(state,quests[id])) break;
      const before=values.get('before').trim(), after=values.get('after').trim();
      const files=['before','after'].map(side=>({side,file:values.get(side+'-photo')}));
      if(files.some(({file})=>file?.size)&&!before&&!after) {alertUser('Ergänze eine kurze Notiz zu deinen Fotos.');break;}
      const submit=form.querySelector('button[type="submit"]');
      submit.disabled=true;
      let pictures;
      try {
        pictures=await Promise.all(files.map(async ({side,file})=>({side,photo:file?.size?await preparePhoto(file):null})));
      } catch(error) {alertUser(error.message);submit.disabled=false;break;}
      if(!form.isConnected) break;
      if(save(latest=>{
        if(before||after) latest.expedition.journal[id]={day:localDate(),before,after};
        else delete latest.expedition.journal[id];
      })) {
        main.querySelector('.expedition-journal summary')?.focus();
        try {
          await Promise.all(pictures.map(({side,photo})=>{
            const key='journal-'+id+'-'+side;
            if(photo) return putPhoto(key,photo);
            if(values.has('remove-journal-photos')||!before&&!after) return deletePhoto(key);
          }));
          alertUser('Journal aktualisiert.');
        } catch {alertUser('Die Notiz ist gespeichert. Die Fotos konnten nicht vollständig aktualisiert werden.');}
      }
      submit.disabled=false;
      break;
    }
    case 'reminder': {
      const days=Number(values.get('days'));
      if(save(latest=>{latest.expedition.reminder={days:[1,7].includes(days)?days:0,last:localDate()};})) {
        main.querySelector('[data-form="reminder"] select')?.focus();
        alertUser(days?'Übungserinnerung aktiv.':'Übungserinnerung pausiert.');
      }
      break;
    }
    case 'reading':
      if(save(latest=>{
        latest.expedition.reading=readingChoices.some(([id])=>id===values.get('reading'))?values.get('reading'):'standard';
        latest.expedition.reducedMotion=values.has('motion');
      })) {main.querySelector('[name="reading"]')?.focus();alertUser('Darstellung gespeichert.');}
      break;
    case 'diagnostic': {
      if(!byHobby[id]) break;
      const assessment=values.get('level')==='practice'?'practice':'start';
      if(save(latest=>{
        latest.expedition.diagnostic[id]=assessment;
        const pref=latest.preferences[id]||{};
        latest.preferences[id]={gear:'any',goal:'try',...pref,experience:assessment};
      })) {main.querySelector('[name="level"]')?.focus();alertUser('Einstiegsprobe gespeichert.');}
      break;
    }
    case 'expedition-week': {
      const chosen=[...new Set(values.getAll('quest'))];
      if(chosen.length>3) {alertUser('Wähle höchstens drei Etappen aus.');break;}
      if(save(latest=>{latest.expedition.weeks[monday()]=chosen.filter(id=>quests[id]?.stage&&unlocks(latest,quests[id]));})) {
        main.querySelector('[data-form="expedition-week"] button')?.focus();
        alertUser('Wochenexpedition gespeichert.');
      }
      break;
    }
    case 'preferences':
      if(!byHobby[id]) break;
      if(save(latest=>{
        latest.preferences[id]=Object.fromEntries(Object.entries(preferences).map(([field,choices])=>[field,choices.some(([value])=>value===values.get(field))?values.get(field):choices[0][0]]));
        const minutes=Number(values.get('minutes')), route=Number(values.get('route')), deadline=values.get('deadline');
        latest.expedition.plans[id]={
          minutes:timeChoices.includes(minutes)?minutes:15,
          route:expeditionContent(byHobby[id]).routes[route]?route:0,
          deadline:validDay(deadline)?deadline:'',
          preparation:values.get('preparation').trim().slice(0,240)
        };
        if(!latest.active.includes(id)) latest.active.push(id);
      })) {main.querySelector('[name="minutes"]')?.focus();alertUser('Übungsplan gespeichert.');}
      break;
    case 'restore': {
      pendingBackup=null;
      const file=values.get('backup');
      if(!file||file.size>1000000) {alertUser('Die Sicherungsdatei ist ungültig oder zu groß.'); break;}
      let profile;
      try { profile=parseBackup(await file.text()); } catch { /* Invalid file. */ }
      if(!profile) {alertUser('Diese Datei ist keine gültige Hobbymaxing-Sicherung.'); break;}
      pendingBackup=profile;
      openModal('Sicherung prüfen',`<ul><li>${profile.active.length} gemerkte Hobbys</li><li>${profile.entries.length} Quest-Ergebnisse</li><li>${Object.keys(profile.expedition.journal).length} Journaleinträge</li><li>${profile.plans.length} Termine</li></ul><p>Die Daten werden mit deinem Profil zusammengeführt. Lokale Fotos sind in der Sicherung nicht enthalten.</p>${btn('Import bestätigen','apply-backup','','button primary')}`);
      break;
    }
    case 'delete-profile': {
      form.querySelector('button[type="submit"]').disabled=true;
      try {
        await clearPhotos();
        localStorage.removeItem(key);
        state=load(localStorage);
        language=state.language;
        labDrafts={};
        studioDrafts={};
        focusTimer=null;
        storeFocusTimer();
        pendingBackup=null;
        coachHistory=[];
        modal.close();
        render();
        main.focus();
        alertUser('Dein lokales Profil und deine privaten Fotos wurden gelöscht.');
      } catch {
        form.querySelector('button[type="submit"]').disabled=false;
        alertUser('Die Browserdaten konnten nicht vollständig gelöscht werden. Versuche es erneut.');
      }
      break;
    }
    case 'goal':
      if(save(latest=>{latest.goals[shift(monday(),7)]=Number(values.get('goal'));})) alertUser('Ziel für nächste Woche gespeichert.');
      break;
    case 'invite':
    case 'plan':
    case 'reschedule': {
      const day=values.get('day');
      const kind=form.dataset.form;
      let invite;
      if(!validDay(day)||day<localDate()) return;
      let collision=false;
      if(!save(latest=>{
        if(kind==='reschedule') {
          const result=updatePlan(latest,id,day);
          collision=result==='collision';
          if(result!=='done') return false;
        } else if(canPlan(id)&&kind==='plan') {
          if(latest.plans.some(item=>!item.done&&item.day===day&&item.quest===id)) return false;
          latest.plans.push({id:crypto.randomUUID(),quest:id,day,done:false});
        } else if(canPlan(id)) {
          invite={quest:id,day,code:crypto.randomUUID(),done:false,friendDone:false};
          latest.invites.unshift(invite);
        }
      })) {
        if(collision) openModal('Für diesen Tag vorgemerkt',`<p>Diese Quest steht am gewählten Tag bereits im Plan.</p>${btn('Termine zusammenführen','merge-plan',id+'~'+day,'button primary')} ${btn('Beide Termine behalten','close','','button secondary')}`);
        else alertUser('Die Quest ist bereits für diesen Tag geplant oder der Termin ist nicht mehr verfügbar.');
        return;
      }
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
      importedRank=rankId(data);
      location.hash='ranglisten/'+data.week+'/'+data.quest;
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
document.addEventListener('change',event=>{
  const control=event.target;
  if(control.dataset.material) {
    const id=control.dataset.material, index=Number(control.value);
    if(!byHobby[id]||!expeditionContent(byHobby[id]).materials[index]) return;
    if(!save(latest=>{
      const checks=new Set(latest.expedition.materials[id]||[]);
      if(control.checked) checks.add(index);
      else checks.delete(index);
      latest.expedition.materials[id]=[...checks];
    },{refresh:false})) control.checked=!control.checked;
    return;
  }
  if(control.id==='practice-language') {
    const value=control.value;
    if(!Object.hasOwn(languages,value)||value===language) return;
    if(save(latest=>{latest.language=value;},{refresh:false})) {
      language=value;
      hiddenTranslations=false;
      const region=main.querySelector('#phrase-cards');
      if(region) {region.innerHTML=phraseCards();region.querySelector('#practice-language')?.focus();}
    }
    return;
  }
  const quest=quests[control.dataset?.questStep];
  if(!quest) return;
  const index=Number(control.value);
  if(!Number.isInteger(index)||index<0||index>=quest.steps.length) return;
  const key=quest.id+':'+quest.version;
  if(save(latest=>{
    if(!unlocks(latest,quest)) return false;
    const checked=new Set(latest.stepChecks[key]||[]);
    if(control.checked) checked.add(index);
    else checked.delete(index);
    latest.stepChecks[key]=[...checked];
  },{refresh:false})) {
    main.querySelector('#step-progress').textContent=state.stepChecks[key].length+' / '+quest.steps.length+' Schritte abgehakt';
  } else control.checked=!control.checked;
});
window.addEventListener('hashchange',()=>{
  if(location.hash==='#main') { main.focus(); return; }
  if(modal.open) modal.close();
  render();
  watchRoom();
  if(location.hash==='#freigaben'||location.hash.startsWith('#freigaben/')) refreshShares(location.hash.split('/')[1]);
  window.scrollTo(0,0);
  main.focus({preventScroll:true});
});
window.addEventListener('storage',event=>{if(event.key===key) {state=load(localStorage);language=state.language;labDrafts=structuredClone(state.labDrafts);studioDrafts=structuredClone(state.studioDrafts);render();}});
render();
checkReminder();
setInterval(checkReminder,60000);
document.addEventListener('visibilitychange',checkReminder);
watchRoom();
if(location.hash==='#freigaben'||location.hash.startsWith('#freigaben/')) refreshShares(location.hash.split('/')[1]);
if(roomSupported()) callRoom('/health').then(result=>{
  onlineRooms=result.available===true;
  if(/^#(?:challenge\/|challenges$|profil$|galerie$)/.test(location.hash)) render();
}).catch(()=>{});


import {groups,hobbies,byHobby,quests,challenges,journeys} from './catalog.mjs?v=06';
import {key,load,localDate,shift,monday,weekGoal,activeDays,streaks,completed,unlocks,level,nextQuest,totalXp,record,badges,leaderboard,encode,decode,validShare,rankId,canPlan,earnPractice,dailyStreak,validDay,validResult,changeEntry,updatePlan,inviteJoin,friendFinished,firstPrerequisite,takeRestDay} from './state.mjs?v=06';
import {lessons} from './lessons.mjs';
import {resourcesForStage} from './resources.mjs';
import {stages,questionOptions,helpTopics,coachReply,blocks,experiments,runBlocks,learningRoute} from './learning.mjs';
import {studios,studioCell,checkStudio,playBeat} from './studios.mjs';
import {languages,selectSpeechVoice,moods,moodQuests,starterGuides,preferences,questMatches,recommend,featuredChallenge,profileBackup,parseBackup,mergeBackup,searchKey,matchingGear,weeklyRecap} from './play.mjs';
import {preparePhoto,putPhoto,deletePhoto,showPhotos} from './photos.mjs';
import {roomSupported,callRoom,roomToken,knownRoomToken} from './rooms.mjs';

const main=document.querySelector('#main');
const nav=document.querySelector('#nav');
const top=document.querySelector('#top');
const modal=document.querySelector('#modal');
let state=load(localStorage);
try { document.documentElement.dataset.theme=localStorage.getItem('hobbymaxing-theme')==='dark'?'dark':'light'; } catch { document.documentElement.dataset.theme='light'; }
let filter={group:'all',query:'',place:'',gear:'',time:'',stage:''};
let toastTimer;
let coachHistory=[];
let language=Object.hasOwn(languages,state.language)?state.language:'en';
let importedRank='';
let onlineRooms=false;
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
const navigation=[['heute','Heute','home'],['entdecken','Entdecken','compass'],['challenges','Challenges','trophy'],['profil','Profil','user'],['hilfe','Hilfe','help']];
const vectors={
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
    <div class="days">${marks}</div><div class="progress-label"><strong>${days.size} von ${goal} Tagen mit Praxisquest</strong><span>${Math.round(Math.min(1,days.size/goal)*100)} %</span></div>
    <progress value="${Math.min(days.size,goal)}" max="${goal}">${days.size}</progress>
    ${plans.length?`<div class="mini-plans">${plans.map(plan=>`<div><a href="#quest/${plan.quest}">${dateLabel(plan.day)} · ${quests[plan.quest].title}</a>${btn('Verschieben','reschedule',plan.id,'text-button')}</div>`).join('')}</div>`:''}
    ${link('Woche planen','woche','button secondary full')}</section>`;
}
function streakCard() {
  const streak=dailyStreak(state);
  const restUsed=state.restDays?.some(day=>monday(day)===monday())||false;
  const restAvailable=streak.running>0&&!streak.doneToday&&!restUsed;
  return `<section class="surface streak-card"><div class="tile-icon ember">${svg('flame')}</div><div><h2>${streak.running} ${streak.running===1?'Tag':'Tage'} in Folge</h2><p>${streak.doneToday?'Heute geschafft.':state.restDays?.includes(localDate())?'Heute ist dein Erholungstag. Deine Serie bleibt erhalten.':streak.running?'Eine Quest, App-Übung oder Wiederholung hält deine Tagesstreak.':'Schließe eine Quest oder App-Übung ab.'}</p>${restUsed&&!state.restDays?.includes(localDate())?'<small>Der Erholungstag dieser Woche ist bereits genutzt.</small>':''}${restAvailable?btn('Heute pausieren','rest-day','','text-button'):''}</div></section>`;
}
function todayPage() {
  const active=state.active.map(id=>byHobby[id]).filter(Boolean);
  const suggestion=recommend(state);
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
    <section class="bubble-row" aria-label="Schnellauswahl">${btn(svg('time')+' 10 Minuten','quick','time','pill')}${btn('⌂ &nbsp; Zu Hause','quick','home','pill')}${btn('✦ &nbsp; Etwas Neues','quick','new','pill')}</section>
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
  if(filter.time||filter.place||filter.gear||filter.stage) {
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
  ${pick?`<div class="mood-result" tabindex="-1" role="status" aria-live="polite">${result?`<span class="mood-result-icon" aria-hidden="true">${result.hobby.icon}</span><div><p class="eyebrow">${option?.label||'Dein Zufallstreffer'} · ${result.quest.minutes} Min.</p><h3>${esc(result.hobby.name)}: ${esc(result.quest.title)}</h3><p>${esc(result.quest.steps[0])}</p><p class="mood-materials"><strong>Ort:</strong> ${esc(result.hobby.place)} · <strong>Material:</strong> ${esc(result.quest.materials||result.hobby.materials)}</p><div class="actions">${link('Los geht’s','quest/'+result.quest.id,'button primary')}${btn('Noch eine Idee','pick-mood',pick.mood,'button secondary')}</div></div>`:`<div><strong>Diese Stimmung hast du schon gemeistert.</strong><p>Wähle eine andere Stimmung für eine neue Idee.</p></div>`}</div>`:''}</section>`;
}
function discoverPage() {
  return `${titleBlock('ENTDECKEN','Finde dein nächstes Hobby.','Wähle etwas, das in deinen Tag passt. Jede Aktivität beginnt mit einer machbaren Quest.')}
    ${moodPicker()}
    <form id="filters" class="surface filters"><label class="search-label">Suche nach Hobby, Material oder Quest <span class="search-input">${svg('search')}<input type="search" name="query" value="${esc(filter.query)}" placeholder="Zum Beispiel Fotografie oder Papier"></span></label>
    <div class="filters-grid">${filterSelect('time','Zeit',[['10','Bis 10 Min.'],['15','Bis 15 Min.'],['25','Bis 25 Min.']])}${filterSelect('place','Ort',['Zu Hause','Draußen','Drinnen'].map(x=>[x,x]))}${filterSelect('gear','Ausrüstung',['Ohne Ausrüstung','Alltagsmaterial','Mit Ausrüstung'].map(x=>[x,x]))}${filterSelect('stage','Quest-Typ',['Einstieg','Training','Meilenstein','Projekt','Erlebnis'].map(x=>[x,x]))}</div></form>
    <div class="bubble-row category-row">${[['all','Alle'],...groups].map(([id,name])=>`<button class="pill" type="button" aria-pressed="${filter.group===id}" data-action="category" data-value="${id}">${name}</button>`).join('')}</div>
    <section id="results" aria-label="Suchergebnisse">${catalogResults()}</section>`;
}
function pathPage(id) {
  const hobby=byHobby[id];
  if(!hobby) return missing();
  const lesson=lessons[id], next=nextQuest(state,hobby);
  const active=state.active.includes(id);
  const hits=hobby.quests.filter(quest=>completed(state,quest.id)).length;
  const mastered=Object.hasOwn(state.practice,'quiz-'+id);
  const skills=[...new Set(hobby.quests.map(quest=>quest.skill).filter(Boolean))];
  const route=learningRoute(state,hobby);
  return `<p>${link('Hobby-Katalog','entdecken','text-button')}</p><div class="path-banner surface ${hobby.group}"><span class="path-emoji">${hobby.icon}</span><div><p class="eyebrow">${groupNames[hobby.group]}</p><h1>${hobby.name}</h1><p>${hobby.skill} · Level ${level(state,hobby)}</p></div>${btn(active?'Aus meinen Hobbys entfernen':'Hobby merken','active',id,'button secondary')}</div>
  <div class="academy-layout section">
    <div>
      <section class="surface mission hobby-intro"><h2>Worum geht’s bei diesem Hobby?</h2><p>${lesson.intro}</p><h3>So gelingt der Einstieg</h3><p>${lesson.technique}</p><div class="tags">${chip(hobby.place)}${chip(esc(hobby.gear))}${chip('Erste Quest: '+hobby.quests[0].minutes+' Min.')}</div>
      <div class="actions intro-mobile-practice">${link('Wissenscheck','wissen/'+id,'button secondary')}${id==='scratch'?link('Blocklabor','labor','button secondary'):Object.hasOwn(studios,id)?link('Übungsstudio','studio/'+id,'button secondary'):''}${btn('Lernpfad drucken','print-path',id,'button secondary')}</div></section>
      <section class="section" aria-label="Lernpfad"><div class="section-title"><div><h2>Dein Lernpfad</h2><p>${hits} von ${hobby.quests.length} Quests erledigt · ${route.stages.filter(stage=>stage.status==='done').length} von 4 Etappen erreicht</p></div></div>
      <ol class="academy-path">${stages.map((label,index)=>{
        const station=hobby.quests.filter(quest=>quest.stage===index+1);
        const cleared=station.some(quest=>completed(state,quest.id));
        const unlocked=station.some(quest=>unlocks(state,quest));
        const isNext=station.includes(next);
        return `<li class="academy-stop ${cleared?'cleared':unlocked?'unlocked':'locked'}">
          <span class="academy-node ${isNext?'next':''}" aria-hidden="true">${cleared?svg('check'):unlocked?index+1:svg('lock')}</span>
          <div class="academy-body"><div class="stage-heading"><h3>${label}</h3><span>${cleared?'Erreicht':unlocked?(isNext?'Als Nächstes':'Freigeschaltet'):'Gesperrt'}</span></div><p>${route.stages[index].guidance}</p>
          <div class="station-options">${station.map(quest=>{
            const done=completed(state,quest.id), open=unlocks(state,quest);
            return `<article class="surface path-body"><p class="eyebrow">${questTime(quest)} · +${quest.xp} XP</p><h4>${quest.title}</h4><p>${quest.skill?quest.skill+" · ":""}${quest.result}</p>${!matchingGear(state,hobby,quest)?"<p><small>Benötigt Ausrüstung. Prüfe die Materialliste vor dem Start.</small></p>":""}
            ${open?link(done?'Erneut üben':quest.stage===1?'Erste Quest starten':'Quest starten','quest/'+quest.id,'button '+(quest===next?'primary':'secondary')):`<small>${quest.any?'Schließe eine der Trainingsquests ab.':'Schließe die vorherige Etappe ab.'}</small>`}</article>`;
          }).join('')}</div></div></li>`;
      }).join('')}</ol></section>
    </div>
    <aside class="academy-sidebar">
      <section class="surface utility"><div class="tile-icon lilac">✦</div><h2>Direkt in der App üben</h2><p>Teste eine Grundregel dieses Hobbys. Beim ersten Bestehen bekommst du 20 XP.</p>${link(mastered?'Wissenscheck wiederholen':'Wissenscheck starten','wissen/'+id,'button primary')}
        ${id==='scratch'?`<h3>Scratch-Blocklabor</h3><p>Drei interaktive Aufgaben zu Ereignissen, Bewegung und Punkten.</p>${link('Blocklabor öffnen','labor','button secondary')}`:''}
        ${Object.hasOwn(studios,id)?`<h3>${studios[id].title}</h3><p>Probier die Technik direkt aus und hol dir Rückmeldung.</p>${link('Übungsstudio öffnen','studio/'+id,'button secondary')}`:''}</section>
      <section class="surface utility"><h2>Was du brauchst</h2><p>${esc(hobby.materials)}</p><h3>Wenn du hängen bleibst</h3><p>${lesson.trouble}</p>${link('Lerncoach fragen','hilfe/'+id,'text-button')}${hobbyPreferences(hobby)}</section>
      ${skills.length?`<section class="surface utility"><h2>Deine Fähigkeiten</h2><ul class="levels">${skills.map(skill=>{
        const tasks=hobby.quests.filter(quest=>quest.skill===skill);
        return `<li><span>${skill}</span><strong>${tasks.filter(quest=>completed(state,quest.id)).length} / ${tasks.length}</strong></li>`;
      }).join('')}</ul></section>`:''}
      ${resourceList(id)}
    </aside>
  </div>`;
}
function hobbyPreferences(hobby) {
  const pref=state.preferences[hobby.id]||{};
  const fields={experience:'Deine Vorerfahrung',gear:'Deine Ausrüstung',goal:'Dein Ziel'};
  return `<details><summary>Empfehlungen für dieses Hobby anpassen</summary><form data-form="preferences" data-value="${hobby.id}">
  ${Object.entries(preferences).map(([field,choices])=>`<label>${fields[field]}<select name="${field}">${choices.map(([value,label])=>`<option value="${value}" ${pref[field]===value?'selected':''}>${label}</option>`).join('')}</select></label>`).join('')}
  <button class="button secondary">Für „Heute“ speichern</button></form></details>`;
}
function resourceList(id,stage) {
  const hobby=byHobby[id];
  if(!hobby) return '';
  const levels=stage?[stage]:[1,2,3,4];
  const choices=levels.map(level=>({level,...resourcesForStage(hobby,level)}));
  const items=choices.flatMap(choice=>choice.items);
  const searches=choices.filter(choice=>choice.videoUrl).map(({level,quest,videoUrl})=>`<li><div><small>${stages[level-1]} · noch kein Video geprüft</small><a href="${videoUrl}" target="_blank" rel="noopener noreferrer">Passende YouTube-Videos suchen</a><p>Suchbegriff: ${esc(hobby.name+' · '+quest.title+' · Schritt für Schritt')}</p></div></li>`).join('');
  return `<section class="surface utility resource-list"><h2>Videos & Anleitungen</h2>${items.length?'<p>Ausgewählte Quellen:</p>':''}<ul class="plain-list">${items.map(([level,name,source,url])=>`<li><div><small>${stages[level-1]} · ${source}</small><a href="${url}" target="_blank" rel="noopener noreferrer">${name}</a></div></li>`).join('')}${searches}</ul><p class="resource-note">Suchtreffer stammen von YouTube und werden nicht von Hobbymaxing geprüft. Geprüfte Links sind als ausgewählte Quelle gekennzeichnet.</p></section>`;
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
    ${questInformation(quest,hobby)}
    ${locked?`<div class="notice">Schließe zuerst „${prerequisite?.title||'den Einstieg'}“ ab. ${prerequisite?link('Voraussetzung starten','quest/'+prerequisite.id+(planned?'/'+planned.code:''),'button primary'):link('Zum Lernpfad','pfad/'+hobby.id,'text-button')}</div>`:
      `${btn('Ergebnis eintragen','finish',id+(planned?'~'+planned.code:preparation?'~~'+preparation.code:''),'button primary')} ${btn('Quest im Fokusmodus starten','focus-open',id,'button secondary')} ${btn('Einplanen','plan',id,'button secondary')} ${btn('Gemeinsam machen','invite',id,'text-button') }`}
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
    ${resourceList(hobby.id,quest.stage)}<div class="notice"><strong>Erfolg heißt:</strong> ${esc(starterGuides[quest.id]?.success||quest.result)}</div><div class="actions">${btn('Ergebnis festhalten','finish',id,'button primary')}${link('Lerncoach fragen','hilfe/'+hobby.id+'/'+id,'button secondary')}</div><p class="focus-privacy">Timer und Fortschritt bleiben in diesem Browser. Der Timer läuft nur in diesem Tab.</p></section>`;
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
function roomPage(id) {
  if(!/^[A-Za-z0-9_-]{24}$/.test(id||'')) return missing();
  if(!roomSupported()) return titleBlock('PRIVATER RAUM','Dieser Raum braucht die Serverversion.','Öffne den ursprünglichen Einladungslink auf dem Server, auf dem der Raum erstellt wurde.');
  const room=currentRoom?.id===id?currentRoom:null;
  if(room?.error) return titleBlock('PRIVATER RAUM','Raum konnte nicht geöffnet werden.',esc(room.error))+btn('Erneut versuchen','refresh-room',id,'button secondary');
  if(!room) return titleBlock('PRIVATER RAUM','Raum wird geladen …','Wir holen die gemeinsame Ergebnisliste.');
  const quest=quests[room.quest];
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
    if(list) list.innerHTML=rankingRows(data.rows,quests[data.quest]);
    else render();
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
    <section class="section"><h2>Wochenvorhaben</h2><div class="hobby-grid">${journeys.map(journey=>{
      const started=state.journeys.includes(journey.id);
      const hits=journey.quests.filter(id=>completed(state,id)).length;
      return `<article class="surface utility"><div class="tile-icon lilac">${journey.icon}</div><h3>${journey.title}</h3><p>${journey.text}</p>${started?`<p><strong>${hits} / ${journey.quests.length} erledigt</strong></p><ul>${journey.quests.map(id=>`<li><a href="#quest/${id}">${quests[id].title}</a> ${completed(state,id)?'✓':''}</li>`).join('')}</ul>`:btn('Vorhaben starten','journey',journey.id,'button secondary')}</article>`;
    }).join('')}</div></section>`;
}
function profilePage() {
  const {running,best}=streaks(state);
  const daily=dailyStreak(state);
  const recap=weeklyRecap(state);
  const bests=new Map();
  for(const entry of state.entries) {
    if(entry.score===null) continue;
    const id=[entry.quest,entry.version,entry.condition].join('|');
    if(!bests.has(id)||bests.get(id).score<entry.score) bests.set(id,entry);
  }
  return `${titleBlock('DEIN PROFIL',state.name?'Hi, '+esc(state.name)+'.':'Dein Projektbuch.','Hier findest du die Quests, Projekte und persönlichen Bestleistungen, die du gesammelt hast.')}
    <section class="surface utility section narrow"><p class="eyebrow">DIESE WOCHE</p><h2>Dein Lernrückblick</h2>${recap.quests?`<p>${recap.quests} ${recap.quests===1?'Quest':'Quests'} an ${recap.days} ${recap.days===1?'Tag':'Tagen'} · ${recap.xp} XP</p><p>${recap.hobbies.length?'Hobbys: '+recap.hobbies.map(esc).join(', '):''}${recap.skills.length?' · Geübt: '+recap.skills.map(esc).join(', '):''}</p>${recap.projects.length?`<p><strong>Meisterstücke:</strong> ${recap.projects.map(project=>esc(project.title)).join(', ')}</p>`:''}`:empty('Diese Woche ist noch kein Praxisfortschritt gespeichert. Eine kurze Quest ist ein guter Anfang.')}</section>
    <div class="stat-grid"><div class="surface stat"><span>${svg('bolt')} Erfahrung</span><strong>${totalXp(state)} XP</strong></div><div class="surface stat"><span>${svg('flame')} Tagesstreak</span><strong>${daily.running} T.</strong><small>Bestwert: ${daily.best} ${daily.best===1?'Tag':'Tage'}</small></div><div class="surface stat"><span>✦ Aktuelle Wochenserie</span><strong>${running} Wo.</strong></div><div class="surface stat"><span>${svg('trophy')} Beste Wochenserie</span><strong>${best} Wo.</strong></div></div>
    <div class="detail-grid section"><section class="surface mission"><h2>Projektbuch</h2>${state.entries.length?`<ul class="plain-list timeline">${state.entries.map(entry=>`<li><div><small>${dateLabel(entry.day)} · ${quests[entry.quest].type}</small><h3><a href="#quest/${entry.quest}">${quests[entry.quest].title}</a></h3><p>${entry.score==null?'':entry.score+' · '}${esc(entry.result)}</p>${entry.note?`<p>${esc(entry.note)}</p>`:''}${entry.quest==='challenge-foto'?`<div class="project-photo" data-photo="${esc(entry.id)}"></div>`:''}</div>${btn('Erfolgskarte','card',entry.id,'text-button')}</li>`).join('')}</ul>`:empty('Schließe deine erste Quest ab. Dann taucht sie hier auf.') }
    <h2>Abgeschlossene Wochenvorhaben</h2>${state.journeys.map(id=>journeys.find(journey=>journey.id===id)).filter(journey=>journey.quests.every(id=>completed(state,id))).map(journey=>`<p>${journey.icon} ${journey.title}</p>`).join('')||empty('Deine fertigen Wochenvorhaben erscheinen hier.')}</section>
    <aside class="surface utility"><h2>Deine Hobbys</h2>${state.active.length?`<ul class="levels">${state.active.map(id=>`<li><a href="#pfad/${id}">${byHobby[id].icon} ${byHobby[id].name}</a><strong>Level ${level(state,byHobby[id])}</strong></li>`).join('')}</ul>`:empty('Noch keine Hobbys gemerkt.')}
    <h2>Abzeichen</h2><ul class="badges">${badges(state).map(([icon,label,has])=>`<li class="${has?'earned':''}"><span>${icon}</span><span>${label}</span><small>${has?'Erhalten':'Offen'}</small></li>`).join('')}</ul>
    <h2>Bestleistungen</h2>${bests.size?`<ul class="levels">${[...bests.values()].map(entry=>`<li><span>${quests[entry.quest].title}<small>${entry.condition==='standard'?'Standardregeln':esc(entry.condition)}</small></span><strong>${entry.score}</strong></li>`).join('')}</ul>`:empty('Messbare Ergebnisse werden nach Bedingungen und Quest-Version verglichen.') }</aside></div>
    <section class="surface utility section narrow"><h2>Profileinstellungen</h2><p>Dein Fortschritt liegt in diesem Browser. Wenn du eine Erfolgskarte teilst, enthält sie deinen gewählten Anzeigenamen und das Ergebnis. Deine private Notiz bleibt hier.</p><form data-form="profile"><label>Anzeigename <input name="name" maxlength="28" value="${esc(state.name)}" placeholder="Optional"></label><button class="button secondary">Speichern</button></form>
    <h2>Fortschritt sichern</h2><p>Die Sicherung enthält Ergebnisse und Notizen, Termine, Wochenvorhaben, Einladungen, importierte Ranglistenwerte, Einstellungen und Entwürfe. Fotos bleiben auf diesem Gerät.</p>
    <div class="actions">${btn('Fortschritt herunterladen','backup','','button secondary')}${btn('Sicherung importieren','restore','','button secondary')}</div></section>`;
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
function render() {
  const [page,id,param]=(location.hash==='#main'?'heute':location.hash.slice(1)).split('/');
  const selected=({pfad:'entdecken',quest:'entdecken',fokus:'entdecken',wissen:'entdecken',labor:'entdecken',studio:'entdecken',challenge:'challenges',ranglisten:'challenges',raum:'challenges',woche:'heute'})[page]||page||'heute';
  nav.innerHTML=navigation.map(([route,label,icon])=>`<a href="#${route}" ${route===selected?'aria-current="page"':''}>${svg(icon)}<span>${label}</span></a>`).join('');
  const dark=document.documentElement.dataset.theme==='dark';
  top.innerHTML=`<div class="top-left"><span class="mobile-mark mark">✳</span><div><p>${new Intl.DateTimeFormat('de-DE',{weekday:'long',day:'numeric',month:'long'}).format(new Date())}</p><strong>${state.name?'Hi, '+esc(state.name):'Willkommen bei Hobbymaxing'}</strong></div></div><div class="top-stats"><button class="button secondary theme-toggle" type="button" data-action="toggle-theme" aria-pressed="${dark}" aria-label="${dark?'Helles':'Dunkles'} Design aktivieren">${dark?'☀ Helles Design':'☾ Dunkles Design'}</button><a class="xp-chip" href="#profil">${svg('bolt')} <strong>${totalXp(state)} XP</strong></a><a class="avatar" href="#profil" aria-label="Profil">${state.name?esc(Array.from(state.name)[0].toLocaleUpperCase('de')):svg('user')}</a></div>`;
  const views={heute:todayPage,entdecken:discoverPage,pfad:pathPage,quest:questPage,fokus:focusPage,wissen:quizPage,labor:labPage,studio:studioPage,hilfe:supportPage,challenges:challengeIndex,challenge:challengePage,ranglisten:rankingPage,raum:roomPage,woche:weekPage,profil:profilePage,quellen:sourcesPage,teilen:sharedPage};
  main.innerHTML=(Object.hasOwn(views,page||'heute')?views[page||'heute']:missing)(id,param);
  if(page==='profil') showPhotos(main);
  startFocusTicker(page);
}
document.querySelector('.skip').addEventListener('click',event=>{
  event.preventDefault();
  main.focus();
  main.scrollIntoView({block:'start'});
});
function openModal(title,contents) {
  modal.innerHTML=`<div class="modal-header"><h2 id="dialog-title">${title}</h2>${btn('Schließen','close','','text-button')}</div>${contents}`;
  modal.setAttribute('aria-labelledby','dialog-title');
  if(!modal.open) modal.showModal();
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
  openModal(entry?'Ergebnis korrigieren':'Quest abschließen',modalForm(entry?'edit-entry':'finish',entry?.id||id,
    `<p>${quest.title} · ${prior?'Wiederholung':'+'+quest.xp+' XP'}</p>${result}${condition}
      ${entry||quest.type==='Challenge'?'':`<label>Wie sicher fühlst du dich?<select name="confidence"><option value="">Noch offen</option><option value="retry">Ich möchte die Technik noch einmal üben</option><option value="ready">Ich bin bereit für den nächsten Schritt</option></select></label>`}
      <label>Private Notiz <textarea name="note" maxlength="420" placeholder="Was hat gut geklappt?">${esc(entry?.note)}</textarea></label>
      ${quest.id==='challenge-foto'?'<label>Privates Foto für dein Projektbuch (optional)<input type="file" name="photo" accept="image/jpeg,image/png,image/webp"></label>':''}
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
  openModal('Deine Erfolgskarte',`<div class="success-card ${hobby.group}"><div class="tile-icon">${hobby.icon}</div><p class="eyebrow">${esc(hobby.name)} · ${entry.xp?('+'+entry.xp+' XP'):'Wiederholung'}</p><h3>${quest.title}</h3><p>${entry.score===null?'':entry.score+' · '}${esc(entry.result||quest.result)}</p>
  ${entry.previous!==null?`<p>Letzter vergleichbarer Versuch: ${entry.previous}</p>`:''}${wasBest?'<p><strong>Persönliche Bestleistung</strong></p>':''}</div>
  <p>${retry?'Wiederhole die Übung und achte auf eine einzige Änderung. In „Heute“ kann sie als Nächstes erscheinen.':resultFeedback(quest)}</p>
  <div class="actions">${retry?link('Übung wiederholen','quest/'+quest.id,'button primary'):''}${options.map((item,index)=>link(item.title,'quest/'+item.id,'button '+(!retry&&index===0?'primary':'secondary'))).join('')}
  ${returnInvite?`<p>${link('Zur gemeinsamen Quest','quest/'+quests[state.invites.find(invite=>invite.code===returnInvite).quest].id+'/'+returnInvite,'button primary')}</p>`:''}
  <div class="actions">${btn(quest.type==='Challenge'?'Ergebnislink für Freunde kopieren':'Erfolgskarten-Link kopieren','share',entry.id,'button secondary')}${btn('Ergebnis korrigieren','edit-entry',entry.id,'text-button')}${recent?btn('Abschluss rückgängig','undo-entry',entry.id,'text-button'):''}</div>`);
}
function resultFeedback(quest) {
  const guide=starterGuides[quest.id];
  return guide?'Selbstcheck: '+esc(guide.success):'Vergleiche dein Ergebnis mit dem Ziel der Quest. Du kannst jederzeit den nächsten Schritt wählen.';
}
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
    case 'toggle-theme': {
      const dark=document.documentElement.dataset.theme!=='dark';
      document.documentElement.dataset.theme=dark?'dark':'light';
      localStorage.setItem('hobbymaxing-theme',dark?'dark':'light');
      render();
      break;
    }
    case 'close': modal.close(); break;
    case 'pick-mood': {
      const options=moodQuests(state,value);
      const available=options.filter(item=>item.quest.id!==discoveryPick?.choice?.quest.id);
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
    case 'backup': {
      const url=URL.createObjectURL(new Blob([profileBackup(state)],{type:'application/json'}));
      const file=document.createElement('a');
      file.href=url;
      file.download='hobbymaxing-fortschritt-'+localDate()+'.json';
      file.click();
      setTimeout(()=>URL.revokeObjectURL(url),1000);
      break;
    }
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
    case 'print-path':
      window.print();
      break;
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
    case 'room-score': {
      if(roomWriting) break;
      const name=values.get('name').trim(), score=Number(values.get('score'));
      if(!name) {alertUser('Gib einen Spitznamen ein.');break;}
      roomWriting=true;
      try {
        const data=await callRoom('/'+id,{method:'PUT',token:roomToken(),body:{name,score}});
        if(location.hash==='#raum/'+id) {
          currentRoom={id,...data};
          main.querySelector('#room-results').innerHTML=rankingRows(data.rows,quests[data.quest]);
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
    case 'preferences':
      if(!byHobby[id]) break;
      if(save(latest=>{
        latest.preferences[id]=Object.fromEntries(Object.entries(preferences).map(([field,choices])=>[field,choices.some(([value])=>value===values.get(field))?values.get(field):choices[0][0]]));
        if(!latest.active.includes(id)) latest.active.push(id);
      })) alertUser('Empfehlungen gespeichert.');
      break;
    case 'restore': {
      const file=values.get('backup');
      if(!file||file.size>1000000) {alertUser('Die Sicherungsdatei ist ungültig oder zu groß.'); break;}
      let profile;
      try { profile=parseBackup(await file.text()); } catch { /* Invalid file. */ }
      if(!profile) {alertUser('Diese Datei ist keine gültige Hobbymaxing-Sicherung.'); break;}
      let counts;
      if(save(latest=>{counts=mergeBackup(latest,profile);},{refresh:false})) {
        language=state.language;
        labDrafts=structuredClone(state.labDrafts);
        studioDrafts=structuredClone(state.studioDrafts);
        render();
        openModal('Sicherung übernommen',`<p>${counts.added} Ergebnisse, Termine, Einladungen oder Ranglistenwerte hinzugefügt oder aktualisiert. ${counts.skipped} doppelte oder nicht zum Profil passende Einträge übersprungen.</p><p>Hobbys, Einstellungen, Entwürfe, Übungstage und Wochenvorhaben wurden zusammengeführt. Lokale Fotos werden separat im Browser gespeichert.</p>`);
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
  window.scrollTo(0,0);
  main.focus({preventScroll:true});
});
window.addEventListener('storage',event=>{if(event.key===key) {state=load(localStorage);language=state.language;labDrafts=structuredClone(state.labDrafts);studioDrafts=structuredClone(state.studioDrafts);render();}});
render();
watchRoom();
if(roomSupported()) callRoom('/health').then(result=>{
  onlineRooms=result.available===true;
  if(location.hash.startsWith('#challenge/')) render();
}).catch(()=>{});


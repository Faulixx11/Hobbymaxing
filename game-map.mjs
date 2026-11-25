import {hobbies,byHobby,quests} from './catalog.mjs?v=06';
import {key,load,localDate,totalXp,unlocks} from './state.mjs?v=08';

const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const sentence=text=>{const value=String(text??'').trim();return /[.!?]$/.test(value)?value:value+'.';};

export const checkpoints=[
  {id:'basislager',name:'Basislager',xp:0,x:15,y:81,icon:'⛺',tone:'camp',reward:'Lagerbuch',
    preview:'Dein Startpunkt. Hier wartet eine kurze Mission mit Stift und Papier.',
    mission:{type:'quest',title:'Dein Lagerbuch',intro:'Such dir ein Blatt und zeichne es mit drei Blattadern ab. So entsteht deine erste Seite im Lagerbuch.',
      options:[{quest:'naturjournal-1',label:'Lagerbuch starten'}]}},
  {id:'waldlichtung',name:'Waldlichtung',xp:30,x:42,y:69,icon:'🌲',tone:'forest',reward:'Foto-Spur',
    preview:'Zwei Wege führen durch die Lichtung: ein Foto-Auftrag oder eine ruhige Naturbeobachtung.',
    mission:{type:'quest',title:'Wähle deine Spur',intro:'Such dir den Weg aus, der heute besser zu dir passt. Eine der beiden Missionen reicht.',
      options:[{quest:'fotografie-1',label:'Foto-Mission starten'},{quest:'vogelbeobachtung-1',label:'Naturbeobachtung starten'}]}},
  {id:'taktbruecke',name:'Taktbrücke',xp:100,x:64,y:53,icon:'🌉',tone:'bridge',reward:'Taktprobe',
    preview:'Hier baust du einen Beat und änderst bewusst sein Tempo.',
    mission:{type:'quest',title:'Beat über die Brücke',intro:'Baue deinen Beat. Spiele ihn danach etwas langsamer und entscheide, welches Tempo sich leichter halten lässt.',
      options:[{quest:'beats-1',label:'Beat bauen'}]}},
  {id:'sternwarte',name:'Sternwarte',xp:225,x:35,y:34,icon:'🔭',tone:'observatory',reward:'Etappenplan',
    preview:'Von hier oben planst du eine kurze Expedition aus drei Etappen.',
    mission:{type:'plan',title:'Expedition in drei Etappen',intro:'Wähle drei Etappen für diese Woche. Lege die anspruchsvollste auf einen Tag, an dem du Zeit für einen zweiten Versuch hast.',
      minutes:5,href:'woche',label:'Etappen wählen',doneWhen:'drei Etappen in deiner Wochenexpedition gespeichert sind'}},
  {id:'gipfel',name:'Gipfel',xp:450,x:77,y:19,icon:'🚩',tone:'summit',reward:'Gipfelabzeichen',
    preview:'Ganz oben wartet ein Meisterstück und dein Gipfelabzeichen.',
    mission:{type:'summit',title:'Dein Meisterstück',intro:'Schließe das Meisterstück eines deiner Lernpfade ab. Danach gehört das Gipfelabzeichen dir.',
      label:'Meisterstück starten'}}
];

const silhouettes={
  camp:'<polygon class="lm-main" points="-13,9 0,-11 13,9"/><polygon class="lm-dark" points="-4,9 0,0 4,9"/><circle class="lm-spark" cx="17" cy="8" r="2"/>',
  forest:'<polygon class="lm-main" points="-16,9 -9,-6 -2,9"/><polygon class="lm-dark" points="-6,9 2,-11 10,9"/><polygon class="lm-main" points="6,9 12,-3 18,9"/>',
  bridge:'<path class="lm-main" d="M-16 9Q0 -14 16 9Z"/><rect class="lm-dark" x="-18" y="-1" width="36" height="3" rx="1"/>',
  observatory:'<path class="lm-main" d="M-11 9A11 11 0 0 1 11 9Z"/><rect class="lm-dark" x="-13" y="9" width="26" height="4" rx="1"/><path class="lm-line" d="M4 -2L16 -12"/><circle class="lm-spark" cx="-17" cy="-8" r="1.6"/><circle class="lm-spark" cx="20" cy="-2" r="1.2"/>',
  summit:'<polygon class="lm-main" points="-17,11 -3,-13 5,0 10,-7 21,11"/><polygon class="lm-snow" points="-3,-13 -8,-4 -4,-6 0,-3 3,-5"/>'
};

const player='<span class="map-player" aria-hidden="true"><svg viewBox="0 0 24 34" width="26" height="36"><circle cx="12" cy="7" r="5" fill="#f2c9a0"/><path d="M6 6a6 6 0 0 1 12 0z" fill="#d95f4a"/><rect x="7" y="13" width="10" height="14" rx="4" fill="#4aa0d9"/><rect x="4" y="15" width="4" height="10" rx="2" fill="#8a5a3c"/><rect x="8" y="27" width="3.5" height="6" rx="1.5" fill="#2b3a52"/><rect x="12.5" y="27" width="3.5" height="6" rx="1.5" fill="#2b3a52"/></svg></span>';

let celebration=null;
export function resetMapSession() { celebration=null; }

export function mapProgress(xp) {
  const points=Number.isFinite(xp)?Math.max(0,xp):0;
  const current=checkpoints.findLastIndex(checkpoint=>checkpoint.xp<=points);
  return {current,next:checkpoints[current+1]||null};
}

const completedQuest=(state,id)=>Array.isArray(state.entries)&&state.entries.some(entry=>entry.quest===id);

export function plannedExpedition(state) {
  const weeks=state.expedition?.weeks;
  return Boolean(weeks)&&Object.values(weeks).some(list=>Array.isArray(list)&&new Set(list.filter(id=>quests[id]?.stage)).size>=3);
}

export function masterpieceDone(state) {
  return Array.isArray(state.entries)&&state.entries.some(entry=>quests[entry.quest]?.stage===4);
}

export function summitTarget(state) {
  const active=(state.active||[]).map(id=>byHobby[id]).filter(Boolean);
  for(const hobby of [...active,...hobbies.filter(item=>!active.includes(item))]) {
    const quest=hobby.quests.find(item=>item.stage===4&&!completedQuest(state,item.id)&&unlocks(state,item));
    if(quest) return quest;
  }
  return null;
}

export function missionDone(state,station) {
  const {mission}=station;
  if(mission.type==='quest') return mission.options.some(option=>completedQuest(state,option.quest));
  if(mission.type==='plan') return plannedExpedition(state);
  return masterpieceDone(state);
}

export function stationState(state,index,xp) {
  const station=checkpoints[index];
  const unlocked=xp>=station.xp;
  return {unlocked,done:unlocked&&missionDone(state,station)};
}

export function stationStatus(state,index,xp) {
  const {unlocked,done}=stationState(state,index,xp);
  if(!unlocked) return 'Gesperrt · noch '+(checkpoints[index].xp-xp)+' XP';
  return done?'Mission erledigt':'Mission offen';
}

export function mapContext(hash,state,xp=totalXp(state)) {
  const [page,id]=String(hash||'').replace(/^#/,'').split('/');
  let index=-1;
  if(page==='quest'||page==='fokus') {
    index=checkpoints.findIndex(point=>point.mission.options?.some(option=>option.quest===id));
    if(index<0&&quests[id]?.stage===4) index=checkpoints.length-1;
  } else if(page==='woche') index=checkpoints.findIndex(point=>point.mission.type==='plan');
  if(index<0||xp<checkpoints[index].xp) return null;
  return {index,station:checkpoints[index],done:missionDone(state,checkpoints[index]),href:'#karte/'+(index+1)};
}

function remember(storage,patch) {
  try { storage.setItem(key,JSON.stringify({...load(storage),...patch})); }
  catch { /* Ohne Speicher bleibt alles aus XP und Abschlüssen ableitbar. */ }
}

function syncProgress(state,storage,current,xp) {
  const patch={};
  const seen=Number.isInteger(state.mapSeen)?state.mapSeen:0;
  if(current>seen) {celebration={index:current};patch.mapSeen=current;}
  const earned=Boolean(state.mapBadge)||stationState(state,checkpoints.length-1,xp).done;
  if(earned&&!state.mapBadge) patch.mapBadge=localDate();
  if(storage&&Object.keys(patch).length) remember(storage,patch);
  return earned;
}

function segment(points,index) {
  const [x0,y0]=points[Math.max(0,index-1)],[x1,y1]=points[index],[x2,y2]=points[index+1],[x3,y3]=points[Math.min(points.length-1,index+2)];
  const round=value=>Number(value.toFixed(1));
  return `M${x1} ${y1}C${round(x1+(x2-x0)/6)} ${round(y1+(y2-y0)/6)} ${round(x2-(x3-x1)/6)} ${round(y2-(y3-y1)/6)} ${x2} ${y2}`;
}

function facts(rows) {
  return `<dl class="map-facts">${rows.map(([term,text])=>`<div><dt>${term}</dt><dd>${esc(text)}</dd></div>`).join('')}</dl>`;
}

function questFacts(quest) {
  const hobby=byHobby[quest.hobby];
  return facts([
    ['Aufgabe',quest.title+': '+sentence(quest.steps?.[0]||quest.result)],
    ['Dauer','etwa '+quest.minutes+' Min.'],
    ['Material',quest.materials||hobby.materials],
    ['Fertig, wenn','du dein Ergebnis gespeichert hast: '+sentence(quest.result)]
  ]);
}

function missionBlock(state,station) {
  const {mission}=station;
  const head=`<h3>${esc(mission.title)}</h3><p>${esc(mission.intro)}</p>`;
  if(mission.type==='quest') {
    const options=mission.options.map(option=>({...option,quest:quests[option.quest]})).filter(option=>option.quest);
    if(!options.length) return '<p>Diese Mission ist gerade nicht verfügbar.</p>';
    if(options.length===1) return `${head}${questFacts(options[0].quest)}<a class="button primary" href="#quest/${options[0].quest.id}">${esc(options[0].label)}</a>`;
    return `${head}<div class="map-options">${options.map(({quest,label})=>{
      const hobby=byHobby[quest.hobby];
      return `<article class="map-option"><h4><span aria-hidden="true">${hobby.icon}</span> ${esc(hobby.name)}: ${esc(quest.title)}</h4>${questFacts(quest)}<a class="button secondary" href="#quest/${quest.id}">${esc(label)}</a></article>`;
    }).join('')}</div>`;
  }
  if(mission.type==='plan') return `${head}${facts([['Aufgabe','Öffne „Woche planen“ und wähle drei Etappen.'],['Dauer','etwa '+mission.minutes+' Min.'],['Fertig, wenn',mission.doneWhen]])}<a class="button primary" href="#${mission.href}">${esc(mission.label)}</a>`;
  const target=summitTarget(state);
  if(target) {
    const hobby=byHobby[target.hobby];
    return `${head}${facts([['Aufgabe',hobby.name+': '+target.title],['Dauer','etwa '+target.minutes+' Min.'],['Fertig, wenn','du das Meisterstück gespeichert hast und alle Projektkriterien bestätigt sind']])}<a class="button primary" href="#quest/${target.id}">${esc(mission.label)}</a>`;
  }
  const hobby=(state.active||[]).find(id=>byHobby[id]);
  return `${head}<p>Noch ist kein Meisterstück freigeschaltet. Schließe zuerst die Etappen eines Lernpfads ab.</p><a class="button primary" href="#${hobby?'pfad/'+hobby:'entdecken'}">${hobby?'Lernpfad öffnen':'Hobby auswählen'}</a>`;
}

function doneBlock(state,station,selected,xp) {
  const {mission}=station;
  const entry=mission.type==='quest'?state.entries.find(item=>mission.options.some(option=>option.quest===item.quest)):mission.type==='summit'?state.entries.find(item=>quests[item.quest]?.stage===4):null;
  const detail=entry?`<p>Du hast „${esc(quests[entry.quest].title)}“ abgeschlossen: ${esc(sentence(entry.result||quests[entry.quest].result))}</p>`:mission.type==='plan'?'<p>Deine Wochenexpedition mit drei Etappen steht.</p>':'';
  const following=checkpoints[selected+1];
  const step=!following?'<p>Das war die letzte Station. Dein Abzeichen bleibt auf der Karte erhalten.</p>':
    xp>=following.xp?`<a class="button primary" href="#karte/${selected+2}">Weiter zu ${esc(following.name)}</a>`:
    `<p>Als Nächstes wartet ${esc(following.name)}. Dir fehlen noch ${following.xp-xp} XP.</p><a class="button secondary" href="#heute">XP mit Quests sammeln</a>`;
  return `<h3>${esc(mission.title)}: erledigt</h3>${detail}${step}`;
}

function dossier(state,xp,selected) {
  const station=checkpoints[selected];
  const {unlocked,done}=stationState(state,selected,xp);
  const head=`<p class="eyebrow">Level ${selected+1} von ${checkpoints.length} · ab ${station.xp} XP</p><h2 id="map-station">${esc(station.name)}</h2><p class="map-status"><strong>${esc(stationStatus(state,selected,xp))}</strong></p>`;
  if(!unlocked) return `${head}<h3>Ausblick</h3><p>${esc(station.preview)}</p><p>Dir fehlen noch ${station.xp-xp} XP, bis dieser Ort aufgeht.</p>`;
  return head+(done?doneBlock(state,station,selected,xp):missionBlock(state,station));
}

function summary(xp,current,next,badge) {
  const base=checkpoints[current].xp;
  return `<div class="map-summary"><strong>${xp} XP · Level ${current+1} von ${checkpoints.length}</strong>${next?
    `<progress aria-label="Fortschritt zur nächsten Station" value="${xp-base}" max="${next.xp-base}">${xp-base} von ${next.xp-base} XP</progress><p>Noch ${next.xp-xp} XP bis ${esc(next.name)}.</p><a class="text-button" href="#heute">XP durch Quests und Übungen sammeln</a>`:
    '<p>Du hast alle Stationen freigeschaltet.</p>'}<p class="map-badge ${badge?'earned':''}"><span aria-hidden="true">🚩</span> Gipfelabzeichen: ${badge?'gesammelt':'noch offen'}</p></div>`;
}

const currentStorage=()=>typeof localStorage==='undefined'?null:localStorage;
const currentState=()=>load(currentStorage()||{getItem:()=>null});

export function gameMapPage(xpValue,id,state=currentState(),storage=currentStorage()) {
  const xp=Number.isFinite(xpValue)?xpValue:totalXp(state);
  const {current,next}=mapProgress(xp);
  const requested=checkpoints.findIndex((_,index)=>String(index+1)===String(id));
  const selected=requested<0?current:requested;
  const badge=syncProgress(state,storage,current,xp);
  const points=checkpoints.map(({x,y})=>[x,y]);
  const arrived=celebration?.index===current&&current>0?checkpoints[current]:null;
  const states=checkpoints.map((_,index)=>stationState(state,index,xp));
  return `<div class="page-heading"><h1>Spielkarte</h1><p>Hier siehst du, wo deine Figur steht, was du geschafft hast und welches Abenteuer als Nächstes wartet.</p></div>
  ${arrived?`<section class="surface utility map-celebrate" role="status"><p class="eyebrow">Neu freigeschaltet</p><h2>${esc(arrived.name)}</h2><p>Du hast ${arrived.xp} XP erreicht. Neue Mission: ${esc(arrived.mission.title)}.</p>${selected===current?'':`<a class="button primary" href="#karte/${current+1}">Mission ansehen</a>`}</section>`:''}
  <div class="game-map-layout">
    <div class="map-column">
      <div class="game-map" role="group" aria-label="Spielpfad mit fünf Stationen">
        <svg class="map-art" viewBox="0 0 100 100" aria-hidden="true" focusable="false">
          <path class="map-river" d="M54 20C64 38 72 60 68 88"/>
          ${points.slice(1).map((_,index)=>`<path class="map-path ${index<current?'walked':''}" d="${segment(points,index)}"/>`).join('')}
          <g class="map-silhouettes">${checkpoints.map((point,index)=>`<g class="lm lm-${point.tone} ${states[index].unlocked?'':'locked'}" transform="translate(${point.x} ${point.y})">${silhouettes[point.tone]}</g>`).join('')}</g>
        </svg>
        ${checkpoints.map((point,index)=>{
          const {unlocked,done}=states[index];
          const label=`${index+1}. ${point.name}, ${stationStatus(state,index,xp)}, ab ${point.xp} XP${index===current?', hier steht deine Figur':''}`;
          return `<a class="map-node ${unlocked?'':'locked'} ${done?'done':''} ${index===current?'here':''}" href="#karte/${index+1}" style="--x:${point.x};--y:${point.y}" ${index===selected?'aria-current="true"':''} aria-label="${esc(label)}">${index===current?player:''}<span class="map-pin" aria-hidden="true">${unlocked?point.icon:'🔒'}${done?'<span class="map-check">✓</span>':''}</span><span class="map-label" aria-hidden="true">${esc(point.name)}</span></a>`;
        }).join('')}
      </div>
      <section aria-labelledby="map-list-title"><h2 id="map-list-title">Alle Orte</h2>
        <ol class="map-list">${checkpoints.map((point,index)=>`<li><a href="#karte/${index+1}" ${index===selected?'aria-current="true"':''}><span class="map-list-name"><span aria-hidden="true">${states[index].unlocked?point.icon:'🔒'}</span> ${esc(point.name)}</span><span>${esc(stationStatus(state,index,xp))}</span><small>ab ${point.xp} XP${index===current?' · hier steht deine Figur':''}</small></a></li>`).join('')}</ol>
      </section>
    </div>
    <section class="surface utility map-dossier" aria-labelledby="map-station">
      ${dossier(state,xp,selected)}
      ${summary(xp,current,next,badge)}
    </section>
  </div>`;
}

function installMapHooks() {
  const main=document.querySelector('#main');
  const modal=document.querySelector('#modal');
  if(!main||!modal) return;
  const context=()=>{
    try {
      const state=load(localStorage);
      return mapContext(location.hash,state);
    } catch { return null; }
  };
  new MutationObserver(()=>{
    if(main.querySelector('.map-return')) return;
    const found=context();
    if(!found) return;
    const note=document.createElement('p');
    note.className='notice map-return';
    note.innerHTML=`Kartenmission · ${esc(found.station.name)}: ${esc(found.station.mission.title)}. ${found.done?'Erledigt. ':''}<a href="${found.href}">Zurück zur Karte</a>`;
    main.prepend(note);
  }).observe(main,{childList:true});
  new MutationObserver(()=>{
    const card=modal.querySelector('.success-card');
    if(!modal.open||!card||modal.querySelector('.map-return')) return;
    const found=context();
    if(!found) return;
    const back=document.createElement('p');
    back.className='map-return';
    back.innerHTML=`<a class="button primary" href="${found.href}">Zurück zur Karte</a>`;
    card.after(back);
  }).observe(modal,{childList:true});
  window.addEventListener('hashchange',()=>{if(!location.hash.startsWith('#karte')) celebration=null;});
}

if(typeof document!=='undefined'&&typeof window!=='undefined') installMapHooks();

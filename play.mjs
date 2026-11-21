import {byHobby,quests,challenges,hobbies,journeys} from './catalog.mjs?v=05';
import {monday,completed,unlocks,localDate,initial,validDay,validShare,rankId,rebuildEntries} from './state.mjs?v=05';
import {experiments} from './learning.mjs?v=05';
import {studios} from './studios.mjs';

export const languages = {
  es:{name:'Spanisch',locale:'es-ES',pairs:[['Hola.','Hallo.'],['Buenos días.','Guten Morgen.'],['¿Cómo te llamas?','Wie heißt du?'],['Me llamo Ana.','Ich heiße Ana.'],['Mucho gusto.','Freut mich.']]},
  fr:{name:'Französisch',locale:'fr-FR',pairs:[['Salut !','Hallo!'],['Bonjour !','Guten Tag!'],['Comment tu t’appelles ?','Wie heißt du?'],['Je m’appelle Ana.','Ich heiße Ana.'],['Enchanté !','Freut mich!']]},
  en:{name:'Englisch',locale:'en-GB',pairs:[['Hi!','Hallo!'],['Good morning!','Guten Morgen!'],['What’s your name?','Wie heißt du?'],['My name is Ana.','Ich heiße Ana.'],['Nice to meet you.','Freut mich.']]}
};

export const starterGuides = {
  'sprachen-1':{success:'Du kannst die fünf Sätze ohne Vorlage sprechen und mindestens drei einer passenden Situation zuordnen.',tips:['Wähle oben eine der drei Sprachen. Beginne mit der Begrüßung und ersetze „Ana“ durch deinen Namen.','Höre einen Satz zweimal. Sprich ihn beim dritten Mal mit und dann allein nach. Zerlege längere Fragen in zwei Teile.','Klappe die Vorlage zu und sprich Begrüßung, Frage und Vorstellung auswendig. Öffne danach zum Vergleich wieder die Karten.']},
  'kochen-1':{intro:'Für eine Portion brauchst du 100 g trockene Nudeln, 150 g passierte Tomaten, etwa 1 Liter Wasser und etwas Salz. Optional passen ein Teelöffel Olivenöl oder getrocknete Kräuter dazu.',success:'Die Nudeln sind weich genug zum Kauen und noch leicht bissfest. Die Sauce ist durchgehend heiß und umhüllt die Nudeln.',tips:['Miss alles vor dem Einschalten ab. Verwende einen Topf für Nudeln und eine kleine Pfanne oder einen zweiten Topf für die Sauce.','Koste eine Nudel etwa eine Minute vor Ende der Packungszeit. Ist der Kern zu hart, prüfe nach einer weiteren Minute erneut.', 'Lass die passierten Tomaten etwa fünf Minuten leise köcheln und rühre gelegentlich. Mische die abgetropften Nudeln erst zum Schluss hinein.']},
  'scratch-1':{intro:'Die Bühne ist rechts, die Blockpalette links und der Skriptbereich in der Mitte. Ziehe die Blöcke in die Mitte und lasse sie untereinander einrasten.',success:'Nach dem Klick auf die grüne Flagge bewegt sich deine Figur. Mit 30 Schritten soll die Strecke sichtbar größer sein als mit 10.',tips:['Klicke unter der Bühne auf das Bild deiner Figur. Die Blöcke gelten dann für diese Figur.','Lege den blauen Block so an die Unterkante des gelben Blocks, dass er sichtbar einrastet. Teste dieselbe Reihenfolge zuerst im Blocklabor.','Wenn nichts passiert, klicke auf die grüne Flagge über der Bühne und prüfe, ob der blaue Block direkt am gelben hängt.']},
  'tennis-1':{success:'Du kannst die Bewegung kontrolliert wiederholen und deinen besten zusammenhängenden Versuch benennen.',tips:['Halte die Fläche vor dir waagerecht.','Beginne mit kleinen, leisen Kontakten. Fange den Ball zwischen den Versuchen, wenn er seitlich wegspringt.','Zähle nur aufeinanderfolgende Treffer und notiere den besten Wert aus drei Versuchen.']}
};

export const preferences = {
  experience:[['start','Neu dabei'],['practice','Habe etwas Übung']],
  gear:[['any','Passende Ausrüstung vorhanden'],['basic','Nur Alltagsmaterial / ohne Ausrüstung']],
  goal:[['try','Etwas Neues ausprobieren'],['improve','Eine Fähigkeit verbessern']]
};

export function searchKey(value='') {
  return value.toLocaleLowerCase('de').replaceAll('ß','ss').replace(/[äöü]/g,letter=>({ä:'ae',ö:'oe',ü:'ue'}[letter])).normalize('NFD').replace(/\p{M}/gu,'').trim();
}
export function matchingGear(state,hobby,quest) {
  return state.preferences[hobby.id]?.gear!=='basic'||(quest.gear||hobby.gear)!=='Mit Ausrüstung';
}
export function questMatches(hobby,quest,filters,state) {
  if(!unlocks(state,quest)) return false;
  const place=quest.place||hobby.place;
  const gear=quest.gear||hobby.gear;
  const query=searchKey(filters.query);
  return matchingGear(state,hobby,quest)
    && (!query||searchKey([hobby.name,hobby.skill,quest.materials||hobby.materials,quest.title].join(' ')).includes(query))
    && (!filters.group||filters.group==='all'||hobby.group===filters.group)
    && (!filters.place||place===filters.place)
    && (!filters.gear||gear===filters.gear)
    && (!filters.time||quest.minutes<=Number(filters.time))
    && (!filters.stage||quest.type===filters.stage);
}
export function recommend(state,filters={}) {
  const options=hobbies.flatMap(hobby=>{
    const pref=state.preferences[hobby.id];
    return hobby.quests.filter(quest=>{
      return questMatches(hobby,quest,filters,state);
    }).map(quest=>{
      const done=completed(state,quest.id);
      const last=done&&state.entries.find(entry=>entry.quest===quest.id);
      const retry=last?.confidence==='retry'&&last.day<localDate();
      const priority=(state.active.includes(hobby.id)?16:0)+(pref?.goal==='improve'&&quest.stage>1?5:0)+(pref?.experience==='practice'&&quest.stage>1?3:0)+(retry?13:done?-16:9)-quest.minutes/15;
      return {quest,hobby,priority};
    });
  });
  return options.sort((a,b)=>b.priority-a.priority)[0];
}
export function featuredChallenge(date=localDate()) {
  const first='2026-11-16';
  const current=monday(date);
  const elapsed=Math.round((Date.parse(current)-Date.parse(first))/604800000);
  return challenges[((elapsed%challenges.length)+challenges.length)%challenges.length];
}

const str=(value,limit)=>typeof value==='string'&&value.length<=limit;
const obj=value=>value&&typeof value==='object'&&!Array.isArray(value);
const nonfuture=value=>validDay(value)&&value>='2020-01-01'&&value<=localDate();
const safeId=value=>str(value,50)&&/^[a-f0-9-]{8,50}$/i.test(value);

export function profileBackup(state) {
  const {name,playerId,active,entries,practice,practiceDays,preferences,stepChecks,goals,plans,journeys,invites,scores,language,labDrafts,studioDrafts,checkpoints}=state;
  return JSON.stringify({format:'hobbymaxing-profile',version:2,profile:{name,playerId,active,entries,practice,practiceDays,preferences,stepChecks,goals,plans,journeys,invites,scores,language,labDrafts,studioDrafts,checkpoints}},null,2);
}
export function parseBackup(text) {
  if(text.length>1000000) return null;
  try {
    const file=JSON.parse(text);
    const profile=file.profile;
    if(file.format!=='hobbymaxing-profile'||![1,2].includes(file.version)||!obj(profile)||!str(profile.name,28)||!Array.isArray(profile.entries)||!Array.isArray(profile.active)) return null;
    const restored=initial();
    restored.name=profile.name;
    restored.playerId=safeId(profile.playerId)?profile.playerId:'';
    restored.active=profile.active.filter(id=>Object.hasOwn(byHobby,id));
    restored.entries=profile.entries.filter(entry=>{
      const quest=entry&&quests[entry.quest];
      return quest&&safeId(entry.id)&&nonfuture(entry.day)&&entry.week===monday(entry.day)&&str(entry.time,30)&&Number.isInteger(entry.version)&&entry.version>0&&str(entry.condition,100)&&str(entry.result,160)&&str(entry.note,420)&&str(entry.invite,42)&&[0,quest.xp].includes(entry.xp)&&(quest.max?Number.isInteger(entry.score)&&entry.score>=0&&entry.score<=quest.max:entry.score===null);
    }).map(entry=>({id:entry.id,quest:entry.quest,day:entry.day,week:entry.week,time:entry.time,version:entry.version,condition:entry.condition,result:entry.result,note:entry.note,confidence:entry.confidence==='retry'?'retry':entry.confidence==='ready'?'ready':'',invite:entry.invite,xp:entry.xp,score:entry.score,previous:Number.isInteger(entry.previous)?entry.previous:null,best:Number.isInteger(entry.best)?entry.best:null}));
    for(const [id,value] of Object.entries(obj(profile.practice)?profile.practice:{})) {
      const validId=id.startsWith('quiz-')&&Object.hasOwn(byHobby,id.slice(5))||['lab-start','lab-steuern','lab-sammeln','studio-schach','studio-beats','studio-pixelart'].includes(id);
      if(validId&&obj(value)&&nonfuture(value.day)&&value.xp===(id.startsWith('quiz-')?20:25)) restored.practice[id]={day:value.day,xp:value.xp};
    }
    for(const day of Object.keys(obj(profile.practiceDays)?profile.practiceDays:{})) if(nonfuture(day)) restored.practiceDays[day]=true;
    for(const [id,pref] of Object.entries(obj(profile.preferences)?profile.preferences:{})) {
      if(!Object.hasOwn(byHobby,id)||!obj(pref)) continue;
      restored.preferences[id]=Object.fromEntries(Object.entries(preferences).map(([field,choices])=>[field,choices.some(([value])=>value===pref[field])?pref[field]:choices[0][0]]));
    }
    for(const [key,checks] of Object.entries(obj(profile.stepChecks)?profile.stepChecks:{})) {
      const [id,version]=key.split(':');
      if(quests[id]&&version===String(quests[id].version)&&Array.isArray(checks)) restored.stepChecks[id+':'+version]=[...new Set(checks.filter(index=>Number.isInteger(index)&&index>=0&&index<quests[id].steps.length))];
    }
    for(const [day,goal] of Object.entries(obj(profile.goals)?profile.goals:{})) if(validDay(day)&&Number.isInteger(goal)&&goal>=1&&goal<=7) restored.goals[day]=goal;
    if(Array.isArray(profile.plans)) for(const item of profile.plans) {
      if(!item||!safeId(item.id)||!quests[item.quest]||!validDay(item.day)||typeof item.done!=='boolean') continue;
      restored.plans.push({id:item.id,quest:item.quest,day:item.day,done:item.done,entry:safeId(item.entry)?item.entry:undefined});
    }
    if(Array.isArray(profile.journeys)) restored.journeys=profile.journeys.filter(id=>journeys.some(item=>item.id===id));
    if(Array.isArray(profile.invites)) for(const item of profile.invites) {
      if(!item||!safeId(item.code)||!quests[item.quest]||!validDay(item.day)||typeof item.done!=='boolean') continue;
      restored.invites.push({code:item.code,quest:item.quest,day:item.day,done:item.done,friendId:safeId(item.friendId)?item.friendId:'',friendDone:item.friendDone===true});
    }
    if(Array.isArray(profile.scores)) for(const item of profile.scores) {
      if(item?.mode==='result'&&validShare(item)&&quests[item.quest].type==='Challenge') {
        const {mode,quest,version,week,name,player,score,result}=item;
        restored.scores.push({mode,quest,version,week,name,player,score,result});
      }
    }
    if(Object.hasOwn(languages,profile.language)) restored.language=profile.language;
    for(const exercise of experiments) {
      const draft=profile.labDrafts?.[exercise.id];
      if(Array.isArray(draft)) restored.labDrafts[exercise.id]=draft.filter(block=>exercise.palette.includes(block)).slice(0,12);
    }
    for(const [id,studio] of Object.entries(studios)) {
      const draft=profile.studioDrafts?.[id];
      if(Array.isArray(draft)) restored.studioDrafts[id]=[...new Set(draft.filter(cell=>Number.isInteger(cell)&&cell>=0&&cell<studio.rows*studio.size&&cell!==studio.origin))];
    }
    for(const [id,days] of Object.entries(obj(profile.checkpoints)?profile.checkpoints:{})) {
      if(quests[id]?.elapsedDays&&Array.isArray(days)) restored.checkpoints[id]=[...new Set(days.filter(nonfuture))].sort();
    }
    restored.skipped=['entries','plans','invites','scores'].reduce((count,field)=>count+(Array.isArray(profile[field])?profile[field].length-restored[field].length:0),0);
    return restored;
  } catch { return null; }
}
export function mergeBackup(state,profile) {
  const counts={added:0,skipped:profile.skipped||0};
  const emptyProfile=!state.playerId&&!state.entries.length;
  state.name ||= profile.name;
  state.playerId ||= profile.playerId;
  state.active=[...new Set([...state.active,...profile.active])];
  const ids=new Set(state.entries.map(entry=>entry.id));
  for(const entry of profile.entries) {
    if(ids.has(entry.id)) {counts.skipped++;continue;}
    ids.add(entry.id);
    state.entries.push({...entry});
    counts.added++;
  }
  rebuildEntries(state);
  for(const item of profile.plans) {
    if(state.plans.some(plan=>plan.id===item.id||plan.quest===item.quest&&plan.day===item.day&&plan.done===item.done)) counts.skipped++;
    else {state.plans.push(item); counts.added++;}
  }
  for(const item of profile.invites) {
    if(!emptyProfile&&state.playerId!==profile.playerId||state.invites.some(invite=>invite.code===item.code)) counts.skipped++;
    else {state.invites.push(item); counts.added++;}
  }
  for(const item of profile.scores) {
    const index=state.scores.findIndex(score=>rankId(score)===rankId(item));
    if(item.player&&item.player===state.playerId||index>=0&&(item.score===null||state.scores[index].score>=item.score)) counts.skipped++;
    else if(index>=0) {state.scores[index]=item; counts.added++;}
    else {state.scores.push(item); counts.added++;}
  }
  state.journeys=[...new Set([...state.journeys,...profile.journeys])];
  if(emptyProfile) state.language=profile.language;
  state.labDrafts={...profile.labDrafts,...state.labDrafts};
  state.studioDrafts={...profile.studioDrafts,...state.studioDrafts};
  for(const [id,days] of Object.entries(profile.checkpoints)) state.checkpoints[id]=[...new Set([...(state.checkpoints[id]||[]),...days])].sort();
  state.practice={...profile.practice,...state.practice};
  state.practiceDays={...profile.practiceDays,...state.practiceDays};
  state.preferences={...profile.preferences,...state.preferences};
  state.goals={...profile.goals,...state.goals};
  for(const [key,checks] of Object.entries(profile.stepChecks)) state.stepChecks[key]=[...new Set([...(state.stepChecks[key]||[]),...checks])];
  return counts;
}

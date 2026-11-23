import {byHobby, hobbies, quests} from './catalog.mjs?v=06';
import {completed, localDate, monday, shift, unlocks, validDay} from './state.mjs?v=08';

export const timeChoices = [10, 15, 25, 45];
export const readingChoices = [['standard','Standard'],['large','Größere Schrift'],['text','Textansicht mit reduzierter Bewegung']];
export const seasons = [
  {label:'Winter', groups:['hand','kueche','technik']},
  {label:'Frühling', groups:['natur','sport','kunst']},
  {label:'Sommer', groups:['sport','natur','musik']},
  {label:'Herbst', groups:['kunst','spiel','hand']}
];

const isObject = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const fields = value => Object.entries(isObject(value) ? value : {});
const clean = (value,max) => typeof value === 'string' ? value.trim().slice(0,max) : '';
const list = (value,valid,limit) => Array.isArray(value) ? [...new Set(value.filter(valid))].slice(0,limit) : [];
const questExists = id => typeof id === 'string' && Boolean(quests[id]?.stage);
const hobbyExists = id => typeof id === 'string' && Object.hasOwn(byHobby,id);
const branchTraining = {
  tennis:['tennis-wand','tennis-vorhand'],
  kochen:['kochen-abschmecken','kochen-timing'],
  scratch:['scratch-2','scratch-animation'],
  sprachen:['sprachen-hoeren','sprachen-2']
};

export function expeditionDefaults() {
  return {favorites:[], paused:[], plans:{}, materials:{}, journal:{}, diagnostic:{}, weeks:{}, reading:'standard', reducedMotion:false, reminder:{days:0,last:''}};
}

export function cleanExpedition(value) {
  const result=expeditionDefaults();
  if(!isObject(value)) return result;
  result.favorites=list(value.favorites,questExists,250);
  result.paused=list(value.paused,hobbyExists,hobbies.length);
  result.reading=readingChoices.some(([id])=>id===value.reading)?value.reading:'standard';
  result.reducedMotion=value.reducedMotion===true;
  if([0,1,7].includes(value.reminder?.days)&&validDay(value.reminder?.last)) result.reminder={days:value.reminder.days,last:value.reminder.last};
  for(const [id,plan] of fields(value.plans)) {
    if(!byHobby[id]||!isObject(plan)) continue;
    result.plans[id]={
      minutes:timeChoices.includes(plan.minutes)?plan.minutes:15,
      route:Number.isInteger(plan.route)&&plan.route>=0&&plan.route<5?plan.route:0,
      deadline:validDay(plan.deadline)?plan.deadline:'',
      preparation:clean(plan.preparation,240)
    };
  }
  for(const [id,checked] of fields(value.materials)) {
    if(!byHobby[id]) continue;
    result.materials[id]=list(checked,item=>Number.isInteger(item)&&item>=0&&item<24,24);
  }
  for(const [id,assessment] of fields(value.diagnostic)) {
    if(byHobby[id]&&['start','practice'].includes(assessment)) result.diagnostic[id]=assessment;
  }
  for(const [id,note] of fields(value.journal)) {
    if(!questExists(id)||!isObject(note)||!validDay(note.day)) continue;
    const before=clean(note.before,300), after=clean(note.after,300);
    if(before||after) result.journal[id]={day:note.day,before,after};
  }
  for(const [week,selection] of fields(value.weeks).slice(-52)) {
    if(validDay(week)&&monday(week)===week) result.weeks[week]=list(selection,questExists,3);
  }
  return result;
}

export function mergeExpedition(current, backup) {
  const merged={...backup,...current};
  for(const field of ['favorites','paused']) merged[field]=[...new Set([...current[field],...backup[field]])];
  for(const field of ['plans','diagnostic','journal','weeks']) merged[field]={...backup[field],...current[field]};
  merged.materials={...backup.materials};
  for(const [id,checks] of Object.entries(current.materials)) merged.materials[id]=[...new Set([...(merged.materials[id]||[]),...checks])];
  if(!current.reminder.days&&!current.reminder.last) merged.reminder=backup.reminder;
  return cleanExpedition(merged);
}

export const practicedSkill = quest => quest.skill || quest.title;
export const budgetLabel = quest => quest.gear==='Ohne Ausrüstung'?'Ohne Anschaffung':quest.gear==='Alltagsmaterial'?'Alltagsmaterial':'Ausrüstung leihen oder kaufen';

export function routeSummary(state,hobby) {
  return [1,2,3,4].map(stage=>{
    const tasks=hobby.quests.filter(quest=>quest.stage===stage);
    const done=tasks.find(quest=>completed(state,quest.id));
    const available=tasks.filter(quest=>unlocks(state,quest)&&!completed(state,quest.id));
    const lead=available[0]||done||tasks[0];
    return {stage,tasks,done,available,lead};
  });
}

export function expeditionNext(state,hobby) {
  const plan=state.expedition.plans[hobby.id], number=plan?.minutes||15;
  const station=routeSummary(state,hobby).find(item=>!item.done&&item.available.length);
  if(!station) return null;
  const basic=state.preferences[hobby.id]?.gear==='basic';
  const available=station.available.filter(quest=>!basic||quest.gear!=='Mit Ausrüstung');
  const branch=plan&&station.stage===2?branchTraining[hobby.id]?.[plan.route]:undefined;
  const branchQuest=available.find(quest=>quest.id===branch);
  if(branchQuest) return branchQuest;
  return available.find(quest=>quest.minutes<=number)||available[0]||station.available[0];
}

export function milestoneMinutes(state,hobby) {
  const route=routeSummary(state,hobby);
  const target=route.find(station=>station.stage>=3&&!station.done);
  if(!target) return 0;
  return route.filter(station=>station.stage<=target.stage&&!station.done).reduce((sum,station)=>sum+Math.min(...station.tasks.map(quest=>quest.minutes)),0);
}

export function reviewQuest(state,hobby,today=localDate()) {
  const earliest=shift(today,-14);
  const reviews=hobby.quests.flatMap(quest=>{
    if(quest.stage>=4) return [];
    const latest=state.entries.filter(entry=>entry.quest===quest.id).map(entry=>entry.day).sort().at(-1);
    return latest&&latest<=earliest&&unlocks(state,quest)?[{quest,latest}]:[];
  });
  return reviews.sort((a,b)=>a.latest.localeCompare(b.latest)||a.quest.minutes-b.quest.minutes)[0]?.quest;
}

export function shortQuest(state,max=10) {
  return hobbies.filter(hobby=>!state.expedition.paused.includes(hobby.id)).flatMap(hobby=>hobby.quests.filter(quest=>
    quest.minutes<=max&&quest.stage<4&&unlocks(state,quest)&&!completed(state,quest.id)&&
    (state.preferences[hobby.id]?.gear!=='basic'||quest.gear!=='Mit Ausrüstung')
  )).sort((a,b)=>Number(state.active.includes(b.hobby))-Number(state.active.includes(a.hobby))||a.minutes-b.minutes)[0];
}

export function skillHistory(state,week) {
  const skills=new Map();
  for(const entry of state.entries) {
    const quest=quests[entry.quest];
    if(!quest?.stage||(week&&entry.week!==week)) continue;
    const skill=practicedSkill(quest);
    const id=quest.hobby+'/'+skill;
    const previous=skills.get(id);
    if(!previous||entry.day>previous.day) skills.set(id,{skill,quest,day:entry.day});
  }
  return [...skills.values()].sort((a,b)=>b.day.localeCompare(a.day)||a.skill.localeCompare(b.skill));
}

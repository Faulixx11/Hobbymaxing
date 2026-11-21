import { byHobby, quests } from './catalog.mjs?v=04';

export const initial = () => ({name:'', playerId:'', active:[], entries:[], plans:[], scores:[], goals:{}, journeys:[], invites:[], practice:{}, practiceDays:{}, preferences:{}, stepChecks:{}});
export const key = 'hobbymaxing-v1';
export function load(storage) {
  try { return {...initial(), ...JSON.parse(storage.getItem(key) || '{}')}; } catch { return initial(); }
}
export function localDate(date=new Date()) {
  return [date.getFullYear(),date.getMonth()+1,date.getDate()].map(n=>String(n).padStart(2,'0')).join('-');
}
export function shift(day, delta) {
  const date = new Date(day+'T12:00:00');
  date.setDate(date.getDate()+delta);
  return localDate(date);
}
export function monday(day=localDate()) {
  const date = new Date(day+'T12:00:00');
  return shift(day,-((date.getDay()+6)%7));
}
export function weekGoal(state, week) {
  const latest = Object.keys(state.goals).filter(day=>day<=week).sort().at(-1);
  return state.goals[latest] || 2;
}
export function activeDays(state, week) {
  return new Set(state.entries.filter(entry=>monday(entry.day)===week).map(entry=>entry.day));
}
export function streaks(state, today=localDate()) {
  const current = monday(today);
  const first = state.entries.map(entry=>monday(entry.day)).sort()[0] || current;
  let running=0, best=0;
  for (let week=first; week<=current; week=shift(week,7)) {
    if (activeDays(state,week).size >= weekGoal(state,week)) running++;
    else if (week!==current) running=0;
    best=Math.max(best,running);
  }
  return {running,best};
}
export function completed(state, questId) {
  return state.entries.some(entry=>entry.quest===questId);
}
export function unlocks(state, quest) {
  if (!quest.requires.length) return true;
  return quest.any ? quest.requires.some(id=>completed(state,id)) : quest.requires.every(id=>completed(state,id));
}
export function level(state, hobby) {
  if (completed(state,hobby.id+'-meisterwerk')) return 4;
  if (completed(state,hobby.id+'-3')) return 3;
  return completed(state,hobby.id+'-1') ? 2 : 1;
}
export function nextQuest(state,hobby) {
  return hobby.quests.find(quest=>!completed(state,quest.id)&&unlocks(state,quest));
}
export function totalXp(state) {
  return state.entries.reduce((sum,entry)=>sum+entry.xp,0)+Object.values(state.practice).reduce((sum,entry)=>sum+entry.xp,0);
}
export function earnPractice(state,id,xp,today=localDate()) {
  state.practiceDays[today]=true;
  if(Object.hasOwn(state.practice,id)) return false;
  state.practice[id]={day:today,xp};
  return true;
}
export function dailyStreak(state,today=localDate()) {
  const days=[...new Set([...state.entries.map(entry=>entry.day),...Object.values(state.practice).map(entry=>entry.day),...Object.keys(state.practiceDays)])].filter(day=>day<=today).sort();
  let best=0, running=0, prior='';
  for(const day of days) {
    running=prior&&shift(prior,1)===day?running+1:1;
    best=Math.max(best,running);
    prior=day;
  }
  return {best,running:prior===today||prior===shift(today,-1)?running:0,doneToday:prior===today};
}
export function sameConditions(a,b) {
  return a.quest===b.quest && a.version===b.version && a.condition===b.condition;
}
export function record(state, quest, values, now=new Date()) {
  if (!unlocks(state,quest)) return null;
  const day=localDate(now);
  const weekly=quest.type==='Challenge';
  const week=monday(day);
  if (state.entries.some(entry=>entry.quest===quest.id && entry.day===day && entry.invite===(values.invite||''))) return null;
  if (quest.max && (!Number.isInteger(values.score)||values.score<0||values.score>quest.max)) return null;
  const condition=weekly?'standard':String(values.condition||'').trim().toLowerCase().replace(/\s+/g,' ');
  const reference={quest:quest.id,version:quest.version,condition};
  const comparable=state.entries.filter(entry=>sameConditions(entry,reference)&&entry.score!=null);
  const hasReward=state.entries.some(entry=>entry.quest===quest.id && (!weekly||entry.week===week));
  const entry={
    id:crypto.randomUUID(), ...reference, day, week, time:now.toISOString(),
    score:quest.max?values.score:null, result:String(values.result||'').trim().slice(0,160),
    note:String(values.note||'').trim().slice(0,420), confidence:values.confidence==='retry'?'retry':values.confidence==='ready'?'ready':'', invite:values.invite||'', xp:hasReward?0:quest.xp,
    previous:comparable[0]?.score??null, best:comparable.length?Math.max(...comparable.map(item=>item.score)):null
  };
  state.playerId ||= crypto.randomUUID();
  state.entries.unshift(entry);
  if (!state.active.includes(quest.hobby)) state.active.push(quest.hobby);
  if (values.invite) {
    state.invites=state.invites.map(invite=>invite.code===values.invite?{...invite,done:true}:invite);
  }
  return entry;
}
export function badges(state) {
  const hobbiesStarted=new Set(state.entries.map(entry=>quests[entry.quest]?.hobby).filter(Boolean));
  return [
    ['✦','Erster Schritt',state.entries.length>0],
    ['◈','Drei Hobbys ausprobiert',hobbiesStarted.size>=3],
    ['◆','Erstes Projekt',state.entries.some(entry=>quests[entry.quest]?.type==='Projekt')],
    ['◉','Gemeinsam unterwegs',state.invites.some(invite=>invite.done&&invite.friendDone)],
    ['☀','Wochenziel erreicht',streaks(state).best>0]
  ];
}
export function leaderboard(state, challenge, week=monday()) {
  const match=entry=>entry.quest===challenge.id&&(!week||entry.week===week)&&entry.version===challenge.version;
  const mine=state.entries.filter(match);
  const best=challenge.max?mine.sort((a,b)=>b.score-a.score||a.time.localeCompare(b.time))[0]:mine[0];
  const scores=new Map();
  for(const entry of state.scores.filter(match)) {
    const id=entry.player||entry.name.trim().toLowerCase();
    const existing=scores.get(id);
    if(!existing || (challenge.max ? existing.score<entry.score : existing.week<entry.week)) scores.set(id,entry);
  }
  const rows=[...scores.values()];
  if (best) rows.push({...best,name:state.name||'Du',mine:true});
  return challenge.max ? rows.sort((a,b)=>b.score-a.score||a.name.localeCompare(b.name)) : rows;
}
export function encode(data) {
  const bytes = new TextEncoder().encode(JSON.stringify(data));
  const binary = Array.from(bytes, byte => String.fromCharCode(byte)).join('');
  return btoa(binary).replaceAll('+','-').replaceAll('/','_').replace(/=+$/,'');
}
export function decode(raw) {
  if (!/^[\w-]{5,4000}$/.test(raw)) return null;
  try {
    const binary=atob(raw.replaceAll('-','+').replaceAll('_','/'));
    return JSON.parse(new TextDecoder().decode(Uint8Array.from(binary,char=>char.charCodeAt(0))));
  } catch { return null; }
}
export function validShare(data) {
  if (!data||!Object.hasOwn(quests,data.quest)||typeof data.name!=='string'||data.name.length>28) return false;
  const quest=quests[data.quest];
  if (data.mode==='invite') return typeof data.code==='string'&&/^[a-z0-9-]{8,42}$/i.test(data.code)&&validDay(data.day)&&typeof data.done==='boolean';
  const versionOK=quest.type==='Challenge'?data.version===quest.version:Number.isInteger(data.version)&&data.version>=1&&data.version<=quest.version;
  if (data.mode!=='result'||!versionOK||!validDay(data.week)||monday(data.week)!==data.week||typeof data.result!=='string'||data.result.length>160) return false;
  if (data.player!==undefined&&(typeof data.player!=='string'||!/^[a-f\d]{8}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{12}$/i.test(data.player))) return false;
  return quest.max?Number.isInteger(data.score)&&data.score>=0&&data.score<=quest.max:data.score===null;
}
export function validDay(day) {
  return typeof day==='string' && /^\d{4}-\d{2}-\d{2}$/.test(day) && localDate(new Date(day+'T12:00:00'))===day;
}
export function rankId(data) {
  return [data.quest,data.version,data.week,data.player||data.name.trim().toLowerCase()].join('|');
}
export function canPlan(questId) { return Object.hasOwn(quests,questId) && Object.hasOwn(byHobby,quests[questId].hobby); }

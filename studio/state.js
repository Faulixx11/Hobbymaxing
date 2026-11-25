const STORAGE = 'hobbymaxing-studio-v1';
const DAY = 86400000;
export const VERSION = 1;
const objects = ['active','completed','evidence','skills','world','quest','hobbyNotes','placements'];
const arrays = ['favorites','custom','projects','events','journal','activity','awards','goals','challenges'];

export function freshState() {
  return {
    version:VERSION,
    profile:{name:'',avatar:'spark',categories:[],level:'Einstieg',minutes:20,budget:30,materials:'',method:'Ausprobieren',existing:'',desired:'',goal:'',world:true,onboarded:false},
    settings:{theme:'light',accent:'green',motion:true,audio:true,xpVisible:true,largeText:false,language:'de'},
    xp:0,
    ...Object.fromEntries(objects.map(key => [key,{}])),
    ...Object.fromEntries(arrays.map(key => [key,[]]))
  };
}

function plain(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
const asText = (value, length = 255) => typeof value === 'string' ? value.slice(0,length) : '';
const safeKeys = key => /^[\p{L}0-9:_-]{1,140}$/u.test(key) && !['__proto__','prototype','constructor'].includes(key);
const asNumber = (value, max = 1000000) => Number.isFinite(value) ? Math.max(0, Math.min(max, Math.floor(value))) : 0;
const asDate = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(+new Date(value)) ? value : '';
const asTime = value => typeof value === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(value) ? value : '';
const asIso = value => typeof value === 'string' && value.length < 45 && !Number.isNaN(+new Date(value)) ? new Date(value).toISOString() : '';
const entries = (value, fn) => plain(value) ? Object.fromEntries(Object.entries(value).slice(0,8000).filter(([key]) => safeKeys(key)).map(([key,item]) => [key,fn(item)])) : {};
const rows = (value, fn, max = 800) => Array.isArray(value) ? value.slice(0,max).filter(plain).map(fn).filter(row => row.id && safeKeys(row.id)).filter((row,index,list) => list.findIndex(item => item.id === row.id) === index) : [];
const strings = (value, max = 100, length = 160) => Array.isArray(value) ? [...new Set(value.slice(0,max).map(item => asText(item,length)).filter(Boolean))] : [];
const tasks = value => Array.isArray(value) ? value.slice(0,60).filter(plain).map(task => ({title:asText(task.title),done:task.done === true})).filter(task => task.title) : [];
const imageData = value => typeof value === 'string' && value.length <= 850000 && /^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/]+=*$/.test(value) ? value : '';

export function sanitize(value) {
  if (!plain(value) || value.version !== VERSION) throw new Error('Diese Datei enthält keine unterstützte HobbyMaxing-Sicherung.');
  const clean = freshState();
  const profile = plain(value.profile) ? value.profile : {};
  const settings = plain(value.settings) ? value.settings : {};
  for (const key of ['name','avatar','level','materials','method','existing','desired','goal']) {
    if (typeof profile[key] === 'string') clean.profile[key] = asText(profile[key],500);
  }
  clean.profile.categories = strings(profile.categories,12,25).filter(safeKeys);
  for (const key of ['minutes','budget']) if (Number.isFinite(profile[key])) clean.profile[key] = asNumber(profile[key],5000);
  for (const key of ['world','onboarded']) if (typeof profile[key] === 'boolean') clean.profile[key] = profile[key];
  clean.settings.theme = ['light','dark','system'].includes(settings.theme) ? settings.theme : 'light';
  clean.settings.accent = ['green','lilac','peach'].includes(settings.accent) ? settings.accent : 'green';
  for (const key of ['motion','audio','xpVisible','largeText']) if (typeof settings[key] === 'boolean') clean.settings[key] = settings[key];
  clean.xp = asNumber(value.xp,10000000);
  clean.active = entries(value.active,item => ['active','paused','archived'].includes(item) ? item : 'archived');
  clean.completed = entries(value.completed,item => asIso(item) || (item === true ? new Date(0).toISOString() : ''));
  clean.evidence = entries(value.evidence,item => ({title:asText(item?.title),date:asIso(item?.date),kind:asText(item?.kind,30)}));
  clean.skills = entries(value.skills,item => ({
    tries:asNumber(item?.tries), correct:asNumber(item?.correct), streak:asNumber(item?.streak,30), last:asIso(item?.last),
    next:asIso(item?.next), errors:strings(item?.errors,12,250)
  }));
  clean.quest = entries(value.quest,item => ({checks:Array.isArray(item?.checks) ? item.checks.slice(0,60).map(x => x === true) : [],done:item?.done === true}));
  clean.hobbyNotes = entries(value.hobbyNotes,item => ({goal:asText(item?.goal,600),note:asText(item?.note,3000)}));
  clean.placements = entries(value.placements,item => asIso(item));
  clean.favorites = strings(value.favorites,2000,100).filter(safeKeys);
  clean.awards = strings(value.awards,8000,140);
  clean.custom = rows(value.custom,item => ({
    id:item.id,name:asText(item.name,100),description:asText(item.description,1000),category:asText(item.category,30),
    materials:strings(item.materials,30),project:asText(item.project,500),digital:item.digital === true,
    cost:asNumber(item.cost,5000),minutes:asNumber(item.minutes,1440)
  }));
  clean.projects = rows(value.projects,item => ({
    id:item.id,title:asText(item.title,180),description:asText(item.description,4000),hobby:asText(item.hobby,100),
    day:asDate(item.day),materials:asText(item.materials,1000),notes:asText(item.notes,4000),tasks:tasks(item.tasks),
    status:['active','paused','done'].includes(item.status) ? item.status : 'active'
  }));
  clean.events = rows(value.events,item => ({
    id:item.id,title:asText(item.title),day:asDate(item.day),time:asTime(item.time),hobby:asText(item.hobby,100),repeat:item.repeat === true
  })).filter(item => item.day);
  clean.journal = rows(value.journal,item => ({
    id:item.id,title:asText(item.title),day:asDate(item.day),hobby:asText(item.hobby,100),body:asText(item.body,8000),image:imageData(item.image)
  }),300);
  clean.goals = rows(value.goals,item => ({
    id:item.id,title:asText(item.title),target:Math.max(1,asNumber(item.target,99)),count:asNumber(item.count,99),paused:item.paused === true
  }));
  clean.challenges = rows(value.challenges,item => ({
    id:item.id,title:asText(item.title),day:asDate(item.day),tasks:tasks(item.tasks),paused:item.paused === true,done:item.done === true
  }));
  clean.activity = Array.isArray(value.activity) ? value.activity.slice(-8000).filter(plain).map(item => ({
    date:asIso(item.date),hobby:asText(item.hobby,100),kind:asText(item.kind,45),title:asText(item.title,280),
    minutes:asNumber(item.minutes,1440),xp:asNumber(item.xp,500)
  })).filter(item => item.date) : [];
  if (plain(value.world)) {
    clean.world = JSON.parse(JSON.stringify(value.world,(key,item) => {
      if (['__proto__','prototype','constructor'].includes(key)) return undefined;
      if (typeof item === 'string') return asText(item,160);
      if (Array.isArray(item)) return item.slice(0,400);
      return item;
    }));
    if (JSON.stringify(clean.world).length > 64000) clean.world = {};
  }
  return clean;
}

let db;
let pending = Promise.resolve();
export let storageMode = 'indexeddb';
function openDatabase() {
  return new Promise((resolve,reject) => {
    const request = indexedDB.open(STORAGE,1);
    request.onupgradeneeded = () => request.result.createObjectStore('profile');
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error('Datenbank blockiert'));
    request.onsuccess = () => resolve(request.result);
  });
}
function transaction(mode,operation) {
  return new Promise((resolve,reject) => {
    const txn = db.transaction('profile',mode);
    const request = operation(txn.objectStore('profile'));
    txn.oncomplete = () => resolve(request.result);
    txn.onerror = () => reject(txn.error);
    txn.onabort = () => reject(txn.error);
  });
}
export async function load() {
  let value;
  try {
    db = await openDatabase();
    value = await transaction('readonly',store => store.get('main'));
  } catch {
    db = undefined;
    storageMode = 'local';
    try { value = JSON.parse(localStorage.getItem(STORAGE)); } catch { storageMode = 'session'; }
  }
  try { return value ? sanitize(value) : freshState(); } catch { return freshState(); }
}
export function save(state) {
  const copy = structuredClone(state);
  const write = async () => {
    if (db) return transaction('readwrite',store => store.put(copy,'main'));
    try { localStorage.setItem(STORAGE,JSON.stringify(copy)); } catch {
      storageMode = 'session';
      throw new Error('Der Browser konnte deine Daten nicht speichern.');
    }
  };
  const current = pending.then(write);
  pending = current.catch(() => {});
  return current;
}
export function markActivity(state,{title,kind,hobby='',minutes=0,xp=0,date=new Date().toISOString()}) {
  if (state.activity.length >= 8000) state.activity.shift();
  state.activity.push({date,hobby,kind,title,minutes,xp});
}
export function award(state,key,xp,details) {
  if (state.awards.includes(key)) return false;
  state.awards.push(key);
  state.xp += xp;
  markActivity(state,{...details,xp});
  return true;
}
export function attempt(state,key,correct,response,date=new Date()) {
  const skill = state.skills[key] ?? {tries:0,correct:0,streak:0,errors:[]};
  skill.tries++;
  if (correct) {
    skill.correct++;
    skill.streak++;
  } else {
    skill.streak=0;
    if (response && !skill.errors.includes(response)) skill.errors = [...skill.errors,response].slice(-8);
  }
  const intervals = [1,3,7,14,30,60];
  skill.last = date.toISOString();
  skill.next = new Date(+date + (correct ? DAY * intervals[Math.min(skill.streak-1,intervals.length-1)] : 0)).toISOString();
  state.skills[key] = skill;
  return skill;
}
export function mastery(skill, now = new Date()) {
  if (!skill?.tries) return 'Noch nicht begonnen';
  if (skill.next && +new Date(skill.next) <= +now) return 'Wiederholung empfohlen';
  if (skill.streak >= 3) return 'Sicher angewendet';
  if (skill.correct >= 2) return 'In Übung';
  return 'Kennengelernt';
}
export function recordLesson(state,hobby,index,lesson,seconds) {
  const key = hobby.id + ':' + index;
  const first = !state.completed[key];
  if (first) state.completed[key] = new Date().toISOString();
  if (!state.active[hobby.id]) state.active[hobby.id] = 'active';
  if (first) award(state,'lesson:'+key,25,{title:lesson.title,kind:'Lektion',hobby:hobby.id,minutes:Math.max(1,Math.round(seconds/60))});
  else markActivity(state,{title:lesson.title,kind:'Wiederholung',hobby:hobby.id,minutes:Math.max(1,Math.round(seconds/60))});
  state.evidence[key] = {title:lesson.goal,date:new Date().toISOString(),kind:lesson.steps.some(step => step.type === 'reflect') ? 'Interaktiv und selbst dokumentiert' : 'Interaktiv nachgewiesen'};
  return first;
}

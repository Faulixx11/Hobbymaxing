import {categories,hobbies} from './content.js';
import {icon,esc,action,link,brand,empty,pageHead,route,readRoute,download,localDay,normalize,uid} from './ui.js';
import {freshState,sanitize,load,save as persist,award} from './state.js';
import {mountLesson,reviewPage} from './learning.js';
import {allHobbies,hobbyFor,featured,landing,explore,explorerResults,filteredHobbies,hobbyDetail,lessonUnlocked,mine,dashboard,learnPage,onboarding,profilePage,settingsPage,statsPage,field,area,selectMenu} from './pages.js';
import {quests,templates,questsPage,goalForm,finishQuest,challengesPage,challengeForm,projectsPage,projectForm,completeProject,calendarShift,calendarPage,eventForm,journalPage,journalEntries,journalForm,journalImage,taskList,upsert,refreshWeeks,weekKey} from './planner.js';

const app = document.querySelector('#app');
const dialog = document.querySelector('#dialog');
const toast = document.querySelector('#toast');
const freshFilters = () => ({q:'',category:'',sub:'',level:'',cost:'',minutes:'',material:'',type:'',favorites:false});
const statFilters = {period:'',hobby:'',kind:''};
const modules = new Map();
let state = freshState();
let filters = freshFilters();
let calendar = {day:localDay(),view:'month'};
let journalQuery = '';
let onboardingStage = 0;
let onboardingDraft;
let cleanup;
let revision = 0;
let toastTimer;
let mobileOpen = false;
let pendingImport;

const nav = [
  ['Entdecken & lernen', [['dashboard','Übersicht','home'],['explore','Entdecken','compass'],['mine','Meine Hobbys','bookmark'],['learn','Lernen','book'],['review','Wiederholen','repeat']]],
  ['Deine Vorhaben', [['quests','Quests','flag'],['challenges','Challenges','trophy'],['world','HobbyWorld','game'],['projects','Projekte','folder'],['calendar','Kalender','calendar'],['journal','Journal','pen']]],
  ['Persönlich', [['stats','Statistiken','chart'],['profile','Profil','user'],['settings','Einstellungen','settings']]]
];
const defaultStudioHobbies = {chess:'schach',code:'html-css',music:'klavier',drawing:'zeichnen',camera:'fotografie',sudoku:'sudoku',design:'grafikdesign',timeline:'videoschnitt',astronomy:'astronomie',geography:'geografie',languages:'englisch',cook:'kochen',pixel:'pixel-art',logic:'logikraetsel'};

function notify(message) {
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toastTimer = window.setTimeout(()=>{toast.textContent='';},3400);
}
function save() {
  return persist(state).catch(()=>notify('Speichern ist gerade nicht möglich. Sichere deine Daten über den Export.'));
}
function applyTheme() {
  const theme = state.settings.theme;
  const html = document.documentElement;
  html.dataset.theme = theme === 'system' ? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : theme;
  html.dataset.accent = state.settings.accent;
  html.dataset.motion = state.settings.motion ? 'on' : 'off';
  html.dataset.large = String(state.settings.largeText);
  document.querySelector('[name="theme-color"]').content = html.dataset.theme === 'dark' ? '#171e19' : '#f8f8f1';
}
function go(path) {
  closeDialog();
  if (location.hash === route(path)) render(false);
  else location.hash = route(path).slice(1);
}
function openDialog(title,body) {
  dialog.innerHTML = `<div class="dialog-card"><button type="button" class="icon-button dialog-close" data-action="close-dialog" aria-label="Dialog schließen">${icon('close',19)}</button><h2 id="dialog-title">${esc(title)}</h2>${body}</div>`;
  if (!dialog.open) dialog.showModal();
  const target = dialog.querySelector('[autofocus],input:not([type="hidden"]),select,textarea');
  target?.focus();
}
function closeDialog() {
  if (dialog.open) dialog.close();
}
function shell(current) {
  const page = ({hobby:'explore',lesson:'learn',studio:'learn',onboarding:'profile'})[current] ?? current;
  const theme = document.documentElement.dataset.theme;
  return `<div class="app-shell"><aside class="sidebar" id="sidebar" data-open="${mobileOpen}">${brand()}${nav.map(([name,entries])=>`<nav class="nav-group" aria-label="${name}"><div class="nav-label">${name}</div>${entries.map(([path,label,symbol])=>`<a class="nav-link" href="#/${path}" ${page === path ? 'aria-current="page"' : ''}>${icon(symbol,19)}${label}</a>`).join('')}</nav>`).join('')}<div class="side-footer"><a class="nav-link" href="../">${icon('globe',19)} Bisherige Beta</a></div></aside>
    <div><header class="app-top"><button class="icon-button mobile-menu" type="button" data-action="mobile-menu" aria-label="Menü öffnen" aria-controls="sidebar" aria-expanded="${mobileOpen}">${icon('menu')}</button><button class="button outline search-button" type="button" data-action="global-search">${icon('search',18)} Suchen <kbd>Strg + K</kbd></button><div class="header-actions">${state.settings.xpVisible ? `<a class="tag accent" href="#/stats" aria-label="${state.xp} Erfahrungspunkte">${icon('bolt',15)}${state.xp} XP</a>` : ''}<button type="button" class="icon-button" data-action="theme" aria-label="Farbschema wechseln">${icon(theme === 'dark' ? 'sun' : 'moon',19)}</button><a class="icon-button" href="#/profile" aria-label="Profil">${icon(state.profile.avatar || 'user',18)}</a></div></header><main class="app-main" id="main" tabindex="-1"></main></div></div>`;
}
function loadModule(name,css) {
  if (!modules.has(name)) {
    if (css && !document.querySelector(`[data-css="${name}"]`)) {
      const sheet = document.createElement('link');
      sheet.rel = 'stylesheet';
      sheet.href = './'+css;
      sheet.dataset.css = name;
      document.head.append(sheet);
    }
    modules.set(name,import('./'+name+'.js').catch(error=>{modules.delete(name);throw error;}));
  }
  return modules.get(name);
}
const loading = '<p class="loading" role="status">Wird geladen …</p>';
const pages = {
  dashboard:()=>dashboard(state),explore:()=>explore(state,filters),mine:()=>mine(state),
  review:()=>reviewPage(state,allHobbies(state)),
  quests:()=>questsPage(state),challenges:()=>challengesPage(state),projects:()=>projectsPage(state),
  calendar:()=>calendarPage(state,calendar),journal:()=>journalPage(state,journalQuery),
  stats:()=>statsPage(state,statFilters),profile:()=>profilePage(state),settings:()=>settingsPage(state),
  onboarding:()=>onboarding(state,onboardingStage,onboardingDraft ??= {...state.profile}),
  hobby:id=>{const hobby = hobbyFor(state,id);return hobby ? hobbyDetail(hobby,state,Object.fromEntries(Object.keys(defaultStudioHobbies).map(key=>[key,true]))) : missing();},
};
const missing = () => empty('Diese Seite gibt es hier nicht','Öffne die Übersicht oder suche ein Hobby aus.',link('Zur Übersicht','dashboard','primary'));

async function render(changed = true) {
  const token = ++revision;
  if (refreshWeeks(state)) save();
  if (typeof cleanup === 'function') cleanup();
  cleanup = undefined;
  applyTheme();
  const [page,id,sub,mode,step] = readRoute();
  if (!page) {
    app.innerHTML = landing(state);
  } else {
    app.innerHTML = shell(page);
    const main = app.querySelector('#main');
    try {
      if (Object.hasOwn(pages,page)) {
        main.innerHTML = pages[page](id);
      } else if (page === 'lesson') {
        const hobby = hobbyFor(state,id);
        const index = Number(sub)||0;
        if (hobby?.lessons[index] && !lessonUnlocked(state,hobby,index) && mode !== 'review') {
          main.innerHTML = empty('Hier geht es bald weiter','Schließe zuerst die vorherige Lektion im Lernpfad ab.',link('Zum Lernpfad','hobby/'+id,'primary','book'),'lock');
        } else cleanup = mountLesson(main,{hobby,index,mode,stepIndex:Number(step),state,save,go,notify});
      } else if (page === 'learn' || page === 'studio' || page === 'world') {
        main.innerHTML = loading;
        const world = page === 'world';
        const module = await loadModule(world ? 'world' : 'studios',world ? 'world.css' : 'studios.css');
        if (token !== revision) return;
        if (world) {
          cleanup = module.mountWorld(main,{state,save,go,notify});
        } else if (page === 'learn') main.innerHTML = learnPage(state,module.studios);
        else {
          const current = module.studios[id];
          if (!current) main.innerHTML = missing();
          else {
            main.innerHTML = pageHead('Interaktives Lernen',current.name,current.description,link('Alle Studios','learn','outline','layers'));
            const content = document.createElement('div');
            main.append(content);
            cleanup = module.mountStudio(content,id,{complete:(key,title) => completeStudio(id,key,title),notify,audio:state.settings.audio});
          }
        }
      } else main.innerHTML = missing();
    } catch (error) {
      if (token !== revision) return;
      console.error(error);
      main.innerHTML = empty('Dieser Bereich konnte nicht geladen werden','Versuche es noch einmal oder kehre zur Übersicht zurück.',action('Neu laden','retry','primary')+link('Übersicht','dashboard','outline'));
    }
  }
  if (token === revision) {
    const heading = app.querySelector('#main h1')?.textContent.trim();
    document.title = page && heading ? heading + ' · HobbyMaxing' : 'HobbyMaxing — Mach mehr aus deiner Freizeit';
  }
  if (changed && token === revision) {
    window.scrollTo({top:0,behavior:'instant'});
    app.querySelector('#main')?.focus({preventScroll:true});
  }
}

function completeStudio(studio,key,title) {
  const hobby = defaultStudioHobbies[studio] || '';
  const stableKey = String(key).slice(0,80).replace(/[^a-z0-9_-]/gi,'-');
  const scope = hobby+':studio-'+studio+'-'+stableKey;
  if (!award(state,'studio:'+scope,15,{kind:'Studio',title:String(title),hobby})) return;
  const date = new Date().toISOString();
  state.completed[scope] = date;
  state.evidence[scope] = {title:String(title),date,kind:'Interaktive Studioübung'};
  save();
  const badge = app.querySelector('.app-top [href="#/stats"]');
  if (badge) {
    badge.innerHTML = icon('bolt',15)+state.xp+' XP';
    badge.setAttribute('aria-label',state.xp+' Erfahrungspunkte');
  }
  notify(state.settings.xpVisible ? 'Studiofortschritt gespeichert · +15 XP' : 'Studiofortschritt gespeichert');
}

function saveAndRender(message) {
  save();
  closeDialog();
  render(false);
  if (message) notify(message);
}
function searchEntries() {
  const hobbyEntries = allHobbies(state).flatMap(hobby => [
    {title:hobby.name,type:'Hobby · Lernpfad',path:'hobby/'+hobby.id,detail:hobby.description},
    ...hobby.lessons.flatMap((lesson,index)=>[
      {title:lesson.title,type:hobby.name+' · Lektion',path:'lesson/'+hobby.id+'/'+index,detail:lesson.goal},
      ...lesson.steps.map(step=>({title:step.prompt,type:hobby.name+' · Übung',path:'lesson/'+hobby.id+'/'+index,detail:step.hint}))
    ])
  ]);
  return [
    ...nav.flatMap(([,items])=>items.map(([path,title])=>({title,path,type:'Seite'}))),
    ...hobbyEntries,
    ...quests.map(item=>({title:item.title,type:'Quest',path:'quests',detail:item.goal})),
    ...state.projects.map(item=>({title:item.title,type:'Projekt',path:'projects',detail:item.description})),
    ...state.challenges.map(item=>({title:item.title,type:'Challenge',path:'challenges'})),
    ...state.journal.map(item=>({title:item.title,type:'Journal',path:'journal',detail:item.body})),
    ...['Farbschema','Akzentfarbe','Daten exportieren','Daten importieren','Audio','Animationen'].map(title=>({title,type:'Einstellung',path:'settings'}))
  ];
}
function renderSearch(query = '') {
  const text = normalize(query);
  const list = searchEntries().filter(item=>!text || normalize(item.title+' '+item.type+' '+(item.detail || '')).includes(text));
  list.sort((a,b)=>Number(normalize(b.title).startsWith(text))-Number(normalize(a.title).startsWith(text)));
  const results = dialog.querySelector('#global-results');
  results.innerHTML = list.length ? list.slice(0,24).map(item=>`<a class="list-row" href="${route(item.path)}"><span><strong>${esc(item.title)}</strong><small class="muted">${esc(item.type)}</small></span>${icon('chevron',16)}</a>`).join('') : '<p class="muted">Keine Treffer gefunden.</p>';
}
function compareForm() {
  const options = allHobbies(state).map(item=>[item.id,item.name]).sort((a,b)=>a[1].localeCompare(b[1],'de'));
  openDialog('Hobbys vergleichen',`<form id="compare-form" class="form-grid">${selectMenu('Erstes Hobby','a',options,featured[0]?.id)}${selectMenu('Zweites Hobby','b',options,featured[1]?.id)}</form><div id="compare-results" class="columns" style="margin-top:1rem"></div>`);
  drawComparison();
}
function drawComparison() {
  const compare = new FormData(dialog.querySelector('#compare-form'));
  const items = ['a','b'].map(key=>hobbyFor(state,compare.get(key))).filter(Boolean);
  dialog.querySelector('#compare-results').innerHTML = items.map(item=>`<article class="surface"><h3>${esc(item.name)}</h3><p>${esc(item.description)}</p><p class="small muted">${esc(item.level)} · ca. ${item.minutes} Min. · ${item.cost ? 'ca. '+item.cost+' €' : 'kostenloser Einstieg'}</p><p class="small muted">${esc(item.materials.join(', '))}</p><div class="actions">${link('Ansehen','hobby/'+item.id,'outline compact')}</div></article>`).join('');
}
function row(collection,id) {return state[collection]?.find(item=>item.id===id);}
function deleteDialog(value) {
  const [name,id] = value.split(':');
  if (!['projects','events','journal','challenges'].includes(name)) return;
  const item = row(name,id);
  if (!item) return;
  openDialog('Eintrag löschen?',`<p>${esc(item.title)} wird aus deinen lokalen Daten entfernt.</p><div class="actions" style="margin-top:1rem">${action('Abbrechen','close-dialog','outline')}${action('Eintrag löschen','confirm-delete','danger','close',value)}</div>`);
}
function captureOnboarding() {
  const form = app.querySelector('#onboard-form');
  if (!form || !onboardingDraft) return;
  const data = new FormData(form);
  for (const [key,v] of data.entries()) {
    if (['categories','world'].includes(key)) continue;
    onboardingDraft[key] = ['minutes','budget'].includes(key) ? (v === '' ? freshState().profile[key] : Number(v)) : String(v).trim().slice(0,500);
  }
  if (onboardingStage===0) onboardingDraft.categories = data.getAll('categories');
  if (onboardingStage===2) onboardingDraft.world = data.has('world');
}
function openNewProject(id) {
  const hobby = hobbyFor(state,id);
  openDialog('Projekt anlegen',projectForm(state,{hobby:hobby?.id,title:hobby ? hobby.name+'-Projekt' : '',description:hobby?.project || ''}));
}

const actions = {
  retry:()=>render(false),
  'close-dialog':()=>closeDialog(),
  'mini-scroll':()=>{const title=document.querySelector('#mini-title');title?.setAttribute('tabindex','-1');title?.focus({preventScroll:true});document.querySelector('#mini')?.scrollIntoView({behavior:state.settings.motion ? 'smooth' : 'instant'});},
  'mini-answer':(value,button)=>{
    for (const option of app.querySelectorAll('[data-action="mini-answer"]')) option.setAttribute('aria-pressed',String(option === button));
    const panel=app.querySelector('#mini-feedback');
    panel.hidden=false;
    panel.className='feedback '+(value==='short'?'good':'wrong');
    panel.textContent=value==='short'?'Richtig. Bei einer kurzen Verschlusszeit bewegt sich das Motiv während der Aufnahme weniger.':'Eine lange Verschlusszeit zeichnet mehr von der Bewegung auf. Versuche es mit einer kürzeren Belichtung.';
  },
  theme:()=>{state.settings.theme=document.documentElement.dataset.theme==='dark'?'light':'dark';saveAndRender();},
  'mobile-menu':(_,button)=>{
    mobileOpen=!mobileOpen;
    app.querySelector('#sidebar').dataset.open=String(mobileOpen);
    button.setAttribute('aria-expanded',String(mobileOpen));
    button.setAttribute('aria-label',mobileOpen?'Menü schließen':'Menü öffnen');
  },
  'global-search':()=>{
    openDialog('HobbyMaxing durchsuchen','<label class="field">Suchbegriff<input type="search" id="global-query" placeholder="Hobbys, Lektionen, Projekte …" autofocus></label><div id="global-results" class="row-list search-results" aria-live="polite"></div>');
    renderSearch();
  },
  favorite:(id)=>{
    if (!hobbyFor(state,id)) return;
    const was = state.favorites.includes(id);
    state.favorites = was ? state.favorites.filter(item=>item!==id) : [...state.favorites,id];
    saveAndRender(was ? 'Aus Favoriten entfernt' : 'In Favoriten gespeichert');
  },
  category:(value)=>{filters.category=value;filters.sub='';render(false);},
  'clear-filters':()=>{filters=freshFilters();render(false);},
  'random-hobby':()=>{
    const pool=filteredHobbies(state,filters);
    const list=pool.length?pool:hobbies;
    go('hobby/'+list[Math.floor(Math.random()*list.length)].id);
  },
  compare:compareForm,
  'hobby-status':value=>{
    const [id,status]=value.split(':');
    if (!hobbyFor(state,id) || !['active','paused','archived'].includes(status)) return;
    state.active[id]=status;
    saveAndRender({active:'Hobby begonnen',paused:'Hobby pausiert',archived:'Hobby archiviert'}[status]);
  },
  'edit-hobby-notes':id=>{
    const hobby=hobbyFor(state,id);
    if (!hobby) return;
    const notes=state.hobbyNotes[id] ?? {};
    openDialog('Ziel und Notizen',`<form data-form="hobby-notes" class="stack"><input type="hidden" name="id" value="${esc(id)}">${field('Mein Ziel','goal',notes.goal,'text','maxlength="600"')}${area('Meine Notizen','note',notes.note,3000)}<button class="button primary" type="submit">Speichern</button></form>`);
  },
  'custom-hobby':()=>openDialog('Eigenes Hobby hinzufügen',`<form data-form="custom" class="stack">${field('Name','name','','text','maxlength="100" required')}${area('Beschreibung','description','',1000)}<div class="form-grid">${selectMenu('Kategorie','category',[['','Eigene Hobbys'],...categories.map(cat=>[cat.id,cat.name])])}${field('Material, mit Komma getrennt','materials','','text','maxlength="400"')}${field('Geschätzte Kosten in €','cost',0,'number','min="0" max="5000"')}${field('Minuten pro Einheit','minutes',20,'number','min="1" max="480"')}</div>${field('Projektidee','project','','text','maxlength="500"')}<label class="checkbox"><input type="checkbox" name="digital"> Digital übbar</label><button class="button primary" type="submit">Hobby anlegen</button></form>`),
  'onboard-back':()=>{captureOnboarding();onboardingStage=Math.max(0,onboardingStage-1);render(false);},
  'skip-onboard':()=>{state.profile.onboarded=true;onboardingStage=0;onboardingDraft=undefined;save();go('dashboard');},
  avatar:()=>openDialog('Avatar wählen',`<div class="chip-row">${[['spark','Stern'],['leaf','Blatt'],['music','Note'],['camera','Kamera'],['orbit','Planet'],['palette','Palette']].map(([id,label])=>action(label,'choose-avatar','outline',id,id)).join('')}</div>`),
  'choose-avatar':value=>{state.profile.avatar=value;saveAndRender('Avatar gespeichert');},
  export:()=>download('HobbyMaxing-Sicherung-'+localDay()+'.json',state),
  'journal-export':()=>download('HobbyMaxing-Journal-'+localDay()+'.json',state.journal),
  import:()=>openDialog('Sicherung importieren','<form class="stack" data-form="import"><p>Wähle eine HobbyMaxing-Datei im JSON-Format. Vor dem Ersetzen deiner Daten siehst du eine Vorschau.</p><label class="field">Sicherungsdatei<input type="file" name="backup" accept=".json,application/json" required></label><p class="small muted" role="status" data-form-status></p><button class="button primary" type="submit">Datei prüfen</button></form>'),
  'confirm-import':()=>{if (pendingImport) {state=pendingImport;pendingImport=undefined;onboardingDraft=undefined;saveAndRender('Sicherung importiert');}},
  reset:()=>openDialog('Alle lokalen Studio-Daten löschen?','<p>Diese Aktion entfernt dein Profil, deinen Fortschritt, deine Projekte und deine Insel aus diesem Browser.</p><div class="actions" style="margin-top:1rem">'+action('Abbrechen','close-dialog','outline')+action('Alle Studio-Daten löschen','confirm-reset','danger')+'</div>'),
  'confirm-reset':()=>{state=freshState();onboardingDraft=undefined;saveAndRender('Lokale Studio-Daten zurückgesetzt');},
  'goal-new':id=>openDialog(id?'Wochenziel bearbeiten':'Wochenziel anlegen',goalForm(row('goals',id))),
  'goal-progress':id=>{
    refreshWeeks(state);
    const goal=row('goals',id);
    if (goal && !goal.paused && goal.count<goal.target) {goal.count++;saveAndRender('Einheit gespeichert');}
  },
  'goal-restart':id=>{const goal=row('goals',id);if(goal){goal.count=0;saveAndRender('Wochenziel zurückgesetzt');}},
  'quest-done':id=>{if(finishQuest(state,id)) saveAndRender('Quest abgeschlossen');},
  'challenge-edit':id=>openDialog('Challenge bearbeiten',challengeForm(row('challenges',id) || {})),
  'challenge-template':id=>{const sample=templates.find(item=>item.id===id);if(sample) openDialog('Challenge starten',challengeForm({title:sample.title,tasks:sample.steps.map(title=>({title}))}));},
  'challenge-done':id=>{
    const item=row('challenges',id);
    if (!item || item.paused || item.done || !item.tasks.length || !item.tasks.every(t=>t.done)) return;
    item.done=true;
    award(state,'challenge:'+id,35,{title:item.title,kind:'Challenge'});
    saveAndRender('Challenge abgeschlossen');
  },
  'project-new':openNewProject,
  'project-edit':id=>{const item=row('projects',id);if(item) openDialog('Projekt bearbeiten',projectForm(state,item));},
  'project-done':id=>{const item=row('projects',id);if(item && completeProject(state,item)) saveAndRender('Projekt abgeschlossen');},
  'cal-view':value=>{calendar.view=value;render(false);},
  'cal-select':value=>{calendar.day=value;render(false);},
  'cal-shift':value=>{calendar.day=calendarShift(calendar.day,calendar.view,Number(value));render(false);},
  'cal-today':()=>{calendar.day=localDay();render(false);},
  'event-new':day=>openDialog('Termin anlegen',eventForm(state,{day:day || calendar.day})),
  'event-edit':id=>{const item=row('events',id);if(item) openDialog('Termin bearbeiten',eventForm(state,item));},
  'event-suggestion':id=>{const hobby=hobbyFor(state,id);if(hobby) openDialog('Vorschlag einplanen',eventForm(state,{title:hobby.name+' üben',hobby:id,day:calendar.day}));},
  'journal-new':()=>openDialog('Journaleintrag anlegen',journalForm(state,{day:localDay()})),
  'journal-edit':id=>{const item=row('journal',id);if(item) openDialog('Journaleintrag bearbeiten',journalForm(state,item));},
  'delete-row':deleteDialog,
  'confirm-delete':value=>{
    const [name,id]=value.split(':');
    if (!['projects','events','journal','challenges'].includes(name)) return;
    state[name]=state[name].filter(item=>item.id!==id);
    saveAndRender('Eintrag gelöscht');
  },
};

document.addEventListener('click',event=>{
  const target=event.target.closest('[data-action]');
  if (target && Object.hasOwn(actions,target.dataset.action)) {
    actions[target.dataset.action](target.dataset.value || '',target);
    return;
  }
  const href=event.target.closest('a')?.getAttribute('href');
  if (href==='#main') {event.preventDefault();app.querySelector('#main')?.focus();return;}
  if (href?.startsWith('#/')) {
    if (dialog.open) closeDialog();
    if (mobileOpen && href===location.hash) {mobileOpen=false;render(false);}
  }
});
dialog.addEventListener('click',event=>{if(event.target===dialog) closeDialog();});
document.addEventListener('keydown',event=>{
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase()==='k') {event.preventDefault();actions['global-search']();}
  if (event.key==='Escape' && !dialog.open && mobileOpen) {mobileOpen=false;render(false);app.querySelector('.mobile-menu')?.focus();}
});
window.addEventListener('hashchange',()=>{
  closeDialog();
  mobileOpen=false;
  if (readRoute()[0]!=='onboarding') {onboardingStage=0;onboardingDraft=undefined;}
  render();
});
matchMedia('(prefers-color-scheme: dark)').addEventListener('change',()=>{if(state.settings.theme==='system') applyTheme();});

function updateFilters(form) {
  const data=new FormData(form);
  for (const [key,value] of data.entries()) if(key!=='favorites') filters[key]=String(value);
  filters.favorites=data.has('favorites');
  app.querySelector('#explore-results').innerHTML=explorerResults(state,filters);
}
document.addEventListener('input',event=>{
  const element=event.target;
  if (element.id==='global-query') renderSearch(element.value);
  if (element.closest('#filters') && element.type==='search') updateFilters(element.form);
  if (element.id==='journal-search') {
    journalQuery=element.value;
    const query=normalize(journalQuery);
    const entries=state.journal.filter(item=>normalize(item.title+' '+item.body+' '+(hobbyFor(state,item.hobby)?.name || '')).includes(query)).sort((a,b)=>b.day.localeCompare(a.day));
    app.querySelector('#journal-entries').innerHTML=journalEntries(entries,state);
  }
});
document.addEventListener('change',event=>{
  const control=event.target;
  const form=control.form;
  if (form?.id==='filters') updateFilters(form);
  if (form?.id==='compare-form') drawComparison();
  if (form?.id==='stat-filters') {statFilters[control.name]=control.value;render(false);}
  if (form?.id==='settings-form') {
    state.settings[control.name]=control.type==='checkbox'?control.checked:control.value;
    applyTheme();
    save();
  }
  if (control.dataset.check) {
    const {check,id,index}=control.dataset;
    const position=Number(index);
    if (check==='quest') {
      const item=state.quest[id] ??= {checks:[],done:false};
      if (item.done) {control.checked=true;return;}
      item.checks[position]=control.checked;
      const card=control.closest('section');
      const complete=card.querySelector('[data-action="quest-done"]');
      if (complete) complete.disabled=!Array.from(card.querySelectorAll('[data-check="quest"]')).every(input=>input.checked);
      save();
      return;
    }
    const item=row(check==='project'?'projects':'challenges',id);
    if (item?.tasks[position]) {
      if (item.done || item.status==='done') {control.checked=true;return;}
      item.tasks[position].done=control.checked;
      save();
      render(false);
      app.querySelector(`[data-check="${check}"][data-id="${CSS.escape(id)}"][data-index="${position}"]`)?.focus({preventScroll:true});
    }
  }
});

const val = (form,key) => String(form.get(key) || '').trim();
const numeric = (form,key,defaultValue) => form.get(key)==='' ? defaultValue : Number(form.get(key));
function currentRow(form,name){return row(name,val(form,'id'));}
const submitForms = {
  'hobby-notes':data=>{const id=val(data,'id');if(hobbyFor(state,id)){state.hobbyNotes[id]={goal:val(data,'goal'),note:val(data,'note')};saveAndRender('Notizen gespeichert');}},
  custom:data=>{
    const id='eigen-'+uid();
    const name=val(data,'name');
    if (!name) return notify('Gib deinem Hobby einen Namen.');
    state.custom.push({id,name,description:val(data,'description'),category:val(data,'category'),materials:val(data,'materials').split(',').map(item=>item.trim()).filter(Boolean),project:val(data,'project'),digital:data.has('digital'),cost:numeric(data,'cost',0),minutes:numeric(data,'minutes',20)});
    state.active[id]='active';
    save();
    go('hobby/'+id);
    notify('Eigenes Hobby hinzugefügt');
  },
  goal:data=>{
    const old=currentRow(data,'goals');
    if (!val(data,'title')) return notify('Gib deinem Wochenziel einen Titel.');
    const target=Number(data.get('target'));
    upsert(state.goals,{id:old?.id,title:val(data,'title'),target,count:Math.min(target,old?.count || 0),week:weekKey(),paused:data.has('paused')});
    saveAndRender('Wochenziel gespeichert');
  },
  challenge:data=>{
    const old=currentRow(data,'challenges');
    if (!val(data,'title')) return notify('Gib deiner Challenge einen Titel.');
    upsert(state.challenges,{id:old?.id,title:val(data,'title'),day:val(data,'day'),tasks:taskList(data.get('tasks'),old?.tasks),paused:data.has('paused'),done:old?.done || false});
    saveAndRender('Challenge gespeichert');
  },
  project:data=>{
    const old=currentRow(data,'projects');
    if (!val(data,'title')) return notify('Gib deinem Projekt einen Titel.');
    upsert(state.projects,{id:old?.id,title:val(data,'title'),description:val(data,'description'),hobby:val(data,'hobby'),day:val(data,'day'),materials:val(data,'materials'),notes:val(data,'notes'),tasks:taskList(data.get('tasks'),old?.tasks),status:old?.status==='done'?'done':val(data,'status')});
    saveAndRender('Projekt gespeichert');
  },
  event:data=>{
    if (!val(data,'title')) return notify('Gib deinem Termin einen Titel.');
    upsert(state.events,{id:currentRow(data,'events')?.id,title:val(data,'title'),day:val(data,'day'),time:val(data,'time'),hobby:val(data,'hobby'),repeat:data.has('repeat')});
    calendar.day=val(data,'day');
    saveAndRender('Termin gespeichert');
  },
  journal:async(data,form)=>{
    const old=currentRow(data,'journal');
    if (!val(data,'title')) return notify('Gib deinem Eintrag einen Titel.');
    const image=await journalImage(data.get('image')) || (data.has('removeImage')?'':old?.image || '');
    if (!form.isConnected || !dialog.open) return;
    upsert(state.journal,{id:old?.id,title:val(data,'title'),day:val(data,'day'),hobby:val(data,'hobby'),body:val(data,'body'),image});
    saveAndRender('Journaleintrag gespeichert');
  },
  import:async(data,form)=>{
    const file=data.get('backup');
    if (!file?.size || file.size>30*1024*1024) throw new Error('Wähle eine JSON-Sicherung bis 30 MB.');
    let parsed;
    try {parsed=JSON.parse(await file.text());} catch {throw new Error('Die Datei konnte nicht als JSON gelesen werden.');}
    if (!form.isConnected || !dialog.open) return;
    pendingImport=sanitize(parsed);
    openDialog('Lokale Daten ersetzen?',`<p>Die Sicherung enthält ${Object.keys(pendingImport.completed).length} Lernabschlüsse, ${pendingImport.projects.length} Projekte und ${pendingImport.journal.length} Journaleinträge.</p><div class="actions" style="margin-top:1rem">${action('Abbrechen','close-dialog','outline')}${action('Sicherung übernehmen','confirm-import','danger','folder')}</div>`);
  }
};
document.addEventListener('submit',async event=>{
  const form=event.target;
  if (form.id==='onboard-form') {
    event.preventDefault();
    captureOnboarding();
    if (onboardingStage<2) {onboardingStage++;render(false);app.querySelector('h1')?.setAttribute('tabindex','-1');app.querySelector('h1')?.focus();}
    else {state.profile={...onboardingDraft,onboarded:true};save();go('dashboard');notify('Profil gespeichert');}
    return;
  }
  if (form.id==='filters' || form.id==='compare-form' || form.id==='settings-form' || form.id==='stat-filters') {event.preventDefault();return;}
  if (!Object.hasOwn(submitForms,form.dataset.form) || form.dataset.busy) return;
  event.preventDefault();
  form.dataset.busy='true';
  try {await submitForms[form.dataset.form](new FormData(form),form);}
  catch(error){const line=form.querySelector('[data-form-status]');if(line) line.textContent=error.message;else notify(error.message);}
  finally {delete form.dataset.busy;}
});

if (!location.hash.startsWith('#/')) history.replaceState(null,'','#/');
app.innerHTML=loading;
state=await load();
render(false);

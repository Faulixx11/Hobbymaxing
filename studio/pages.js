import {categories,hobbies} from './content.js';
import {esc,icon,route,link,action,brand,empty,pageHead,normalize,paragraphList,dateLabel,localDay} from './ui.js';

const art = {fotografie:'camera',schach:'chess',zeichnen:'drawing',klavier:'piano'};
const palette = {music:'#c8e0d2',art:'#e0d2ef',tech:'#cddde7',media:'#f2c5ad',strategy:'#efdaaa',language:'#ebc9c7',science:'#d1d2ed',craft:'#dce5b5',movement:'#f1d4bb'};
export const featured = Object.keys(art).map(id => hobbies.find(hobby => hobby.id === id)).filter(Boolean);
export const category = id => categories.find(item => item.id === id);
export const allHobbies = state => [...hobbies,...state.custom.map(item => ({...item,level:'Eigener Weg',lessons:[],skills:[],subcategory:'Eigene Hobbys',intro:item.description}))];
export const hobbyFor = (state,id) => allHobbies(state).find(hobby => hobby.id === id);
export const levelAt = xp => 1 + Math.floor(xp / 100);
export const studioFor = {schach:'chess','html-css':'code',javascript:'code',webentwicklung:'code',klavier:'music',gitarre:'music',geige:'music',ukulele:'music',rhythmustraining:'music',musiktheorie:'music',musikproduktion:'music',zeichnen:'drawing',aquarellmalerei:'drawing',fotografie:'camera',sudoku:'sudoku',grafikdesign:'design','ui-ux-design':'design',videoschnitt:'timeline',astronomie:'astronomy',geografie:'geography',englisch:'languages',franzoesisch:'languages',spanisch:'languages',italienisch:'languages',kochen:'cook','pixel-art':'pixel',logikraetsel:'logic'};

export function cardArt(hobby, large = false) {
  const cat = category(hobby.category);
  const photo = art[hobby.id];
  return `<div class="card-art" style="--card-color:${palette[hobby.category] ?? '#dbe7d5'}">${photo ? `<img alt="" src="./assets/${photo}.jpg" width="560" height="353" ${large ? '' : 'loading="lazy"'}>` : icon(cat?.icon || 'spark',large ? 74 : 49)}</div>`;
}
export function hobbyCard(hobby, state, interactive = true) {
  const liked = state.favorites.includes(hobby.id);
  return `<article class="hobby-card">${interactive ? `<button class="icon-button card-favorite" type="button" aria-label="${liked ? 'Aus Favoriten entfernen' : 'Als Favorit speichern'}: ${esc(hobby.name)}" aria-pressed="${liked}" data-action="favorite" data-value="${esc(hobby.id)}">${icon('heart',16)}</button>` : ''}
    <a href="${route('hobby/'+hobby.id)}" aria-label="${esc(hobby.name)} ansehen">${cardArt(hobby)}</a><div class="card-body"><span class="subtle">${esc(category(hobby.category)?.name || 'Eigenes Hobby')}</span><h3><a href="${route('hobby/'+hobby.id)}">${esc(hobby.name)}</a></h3><p>${esc(hobby.description)}</p><div class="meta-row"><span>${icon('clock',14)} ca. ${hobby.minutes || 15} Min.</span><span>${icon('layers',14)} ${esc(hobby.level || 'Einstieg')}</span></div></div></article>`;
}
const cardGrid = (list,state,interactive = true) => `<div class="card-grid">${list.map(hobby => hobbyCard(hobby,state,interactive)).join('')}</div>`;

const faqs = [
  ['Brauche ich Vorkenntnisse?','Du kannst mit den Einstiegslektionen beginnen. Viele Hobbys bieten außerdem eine kurze Einstufung an.'],
  ['Muss ich etwas kaufen?','Die Website ist kostenlos. Viele Übungen funktionieren direkt im Browser. Material und unverbindliche Kosten stehen beim jeweiligen Hobby.'],
  ['Wo wird mein Fortschritt gespeichert?','Dein Profil, Journal und Fortschritt bleiben in diesem Browser. In den Einstellungen kannst du deine Daten als Datei sichern und in einem anderen Browser einlesen.'],
  ['Muss ich HobbyWorld spielen?','HobbyWorld ist freiwillig. Alle Hobbys und Übungen sind direkt in der Bibliothek erreichbar.'],
  ['Wie weit sind die Lernpfade?','Alle 80 Kataloghobbys haben einen interaktiven Einstieg. Der jeweilige Lernpfad zeigt dir, welche Vertiefungen bereits verfügbar sind.']
];
export function landing(state) {
  return `<header class="site-header"><div class="container header-inner">${brand()}<nav class="site-links" aria-label="Navigation"><a href="#/explore">Hobbys</a><a href="#/learn">Lernen</a><a href="#/world">HobbyWorld</a></nav><div class="header-actions"><button type="button" class="icon-button" data-action="theme" aria-label="Farbschema wechseln">${icon(state.settings.theme === 'dark' ? 'sun' : 'moon',19)}</button>${link(state.profile.onboarded ? 'Meine Übersicht' : 'Kostenlos starten',state.profile.onboarded ? 'dashboard' : 'onboarding','primary')}</div></div></header>
    <main id="main" tabindex="-1"><section class="container hero"><div class="hero-copy"><span class="eyebrow">${icon('spark',15)} Die Plattform für neugierige Menschen</span><h1>Mehr Hobby.<em>Mehr du.</em></h1><p>Finde heraus, was dir Spaß macht. Lerne im eigenen Tempo, probiere Dinge direkt aus und mach aus Neugier echte Fähigkeiten.</p><div class="actions">${link('Hobbys entdecken','explore','primary','compass')}${action('Mini-Lektion testen','mini-scroll','outline','play')}</div></div><div class="hero-visual"><img alt="Analoge Kamera, hölzernes Schachbrett und gefalteter Papiervogel auf einer dunkelgrünen Fläche" src="./assets/hero.jpg" width="850" height="1062" fetchpriority="high"><a href="#/world" class="hero-caption">${icon('spark',15)} Deine HobbyWorld</a></div></section>
    <div class="container value-strip"><div>${icon('compass',21)} 80 Hobbys entdecken</div><div>${icon('activity',21)} Interaktiv üben</div><div>${icon('game',21)} Eigene Welt gestalten</div></div>
    <section class="container section featured-section"><div class="section-head"><div><span class="eyebrow">Entdecken</span><h2>Worauf hast du Lust?</h2><p>Such dir etwas aus und probiere es gleich aus.</p></div><div class="actions">${link('Alle Hobbys','explore','outline','compass')}</div></div>${cardGrid(featured,state,false)}</section>
    <section id="mini" class="container section split-feature" aria-labelledby="mini-title"><div><span class="eyebrow">${icon('play',15)} Interaktive Mini-Lektion</span><h2 id="mini-title">Licht festhalten.</h2><p>Eine Kamera sammelt Licht, solange der Verschluss offen ist. Je länger er offen bleibt, desto weiter kann sich ein Motiv im Bild bewegen.</p>${link('Zum Kamera-Simulator','studio/camera','outline','camera')}</div><div><div class="mini-box"><div class="tag">Fotografie · 1 Minute</div><h3>Wie frierst du einen Sprung im Bild ein?</h3><button type="button" class="choice" data-action="mini-answer" data-value="long" aria-pressed="false">Mit einer langen Verschlusszeit</button><button type="button" class="choice" data-action="mini-answer" data-value="short" aria-pressed="false">Mit einer kurzen Verschlusszeit</button><div class="feedback" id="mini-feedback" role="status" hidden></div></div></div></section>
    <section class="container section"><div class="section-head"><div><span class="eyebrow">Lernen, gestalten, weitermachen</span><h2>Deine Freizeit, dein Projekt.</h2></div></div><div class="form-grid"><article class="surface"><span class="round-icon">${icon('book')}</span><h3>Ein Lernpfad für deinen Einstieg</h3><p>Zum Beispiel Zeichnen. Erkenne Grundformen, überprüfe deine Beobachtung und setze sie bei einer eigenen Skizze um.</p><div class="actions">${link('Lernpfad ansehen','hobby/zeichnen','outline')}</div></article><article class="surface"><span class="round-icon">${icon('game')}</span><h3>Eine Welt, die mit dir wächst</h3><p>Erkunde deine Insel, stelle Gegenstände auf und schalte Werkstätten durch Übungen frei.</p><div class="actions">${link('HobbyWorld öffnen','world','outline')}</div></article></div></section>
    <section class="container section landing-faq"><div class="section-head"><div><h2>Häufige Fragen</h2></div></div><div class="faq-list">${faqs.map(([q,a])=>`<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</div><div class="actions" style="margin-top:1.2rem">${link('Jetzt loslegen','onboarding','primary','spark')}</div></section></main>
    <footer class="site-footer"><div class="container footer-inner">${brand()}<span>Interaktiv lernen und eigene Projekte umsetzen.</span><a href="../">Bisherige Beta</a><a href="#/settings">Datenschutz &amp; Einstellungen</a><a href="https://github.com/Faulixx11/Hobbymaxing">GitHub</a></div></footer>`;
}

export function recommendations(state) {
  const user = state.profile;
  const categoriesSeen = Object.keys(state.active).filter(id => state.active[id] === 'active').map(id => hobbyFor(state,id)?.category);
  const query = normalize([user.desired,user.goal].filter(Boolean).join(' ')).split(/\s+/).filter(word => word.length > 3);
  return hobbies.map(hobby => {
    const why = [];
    let score = 0;
    if (user.categories.includes(hobby.category)) {score += 6; why.push('Ein Bereich, den du magst');}
    if (query.some(word => normalize(hobby.name+' '+hobby.description).includes(word))) {score += 6; why.push('Passt zu deinem Ziel');}
    if (state.favorites.includes(hobby.id)) {score += 5; why.push('In deinen Favoriten');}
    if (hobby.minutes <= user.minutes) {score += 2; why.push('Passt in deine Lernzeit');}
    if (hobby.cost <= user.budget) score += 1;
    if (normalize(hobby.level) === normalize(user.level)) score += 1;
    if (categoriesSeen.includes(hobby.category)) score += 1;
    if (user.materials && hobby.materials.some(x => normalize(user.materials).includes(normalize(x)))) {score += 2; why.push('Passendes Material vorhanden');}
    if (state.completed[hobby.id+':0'] || state.active[hobby.id] === 'archived') score -= 8;
    if (featured.includes(hobby)) score += .1;
    return {...hobby,score,why};
  }).sort((a,b) => b.score-a.score || a.name.localeCompare(b.name,'de'));
}

const selected = (option,current) => option === String(current) ? ' selected' : '';
export function selectMenu(label,name,choices,current = '') {
  return `<label class="field">${esc(label)}<select name="${name}" aria-label="${esc(label)}">${choices.map(item => { const [value,text] = Array.isArray(item) ? item : [item,item]; return `<option value="${esc(value)}"${selected(value,current)}>${esc(text)}</option>`; }).join('')}</select></label>`;
}
export function field(label,name,value = '',type = 'text',extra = '') {
  return `<label class="field">${esc(label)}<input name="${name}" type="${type}" value="${esc(value)}" ${extra}></label>`;
}
export function area(label,name,value = '',length = 4000) {
  return `<label class="field">${esc(label)}<textarea name="${name}" maxlength="${length}">${esc(value)}</textarea></label>`;
}
export const hobbyOptions = state => [['','Ohne Hobby'],...allHobbies(state).map(x => [x.id,x.name])];

export function filteredHobbies(state,filter) {
  const q = normalize(filter.q);
  const material = normalize(filter.material);
  return allHobbies(state).filter(hobby => {
    return (!q || normalize([hobby.name,hobby.description,hobby.subcategory,category(hobby.category)?.name].join(' ')).includes(q))
      && (!filter.category || hobby.category === filter.category)
      && (!filter.sub || hobby.subcategory === filter.sub)
      && (!filter.level || hobby.level === filter.level)
      && (!filter.cost || hobby.cost <= Number(filter.cost))
      && (!filter.minutes || hobby.minutes <= Number(filter.minutes))
      && (!material || normalize(hobby.materials.join(' ')).includes(material))
      && (!filter.type || hobby.digital === (filter.type === 'digital'))
      && (!filter.favorites || state.favorites.includes(hobby.id));
  });
}
export function explorerResults(state,filter) {
  const found = filteredHobbies(state,filter);
  return `<div class="result-bar"><strong>${found.length} ${found.length === 1 ? 'Hobby' : 'Hobbys'}</strong><span>Kosten und Zeit sind Schätzungen</span></div>${found.length ? cardGrid(found,state) : empty('Keine passenden Hobbys','Ändere deine Suchbegriffe oder entferne einen Filter.',action('Filter zurücksetzen','clear-filters','outline'))}`;
}
export function explore(state,filter) {
  const subs = [...new Set(hobbies.filter(x => !filter.category || x.category === filter.category).map(x => x.subcategory))].sort((a,b) => a.localeCompare(b,'de'));
  return pageHead('Bibliothek','Entdecken','Finde etwas, das zu deinen Interessen, deiner Zeit und deinem Material passt.',action('Überrasch mich','random-hobby','outline','shuffle')+action('Vergleichen','compare','outline','compare'))+
    `<div class="surface explorer-filters"><div class="chip-row" aria-label="Kategorien">${[{id:'',name:'Alle Hobbys'},...categories].map(cat=>`<button type="button" class="chip" aria-pressed="${filter.category === cat.id}" data-action="category" data-value="${cat.id}">${cat.icon ? icon(cat.icon,15) : ''}${esc(cat.name)}</button>`).join('')}</div><form id="filters" class="stack"><div class="filter-fields">
    <div class="wide">${field('Hobby suchen','q',filter.q,'search','placeholder="z. B. Fotografie"')}</div>${selectMenu('Unterkategorie','sub',[['','Alle'],...subs],filter.sub)}${selectMenu('Niveau','level',[['','Alle'],...new Set(hobbies.map(x => x.level))],filter.level)}${selectMenu('Kosten','cost',[['','Alle'],['0','Kostenlos'],['25','Bis 25 €'],['100','Bis 100 €']],filter.cost)}${selectMenu('Lernzeit','minutes',[['','Alle'],['10','Bis 10 Min.'],['20','Bis 20 Min.'],['45','Bis 45 Min.']],filter.minutes)}</div>
    <details ${filter.type || filter.material || filter.favorites ? 'open' : ''}><summary>Weitere Filter</summary><div class="filter-fields" style="margin-top:.65rem">${selectMenu('Lernort','type',[['','Alle'],['digital','Digital'],['practice','Praktisch']],filter.type)}${field('Material','material',filter.material,'search','placeholder="z. B. Papier"')}<label class="checkbox"><input name="favorites" type="checkbox" ${filter.favorites ? 'checked' : ''}> Nur Favoriten</label></div></details></form></div><section id="explore-results" aria-live="polite">${explorerResults(state,filter)}</section>`;
}
export const lessonUnlocked = (state,hobby,index) => index === 0 || Boolean(state.completed[hobby.id+':'+index]) || Boolean(state.completed[hobby.id+':'+(index-1)]) || (index === 1 && Boolean(state.placements[hobby.id]));

export function hobbyDetail(hobby,state,studios) {
  const status = state.active[hobby.id];
  const favorite = state.favorites.includes(hobby.id);
  const studio = studioFor[hobby.id];
  const minutes = hobby.minutes || 15;
  const notes = state.hobbyNotes[hobby.id];
  const path = hobby.lessons || [];
  const done = path.filter((_,index) => state.completed[hobby.id+':'+index]).length;
  const next = path.findIndex((_,index) => !state.completed[hobby.id+':'+index] && !(index === 0 && state.placements[hobby.id]));
  const tags = [hobby.level,'Ca. '+minutes+' Min. pro Einstieg',hobby.digital ? 'Digital übbar' : 'Praktische Übungen',hobby.cost ? 'Ca. '+hobby.cost+' € Einstieg' : 'Kostenloser Einstieg'];
  return `<div class="stack"><section class="detail-hero">${pageHead(category(hobby.category)?.name || 'Eigenes Hobby',hobby.name,hobby.intro || hobby.description,(path.length ? link(next === -1 ? 'Einstieg wiederholen' : 'Lektion starten','lesson/'+hobby.id+'/'+Math.max(0,next),'primary','play') : '')+(studios?.[studio] ? link('Studio öffnen','studio/'+studio,'outline','layers') : '')+action(favorite ? 'Gespeichert' : 'Favorisieren','favorite','outline','heart',hobby.id))}${cardArt(hobby,true)}</section>
    <div class="tags">${tags.map(tag=>`<span class="tag">${esc(tag)}</span>`).join('')}</div><div class="columns"><section class="surface"><h2>Lernpfad</h2><p class="muted">${path.length ? `${done} von ${path.length} veröffentlichten Lektionen abgeschlossen.` : 'Für dein eigenes Hobby kannst du ein Ziel setzen, Notizen sammeln und Projekte planen.'}</p>
    ${path.length ? `<div class="path-list" style="margin-top:.75rem">${path.map((lesson,index) => {
      const key = hobby.id+':'+index;
      const complete = state.completed[key];
      const waived = index === 0 && state.placements[hobby.id];
      const unlocked = lessonUnlocked(state,hobby,index);
      return `<div class="path-node"><span class="round-icon">${icon(complete || waived ? 'check' : unlocked ? 'book' : 'lock',18)}</span><div><strong>${esc(lesson.title)}</strong><p class="small muted">${complete ? 'Abgeschlossen' : waived ? 'Durch Einstufung freigegeben' : esc(lesson.goal)}</p></div>${unlocked ? link(complete || waived ? 'Wiederholen' : 'Öffnen','lesson/'+hobby.id+'/'+index,'compact outline') : '<span class="tag">Nach der vorherigen Lektion</span>'}</div>`; }).join('')}
    <div class="path-node"><span class="round-icon">${icon('lock',18)}</span><div><strong>Grundlagen bis Vertiefung</strong><p class="small muted">Weitere Module sind in Entwicklung.</p></div></div>
    ${path[0].steps.filter(step => step.type !== 'reflect').length >= 2 && !state.completed[hobby.id+':0'] && !state.placements[hobby.id] ? link('Optionaler Einstufungstest','lesson/'+hobby.id+'/0/placement','outline','flag') : ''}</div>` : ''}</section>
    <section class="surface"><h2>So kannst du anfangen</h2><h3>Material</h3>${paragraphList(hobby.materials)}${!hobby.materials?.length ? '<p class="muted">Du kannst Material in deinen Notizen ergänzen.</p>' : ''}${hobby.skills?.length ? `<h3>Kompetenzen</h3>${paragraphList(hobby.skills)}` : ''}${hobby.pitfall ? `<h3>Typischer Anfängerfehler</h3><p>${esc(hobby.pitfall)}</p>` : ''}<p class="small muted">Kosten und Lernzeiten sind unverbindliche Schätzungen.</p></section></div>
    <div class="columns"><section class="surface"><h2>Dein Hobby</h2><p>${status === 'active' ? 'Aktiv' : status === 'paused' ? 'Pausiert' : status === 'archived' ? 'Archiviert' : 'Noch nicht aktiv'}</p><div class="actions">${status !== 'active' ? action(status ? 'Fortsetzen' : 'Hobby beginnen','hobby-status','primary','play',hobby.id+':active') : action('Pausieren','hobby-status','outline','clock',hobby.id+':paused')}${status && status !== 'archived' ? action('Archivieren','hobby-status','outline','bookmark',hobby.id+':archived') : ''}</div>${notes?.goal ? `<p><strong>Ziel</strong> · ${esc(notes.goal)}</p>` : ''}${notes?.note ? `<p><strong>Notiz</strong> · ${esc(notes.note)}</p>` : ''}<div class="actions">${action('Ziel & Notizen bearbeiten','edit-hobby-notes','outline','pen',hobby.id)}</div></section>
    <section class="surface"><h2>Projektidee</h2><p>${esc(hobby.project || 'Lege ein Projekt an und teile die Idee in kleine, überprüfbare Schritte auf.')}</p><div class="actions">${action('Als Projekt planen','project-new','outline','folder',hobby.id)}</div></section></div></div>`;
}

export function mine(state) {
  const list = allHobbies(state);
  const groups = [['active','Aktiv'],['paused','Pausiert'],['archived','Archiviert']];
  const favorites = list.filter(item => state.favorites.includes(item.id));
  return pageHead('Deine Sammlung','Meine Hobbys','Verwalte deine Lernvorhaben, eigenen Hobbys und Favoriten.',action('Eigenes Hobby','custom-hobby','primary','plus'))+
    `<div class="stack">${groups.map(([id,title]) => {const items = list.filter(item=>state.active[item.id]===id);return items.length ? `<section><h2 style="margin-bottom:.55rem">${title}</h2>${cardGrid(items,state)}</section>` : '';}).join('')}${favorites.length ? `<section><h2 style="margin-bottom:.55rem">Favoriten</h2>${cardGrid(favorites,state)}</section>` : ''}${!favorites.length && !Object.keys(state.active).length ? empty('Ein guter Tag für etwas Neues','Starte ein Hobby oder speichere Ideen für später.',link('Hobbys entdecken','explore','primary'),'bookmark') : ''}</div>`;
}

export function dashboard(state) {
  const next = allHobbies(state).filter(hobby => state.active[hobby.id] === 'active').map(hobby => ({hobby,index:hobby.lessons.findIndex((_,i) => !state.completed[hobby.id+':'+i] && !(i === 0 && state.placements[hobby.id]))})).find(item => item.index !== -1);
  const picks = recommendations(state).slice(0,4);
  const due = Object.values(state.skills).filter(skill => skill.next && +new Date(skill.next) <= Date.now()).length;
  const nextHobby = next?.hobby ?? picks[0];
  const last = state.activity.at(-1);
  return pageHead('Dein Lernbereich',state.profile.name ? 'Hallo, '+state.profile.name+'!' : 'Deine Übersicht','Ein Ort für deine Hobbys, Fortschritte und Ideen.',link('Planen','calendar','outline','calendar'))+
  `<section class="dash-banner"><div><span class="eyebrow">${next ? 'Nächste Lektion' : 'Heute ausprobieren'}</span><h2>${esc(next ? next.hobby.lessons[next.index].title : nextHobby?.name || 'Finde dein nächstes Hobby')}</h2><p>${esc(next ? next.hobby.lessons[next.index].goal : nextHobby?.description || 'Entdecke einen passenden Einstieg.')}</p><div class="actions">${next ? link('Weiterlernen','lesson/'+next.hobby.id+'/'+next.index,'primary','play') : link('Einstieg ansehen',nextHobby ? 'hobby/'+nextHobby.id : 'explore','primary','play')}${!state.profile.onboarded ? link('Profil einrichten','onboarding','outline','user') : ''}</div></div><div class="dash-mark">${icon('spark',130)}</div></section>
  <div class="tiles"><div class="tile"><span>Abgeschlossene Lektionen</span><strong>${Object.entries(state.completed).filter(([id,date])=>date && /:\d+$/.test(id)).length}</strong></div><a class="tile" href="#/review"><span>Fällige Wiederholungen</span><strong>${due}</strong></a><a class="tile" href="#/stats"><span>${state.settings.xpVisible ? 'Level' : 'Aktive Hobbys'}</span><strong>${state.settings.xpVisible ? levelAt(state.xp) : Object.values(state.active).filter(v=>v==='active').length}</strong></a></div>
  <div class="columns"><section class="surface"><h2>Diese Woche</h2>${state.goals.some(g => !g.paused) ? paragraphList(state.goals.filter(g => !g.paused).map(g => g.title+' · '+g.count+'/'+g.target)) : '<p class="muted">Setze dir ein kleines Ziel, das zu deiner Woche passt.</p>'}<div class="actions">${link('Wochenziele & Quests','quests','outline','flag')}</div></section><section class="surface"><h2>${last ? 'Zuletzt gemacht' : 'Eigene Projekte'}</h2><p>${esc(last?.title || 'Mach aus einer Idee ein Projekt und plane den nächsten Arbeitsschritt.')}</p><div class="actions">${link('Meine Projekte','projects','outline','folder')}${state.profile.world ? link('HobbyWorld','world','outline','game') : ''}</div></section></div>
  <section class="section"><div class="section-head"><div><h2>Für dich ausgewählt</h2><p>${esc(picks[0]?.why[0] || 'Kurze Einstiege aus dem Katalog.')}</p></div></div>${cardGrid(picks,state)}</section>`;
}

export function learnPage(state,studios) {
  return pageHead('Üben und ausprobieren','Lernen','Starte eine Lektion mit direkter Rückmeldung oder arbeite in einem interaktiven Studio.',link('Hobbys durchsuchen','explore','outline','compass'))+
    `<div class="stack"><div class="columns">${Object.entries(studios).map(([id,studio])=>`<article class="surface"><span class="round-icon">${icon(({chess:'brain',code:'code',music:'music',drawing:'palette',camera:'camera',astronomy:'orbit',geography:'globe'})[id] || 'spark')}</span><h3>${esc(studio.name)}</h3><p class="muted">${esc(studio.description)}</p><div class="actions">${link('Studio öffnen','studio/'+id,'outline','play')}</div></article>`).join('')}</div><h2>Beliebte Einstiege</h2>${cardGrid(featured,state)}</div>`;
}

export function onboarding(state,stage,draft) {
  const headings = ['Was interessiert dich?','Was passt in deinen Alltag?','Woran möchtest du arbeiten?'];
  const content = [
    `<div class="chip-row">${categories.map(cat=>`<label class="choice"><input type="checkbox" name="categories" value="${cat.id}" ${draft.categories.includes(cat.id) ? 'checked' : ''}>${esc(cat.name)}</label>`).join('')}</div>${field('Bisherige Hobbys','existing',draft.existing)}${field('Was möchtest du lernen?','desired',draft.desired)}`,
    `<div class="form-grid">${selectMenu('Erfahrung','level',['Einstieg','Grundlagen','Fortgeschritten'],draft.level)}${field('Zeit je Lerneinheit in Minuten','minutes',draft.minutes,'number','min="5" max="180"')}${selectMenu('Lernmethode','method',['Ausprobieren','Lesen und anwenden','Praktische Projekte','Kurze Wiederholungen'],draft.method)}${field('Ungefähres Budget in €','budget',draft.budget,'number','min="0" max="5000"')}${field('Vorhandenes Material','materials',draft.materials)}</div>`,
    `${field('Dein Name oder Spitzname','name',draft.name,'text','maxlength="55"')}${area('Dein persönliches Ziel','goal',draft.goal,500)}<label class="checkbox"><input type="checkbox" name="world" ${draft.world ? 'checked' : ''}> HobbyWorld in meiner Übersicht zeigen</label>`
  ];
  return `<div class="lesson">${pageHead('Dein Profil · Schritt '+(stage+1)+' von 3',headings[stage],'Die Angaben sind freiwillig und du kannst sie später im Profil ändern.')}<div class="progress" aria-hidden="true"><span style="width:${(stage+1)/3*100}%"></span></div><form id="onboard-form" class="surface stack" style="margin-top:.8rem">${content[stage]}<div class="actions">${stage > 0 ? action('Zurück','onboard-back','outline') : ''}<button type="submit" class="button primary">${stage === 2 ? 'Profil speichern' : 'Weiter'}</button>${action('Überspringen','skip-onboard','ghost')}</div></form></div>`;
}

export function profilePage(state) {
  const user = state.profile;
  const evidence = Object.values(state.evidence).filter(x=>x.title).sort((a,b)=>(b.date || '').localeCompare(a.date || '')).slice(0,12);
  return pageHead('Persönlich','Mein Profil','Interessen und nachgewiesene Fähigkeiten bleiben in deinem Browser.',link('Profil bearbeiten','onboarding','primary','pen'))+
  `<div class="columns"><section class="surface stack"><span class="round-icon">${icon(user.avatar)}</span><h2>${esc(user.name || 'Neugieriges Profil')}</h2><p>${esc(user.goal || 'Du kannst ein persönliches Ziel hinzufügen.')}</p><p class="muted">${esc(user.method)} · ${user.minutes} Min. pro Einheit</p><div class="tags">${user.categories.map(id => category(id)).filter(Boolean).map(cat => `<span class="tag">${esc(cat.name)}</span>`).join('')}</div>${action('Avatar auswählen','avatar','outline','user')}</section><section class="surface"><h2>Kompetenzprofil</h2>${evidence.length ? `<div class="row-list">${evidence.map(item=>`<div class="list-row"><div><strong>${esc(item.title)}</strong><span class="small muted">${esc(item.kind)} · ${esc(dateLabel(item.date))}</span></div></div>`).join('')}</div>` : '<p class="muted">Bearbeitete Übungen, Einstufungen und Projekte erscheinen hier mit ihrer Nachweisart.</p>'}</section></div>`;
}

export function settingsPage(state) {
  const settings = state.settings;
  const select = (label,name,list) => selectMenu(label,name,list,settings[name]);
  return pageHead('Persönlich','Einstellungen','Passe Darstellung und Bedienung an und verwalte deine lokalen Daten.')+
    `<div class="columns"><form id="settings-form" class="surface stack"><h2>Darstellung und Lernen</h2>${select('Farbschema','theme',[['light','Hell'],['dark','Dunkel'],['system','System']])}${select('Akzentfarbe','accent',[['green','Limette'],['lilac','Flieder'],['peach','Pfirsich']])}${select('Sprache','language',[['de','Deutsch']])}
    ${[['motion','Animationen zulassen'],['audio','Studio-Audio zulassen'],['xpVisible','XP und Level anzeigen'],['largeText','Größere Schrift verwenden']].map(([key,title])=>`<label class="checkbox"><input name="${key}" type="checkbox" ${settings[key] ? 'checked' : ''}> ${title}</label>`).join('')}</form>
    <section class="surface stack"><h2>Datenschutz und Sicherung</h2><p>Profil, Journal und Lernfortschritt werden auf diesem Gerät gespeichert. HobbyMaxing verwendet keine Anmeldung und keine Tracker.</p><div class="actions">${action('Daten exportieren','export','outline','folder')}${action('Sicherung importieren','import','outline','folder')}${action('Daten zurücksetzen','reset','danger','repeat')}</div><p class="small muted">Die Sicherungsdatei enthält auch persönliche Notizen und Bilder. Du entscheidest, wo du sie aufbewahrst.</p></section></div>`;
}

export function statsPage(state,filter) {
  const history = state.activity.filter(item => {
    if (filter.hobby && item.hobby !== filter.hobby) return false;
    if (filter.kind && item.kind !== filter.kind) return false;
    if (filter.period && +new Date(item.date) < Date.now()-Number(filter.period)*86400000) return false;
    return true;
  });
  const graph = Array.from({length:7},(_,index)=> {
    const date = new Date();
    date.setDate(date.getDate()-6+index);
    return {label:new Intl.DateTimeFormat('de-DE',{weekday:'short'}).format(date),count:history.filter(item => localDay(new Date(item.date)) === localDay(date)).length};
  });
  const peak = Math.max(1,...graph.map(item=>item.count));
  const minutes = history.reduce((sum,item) => sum+item.minutes,0);
  const badges = [
    [state.activity.some(x=>x.kind==='Lektion'),'Erste Schritte','Schließe eine Lektion ab.'],
    [Object.keys(state.evidence).filter(id=>!id.startsWith('placement:')).length >= 5,'Entdeckergeist','Dokumentiere fünf Kompetenzen.'],
    [state.projects.some(x=>x.status==='done'),'Projektwerkstatt','Schließe ein Projekt ab.'],
    [state.activity.filter(x=>x.kind==='Wiederholung').length>=3,'Drangeblieben','Wiederhole drei Übungen.']
  ];
  return pageHead('Fortschritt','Statistiken','Deine Zahlen entstehen aus Übungen und Aktivitäten, die du hier tatsächlich gespeichert hast.')+
    `<div class="stack"><form id="stat-filters" class="surface filter-fields">${selectMenu('Zeitraum','period',[['','Gesamt'],['7','7 Tage'],['30','30 Tage'],['90','90 Tage']],filter.period)}${selectMenu('Hobby','hobby',[['','Alle Hobbys'],...allHobbies(state).map(h=>[h.id,h.name])],filter.hobby)}${selectMenu('Aktivität','kind',[['','Alle Aktivitäten'],...new Set(state.activity.map(x=>x.kind))],filter.kind)}</form><div class="tiles"><div class="tile"><span>Aktivitäten</span><strong>${history.length}</strong></div><div class="tile"><span>Lernminuten</span><strong>${minutes}</strong></div><div class="tile"><span>${state.settings.xpVisible ? 'XP im Zeitraum' : 'Wiederholungen'}</span><strong>${state.settings.xpVisible ? history.reduce((s,x)=>s+x.xp,0) : history.filter(x=>x.kind==='Wiederholung').length}</strong></div></div>
    <div class="columns"><section class="surface"><h2>Letzte sieben Tage</h2><div class="chart">${graph.map(item=>`<div class="chart-day" aria-label="${esc(item.label)}, ${item.count} Aktivitäten"><div class="chart-bar" style="height:${Math.max(3,Math.round(item.count/peak*100))}%">${item.count || ''}</div><span>${esc(item.label)}</span></div>`).join('')}</div></section>
    <section class="surface"><h2>Abzeichen</h2><div class="row-list">${badges.map(([won,title,text])=>`<div class="list-row"><div><strong>${icon(won ? 'trophy' : 'lock',17)} ${title}</strong><span class="muted small">${text}</span></div><span class="tag ${won ? 'accent' : ''}">${won ? 'Erreicht' : 'Offen'}</span></div>`).join('')}</div></section></div>
    <section class="surface"><h2>Aktivitätsverlauf</h2>${history.length ? `<div class="row-list">${history.slice(-30).reverse().map(item=>`<div class="list-row"><div><strong>${esc(item.title)}</strong><span class="muted small">${esc(item.kind)}</span></div><span class="muted small">${esc(dateLabel(item.date))}</span></div>`).join('')}</div>` : '<p class="muted">Für diesen Zeitraum gibt es noch keine gespeicherten Aktivitäten.</p>'}</section></div>`;
}

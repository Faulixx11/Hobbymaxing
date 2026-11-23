import { blocks, experiments, runBlocks } from './learning.mjs';
import { languages } from './play.mjs';
import { localDate, validDay } from './state.mjs?v=06';

export const practiceStudios = {
  scratch:{ title:'Scratch-Testwerkstatt', description:'Finde mit sichtbaren Testfällen heraus, ob ein Spiel beim Neustart wieder von vorne beginnt.' },
  zeichnen:{ title:'Kompositionsstudio', description:'Baue ein Stillleben aus Formen. Prüfe Überlappung und unterscheide Vordergrund und Hintergrund.' },
  beats:{ title:'Rhythmusstudio', description:'Höre vier Schläge zur Orientierung und tippe wiederholbar mit. Vergleiche deine Abstände mit dem eingestellten Tempo.' },
  schach:{ title:'Schachtaktik', description:'Ziehe eine Figur in kleinen Stellungen und lasse dir das jeweilige Motiv erklären.' },
  kochen:{ title:'Kochplaner', description:'Rechne ein Nudelgericht auf deine Portionen um und plane Sauce und Nudeln auf denselben Servierzeitpunkt.' },
  fotografie:{ title:'Foto-Komposition', description:'Vergleiche Mitte und Drittelraster direkt am Beispielmotiv oder mit einer eigenen Datei.' },
  laufen:{ title:'Lauf- und Krafttagebuch', description:'Halte Minuten und dein Belastungsgefühl pro Einheit im privaten Verlauf fest.' },
  sprachen:{ title:'Hör- und Sprachvergleich', description:'Spiele eine Gerätestimme ab und höre deine eigene Aufnahme direkt danach an.' }
};

const encode = value => String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const button = (name, text) => `<button class="button secondary" type="button" data-practice="${name}">${text}</button>`;
const options = (rows, selected) => rows.map(([id,name])=>`<option value="${encode(id)}"${id===selected?' selected':''}>${encode(name)}</option>`).join('');
const number = (value,min,max) => {
  if(typeof value!=='number' && (typeof value!=='string' || !/^\d+$/.test(value))) return null;
  const result=Number(value);
  return Number.isInteger(result) && result>=min && result<=max ? result : null;
};
const shapes = [['ellipse','Oval'],['rect','Rechteck'],['triangle','Dreieck']];
const colors = [['amber','Ocker'],['violet','Violett'],['teal','Türkis'],['cream','Creme']];
const colorValues = {amber:'#d69035',violet:'#675ab5',teal:'#279587',cream:'#fff3cd'};
const workoutTypes = [['lauf','Laufen'],['kraft','Krafttraining']];
const efforts = [['1','Locker'],['2','Mittel'],['3','Anstrengend']];

function shapeDraft(row) {
  if(!row || !shapes.some(([id])=>id===row.shape) || !Object.hasOwn(colorValues,row.color)) return null;
  const x=number(row.x,0,8),y=number(row.y,0,8),size=number(row.size,1,10);
  return x===null || y===null || size===null || x+size>10 || y+size>10 ? null : {shape:row.shape,color:row.color,x,y,size};
}

function workoutDraft(row) {
  if(!row || typeof row.day!=='string' || !validDay(row.day) || !workoutTypes.some(([id])=>id===row.type)) return null;
  const minutes=number(row.minutes,1,600);
  const effort=row.effort==='' || row.effort==null?'':String(row.effort);
  if(minutes===null || effort && !efforts.some(([id])=>id===effort)) return null;
  return {day:row.day,type:row.type,minutes,effort,note:typeof row.note==='string'?row.note.trim().slice(0,180):''};
}

export function sanitizePracticeDraft(id,data) {
  if(id==='kochen') return {portions:number(data?.portions,1,12)??2, pasta:number(data?.pasta,3,40)??10};
  if(id==='zeichnen') return {layers:Array.isArray(data?.layers)?data.layers.slice(0,10).map(shapeDraft).filter(Boolean):[]};
  if(id==='laufen') return {sessions:Array.isArray(data?.sessions)?data.sessions.slice(0,80).map(workoutDraft).filter(Boolean):[]};
  return {};
}

export function recipePlan(portions,pasta) {
  const sauce=16;
  const duration=Math.max(sauce,pasta);
  return [
    {minute:0,text:`Bereitlegen: ${85*portions} g Nudeln, ${150*portions} g passierte Tomaten, ${5*portions} ml Olivenöl und Gewürze. Für die Nudeln rechtzeitig Wasser aufsetzen.`},
    {minute:duration-sauce,text:'Sauce erwärmen, bei geringer Hitze köcheln lassen und kurz vor dem Servieren abschmecken.'},
    {minute:duration-pasta,text:'Nudeln in das bereits kochende Wasser geben. Die Garzeit auf der Packung als Ausgangspunkt nehmen.'},
    {minute:duration-1,text:'Eine Nudel probieren. Wenn sie dir noch zu fest ist, gib ihr etwas Zeit und halte die Sauce warm.'},
    {minute:duration,text:'Nudeln abgießen und mit der Sauce servieren.'}
  ].sort((a,b)=>a.minute-b.minute);
}

export function tapFeedback(taps,bpm) {
  if(taps.length<4) return 'Tippe mindestens vier Schläge, damit ein Vergleich möglich ist.';
  const expected=60000/bpm;
  const errors=taps.slice(1).map((tap,index)=>Math.abs(tap-taps[index]-expected));
  const mean=Math.round(errors.reduce((sum,value)=>sum+value,0)/errors.length);
  return mean<=expected*.15?`Gleichmäßig getroffen. Deine Abstände weichen durchschnittlich ${mean} ms vom Ziel ab.`:
    `Deine Abstände weichen durchschnittlich ${mean} ms vom Ziel ab. Lass die Hand locker und orientiere dich an jedem hörbaren Schlag.`;
}

const chessPuzzles = [
  { pieces:{f6:'WK',g6:'WQ',h8:'BK'}, target:'g6-g7', title:'Die Dame deckt die Fluchtfelder', goal:'Weiß setzt in einem Zug matt. Der weiße König deckt das Feld g7.', answer:'Dame nach g7 setzt matt. Sie bedroht h8 und deckt h7 und g8. Der weiße König schützt die Dame.' },
  { pieces:{g1:'WK',e1:'WR',g8:'BK',f7:'BP',g7:'BP',h7:'BP'}, target:'e1-e8', title:'Grundreihenmatt', goal:'Die schwarzen Bauern versperren dem König den Weg nach unten. Nutze den Turm.', answer:'Turm nach e8 setzt matt. Der Turm bedroht den König auf g8 und deckt dessen übrige freie Felder auf der Grundreihe.' },
  { pieces:{g1:'WK',d4:'WN',e6:'BK',a6:'BR'}, target:'d4-c5', title:'Springergabel', goal:'Gib mit dem Springer Schach und bedrohe gleichzeitig den schwarzen Turm.', answer:'Springer nach c5 gibt Schach auf e6 und droht zugleich, den Turm auf a6 zu schlagen.' }
];
const rankFile = cell => [cell.charCodeAt(0)-97,Number(cell[1])-1];
const chessLabel = {WK:'Weißer König',WQ:'Weiße Dame',WR:'Weißer Turm',WN:'Weißer Springer',BK:'Schwarzer König',BR:'Schwarzer Turm',BP:'Schwarzer Bauer'};
const chessIcon = {WK:'♔',WQ:'♕',WR:'♖',WN:'♘',BK:'♚',BR:'♜',BP:'♟'};

function reaches(piece,from,to,pieces) {
  const [x,y]=rankFile(from),[destX,destY]=rankFile(to);
  const dx=destX-x,dy=destY-y,ax=Math.abs(dx),ay=Math.abs(dy);
  if(!ax && !ay) return false;
  if(piece[1]==='K') return Math.max(ax,ay)===1;
  if(piece[1]==='N') return ax*ay===2;
  if(piece[1]==='P') return ax===1 && dy===(piece[0]==='B'?-1:1);
  if(dx && dy && (piece[1]!=='Q' || ax!==ay)) return false;
  const distance=Math.max(ax,ay);
  for(let step=1;step<distance;step++) {
    const square=String.fromCharCode(97+x+Math.sign(dx)*step)+(y+Math.sign(dy)*step+1);
    if(pieces[square]) return false;
  }
  return true;
}

export function legalPuzzleMove(pieces,from,to) {
  if(!/^[a-h][1-8]$/.test(from) || !/^[a-h][1-8]$/.test(to)) return false;
  const piece=pieces[from];
  if(piece?.[0]!=='W' || pieces[to]?.[0]==='W' || pieces[to]==='BK' || !reaches(piece,from,to,pieces)) return false;
  const position={...pieces,[to]:piece};
  delete position[from];
  const king=Object.keys(position).find(square=>position[square]==='WK');
  return Boolean(king) && !Object.entries(position).some(([square,other])=>other[0]==='B' && reaches(other,square,king,position));
}

export function parseWorkoutCsv(text) {
  const rows=text.trim().split(/\r?\n/);
  const headers=(rows.shift()??'').replace(/^\uFEFF/,'').toLowerCase().split(';');
  const expected=['datum','typ','minuten','belastung','notiz'];
  if(headers.length<3 || headers.length>5 || headers.some((field,i)=>field!==expected[i]) || rows.length<1 || rows.length>80) return null;
  const parsed=rows.map(line=>{
    const fields=line.split(';');
    if(fields.length!==headers.length) return null;
    const [day,type,minutes,effort,note]=fields;
    return workoutDraft({day,type,minutes,effort,note});
  });
  return parsed.some(row=>!row)?null:parsed;
}

function scratchMarkup() {
  const program=experiments.find(item=>item.id==='sammeln');
  return `<p>${program.goal}</p><div class="practice-controls">${program.palette.map(key=>button('block-'+key,blocks[key].label)).join('')}</div>
    <ol data-practice-output="blocks" class="practice-layers"></ol><div class="practice-controls">${button('undo','Letzten Block entfernen')}${button('clear','Alle entfernen')}${button('test','Beide Starts testen')}</div>
    <ol data-practice-output="frames"></ol><a class="button secondary" href="#labor/start">Zu den weiteren Blocklabor-Aufgaben</a>`;
}

function drawingMarkup() {
  return `<p>Setze zwei verschiedenfarbige Formen so, dass sie sich überschneiden. Die letzte Ebene erscheint im Vordergrund.</p>
    <div class="practice-art" data-practice-output="art" role="img" aria-label="Leere Komposition"></div>
    <div class="practice-controls"><label>Form<select name="shape">${options(shapes)}</select></label><label>Farbe<select name="color">${options(colors)}</select></label>
    <label>Von links (0–8)<input name="x" type="number" min="0" max="8" value="2"></label><label>Von oben (0–8)<input name="y" type="number" min="0" max="8" value="2"></label><label>Größe (1–10)<input name="size" type="number" min="1" max="10" value="4"></label></div>
    <div class="practice-controls">${button('add','Ebene hinzufügen')}${button('check','Komposition prüfen')}</div>
    <h2>Ebenen von hinten nach vorn</h2><ol class="practice-layers" data-practice-output="layers"></ol>`;
}

function rhythmMarkup() {
  return `<p>Höre zuerst vier Schläge. Tippe ab dann für mindestens vier Schläge auf „Schlag tippen“. Nach 16 hörbaren Schlägen bekommst du Rückmeldung.</p>
    <div class="practice-controls"><label>Schläge pro Minute<input name="bpm" type="number" min="45" max="180" value="80"></label>
    ${button('start','Metronom starten')}${button('tap','Schlag tippen')}${button('stop','Stoppen und auswerten')}</div>`;
}

function chessMarkup() {
  return `<label>Aufgabe<select name="puzzle">${options(chessPuzzles.map((item,index)=>[index,item.title]))}</select></label>
    <p data-practice-output="goal"></p><p>Wähle eine weiße Figur und dann ihr Zielfeld. Mit den Pfeiltasten wechselst du das Feld.</p><div class="practice-board" data-practice-output="board" aria-label="Schachbrett"></div>`;
}

function recipeMarkup() {
  return `<p>Rechne die Grundmengen für Tomatennudeln um. Minute 0 ist der Beginn der Arbeitsphase. Plane für das Aufkochen zusätzlich Zeit ein.</p>
    <div class="practice-controls"><label>Portionen<input name="portions" type="number" min="1" max="12"></label><label>Nudelzeit laut Packung in Minuten<input name="pasta" type="number" min="3" max="40"></label>${button('plan','Plan speichern')}</div>
    <ol data-practice-output="recipe"></ol>`;
}

function photoMarkup() {
  return `<p>Beginne mit dem Motiv in der Mitte. Schiebe es dann auf einen Schnittpunkt des Drittelrasters. Vergleiche, wie viel Platz in Blickrichtung bleibt.</p>
    <div class="practice-photo" data-practice-output="photo"><div class="practice-photo-demo" aria-hidden="true"><span></span></div><div class="practice-photo-grid" aria-hidden="true"></div></div>
    <div class="practice-controls"><label>Bilddatei auswählen (max. 10 MB)<input name="photo" type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/avif"></label>
    <label>Horizontal<input name="position" type="range" min="0" max="100" value="50"></label></div>
    <div class="practice-controls">${button('grid','Drittelraster umschalten')}${button('center','Mitte')}${button('third','Linkes Drittel')}${button('remove','Beispielmotiv zurückholen')}</div>
    <p class="muted">Deine Datei bleibt in dieser Ansicht. Beim Verlassen wird sie freigegeben.</p>`;
}

function workoutsMarkup() {
  return `<p>Trage eine Einheit manuell ein. Verwende in der optionalen Notiz lieber eine Beobachtung zur Einheit als persönliche Gesundheitsdaten oder einen genauen Ort.</p>
    <div class="practice-controls"><label>Tag<input name="day" type="date" value="${localDate()}"></label><label>Art<select name="type">${options(workoutTypes)}</select></label>
    <label>Minuten<input name="minutes" type="number" min="1" max="600" value="15"></label><label>Belastungsgefühl<select name="effort">${options([['','Offen lassen'],...efforts])}</select></label></div>
    <label>Optionale Notiz<input name="note" maxlength="180" placeholder="Was möchte ich wiederholen?"></label>
    <div class="practice-controls">${button('add','Einheit speichern')}</div><p data-practice-output="summary"></p>
    <ul class="practice-layers" data-practice-output="workouts"></ul>
    <details><summary>Trainingsdatei importieren</summary><p>CSV bis 32 KB. Kopfzeile <code>datum;typ;minuten</code>, optional gefolgt von <code>;belastung;notiz</code>. Datum als JJJJ-MM-TT, Typ als <code>lauf</code> oder <code>kraft</code>, Belastung optional als 1–3. Nutze keine Semikolons in Freitext.</p>
    <label>CSV auswählen<input name="csv" type="file" accept=".csv,text/csv"></label>
    <div class="practice-controls"><label class="practice-check"><input name="import-effort" type="checkbox">Belastung übernehmen</label><label class="practice-check"><input name="import-note" type="checkbox">Notizen übernehmen</label></div>
    <p>Datum, Art und Minuten werden für den Import benötigt. Doppelte Einheiten werden ausgelassen.</p>
    <ul class="practice-layers" data-practice-output="preview"></ul>${button('import','Vorschau übernehmen')}</details>`;
}

function languageMarkup() {
  return `<p>Höre dir einen Satz an. Nimm deine Version auf und vergleiche Betonung und Pausen beim Anhören. Die Aufnahme bleibt bis zum Verlassen der Ansicht oder bis zum Löschen im Tab.</p>
    <div class="practice-controls"><label>Sprache<select name="language">${options(Object.entries(languages).map(([id,item])=>[id,item.name]))}</select></label><label>Satz<select name="phrase"></select></label></div>
    <div class="practice-controls">${button('listen','Lokale Stimme anhören')}${button('record','Aufnahme starten')}${button('stop','Aufnahme beenden')}${button('clear','Aufnahme löschen')}</div>
    <audio aria-label="Deine Aufnahme" controls hidden></audio>`;
}

const markups={scratch:scratchMarkup,zeichnen:drawingMarkup,beats:rhythmMarkup,schach:chessMarkup,kochen:recipeMarkup,fotografie:photoMarkup,laufen:workoutsMarkup,sprachen:languageMarkup};

export function practiceStudioPage(id) {
  if(id==='gym') id='laufen';
  if(!Object.hasOwn(practiceStudios,id)) return '<h1>Übungsstudio finden</h1><p>Öffne einen Lernpfad und wähle dort das passende Studio.</p><a class="button" href="#entdecken">Hobbys entdecken</a>';
  const studio=practiceStudios[id];
  return `<header class="page-heading"><a href="#pfad/${id}">Zurück zum Lernpfad</a><h1>${studio.title}</h1><p>${studio.description}</p></header>
    <section class="surface utility practice-studio" aria-label="${studio.title}">${markups[id]()}<p class="practice-status" data-practice-output="status" role="status"></p></section>`;
}

function mountScratch({output,status,onClick}) {
  const experiment=experiments.find(item=>item.id==='sammeln');
  let program=[];
  const display=()=>{
    output('blocks').innerHTML=program.length?program.map(key=>`<li>${blocks[key].label}</li>`).join(''):'<li>Beginne mit einem Ereignisblock, zum Beispiel „Wenn Start gedrückt“.</li>';
    output('frames').replaceChildren();
  };
  display();
  onClick(action=>{
    if(action==='test') {
      const result=runBlocks(program,experiment);
      output('frames').innerHTML=result.frames.map((frame,i)=>`<li>Start ${i+1} · Position ${frame.pos+1} von 5 · Punkte ${frame.points} · Stern ${frame.star?'liegt da':'eingesammelt'}</li>`).join('');
      if(result.pass) status('Beide Starts bestanden. Der Stern wird jeweils genau einmal eingesammelt.');
      else if(!result.frames.length) status(result.message);
      else status('Der Test erwartet nach jedem Start die Position 4 von 5 und genau einen Punkt. Prüfe die Reihenfolge deiner Blöcke.');
      return;
    }
    if(action==='clear') program=[];
    if(action==='undo') program.pop();
    if(action.startsWith('block-') && experiment.palette.includes(action.slice(6))) {
      if(program.length===12) return status('Das Testprogramm kann höchstens zwölf Blöcke enthalten.');
      program.push(action.slice(6));
    }
    display();
    status('');
  });
}

function shapesOverlap(layers) {
  const top=layers.at(-1);
  if(!top) return false;
  const contains=(layer,x,y)=>{
    const u=(x-layer.x)/layer.size,v=(y-layer.y)/layer.size;
    if(u<=0||u>=1||v<=0||v>=1) return false;
    if(layer.shape==='ellipse') return (u-.5)**2+(v-.5)**2<.25;
    if(layer.shape==='triangle') return Math.abs(u-.5)<v/2;
    return true;
  };
  return layers.slice(0,-1).some(other=>{
    if(top.color===other.color) return false;
    const fromX=Math.max(top.x,other.x),toX=Math.min(top.x+top.size,other.x+other.size);
    const fromY=Math.max(top.y,other.y),toY=Math.min(top.y+top.size,other.y+other.size);
    for(let x=fromX+.125;x<toX;x+=.25) {
      for(let y=fromY+.125;y<toY;y+=.25) {
        if(contains(top,x,y) && contains(other,x,y)) return true;
      }
    }
    return false;
  });
}

function mountDrawing({output,status,onClick,field,draft,persist,root}) {
  const display=()=>{
    const art=output('art');
    art.innerHTML=draft.layers.map(layer=>`<span class="practice-shape ${layer.shape}" style="--left:${layer.x*10}%;--top:${layer.y*10}%;--size:${layer.size*10}%;--fill:${colorValues[layer.color]}"></span>`).join('');
    art.setAttribute('aria-label',draft.layers.length?`Komposition mit ${draft.layers.length} Ebenen. Die Merkmale stehen darunter.`:'Leere Komposition');
    output('layers').innerHTML=draft.layers.map((layer,index)=>
      `<li><span>${Object.fromEntries(shapes)[layer.shape]}, ${Object.fromEntries(colors)[layer.color]} · links ${layer.x} · oben ${layer.y} · Größe ${layer.size}</span>${index<draft.layers.length-1?button('front-'+index,'Nach vorn'):''}${index>0?button('back-'+index,'Nach hinten'):''}${button('delete-'+index,'Entfernen')}</li>`).join('') || '<li>Füge als Erstes eine große Hintergrundform hinzu.</li>';
  };
  display();
  onClick(action=>{
    if(action==='check') {
      status(shapesOverlap(draft.layers)?'Die oberste Form überlappt eine andersfarbige Ebene. Verschiebe sie versuchsweise nach hinten und vergleiche die Raumwirkung.':'Setze die oberste Form so, dass sie eine andersfarbige Form teilweise bedeckt. Du kannst eine weitere Form anlegen.');
      return;
    }
    const layers=[...draft.layers];
    if(action==='add') {
      if(layers.length===10) return status('Du kannst zehn Ebenen anlegen. Entferne eine Ebene, wenn du Platz brauchst.');
      const layer=shapeDraft(Object.fromEntries(['shape','color','x','y','size'].map(name=>[name,field(name).value])));
      if(!layer) return status('Die Form muss vollständig in die Fläche von 0 bis 10 passen. Wähle eine kleinere Größe oder einen anderen Startpunkt.');
      layers.push(layer);
    }
    if(action.startsWith('front-')) layers.push(...layers.splice(Number(action.slice(6)),1));
    if(action.startsWith('back-')) layers.unshift(...layers.splice(Number(action.slice(5)),1));
    if(action.startsWith('delete-')) layers.splice(Number(action.slice(7)),1);
    if(!persist({layers})) return;
    draft.layers=layers;
    display();
    if(action!=='add') root.querySelector('[data-practice="add"]').focus();
    status('Komposition gespeichert.');
  });
}

function mountRhythm({status,onClick,field,cleanups}) {
  let context, endTimer, bpm, startAt, taps=[];
  const release=()=>{
    clearTimeout(endTimer);
    const audio=context;
    context=null;
    audio?.close().catch(()=>{});
  };
  cleanups.push(release);
  const stop=()=>{
    release();
    status(tapFeedback(taps,bpm));
  };
  onClick(async action=>{
    if(action==='start') {
      release();
      const Audio=window.AudioContext || window.webkitAudioContext;
      if(!Audio) return status('Dieser Browser unterstützt das Metronom nicht.');
      bpm=number(field('bpm').value,45,180);
      if(!bpm) return status('Wähle ein Tempo zwischen 45 und 180 Schlägen pro Minute.');
      taps=[];
      try {
        const audio=new Audio();
        context=audio;
        await audio.resume();
        if(context!==audio) return;
        const interval=60/bpm;
        const start=audio.currentTime+.08;
        startAt=start+interval*4;
        for(let i=0;i<16;i++) {
          const signal=audio.createOscillator(),volume=audio.createGain(),at=start+i*interval;
          signal.frequency.value=i%4===0?800:550;
          volume.gain.setValueAtTime(.12,at);
          volume.gain.exponentialRampToValueAtTime(.001,at+.07);
          signal.connect(volume).connect(audio.destination);
          signal.start(at);
          signal.stop(at+.08);
        }
        status('Das Metronom läuft. Warte vier Schläge und tippe dann mit.');
        endTimer=setTimeout(stop,(16*interval+.15)*1000);
      } catch {
        release();
        status('Das Metronom konnte in diesem Browser nicht abgespielt werden.');
      }
    }
    if(action==='stop') {
      if(context) stop();
      else status('Starte das Metronom, um einen Versuch zu beginnen.');
    }
    if(action==='tap') {
      if(!context) return status('Starte zuerst das Metronom.');
      if(context.currentTime<startAt-.2) return status('Höre erst die vier Vorbereitungsschläge.');
      if(taps.length>=32) return;
      taps.push(context.currentTime*1000);
      status(`${taps.length} Schläge getippt.`);
    }
  });
}

function mountChess({root,output,status,onClick,on,field}) {
  const squares=Array.from({length:64},(_,i)=>String.fromCharCode(97+i%8)+(8-Math.floor(i/8)));
  let origin='',puzzle,position,solved=false;
  function display(active) {
    output('board').innerHTML=squares.map((square,index)=>{
      const piece=position[square];
      const tile=(Math.floor(index/8)+index%8)%2?'dark':'light';
      return `<button class="practice-square ${tile}" type="button" data-practice="square-${square}" tabindex="${square===active?0:-1}" aria-pressed="${square===origin}" aria-label="${square}${piece?', '+chessLabel[piece]:', leer'}"><span aria-hidden="true">${chessIcon[piece]||''}</span><small aria-hidden="true">${square}</small></button>`;
    }).join('');
    output('goal').textContent=puzzle.goal;
  }
  function choose() {
    puzzle=chessPuzzles[field('puzzle').value]??chessPuzzles[0];
    origin='';
    position=puzzle.pieces;
    solved=false;
    display(puzzle.target.slice(0,2));
    status('');
  }
  choose();
  on(field('puzzle'),'change',choose);
  on(output('board'),'keydown',event=>{
    const square=event.target.dataset.practice?.slice(7);
    if(!square) return;
    if(event.key==='Enter') {
      event.preventDefault();
      event.target.click();
      return;
    }
    if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(event.key)) return;
    event.preventDefault();
    const index=squares.indexOf(square),col=index%8;
    const next={ArrowLeft:col?index-1:index,ArrowRight:col<7?index+1:index,ArrowUp:Math.max(col,index-8),ArrowDown:Math.min(56+col,index+8),Home:index-col,End:index-col+7}[event.key];
    event.target.tabIndex=-1;
    const cell=root.querySelector(`[data-practice="square-${squares[next]}"]`);
    cell.tabIndex=0;
    cell.focus();
  });
  onClick(action=>{
    if(!action.startsWith('square-')) return;
    const chosen=action.slice(7);
    if(solved) return status(puzzle.answer+' Wähle oben eine weitere Aufgabe.');
    if(position[chosen]?.[0]==='W') {
      origin=chosen===origin?'':chosen;
      status(origin?`${chessLabel[position[origin]]} auf ${origin} gewählt. Wähle das Zielfeld.`:'Auswahl aufgehoben.');
    } else if(!origin) {
      status('Wähle zuerst eine weiße Figur.');
    } else if(!legalPuzzleMove(position,origin,chosen)) {
      status('Dieser Zug ist in der Stellung nicht erlaubt. Prüfe Zugrichtung, Hindernisse und den eigenen König.');
    } else if(origin+'-'+chosen===puzzle.target) {
      position={...position,[chosen]:position[origin]};
      delete position[origin];
      origin='';
      solved=true;
      status(puzzle.answer);
    } else {
      status('Der Zug ist legal. Er erreicht das Lernziel dieser Stellung noch nicht.');
    }
    display(chosen);
    root.querySelector(`[data-practice="square-${chosen}"]`).focus();
  });
}

function mountRecipe({output,status,onClick,on,field,draft,persist}) {
  const preview=()=>{
    const portions=number(field('portions').value,1,12),pasta=number(field('pasta').value,3,40);
    if(portions===null || pasta===null) {
      output('recipe').replaceChildren();
      return null;
    }
    output('recipe').innerHTML=recipePlan(portions,pasta).map(step=>`<li><strong>Minute ${step.minute}</strong> · ${step.text}</li>`).join('');
    return {portions,pasta};
  };
  for(const name of ['portions','pasta']) {
    field(name).value=draft[name];
    on(field(name),'input',preview);
  }
  preview();
  onClick(action=>{
    if(action!=='plan') return;
    const next=preview();
    if(!next) return status('Gib eine bis zwölf Portionen und drei bis vierzig Minuten Garzeit ein.');
    if(persist(next)) status('Portionen und Garzeit gespeichert.');
  });
}

function mountPhoto({output,status,onClick,on,field,cleanups}) {
  const stage=output('photo'),demo=stage.querySelector('.practice-photo-demo');
  const grid=stage.querySelector('.practice-photo-grid');
  const image=document.createElement('img');
  image.alt='Dein Motiv zur Kompositionsübung';
  image.hidden=true;
  stage.prepend(image);
  let url,version=0;
  const remove=()=>{
    version++;
    if(url) URL.revokeObjectURL(url);
    url=null;
    image.removeAttribute('src');
    image.hidden=true;
    demo.hidden=false;
  };
  const adjust=()=>{
    const position=field('position').value;
    stage.style.setProperty('--subject',position+'%');
    status(`Horizontale Einstellung ${position} von 100.`);
  };
  cleanups.push(remove);
  on(field('position'),'input',adjust);
  on(field('photo'),'change',()=>{
    const file=field('photo').files[0];
    if(!file) return;
    if(!/^image\/(png|jpeg|webp|gif|avif)$/.test(file.type) || file.size>10000000) {
      field('photo').value='';
      return status('Wähle eine PNG-, JPEG-, WebP-, GIF- oder AVIF-Datei unter 10 MB.');
    }
    remove();
    const loaded=version;
    url=URL.createObjectURL(file);
    image.src=url;
    image.decode().then(()=>{
      if(loaded!==version) return;
      image.hidden=false;
      demo.hidden=true;
      status('Bild lokal geöffnet. Vergleiche seine Linien und Flächen mit dem Raster.');
    }).catch(()=>{
      if(loaded!==version) return;
      remove();
      status('Die Datei konnte nicht als Bild geöffnet werden.');
    });
  });
  onClick(action=>{
    if(action==='grid') {
      grid.hidden=!grid.hidden;
      status(grid.hidden?'Drittelraster ausgeblendet.':'Drittelraster eingeblendet.');
    }
    if(action==='remove') {
      remove();
      field('photo').value='';
      status('Beispielmotiv ist wieder sichtbar.');
    }
    if(action==='center'||action==='third') {
      field('position').value=action==='center'?'50':'33';
      adjust();
    }
  });
}

function mountWorkouts({output,status,onClick,on,field,draft,persist,root,signal}) {
  let pending=[];
  const name=Object.fromEntries(workoutTypes), effort=Object.fromEntries(efforts);
  const describe=row=>`${row.day} · ${name[row.type]} · ${row.minutes} Min.${row.effort?' · '+effort[row.effort]:''}${row.note?' · '+row.note:''}`;
  const display=()=>{
    const sorted=draft.sessions.map((row,index)=>({row,index})).sort((a,b)=>b.row.day.localeCompare(a.row.day));
    const total=draft.sessions.reduce((sum,row)=>sum+row.minutes,0);
    const count=draft.sessions.length;
    output('summary').textContent=count?`${count} ${count===1?'Einheit':'Einheiten'} mit insgesamt ${total} ${total===1?'Minute':'Minuten'}.`:'Trage deine erste Einheit ein, um hier deinen Verlauf zu sehen.';
    output('workouts').innerHTML=sorted.map(({row,index})=>`<li><span>${encode(describe(row))}</span>${button('remove-'+index,'Entfernen')}</li>`).join('');
  };
  const save=sessions=>{
    if(sessions.length>80) {
      status('Das Tagebuch kann 80 Einheiten speichern. Entferne einen älteren Eintrag, um Platz zu schaffen.');
      return false;
    }
    if(!persist({sessions})) return false;
    draft.sessions=sessions;
    display();
    return true;
  };
  const preview=()=>{
    const notes=field('import-note').checked,load=field('import-effort').checked;
    output('preview').innerHTML=pending.slice(0,10).map(row=>`<li>${encode(describe({...row,effort:load?row.effort:'',note:notes?row.note:''}))}</li>`).join('');
    if(pending.length>10) output('preview').insertAdjacentHTML('beforeend',`<li>Weitere Einheiten in der Datei: ${pending.length-10}</li>`);
  };
  display();
  on(field('import-note'),'change',preview);
  on(field('import-effort'),'change',preview);
  on(field('csv'),'change',async ()=>{
    const file=field('csv').files[0];
    pending=[];
    preview();
    if(!file) return;
    if(file.size>32000) return status('Wähle eine CSV-Datei unter 32 KB.');
    try {
      const parsed=parseWorkoutCsv(await file.text());
      if(signal.aborted || field('csv').files[0]!==file) return;
      if(!parsed) return status('Die CSV enthält eine ungültige Zeile oder Kopfzeile. Prüfe das oben gezeigte Format.');
      pending=parsed;
      preview();
      status(`Vorschau für ${pending.length} Einheiten geladen. Kontrolliere die Felder und bestätige den Import.`);
    } catch {
      if(!signal.aborted) status('Die Datei konnte nicht gelesen werden.');
    }
  });
  onClick(action=>{
    if(action==='add') {
      const values=Object.fromEntries(['day','type','minutes','effort','note'].map(key=>[key,field(key).value]));
      const row=workoutDraft(values);
      if(!row) return status('Prüfe Datum, Art und Dauer. Die Dauer muss zwischen einer und 600 Minuten liegen.');
      if(save([...draft.sessions,row])) {
        field('note').value='';
        status('Einheit im privaten Tagebuch gespeichert.');
      }
    }
    if(action.startsWith('remove-')) {
      const index=Number(action.slice(7));
      if(save(draft.sessions.filter((_,i)=>i!==index))) {
        root.querySelector('[data-practice="add"]').focus();
        status('Einheit gelöscht.');
      }
    }
    if(action==='import') {
      if(!pending.length) return status('Wähle zuerst eine gültige CSV-Datei für die Vorschau.');
      const notes=field('import-note').checked,load=field('import-effort').checked;
      const sessions=[...draft.sessions];
      const identities=new Set(sessions.map(row=>[row.day,row.type,row.minutes].join('|')));
      for(const row of pending) {
        const identity=[row.day,row.type,row.minutes].join('|');
        if(identities.has(identity)) continue;
        identities.add(identity);
        sessions.push({...row,effort:load?row.effort:'',note:notes?row.note:''});
      }
      const added=sessions.length-draft.sessions.length;
      if(save(sessions)) {
        pending=[];
        preview();
        field('csv').value='';
        status(`${added} Einheiten ins private Tagebuch übernommen.`);
      }
    }
  });
}

function mountLanguage({root,status,onClick,on,field,cleanups,signal}) {
  const player=root.querySelector('audio');
  const synth=window.speechSynthesis;
  let source,recorder,stream,recording=false,recordTimer;
  const language=()=>languages[field('language').value];
  const phrases=()=>{field('phrase').innerHTML=options(language().pairs.map(([line],i)=>[i,line]));};
  const releaseStream=()=>{
    stream?.getTracks().forEach(track=>track.stop());
    stream=null;
  };
  const clear=()=>{
    if(source) URL.revokeObjectURL(source);
    source=null;
    player.removeAttribute('src');
    player.hidden=true;
  };
  const stop=()=>{
    clearTimeout(recordTimer);
    if(recorder?.state==='recording') recorder.stop();
  };
  phrases();
  on(field('language'),'change',phrases);
  cleanups.push(()=>{
    synth?.cancel();
    stop();
    releaseStream();
    clear();
  });
  onClick(async action=>{
    if(action==='listen') {
      const item=language();
      const voices=synth?.getVoices().filter(voice=>voice.localService)??[];
      const locale=item.locale.toLowerCase(),base=locale.split('-')[0];
      const voice=voices.find(voice=>voice.lang.toLowerCase()===locale)??voices.find(voice=>voice.lang.toLowerCase().split('-')[0]===base);
      if(!voice || !window.SpeechSynthesisUtterance) return status('Für diese Sprache wurde keine lokale Stimme gefunden. Lies den Satz und vergleiche zwei eigene Aufnahmen nacheinander.');
      try {
        const utterance=new SpeechSynthesisUtterance(item.pairs[field('phrase').value][0]);
        utterance.voice=voice;
        utterance.lang=voice.lang;
        utterance.rate=.85;
        utterance.onerror=()=>{if(!signal.aborted) status('Die lokale Stimme konnte den Satz nicht abspielen.');};
        synth.cancel();
        synth.speak(utterance);
        status('Die Gerätestimme liest den gewählten Satz.');
      } catch {
        status('Die lokale Stimme konnte den Satz nicht abspielen.');
      }
    }
    if(action==='clear') {
      if(recording) return status('Beende zuerst die aktive Aufnahme.');
      clear();
      status('Aufnahme gelöscht.');
    }
    if(action==='stop') {
      if(recorder?.state==='recording') stop();
      else status('Starte zuerst eine Aufnahme.');
    }
    if(action==='record') {
      if(recording) return;
      if(!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) return status('In diesem Browser oder an dieser Adresse steht die Mikrofonaufnahme nicht zur Verfügung.');
      recording=true;
      try {
        const media=await navigator.mediaDevices.getUserMedia({audio:true});
        if(signal.aborted) {
          media.getTracks().forEach(track=>track.stop());
          return;
        }
        stream=media;
        const chunks=[];
        recorder=new MediaRecorder(media);
        recorder.addEventListener('dataavailable',event=>{if(event.data.size) chunks.push(event.data);});
        recorder.addEventListener('stop',()=>{
          releaseStream();
          recording=false;
          if(signal.aborted) return;
          if(!chunks.length) return status('Die Aufnahme enthält kein Audio. Versuche es erneut.');
          clear();
          source=URL.createObjectURL(new Blob(chunks,{type:recorder.mimeType||chunks[0].type}));
          player.src=source;
          player.hidden=false;
          status('Aufnahme bereit. Höre dir deine Betonung und Pausen an.');
        },{once:true});
        recorder.addEventListener('error',()=>{
          clearTimeout(recordTimer);
          releaseStream();
          recording=false;
          if(!signal.aborted) status('Die Aufnahme wurde wegen eines Mikrofonfehlers beendet.');
        },{once:true});
        recorder.start();
        status('Aufnahme läuft. Nach 30 Sekunden endet sie automatisch.');
        recordTimer=setTimeout(stop,30000);
      } catch {
        releaseStream();
        recording=false;
        if(!signal.aborted) status('Das Mikrofon konnte nicht geöffnet werden. Prüfe den Gerätezugriff im Browser.');
      }
    }
  });
}

const mounts={scratch:mountScratch,zeichnen:mountDrawing,beats:mountRhythm,schach:mountChess,kochen:mountRecipe,fotografie:mountPhoto,laufen:mountWorkouts,sprachen:mountLanguage};
let cleanup;
export function unmountPracticeStudio() { cleanup?.(); cleanup=null; }

export function mountPracticeStudio(container,id,{read,write}={}) {
  unmountPracticeStudio();
  if(id==='gym') id='laufen';
  const root=container.querySelector('.practice-studio');
  if(!root||!Object.hasOwn(mounts,id)) return;
  const controller=new AbortController(),{signal}=controller,cleanups=[];
  const field=name=>root.querySelector(`[name="${name}"]`);
  const output=name=>root.querySelector(`[data-practice-output="${name}"]`);
  const status=text=>{output('status').textContent=text;};
  const on=(node,event,listener)=>node.addEventListener(event,listener,{signal});
  const onClick=listener=>on(root,'click',event=>{
    const action=event.target.closest('[data-practice]');
    if(action) listener(action.dataset.practice);
  });
  const draft=sanitizePracticeDraft(id,read?.(id));
  const persist=data=>{
    if(write?.(id,sanitizePracticeDraft(id,data))!==false) return true;
    status('Die Änderung konnte nicht gespeichert werden. Versuche es erneut oder sichere dein Profil.');
    return false;
  };
  cleanup=()=>{
    controller.abort();
    for(const release of cleanups) release();
  };
  mounts[id]({root,signal,cleanups,field,output,status,on,onClick,draft,persist});
}

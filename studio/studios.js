export const studios = {
  chess: { name: 'Schachbrett', description: 'Spiele legale Züge und löse Taktikstellungen.' },
  code: { name: 'Weblabor', description: 'Schreibe HTML, CSS und JavaScript und prüfe dein Ergebnis.' },
  music: { name: 'Musikstudio', description: 'Spiele Klavier, erkunde Griffbretter und übe Gehör und Rhythmus.' },
  drawing: { name: 'Zeichenatelier', description: 'Zeichne Formen, spiele mit Perspektive und exportiere deine Skizze.' },
  camera: { name: 'Kameralabor', description: 'Erkunde Belichtung, Bewegungsunschärfe und Bildausschnitt.' },
  sudoku: { name: 'Sudoku', description: 'Nutze Ausschluss, um ein Zahlenraster zu lösen.' },
  design: { name: 'Designatelier', description: 'Gestalte eine Karte und überprüfe Lesbarkeit und Hierarchie.' },
  timeline: { name: 'Schnittplatz', description: 'Ordne Clips und baue aus Einstellungen eine Geschichte.' },
  astronomy: { name: 'Orbitallabor', description: 'Spiele mit Umlaufzeiten und simuliere Mondphasen.' },
  geography: { name: 'Kartenlabor', description: 'Ordne Länder und Hauptstädte einer schematischen Europakarte zu.' },
  languages: { name: 'Sprachcafé', description: 'Übe kurze Dialoge in vier Sprachen mit optionaler Sprachausgabe.' },
  cook: { name: 'Rezeptlabor', description: 'Rechne Zutaten für verschiedene Portionszahlen um.' },
  pixel: { name: 'Pixelatelier', description: 'Entwirf ein kleines Symbol Pixel für Pixel.' },
  logic: { name: 'Argumentationslabor', description: 'Prüfe Behauptungen, Belege und mögliche Erklärungen.' }
};

const escape = value => String(value).replace(/[&<>"']/g, mark => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[mark]));
const listen = (parent, selector, handler, event = 'click') => parent.querySelectorAll(selector).forEach(element => element.addEventListener(event, handler));
const inside = (r, c) => r >= 0 && r < 8 && c >= 0 && c < 8;
const sq = index => `${'abcdefgh'[index % 8]}${8 - Math.floor(index / 8)}`;
const changes = () => '<p class="st-feedback" data-feedback role="status" aria-live="polite"></p>';
const btn = (label, data, classes = '') => `<button type="button" class="st-button ${classes}" ${data}>${label}</button>`;
const task = (headline, copy) => `<div class="st-task"><strong>${headline}</strong><p>${copy}</p></div>`;

export function mountStudio(root, id, { complete = () => {}, notify = () => {}, audio = true } = {}) {
  const studio = studios[id];
  if (!studio) return;
  root.innerHTML = `<section class="st-room" aria-label="${studio.name}"><header class="st-heading"><h2>${studio.name}</h2><p>${studio.description}</p></header><div data-room></div></section>`;
  const room = root.querySelector('[data-room]');
  const feedback = (message, good = null) => {
    const output = room.querySelector('[data-feedback]');
    if (!output) return;
    output.textContent = message;
    output.dataset.result = good == null ? '' : good ? 'yes' : 'no';
  };
  return mounts[id]?.(room, { feedback, pass: complete, notify, audioEnabled:audio });
}

const pieces = { K:'♔', Q:'♕', R:'♖', B:'♗', N:'♘', P:'♙', k:'♚', q:'♛', r:'♜', b:'♝', n:'♞', p:'♟' };
const pieceNames = { k:'König', q:'Dame', r:'Turm', b:'Läufer', n:'Springer', p:'Bauer' };
const start = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -';
const knightOffsets = [[1,2],[2,1],[-1,2],[-2,1],[1,-2],[2,-1],[-1,-2],[-2,-1]];
const diagonals = [[1,1],[1,-1],[-1,1],[-1,-1]];
const straights = [[1,0],[-1,0],[0,1],[0,-1]];
const adjacent = [...diagonals, ...straights];
const isWhite = piece => piece === piece.toUpperCase();
const indexOfSq = name => name === '-' ? -1 : (8 - Number(name[1])) * 8 + 'abcdefgh'.indexOf(name[0]);
const fromFen = fen => {
  const [layout, turn, rights, enPassant] = fen.split(' ');
  const board = [...layout.replace(/\//g, '').replace(/[1-8]/g, value => '.'.repeat(Number(value)))].map(piece => piece === '.' ? null : piece);
  return {board,white:turn === 'w',rights:rights === '-' ? '' : rights,enPassant:indexOfSq(enPassant)};
};

function pseudoMoves(position, from, attackOnly = false) {
  const {board, rights, enPassant} = position;
  const piece = board[from];
  if (!piece) return [];
  const white = isWhite(piece);
  const row = Math.floor(from / 8);
  const col = from % 8;
  const kind = piece.toLowerCase();
  const targets = [];
  if (kind === 'p') {
    const dir = white ? -1 : 1;
    for (const dc of [-1, 1]) {
      if (!inside(row + dir, col + dc)) continue;
      const to = from + dir * 8 + dc;
      if (attackOnly || (board[to] && isWhite(board[to]) !== white) || to === enPassant) targets.push(to);
    }
    if (attackOnly || !inside(row + dir, col) || board[from + dir * 8]) return targets;
    targets.push(from + dir * 8);
    if (row === (white ? 6 : 1) && !board[from + dir * 16]) targets.push(from + dir * 16);
    return targets;
  }
  const vectors = kind === 'n' ? knightOffsets : kind === 'b' ? diagonals : kind === 'r' ? straights : adjacent;
  const distance = kind === 'k' || kind === 'n' ? 1 : 7;
  for (const [dr, dc] of vectors) {
    for (let i = 1; i <= distance && inside(row + dr * i, col + dc * i); i++) {
      const to = (row + dr * i) * 8 + col + dc * i;
      const occupant = board[to];
      if (attackOnly || !occupant || isWhite(occupant) !== white) targets.push(to);
      if (occupant) break;
    }
  }
  if (kind === 'k' && !attackOnly && from === (white ? 60 : 4) && !attacked(position, from, !white)) {
    const rook = white ? 'R' : 'r';
    const castles = [
      [white ? 'K' : 'k', from + 3, [from + 1, from + 2], [from + 1, from + 2]],
      [white ? 'Q' : 'q', from - 4, [from - 1, from - 2, from - 3], [from - 1, from - 2]]
    ];
    for (const [right, rookFrom, clear, safe] of castles) {
      if (rights.includes(right) && board[rookFrom] === rook && clear.every(to => !board[to]) && safe.every(to => !attacked(position, to, !white))) targets.push(safe[1]);
    }
  }
  return targets;
}

function attacked(position, to, white) {
  return position.board.some((piece, from) => piece && isWhite(piece) === white && pseudoMoves(position, from, true).includes(to));
}

function moved(position, from, to, upgrade = 'q') {
  const board = [...position.board];
  const piece = board[from];
  const white = isWhite(piece);
  const kind = piece.toLowerCase();
  const dir = white ? -1 : 1;
  let rights = position.rights;
  let enPassant = -1;
  board[from] = null;
  board[to] = piece;
  if (kind === 'p') {
    if (to === position.enPassant && from % 8 !== to % 8) board[to - dir * 8] = null;
    if (Math.abs(to - from) === 16) enPassant = from + dir * 8;
    if (Math.floor(to / 8) === (white ? 0 : 7)) board[to] = white ? upgrade.toUpperCase() : upgrade;
  }
  if (kind === 'k') {
    rights = rights.replace(white ? /[KQ]/g : /[kq]/g, '');
    if (Math.abs(from - to) === 2) {
      const direction = Math.sign(to - from);
      const rook = direction === 1 ? from + 3 : from - 4;
      board[from + direction] = board[rook];
      board[rook] = null;
    }
  }
  const corners = {0:'q',7:'k',56:'Q',63:'K'};
  for (const endpoint of [from,to]) if (corners[endpoint]) rights = rights.replace(corners[endpoint], '');
  return {board,white:!white,rights,enPassant};
}

function legalMoves(position, from) {
  const piece = position.board[from];
  if (!piece || isWhite(piece) !== position.white) return [];
  return pseudoMoves(position, from).filter(to => {
    if (position.board[to]?.toLowerCase() === 'k') return false;
    const next = moved(position, from, to);
    return !attacked(next, next.board.indexOf(position.white ? 'K' : 'k'), !position.white);
  });
}

const chessTasks = [
  {id:'chess-opening',title:'Den Mittelpunkt besetzen',fen:start,move:'e2e4',prompt:'Ziehe den weißen Bauern von e2 zwei Felder vor. Die Koordinate e4 liegt in der Brettmitte.',hint:'Wähle e2, anschließend e4.',result:'Auf e4 kontrolliert dein Bauer die Felder d5 und f5.'},
  {id:'chess-fork',title:'Die Springergabel',fen:'3k3r/8/8/4N3/8/8/8/K7 w - -',move:'e5f7',prompt:'Greife den schwarzen König und Turm gleichzeitig mit dem Springer an.',hint:'Ein Springer auf f7 greift d8 und h8 an.',result:'Auf f7 setzt der Springer den König auf d8 ins Schach und greift zugleich den Turm auf h8 an.'},
  {id:'chess-mate',title:'Matt in einem Zug',fen:'7k/8/5KQ1/8/8/8/8/8 w - -',move:'g6g7',prompt:'Setze den schwarzen König mit der weißen Dame matt. Dein König deckt die Felder neben sich.',hint:'Überprüfe, ob der weiße König das Feld g7 deckt.',result:'Die Dame auf g7 bedroht h8 und kontrolliert h7 sowie g8. Der weiße König schützt die Dame.'},
  {id:'chess-castle',title:'Den König durch Rochade sichern',fen:'r3k2r/8/8/8/8/8/8/R3K2R w KQkq -',move:'e1g1',prompt:'Rochiere mit Weiß zur Königsseite. Wähle den König und dann sein Zielfeld.',hint:'Bei der kurzen Rochade zieht der König von e1 nach g1.',result:'Der König steht jetzt auf g1 und der Turm ist auf f1.'}
];

function chess(room, {feedback, pass}) {
  let position = fromFen(start);
  let current = null;
  let selected = -1;
  let keyboardSquare = 0;
  let last = [];
  const history = [];
  room.innerHTML = `<div class="st-toolbar"><label>Stellung <select data-exercise><option value="-1">Freies Brett</option>${chessTasks.map((x,i)=>`<option value="${i}">${x.title}</option>`).join('')}</select></label><label>Bauernumwandlung <select data-upgrade><option value="q">Dame</option><option value="r">Turm</option><option value="b">Läufer</option><option value="n">Springer</option></select></label>${btn('Zug zurück','data-undo')}${btn('Neu beginnen','data-reset')}</div><div data-task></div><div class="st-split"><div class="st-chess" data-board aria-label="Schachbrett"></div><div><p><strong data-turn></strong></p><p>Wähle zuerst eine Figur und dann ein markiertes Zielfeld. Mit den Pfeiltasten wechselst du zwischen Feldern.</p><details data-hint><summary>Hinweis</summary><p></p></details><ol data-moves class="st-moves" aria-label="Zugliste"></ol></div></div>${changes()}`;
  const board = room.querySelector('[data-board]');
  const turn = room.querySelector('[data-turn]');
  const exercise = room.querySelector('[data-exercise]');
  const hint = room.querySelector('[data-hint]');
  function show(focus = -1) {
    if (focus >= 0) keyboardSquare = focus;
    const moves = legalMoves(position, selected);
    const color = position.white ? 'Weiß' : 'Schwarz';
    const king = position.board.indexOf(position.white ? 'K' : 'k');
    const check = attacked(position, king, !position.white);
    const alive = position.board.some((_, index) => legalMoves(position, index).length);
    turn.textContent = !alive ? (check ? `${color} ist schachmatt.` : 'Patt. Die Partie endet unentschieden.') : `${color} am Zug${check ? ' · Schach!' : ''}`;
    board.innerHTML = position.board.map((piece, index) => {
      const tile = (Math.floor(index / 8) + index % 8) % 2 === 0 ? 'st-chess-light' : 'st-chess-dark';
      const mark = `${selected === index ? ' st-selected' : ''}${last.includes(index) ? ' st-last' : ''}${moves.includes(index) ? ' st-legal' : ''}`;
      const label = `${sq(index)}${piece ? `, ${isWhite(piece) ? 'weiß' : 'schwarz'} · ${pieceNames[piece.toLowerCase()]}` : ', leer'}${moves.includes(index) ? ', legaler Zug' : ''}`;
      return `<button type="button" class="${tile}${mark}" data-square="${index}" tabindex="${index===keyboardSquare?0:-1}" aria-label="${label}" aria-pressed="${selected === index}">${piece ? `<span aria-hidden="true" class="${isWhite(piece) ? 'st-white-piece' : 'st-black-piece'}">${pieces[piece]}</span>` : ''}${(index % 8 === 0 || index > 55) ? `<small aria-hidden="true">${index % 8 === 0 ? sq(index)[1] : ''}${index > 55 ? sq(index)[0] : ''}</small>` : ''}</button>`;
    }).join('');
    room.querySelector('[data-moves]').innerHTML = history.map(move => `<li>${move.label}</li>`).join('');
    room.querySelector('[data-undo]').disabled = !history.length;
    if (focus >= 0) board.children[focus].focus();
  }
  function reset() {
    current = chessTasks[Number(exercise.value)] || null;
    position = fromFen(current?.fen || start);
    selected = -1;
    keyboardSquare = 0;
    last = [];
    history.length = 0;
    hint.hidden = !current;
    hint.open = false;
    hint.querySelector('p').textContent = current?.hint || '';
    room.querySelector('[data-task]').innerHTML = current ? task(current.title, current.prompt) : '';
    feedback('');
    show();
  }
  board.addEventListener('click', event => {
    const tile = event.target.closest('[data-square]');
    if (!tile) return;
    const to = Number(tile.dataset.square);
    const occupant = position.board[to];
    if (selected !== to && legalMoves(position, selected).includes(to)) {
      const text = `${sq(selected)}${sq(to)}`;
      if (current && !history.length && text !== current.move) {
        feedback('Dieser Zug ist legal. Prüfe, ob er das Ziel der Stellung erreicht.', false);
        return;
      }
      history.push({position,label:`${sq(selected)} – ${sq(to)}`, last});
      position = moved(position, selected, to, room.querySelector('[data-upgrade]').value);
      last = [selected, to];
      selected = -1;
      if (current && history.length === 1) {
        feedback(current.result, true);
        pass(current.id, current.title);
      } else feedback('');
    } else if (occupant && isWhite(occupant) === position.white) {
      selected = selected === to ? -1 : to;
      feedback(selected >= 0 && !legalMoves(position, selected).length ? 'Diese Figur hat in der aktuellen Stellung keinen legalen Zug.' : '');
    } else if (selected >= 0) feedback('Dieses Feld ist für die ausgewählte Figur kein legales Ziel.', false);
    show(to);
  });
  board.addEventListener('keydown', event => {
    const direction = {ArrowUp:[-1,0],ArrowDown:[1,0],ArrowLeft:[0,-1],ArrowRight:[0,1]}[event.key];
    if (!direction) return;
    event.preventDefault();
    const from = Number(event.target.dataset.square);
    const row = Math.floor(from/8)+direction[0];
    const col = from%8+direction[1];
    if (!inside(row,col)) return;
    keyboardSquare=row*8+col;
    event.target.tabIndex=-1;
    board.children[keyboardSquare].tabIndex=0;
    board.children[keyboardSquare].focus();
  });
  listen(room, '[data-exercise]', reset, 'change');
  listen(room, '[data-reset]', reset);
  listen(room, '[data-undo]', () => {
    const previous = history.pop();
    if (!previous) return;
    position = previous.position;
    last = previous.last;
    selected = -1;
    feedback('Zug zurückgenommen.');
    show();
  });
  reset();
}

const codeSamples = {
  html:{label:'HTML · Überschriften',prompt:'Ersetze den Text im Element h1 durch „Mein Hobby“. Ein klarer Seitentitel steht in einer h1.',hint:'Das öffnende und das schließende h1-Tag bleiben stehen.',start:{html:'<main>\n  <h1>Meine Seite</h1>\n  <p>Willkommen in meiner Werkstatt.</p>\n</main>',css:'body { font: 18px system-ui; color: #183624; background: #f5f8ed; }\nmain { padding: 28px; }',js:''}},
  css:{label:'CSS · Gestaltung',prompt:'Gib der Überschrift die Farbe seagreen, indem du die color-Eigenschaft des h1-Selektors änderst.',hint:'Die Regel lautet h1 { color: seagreen; }.',start:{html:'<h1>Mein Garten</h1>\n<p>Ein Platz für neue Ideen.</p>',css:'body { padding: 20px; font: 18px system-ui; }\nh1 { color: gray; }',js:''}},
  js:{label:'JavaScript · Klicks',prompt:'Erhöhe den Zähler bei jedem Klick um eins. Die sichtbare Zahl steht im Element mit der ID count.',hint:'Ändere count += 0 zu count += 1. Lass die Zeile zum Aktualisieren von textContent stehen.',start:{html:'<button id="up">Zählen</button>\n<p>Zähler: <strong id="count">0</strong></p>',css:'body { padding: 20px; font: 18px system-ui; }',js:'let count = 0;\nconst button = document.querySelector("#up");\nconst output = document.querySelector("#count");\n\nbutton.addEventListener("click", () => {\n  count += 0;\n  output.textContent = count;\n});'}},
  project:{label:'Freies Projekt',prompt:'Entwirf eine kleine Seite für ein Hobby. Ergänze einen Titel, eine kurze Beschreibung und eine eigene Gestaltung.',hint:'Beginne mit h1 und p. Gib dem Inhalt anschließend mit CSS Abstände und Farbe.',start:{html:'<main>\n  <h1>Meine Hobbyseite</h1>\n  <p>Hier beginnt mein Projekt.</p>\n</main>',css:'body { padding: 20px; font: 18px system-ui; }',js:''}}
};

function code(room, {feedback,pass}) {
  room.innerHTML = `<div class="st-toolbar"><label>Aufgabe <select data-mode>${Object.entries(codeSamples).map(([id,entry])=>`<option value="${id}">${entry.label}</option>`).join('')}</select></label>${btn('Vorschau starten','data-run','st-primary')}${btn('Lösung prüfen','data-test')}${btn('Code herunterladen','data-export')}</div><div data-task></div><details><summary>Hinweis</summary><p data-hint></p></details><div class="st-code-layout"><div><div class="st-toolbar st-code-tabs" role="group" aria-label="Datei auswählen">${['html','css','js'].map(label=>btn(label.toUpperCase(),`data-file="${label}" aria-pressed="false"`)).join('')}</div><div class="st-code-editor"><pre data-highlight aria-hidden="true"></pre><textarea data-editor aria-label="Quelltext" spellcheck="false" autocapitalize="off"></textarea></div></div><div><p class="st-preview-label">Vorschau</p><iframe title="Isolierte Vorschau des Nutzercodes" sandbox="allow-scripts" referrerpolicy="no-referrer" data-frame></iframe></div></div>${changes()}`;
  const mode = room.querySelector('[data-mode]');
  const editor = room.querySelector('[data-editor]');
  const highlight = room.querySelector('[data-highlight]');
  const frame = room.querySelector('[data-frame]');
  const tabs = room.querySelectorAll('[data-file]');
  let file = 'html';
  let drafts = {};
  let secret = '';
  let testing = false;
  let wait = 0;
  const entries = () => drafts[mode.value];
  function paint() {
    const tokens = editor.value.match(/<!--[\s\S]*?-->|\/\/[^\n]*|\b(?:let|const|if|else|for|return|function|document|color|background|padding|font)\b|<\/?[\w-]+|"[^"\n]*"|'[^'\n]*'|[^]/g) || [];
    highlight.innerHTML = tokens.map(token => token.length > 1 && !/^\s/.test(token) ? `<span class="st-token">${escape(token)}</span>` : escape(token)).join('')+'\n';
    highlight.scrollTop = editor.scrollTop;
    highlight.scrollLeft = editor.scrollLeft;
  }
  function switchTo(next) {
    file = next;
    editor.value = entries()[file];
    editor.setAttribute('aria-label', `Quelltext · ${file.toUpperCase()}`);
    tabs.forEach(tab => tab.setAttribute('aria-pressed', String(tab.dataset.file === file)));
    paint();
  }
  function markup(check = false, source = entries()) {
    const nonce = crypto.getRandomValues(new Uint32Array(4)).join('');
    const safeCss = source.css.replace(/<\/style/gi, '<\\/style');
    if (!check) return `<!doctype html><html lang="de"><meta charset="utf-8"><style>${safeCss}</style>${source.html}<script>${source.js.replace(/<\/script/gi, '<\\/script')}</script>`;
    secret = crypto.getRandomValues(new Uint32Array(4)).join('');
    const bridge = `const send=(result,message)=>parent.postMessage({token:${JSON.stringify(secret)},result,message},'*');\nwindow.addEventListener('error',event=>send('error',event.message));\nwindow.addEventListener('unhandledrejection',event=>send('error',String(event.reason)));`;
    const solutions = {
      html: `document.querySelector('h1')?.textContent.trim() === 'Mein Hobby'`,
      css: `document.querySelector('h1') && getComputedStyle(document.querySelector('h1')).color === 'rgb(46, 139, 87)'`,
      js: `(() => {const up=document.querySelector('#up');const count=document.querySelector('#count');if(!up||!count)return false;up.click();const first=count.textContent.trim();up.click();return first==='1'&&count.textContent.trim()==='2';})()`,
      project: `false`
    };
    const policy = `default-src 'none'; script-src 'nonce-${nonce}'; style-src 'unsafe-inline'; img-src data:; media-src 'none'; connect-src 'none'; frame-src 'none'; object-src 'none'; form-action 'none'; base-uri 'none'`;
    const userCode = source.js.replace(/<\/script/gi,'<\\/script');
    return `<!doctype html><html lang="de"><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="${policy}"><style>${safeCss}</style><script nonce="${nonce}">${bridge}</script>${source.html}<script nonce="${nonce}">${userCode}</script><script nonce="${nonce}">if(${testing && mode.value !== 'project'}){try{send(Boolean(${solutions[mode.value]}));}catch(error){send('error',error.message);}}</script>`;
  }
  function load(isTest = false) {
    testing = isTest;
    clearTimeout(wait);
    frame.srcdoc = markup(true);
    if (testing) {
      feedback('Prüfe die aktuelle Lösung …');
      wait = setTimeout(() => feedback('Die Vorschau hat kein Testergebnis gesendet. Prüfe, ob HTML und JavaScript vollständig sind.', false), 1800);
    } else feedback('');
  }
  function receive(event) {
    if (event.source !== frame.contentWindow || event.origin !== 'null' || event.data?.token !== secret) return;
    if (event.data.result === 'error') {
      clearTimeout(wait);
      feedback(`JavaScript meldet: ${String(event.data.message).slice(0,180)}`, false);
      return;
    }
    if (!testing) return;
    clearTimeout(wait);
    if (event.data.result === true) {
      feedback('Bestanden. Die Vorschau erfüllt die Anforderung.', true);
      pass(`web-${mode.value}`, codeSamples[mode.value].label);
    } else feedback('Der Test schlägt noch fehl. Prüfe die Aufgabenstellung und den Hinweis.', false);
  }
  function choose() {
    const sample = codeSamples[mode.value];
    if (!drafts[mode.value]) drafts[mode.value] = {...sample.start};
    room.querySelector('[data-task]').innerHTML = task(sample.label, sample.prompt);
    room.querySelector('[data-hint]').textContent = sample.hint;
    room.querySelector('[data-test]').disabled = mode.value === 'project';
    switchTo(mode.value === 'project' ? 'html' : mode.value);
    load();
  }
  window.addEventListener('message', receive);
  listen(room,'[data-mode]',choose,'change');
  listen(room,'[data-file]', event => switchTo(event.currentTarget.dataset.file));
  listen(room,'[data-run]',()=>load());
  listen(room,'[data-test]',()=>load(true));
  listen(room,'[data-export]',()=>download('hobbymaxing-projekt.html',new Blob([markup(false)],{type:'text/html;charset=utf-8'})));
  editor.addEventListener('input', () => {entries()[file] = editor.value; paint();});
  editor.addEventListener('scroll', paint);
  choose();
  return () => {window.removeEventListener('message',receive);clearTimeout(wait);frame.srcdoc='';};
}

function download(filename, blob) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}

const noteNames = ['C','Cis','D','Dis','E','F','Fis','G','Gis','A','Ais','H'];
const noteName = midi => `${noteNames[midi % 12]}${Math.floor(midi / 12) - 1}`;
const instruments = {
  piano:{name:'Klavier',notes:[60,61,62,63,64,65,66,67,68,69,70,71,72]},
  guitar:{name:'Gitarre',notes:[40,45,50,55,59,64]},
  violin:{name:'Geige',notes:[55,62,69,76]}
};
const earTasks = [
  {id:'music-pitch',title:'Tonhöhe vergleichen',notes:[60,67],prompt:'Wie verändert sich die Tonhöhe vom ersten zum zweiten Ton?',choices:['Sie sinkt.', 'Sie steigt.', 'Sie bleibt gleich.'],answer:1,reason:'G4 liegt sieben Halbtöne über C4.'},
  {id:'music-interval',title:'Intervalle erkennen',notes:[60,67],prompt:'Zähle die Halbtonschritte. Welches Intervall hörst du?',choices:['Große Terz (4)', 'Reine Quinte (7)', 'Oktave (12)'],answer:1,reason:'Sieben Halbtonschritte ergeben eine reine Quinte.'},
  {id:'music-chord',title:'Einen Akkord erkennen',notes:[60,64,67],prompt:'Welche Qualität hat C–E–G?',choices:['Dur', 'Moll', 'Vermindert'],answer:0,reason:'C–E ist eine große Terz, E–G eine kleine Terz. So entsteht ein Dur-Dreiklang.',simultaneous:true}
];

function music(room, {feedback,pass,audioEnabled}) {
  room.innerHTML = `<div class="st-toolbar"><label>Instrument <select data-instrument>${Object.entries(instruments).map(([id,x])=>`<option value="${id}">${x.name}</option>`).join('')}</select></label><label for="st-tempo">Tempo <output data-tempo-label>90 BPM</output><input id="st-tempo" type="range" min="45" max="150" value="90" step="1" data-tempo></label>${btn('Metronom starten','data-metronome aria-pressed="false"')}</div><div data-instrument-body></div><div class="st-staff" aria-label="Notensystem mit C, D, E, F, G, A und H"><div class="st-staff-lines" aria-hidden="true"></div><span class="st-clef" aria-hidden="true">𝄞</span><div class="st-staff-notes">${[60,62,64,65,67,69,71].map((n,i)=>`<button type="button" data-note="${n}" style="--note-step:${i}" aria-label="${noteName(n)} auf dem Notensystem"><i aria-hidden="true"></i><small aria-hidden="true">${noteNames[n % 12]}</small></button>`).join('')}</div></div><div class="st-work-grid"><div class="st-panel" data-ear></div><div class="st-panel"><h3>Rhythmus klopfen</h3><p>Tippe viermal gleichmäßig. Das Ziel ist eine Viertelnote pro Schlag im gewählten Tempo. Der Balken zeigt den aktuellen Puls.</p><div class="st-beats" data-beats aria-hidden="true"><i></i><i></i><i></i><i></i></div><div class="st-toolbar">${btn('Schlag','data-tap','st-primary')}${btn('Neu zählen','data-clear-tap')}</div></div></div><div class="st-panel st-seq"><h3>Eine Melodie setzen</h3><p>Wähle Töne für acht Positionen. Aktiviere mehrere Töne in einer Spalte, um einen Akkord zu hören.</p><div class="st-seq-grid" data-sequence></div><div class="st-toolbar">${btn('Melodie spielen','data-play-sequence')}${btn('Leeren','data-clear-sequence')}</div></div>${changes()}`;
  let audio;
  let soundType = 'sine';
  let metronome = 0;
  let beat = -1;
  let sequenceTimers = [];
  let taps = [];
  let earIndex = 0;
  if (!audioEnabled) room.insertAdjacentHTML('afterbegin','<p class="st-caption">Die Tonwiedergabe ist in deinen Einstellungen ausgeschaltet. Die Notennamen, der visuelle Puls und die Aufgabenalternativen sind verfügbar.</p>');
  const tempo = room.querySelector('[data-tempo]');
  const beatDots = room.querySelector('[data-beats]').children;
  function play(midi, offset = 0, duration = .33, type = soundType) {
    if (!audioEnabled) return;
    try {
      const Audio = window.AudioContext || window.webkitAudioContext;
      if (!Audio) throw new Error('Kein Audio');
      audio ??= new Audio();
      if (audio.state === 'suspended') audio.resume().catch(()=>{});
      if (audio.state === 'closed') return;
      const oscillator = audio.createOscillator();
      const gain = audio.createGain();
      const begin = audio.currentTime + offset;
      oscillator.type = type;
      oscillator.frequency.value = 440 * 2 ** ((midi - 69) / 12);
      gain.gain.setValueAtTime(.0001, begin);
      gain.gain.exponentialRampToValueAtTime(.14, begin + .019);
      gain.gain.exponentialRampToValueAtTime(.0001, begin + duration);
      oscillator.connect(gain).connect(audio.destination);
      oscillator.start(begin);
      oscillator.stop(begin + duration + .01);
    } catch {
      feedback('Ton ist gerade nicht verfügbar. Die Notennamen und der visuelle Puls bleiben nutzbar.');
    }
  }
  function drawInstrument() {
    const id = room.querySelector('[data-instrument]').value;
    const instrument = instruments[id];
    soundType = id === 'guitar' ? 'triangle' : id === 'violin' ? 'sawtooth' : 'sine';
    const body = room.querySelector('[data-instrument-body]');
    if (id === 'piano') {
      const keys = instrument.notes.map(note => {
        const offsets = {61:1,63:2,66:4,68:5,70:6};
        const black = Object.hasOwn(offsets,note);
        return `<button type="button" data-note="${note}" class="${black ? 'st-key-black' : 'st-key-white'}" ${black ? `style="--st-key-position:${offsets[note]*12.5}%"` : ''} aria-label="Ton ${noteName(note)}">${noteNames[note % 12]}</button>`;
      });
      body.innerHTML = `<div class="st-piano" aria-label="Virtuelles Klavier"><div class="st-piano-keys">${keys.join('')}</div></div>`;
    } else {
      body.innerHTML = `<div class="st-frets" aria-label="Virtuelles ${instrument.name}-Griffbrett">${[...instrument.notes].reverse().map((open,index) => `<div class="st-fret-row"><strong>Saite ${index+1} · ${noteName(open)}</strong>${Array.from({length:6},(_,fret)=>`<button type="button" data-note="${open+fret}" aria-label="Saite ${index+1}, ${fret === 0 ? 'leer' : `${fret}. Halbtonschritt`}, ${noteName(open+fret)}">${fret === 0 ? 'Leer' : fret}</button>`).join('')}</div>`).join('')}</div>`;
    }
  }
  function tick() {
    beat = (beat + 1) % 4;
    Array.from(beatDots).forEach((dot,index)=>dot.classList.toggle('st-lit',index === beat));
    play(beat === 0 ? 93 : 84,0,.1,'triangle');
  }
  function metro(enabled) {
    clearInterval(metronome);
    metronome = 0;
    const button = room.querySelector('[data-metronome]');
    button.setAttribute('aria-pressed',String(enabled));
    const label = audioEnabled ? 'Metronom' : 'Visuellen Puls';
    button.textContent = enabled ? `${label} stoppen` : `${label} starten`;
    if (enabled) {
      tick();
      metronome = setInterval(tick,60000/Number(tempo.value));
    } else Array.from(beatDots).forEach(dot=>dot.classList.remove('st-lit'));
  }
  function drawEar() {
    const study = earTasks[earIndex];
    room.querySelector('[data-ear]').innerHTML = `<h3>${study.title}</h3><p>${study.prompt}</p><div class="st-toolbar">${btn('Abspielen',audioEnabled?'data-play-ear':'data-play-ear disabled','st-primary')}${btn('Andere Aufgabe','data-next-ear')}</div><details ${audioEnabled?'':'open'}><summary>Visuelle Alternative</summary><p>${study.notes.map(note => `${noteName(note)} (${note})`).join(' · ')}. Die Zahlen geben die Halbtonpositionen an.</p></details><div class="st-toolbar st-ear-answers">${study.choices.map((label,index)=>btn(label,`data-ear-answer="${index}"`)).join('')}</div>`;
  }
  const seqNotes = [72,69,67,64,62,60];
  const sequence = room.querySelector('[data-sequence]');
  sequence.innerHTML = seqNotes.map(note=>`<span>${noteName(note)}</span>${Array.from({length:8},(_,column)=>`<button type="button" data-seq-cell data-column="${column}" data-midi="${note}" aria-pressed="false" aria-label="${noteName(note)}, Position ${column+1}"></button>`).join('')}`).join('');
  room.addEventListener('click', event => {
    const target = event.target.closest('button');
    if (!target) return;
    if (target.matches('[data-note]')) {
      const note = Number(target.dataset.note);
      if(audioEnabled)play(note);
      else feedback(`Ausgewählter Ton: ${noteName(note)}.`);
    }
    if (target.matches('[data-play-ear]')) earTasks[earIndex].notes.forEach((note,index)=>play(note,earTasks[earIndex].simultaneous ? 0 : index*.48,.4,'sine'));
    if (target.matches('[data-next-ear]')) {earIndex = (earIndex + 1) % earTasks.length; drawEar(); feedback(''); room.querySelector('[data-next-ear]').focus();}
    if (target.matches('[data-ear-answer]')) {
      const study = earTasks[earIndex];
      if (Number(target.dataset.earAnswer) === study.answer) {feedback(study.reason,true); pass(study.id,study.title);}
      else feedback('Höre noch einmal hin oder nutze die visuelle Alternative. Entscheidend sind die Abstände zwischen den Tönen.',false);
    }
    if (target.matches('[data-seq-cell]')) {
      const activate = target.getAttribute('aria-pressed') === 'false';
      target.setAttribute('aria-pressed',String(activate));
      if (activate) play(Number(target.dataset.midi));
    }
    if (target.matches('[data-clear-sequence]')) sequence.querySelectorAll('button').forEach(cell=>cell.setAttribute('aria-pressed','false'));
    if (target.matches('[data-play-sequence]')) {
      sequenceTimers.forEach(clearTimeout);
      const duration = 60/Number(tempo.value);
      const selected = [...sequence.querySelectorAll('[aria-pressed="true"]')];
      if (!selected.length) {feedback('Setze zuerst mindestens einen Ton.'); return;}
      selected.forEach(cell=>play(Number(cell.dataset.midi), Number(cell.dataset.column)*duration, Math.min(.5,duration*.9)));
      sequenceTimers = Array.from({length:9},(_,column)=>setTimeout(()=>{
        sequence.querySelectorAll('button').forEach(cell=>cell.classList.toggle('st-seq-now',Number(cell.dataset.column) === column));
      },column*duration*1000));
      if (new Set(selected.map(cell=>cell.dataset.column)).size >= 4 && new Set(selected.map(cell=>cell.dataset.midi)).size >= 3) {
        feedback('Deine Melodie verwendet mindestens drei Töne an vier Positionen.',true);
        pass('music-melody','Eine Melodie setzen');
      }
    }
    if (target.matches('[data-metronome]')) metro(!metronome);
    if (target.matches('[data-clear-tap]')) {taps = [];feedback('Tippe vier Schläge.');}
    if (target.matches('[data-tap]')) {
      const now = performance.now();
      if (taps.length === 4 || (taps.length && now - taps.at(-1) > 2500)) taps = [];
      taps.push(now);
      if (taps.length < 4) {feedback(`${taps.length} von 4 Schlägen.`); return;}
      const expected = 60000/Number(tempo.value);
      const intervals = taps.slice(1).map((time,index)=>time-taps[index]);
      const maxDrift = Math.max(...intervals.map(length=>Math.abs(length-expected)));
      if (maxDrift <= expected*.28) {feedback('Deine vier Schläge liegen gleichmäßig im gewählten Tempo.',true);pass('music-rhythm','Vier gleichmäßige Viertelnoten');}
      else feedback(`Ziel: etwa ${Math.round(expected)} ms Abstand pro Schlag. Deine Abstände lagen bei ${intervals.map(x=>Math.round(x)).join(', ')} ms.`,false);
    }
  });
  tempo.addEventListener('input',()=>{room.querySelector('[data-tempo-label]').textContent=`${tempo.value} BPM`;if(metronome)metro(true);});
  listen(room,'[data-instrument]',drawInstrument,'change');
  if (!audioEnabled) {
    metro(false);
    room.querySelector('[data-play-sequence]').textContent='Melodie visualisieren';
  }
  drawInstrument();
  drawEar();
  return () => {clearInterval(metronome); sequenceTimers.forEach(clearTimeout); if (audio && audio.state !== 'closed') audio.close().catch(()=>{});};
}

function drawing(room, {feedback,pass}) {
  room.innerHTML = `${task('Formen mit Licht und Schatten','Zeichne einen Körper und ergänze einen dunkleren Schatten auf der dem Licht abgewandten Seite. Probiere die Vorlage mit Licht von links oben.')}
  <div class="st-toolbar"><label>Werkzeug <select data-tool><option value="pen">Stift</option><option value="brush">Pinsel</option><option value="erase">Radierer</option><option value="line">Gerade</option><option value="rect">Rechteck</option><option value="ellipse">Ellipse</option></select></label><label>Farbe <input type="color" value="#246348" data-color></label><label>Breite <input type="range" min="1" max="34" value="5" data-size></label><label>Vorlage <select data-guide><option value="none">Blanko</option><option value="forms">Körper &amp; Licht</option><option value="perspective">Fluchtpunkt</option><option value="grid">Raster</option></select></label><label>Ebene <select data-layer><option value="0">Skizze</option><option value="1">Details</option></select></label></div>
  <div class="st-canvas-wrap" data-canvas-wrap><canvas width="800" height="480" data-guide-canvas aria-hidden="true"></canvas><canvas width="800" height="480" data-ink tabindex="0" aria-label="Zeichenfläche. Pfeiltasten verschieben die Position. Leertaste setzt oder löst den Stift."></canvas></div><p class="st-caption">Tastatur: Pfeiltasten bewegen den Cursor um 12 Pixel. Leertaste setzt den Stift auf oder hebt ihn an.</p>
  <div class="st-toolbar">${btn('Rückgängig','data-undo')}${btn('Wiederholen','data-redo')}${btn('Ebene leeren','data-clear')}${btn('PNG exportieren','data-export','st-primary')}</div>
  <fieldset class="st-panel"><legend>Selbstcheck · Licht und Schatten</legend><label><input type="checkbox" data-check> Ich habe einen klar erkennbaren Körper gezeichnet.</label><label><input type="checkbox" data-check> Der stärkste Schatten liegt gegenüber der Lichtquelle.</label><label><input type="checkbox" data-check> Ich habe helle und dunkle Werte verglichen.</label>${btn('Praxis dokumentieren','data-finish')}</fieldset>${changes()}`;
  const surface = room.querySelector('[data-ink]');
  const guide = room.querySelector('[data-guide-canvas]');
  const guideCtx = guide.getContext('2d');
  const display = surface.getContext('2d');
  const layers = Array.from({length:2},()=>Object.assign(document.createElement('canvas'),{width:800,height:480}));
  let active = 0;
  const undo = [];
  const redo = [];
  const width = surface.width;
  const height = surface.height;
  let currentStroke = null;
  let lastPoint = {x:400,y:240};
  let keyboard = false;
  let markCount = 0;
  const keyboardCursor = document.createElement('div');
  keyboardCursor.className = 'st-canvas-cursor';
  keyboardCursor.hidden = true;
  room.querySelector('[data-canvas-wrap]').append(keyboardCursor);
  const context = () => layers[active].getContext('2d');
  const drawAll = () => {
    display.clearRect(0,0,width,height);
    layers.forEach(layer=>display.drawImage(layer,0,0));
  };
  const snapshot = () => ({active,data:context().getImageData(0,0,width,height),markCount});
  function commit(before) {
    undo.push(before);
    if (undo.length > 14) undo.shift();
    redo.length = 0;
    updateControls();
  }
  function updateControls() {
    room.querySelector('[data-undo]').disabled = !undo.length;
    room.querySelector('[data-redo]').disabled = !redo.length;
  }
  function restore(from,to) {
    const entry = from.pop();
    if (!entry) return;
    active = entry.active;
    room.querySelector('[data-layer]').value = String(active);
    to.push(snapshot());
    markCount = entry.markCount;
    context().putImageData(entry.data,0,0);
    drawAll();
    updateControls();
  }
  function drawGuide() {
    const selected = room.querySelector('[data-guide]').value;
    guideCtx.clearRect(0,0,width,height);
    guideCtx.strokeStyle = '#42797385'; guideCtx.fillStyle = '#205e57'; guideCtx.lineWidth = 2;
    guideCtx.setLineDash([8,6]);
    if (selected === 'grid') {
      for (let x=40;x<width;x+=40) {guideCtx.beginPath();guideCtx.moveTo(x,0);guideCtx.lineTo(x,height);guideCtx.stroke();}
      for (let y=40;y<height;y+=40) {guideCtx.beginPath();guideCtx.moveTo(0,y);guideCtx.lineTo(width,y);guideCtx.stroke();}
    }
    if (selected === 'forms') {
      guideCtx.strokeRect(240,158,176,165);
      guideCtx.beginPath();guideCtx.ellipse(575,246,76,76,0,0,Math.PI*2);guideCtx.stroke();
      guideCtx.font='22px system-ui';guideCtx.fillText('Licht von links oben',50,70);guideCtx.beginPath();guideCtx.moveTo(100,90);guideCtx.lineTo(225,155);guideCtx.stroke();
    }
    if (selected === 'perspective') {
      guideCtx.beginPath();guideCtx.moveTo(0,199);guideCtx.lineTo(width,199);guideCtx.stroke();
      for (const x of [0,180,370,590,800]) {guideCtx.beginPath();guideCtx.moveTo(430,199);guideCtx.lineTo(x,height);guideCtx.stroke();}
      guideCtx.beginPath();guideCtx.arc(430,199,5,0,Math.PI*2);guideCtx.fill();
    }
  }
  function position(event) {
    const rect = surface.getBoundingClientRect();
    return {x:(event.clientX-rect.left)*width/rect.width,y:(event.clientY-rect.top)*height/rect.height};
  }
  function strokePoint(a,b, tool) {
    const ctx = context();
    ctx.save();
    ctx.globalCompositeOperation = tool === 'erase' ? 'destination-out' : 'source-over';
    ctx.strokeStyle = room.querySelector('[data-color]').value;
    ctx.lineWidth = Number(room.querySelector('[data-size]').value) * (tool === 'brush' ? 1.8 : 1);
    ctx.globalAlpha = tool === 'brush' ? .45 : 1;
    ctx.lineJoin = 'round';ctx.lineCap='round';ctx.beginPath();
    if (tool === 'rect') ctx.rect(a.x,a.y,b.x-a.x,b.y-a.y);
    else if (tool === 'ellipse') ctx.ellipse((a.x+b.x)/2,(a.y+b.y)/2,Math.abs(a.x-b.x)/2,Math.abs(a.y-b.y)/2,0,0,Math.PI*2);
    else {ctx.moveTo(a.x,a.y);ctx.lineTo(b.x === a.x && b.y === a.y ? b.x+.001 : b.x,b.y);}
    ctx.stroke();ctx.restore();drawAll();
  }
  function begin(point) {
    const tool = room.querySelector('[data-tool]').value;
    currentStroke = {a:point,b:point,tool,before:snapshot(),shape:['line','rect','ellipse'].includes(tool)};
    if (!currentStroke.shape) strokePoint(point,point,tool);
  }
  function paint(point) {
    if (!currentStroke) return;
    if (currentStroke.shape) context().putImageData(currentStroke.before.data,0,0);
    strokePoint(currentStroke.shape?currentStroke.a:currentStroke.b,point,currentStroke.tool);
    currentStroke.b = point;
  }
  function end() {
    if (!currentStroke) return;
    if (currentStroke.tool !== 'erase' && (!currentStroke.shape || currentStroke.a !== currentStroke.b)) markCount++;
    commit(currentStroke.before);
    currentStroke = null;
  }
  surface.addEventListener('pointerdown',event=>{if(event.button !== 0)return;end();keyboard=false;keyboardCursor.hidden=true;surface.setPointerCapture(event.pointerId);begin(position(event));});
  surface.addEventListener('pointermove',event=>{if(surface.hasPointerCapture(event.pointerId))paint(position(event));});
  surface.addEventListener('lostpointercapture',end);
  surface.addEventListener('blur',()=>{end();keyboard=false;keyboardCursor.hidden=true;});
  surface.addEventListener('keydown',event=>{
    const movement = {ArrowLeft:[-12,0],ArrowRight:[12,0],ArrowUp:[0,-12],ArrowDown:[0,12]}[event.key];
    if (!movement && event.key !== ' ') return;
    event.preventDefault();
    keyboardCursor.hidden = false;
    if (movement) {
      lastPoint = {x:Math.max(0,Math.min(width,lastPoint.x+movement[0])),y:Math.max(0,Math.min(height,lastPoint.y+movement[1]))};
      if (keyboard) paint(lastPoint);
    } else {keyboard = !keyboard;if(keyboard)begin(lastPoint);else end();}
    keyboardCursor.style.left = `${lastPoint.x*100/width}%`;keyboardCursor.style.top = `${lastPoint.y*100/height}%`;
  });
  listen(room,'[data-guide]',drawGuide,'change');
  listen(room,'[data-layer]',event=>{end();active=Number(event.currentTarget.value);},'change');
  listen(room,'[data-undo]',()=>restore(undo,redo));
  listen(room,'[data-redo]',()=>restore(redo,undo));
  listen(room,'[data-clear]',()=>{commit(snapshot());context().clearRect(0,0,width,height);if(!layers.some(layer=>layer.getContext('2d').getImageData(0,0,width,height).data.some((p,i)=>i%4===3&&p)))markCount=0;drawAll();});
  listen(room,'[data-export]',()=>surface.toBlob(blob=>{if(blob)download('hobbymaxing-skizze.png',blob);},'image/png'));
  listen(room,'[data-finish]',()=>{
    if (!markCount || [...room.querySelectorAll('[data-check]')].some(check=>!check.checked)) {feedback('Zeichne zuerst und überprüfe anschließend alle drei Kriterien.',false);return;}
    feedback('Dein Selbstcheck wurde als praktische Übung dokumentiert.',true);
    pass('practice-drawing-light','Praxis-Selbstcheck · Licht und Schatten');
  });
  updateControls();
}

const cameraOptions = [
  {id:'aperture',name:'Blende',values:[2.8,4,5.6,8,11,16],start:3,format:value=>`f/${value.toLocaleString('de-DE')}`},
  {id:'shutter',name:'Verschlusszeit',values:[15,30,60,125,250,500,1000],start:2,format:value=>`1/${value} s`},
  {id:'iso',name:'ISO',values:[100,200,400,800,1600,3200],start:2,format:value=>`${value}`},
  {id:'zoom',name:'Brennweite',values:[24,28,35,50,70,85],start:2,format:value=>`${value} mm`},
  {id:'temp',name:'Weißabgleich',values:[3200,4200,5500,6500,7500],start:2,format:value=>`${value} K`},
  {id:'crop',name:'Bildmitte horizontal',values:[-20,-10,0,10,20],start:2,format:value=>`${value}%`}
];

function camera(room, {feedback,pass}) {
  room.innerHTML = `${task('Bewegung einfrieren','Wähle 1/500 s oder kürzer und gleiche den Lichtverlust aus. Halte die simulierte Belichtung im Bereich von −1 bis +1 EV.')}<div class="st-camera-layout"><div><div class="st-camera-preview" data-scene role="img" aria-label="Illustration eines Radfahrers vor einer Berglandschaft"><div class="st-camera-inner"><div class="st-camera-bg"><span class="st-photo-sun"></span><span class="st-photo-mountain m1"></span><span class="st-photo-mountain m2"></span><span class="st-photo-mountain m3"></span><span class="st-photo-forest"></span><span class="st-photo-road"></span></div><div class="st-bike" aria-hidden="true"><span></span><span></span><i></i><b></b><em></em></div></div><div class="st-camera-noise" aria-hidden="true"></div><div class="st-camera-thirds" aria-hidden="true"></div></div><p class="st-caption">Vereinfachtes Lernmodell mit digitaler Illustration. Schärfentiefe und Rauschen werden angenähert.</p><p data-metrics></p></div><div class="st-panel st-camera-controls">${cameraOptions.map(option=>`<label for="st-camera-${option.id}">${option.name} <output data-value="${option.id}"></output><input id="st-camera-${option.id}" type="range" min="0" max="${option.values.length-1}" value="${option.start}" data-camera="${option.id}"></label>`).join('')}<label><input type="checkbox" data-thirds> Drittelraster einblenden</label><div class="st-toolbar">${btn('Aufnahme prüfen','data-check','st-primary')}${btn('Zurücksetzen','data-reset')}</div></div></div>${changes()}`;
  const scene = room.querySelector('[data-scene]');
  function settings() {
    return Object.fromEntries(cameraOptions.map(x=>[x.id,x.values[Number(room.querySelector(`[data-camera="${x.id}"]`).value)]]));
  }
  function ev({aperture,shutter,iso}) {
    return Math.log2((8/aperture)**2*(60/shutter)*(iso/400));
  }
  function paint() {
    const chosen = settings();
    cameraOptions.forEach(x=>room.querySelector(`[data-value="${x.id}"]`).textContent=x.format(chosen[x.id]));
    const exposure = ev(chosen);
    const depth = Math.max(0,(8-chosen.aperture)*.52*(chosen.zoom/35));
    const blur = Math.min(9,140/chosen.shutter);
    scene.style.setProperty('--st-bright',String(Math.max(.13,Math.min(2.5,2**(exposure*.48)))));
    scene.style.setProperty('--st-depth',`${depth}px`);
    scene.style.setProperty('--st-subject-blur',`${blur}px`);
    scene.style.setProperty('--st-noise',String(.03+Math.log2(chosen.iso/100)*.045));
    scene.style.setProperty('--st-zoom',String(.9+(chosen.zoom-24)/68));
    scene.style.setProperty('--st-crop',`${chosen.crop}%`);
    scene.style.setProperty('--st-temperature',`${(chosen.temp-5500)/120}deg`);
    scene.classList.toggle('st-show-thirds',room.querySelector('[data-thirds]').checked);
    const depthLabel = depth > 2 ? 'gering' : 'groß';
    const motion = blur > 1 ? 'sichtbar verwischt' : 'weitgehend eingefroren';
    room.querySelector('[data-metrics]').textContent=`Belichtung ${exposure.toLocaleString('de-DE',{maximumFractionDigits:1,signDisplay:'always'})} EV · Schärfentiefe ${depthLabel} · Bewegung ${motion}`;
  }
  listen(room,'[data-camera], [data-thirds]',paint,'input');
  listen(room,'[data-reset]',()=>{cameraOptions.forEach(x=> room.querySelector(`[data-camera="${x.id}"]`).value=x.start);paint();feedback('');});
  listen(room,'[data-check]',()=>{
    const chosen = settings();
    if (chosen.shutter < 500) {feedback('Die Zeit ist noch zu lang. Erhöhe den Nenner der Verschlusszeit auf 500 oder mehr.',false);return;}
    if (Math.abs(ev(chosen)) > 1) {feedback('Die Bewegung ist scharf. Öffne bei Unterbelichtung die Blende oder erhöhe ISO. Drehe diese Änderungen bei Überbelichtung um.',false);return;}
    feedback('Du hast die Bewegung eingefroren und die Helligkeit passend ausgeglichen.',true);
    pass('camera-motion','Bewegung durch kurze Belichtungszeit einfrieren');
  });
  paint();
}

const sudokuPuzzles = [
  {name:'Ausschluss im kleinen Raster',size:4,box:2,givens:'1004041221004020',answer:'1234341221434321'},
  {name:'Klassisches Sudoku',size:9,box:3,givens:'530070000600195000098000060800060003400803001700020006060000280000419005000080079',answer:'534678912672195348198342567859761423426853791713924856961537284287419635345286179'}
];

function sudoku(room, {feedback,pass}) {
  room.innerHTML = `${task('Ziffern ohne Wiederholung','Jede Ziffer kommt in jeder Zeile, jeder Spalte und jedem umrandeten Block genau einmal vor. Beginne bei einer Reihe mit möglichst vielen Vorgaben.')}<div class="st-toolbar"><label>Raster <select data-puzzle>${sudokuPuzzles.map((x,i)=>`<option value="${i}">${x.name}</option>`).join('')}</select></label>${btn('Prüfen','data-check','st-primary')}${btn('Hinweis','data-hint')}${btn('Neu beginnen','data-reset')}</div><div class="st-sudoku" data-puzzle-board></div>${changes()}`;
  const board = room.querySelector('[data-puzzle-board]');
  const select = room.querySelector('[data-puzzle]');
  let usedHint = false;
  const puzzle = () => sudokuPuzzles[Number(select.value)];
  const inputs = () => [...board.querySelectorAll('input')];
  function reset() {
    const puzzleData = puzzle();
    usedHint = false;
    board.style.setProperty('--st-board-size',String(puzzleData.size));
    board.innerHTML = [...puzzleData.givens].map((digit,i)=>{
      const row = Math.floor(i/puzzleData.size);
      const column = i%puzzleData.size;
      const classes = `${row && row % puzzleData.box === 0 ? 'st-block-top' : ''} ${column && column % puzzleData.box === 0 ? 'st-block-left' : ''}`;
      return `<input class="${classes}" aria-label="Zeile ${row+1}, Spalte ${column+1}${digit === '0' ? '' : ', Vorgabe'}" inputmode="numeric" pattern="[1-${puzzleData.size}]" maxlength="1" ${digit === '0' ? '' : `value="${digit}" readonly`}>`;
    }).join('');
    feedback('');
  }
  board.addEventListener('input',event=>{
    if (!event.target.matches('input')) return;
    event.target.value = event.target.value.replace(new RegExp(`[^1-${puzzle().size}]`,'g'),'');
    event.target.removeAttribute('aria-invalid');
  });
  board.addEventListener('keydown',event=>{
    const delta = {ArrowDown:puzzle().size,ArrowUp:-puzzle().size,ArrowLeft:-1,ArrowRight:1}[event.key];
    if (delta === undefined) return;
    event.preventDefault();
    board.children[[...board.children].indexOf(event.target)+delta]?.focus();
  });
  listen(room,'[data-check]',()=>{
    const wrong = [];
    let empty = 0;
    inputs().forEach((cell,index)=>{
      const mismatch = cell.value && cell.value !== puzzle().answer[index];
      if(mismatch) {wrong.push(cell);cell.setAttribute('aria-invalid','true');}
      if(!cell.value)empty++;
    });
    if (wrong.length) {feedback(`${wrong.length} ${wrong.length === 1 ? 'Ziffer stimmt' : 'Ziffern stimmen'} noch nicht. Überprüfe die markierten Felder.`,false);wrong[0].focus();}
    else if (empty) feedback(`${empty} ${empty===1?'Feld fehlt':'Felder fehlen'}. Alle eingetragenen Ziffern stimmen bislang.`,false);
    else {feedback(usedHint?'Richtig gelöst mit Hinweis.':'Richtig gelöst. Jede Ziffer steht einmal pro Zeile, Spalte und Block.',true);pass(`sudoku-grid-${puzzle().size}`,`Ein ${puzzle().size}×${puzzle().size}-Sudoku lösen`);}
  });
  listen(room,'[data-hint]',()=>{
    const index = inputs().findIndex((cell,i)=>!cell.readOnly && cell.value!==puzzle().answer[i]);
    if(index < 0){feedback('Alle Felder sind bereits korrekt.');return;}
    const size = puzzle().size;
    const row = Math.floor(index/size);
    const col = index%size;
    feedback(`Sieh dir Zeile ${row+1}, Spalte ${col+1} an. Dort gehört eine ${puzzle().answer[index]} hin. Prüfe, wo die übrigen Ziffern in Zeile, Spalte oder Block stehen.`);
    usedHint = true;
    inputs()[index].focus();
  });
  listen(room,'[data-puzzle]',reset,'change');listen(room,'[data-reset]',reset);reset();
}

const rgbFromHex = hex => hex.slice(1).match(/.{2}/g).map(channel=>parseInt(channel,16)/255);
const luminance = hex => rgbFromHex(hex).map(value=>value <= .04045 ? value / 12.92 : ((value+.055)/1.055)**2.4).reduce((sum,color,index)=>sum+color*[.2126,.7152,.0722][index],0);
const contrast = (a,b) => {
  const colors = [luminance(a),luminance(b)].sort((lhs,rhs)=>rhs-lhs);
  return (colors[0]+.05)/(colors[1]+.05);
};

function design(room, {feedback,pass}) {
  room.innerHTML = `${task('Lesbare Hierarchie gestalten','Gestalte eine Einladung. Hebe die Überschrift deutlich von der Beschreibung ab und erreiche mindestens 4,5:1 Kontrast zwischen Text und Hintergrund.')}<div class="st-camera-layout"><div><div class="st-design-preview" data-comparison><article data-reference><p>Vorher</p><div><strong>Offenes Atelier</strong><span>Samstag im Stadtgarten</span><small>Details ansehen</small></div></article><article><p>Dein Entwurf</p><div data-card-preview><strong>Offenes Atelier</strong><span>Samstag im Stadtgarten</span><small>Details ansehen</small></div></article></div><p data-result></p></div><div class="st-panel st-camera-controls"><label>Text <input type="color" value="#777a74" data-fg></label><label>Hintergrund <input type="color" value="#bfbfb4" data-bg></label><label>Schriftfamilie <select data-font><option value="system-ui">Sans Serif</option><option value="Georgia,serif">Serif</option><option value="monospace">Monospace</option></select></label><label>Überschrift <output data-size-label></output><input type="range" min="16" max="42" value="18" data-size></label><label>Weißraum <input type="range" min="12" max="45" value="20" data-padding></label><label>Ausrichtung <select data-align><option value="left">Links</option><option value="center">Mittig</option><option value="right">Rechts</option></select></label><label><input type="checkbox" data-compare checked> Vorher-Vergleich zeigen</label>${btn('Entwurf prüfen','data-check','st-primary')}</div></div>${changes()}`;
  const input = id => room.querySelector(`[data-${id}]`);
  const card = input('card-preview');
  function ratio() { return contrast(input('fg').value,input('bg').value); }
  function paint() {
    card.style.color = input('fg').value;
    card.style.background = input('bg').value;
    card.style.fontFamily = input('font').value;
    card.style.textAlign = input('align').value;
    card.style.padding = `${input('padding').value}px`;
    card.querySelector('strong').style.fontSize=`${input('size').value}px`;
    input('size-label').textContent=`${input('size').value} px`;
    input('reference').hidden = !input('compare').checked;
    input('result').textContent=`Kontrast ${ratio().toLocaleString('de-DE',{maximumFractionDigits:2})}:1`;
  }
  listen(room,'input, select',paint,'input');
  listen(room,'[data-check]',()=>{
    if(ratio()<4.5){feedback('Der Textkontrast liegt unter 4,5:1. Probiere dunkleren Text oder einen helleren Hintergrund.',false);return;}
    if(Number(input('size').value)<24){feedback('Der Textkontrast passt. Vergrößere jetzt die Überschrift auf mindestens 24 px, damit sie sich deutlich von der Beschreibung abhebt.',false);return;}
    feedback('Der Text ist kontrastreich und die Überschrift hebt sich klar ab.',true);pass('design-contrast','Lesbare Hierarchie und ausreichenden Textkontrast gestalten');
  });
  paint();
}

const clipLibrary = {
  wide:{name:'Garten von außen',duration:4,type:'Totale',symbol:'▰'},
  action:{name:'Pflanze eintopfen',duration:5,type:'Halbnah',symbol:'◈'},
  detail:{name:'Erde zwischen den Fingern',duration:3,type:'Detail',symbol:'✦'},
  end:{name:'Die Pflanze steht am Fenster',duration:4,type:'Schlussbild',symbol:'◒'}
};

function timeline(room, {feedback,pass}) {
  let order = ['detail','end','wide','action'];
  let selected = 'wide';
  let motion = 0;
  let drag = '';
  const trims = Object.fromEntries(Object.entries(clipLibrary).map(([id,x])=>[id,x.duration]));
  room.innerHTML = `${task('Eine Handlung montieren','Zeige zuerst den Ort, dann das Eintopfen, anschließend das Detail und zuletzt das Ergebnis. Ordne die Clips mit den Tasten oder ziehe sie aufeinander.')}<div class="st-edit-preview" data-cut-preview><span data-clip-symbol></span><p data-clip-caption></p></div><div class="st-toolbar">${btn('Abspielen','data-play','st-primary')}${btn('Stoppen','data-stop')}<label>Übergang <select data-transition><option>Harter Schnitt</option><option>Kurze Überblendung</option></select></label><label>Cliplänge <output data-trim-label></output><input type="range" min="1" max="5" value="4" data-trim></label></div><div class="st-timeline" data-timeline></div>${btn('Schnittfolge prüfen','data-check')}${changes()}`;
  const slate = room.querySelector('[data-timeline]');
  const trim = room.querySelector('[data-trim]');
  const viewport = room.querySelector('[data-cut-preview]');
  function render(focus = '') {
    const clip = clipLibrary[selected];
    slate.innerHTML = order.map((id,index)=>`<div class="st-clip" data-clip="${id}" draggable="true"><button type="button" data-select="${id}" aria-pressed="${selected===id}" class="st-button"><span>${clipLibrary[id].type}</span><strong>${clipLibrary[id].name}</strong></button><div><button type="button" data-shift="-1" aria-label="${clipLibrary[id].name} nach links" ${index===0?'disabled':''}>‹</button><small>${trims[id]} s</small><button type="button" data-shift="1" aria-label="${clipLibrary[id].name} nach rechts" ${index===order.length-1?'disabled':''}>›</button></div></div>`).join('');
    viewport.dataset.scene=selected;
    viewport.querySelector('[data-clip-symbol]').textContent=clip.symbol;
    viewport.querySelector('[data-clip-caption]').textContent=clip.name;
    trim.max=clip.duration;
    trim.value=trims[selected];
    room.querySelector('[data-trim-label]').textContent=`${trims[selected]} s`;
    if(focus)slate.querySelector(`[data-select="${focus}"]`)?.focus();
  }
  function stop() {clearTimeout(motion);motion=0;}
  function play(index=0) {
    stop();
    if (index >= order.length) return;
    if (index && room.querySelector('[data-transition]').selectedIndex===1) {
      viewport.classList.remove('st-cut-fade');
      void viewport.offsetWidth;
      viewport.classList.add('st-cut-fade');
    }
    selected=order[index];render();
    motion=setTimeout(()=>play(index+1),trims[selected]*1000);
  }
  function reorder(from,to) {
    const [clip] = order.splice(from,1);
    order.splice(to,0,clip);
    render(clip);
  }
  slate.addEventListener('click',event=>{
    const target = event.target.closest('button');
    if(!target)return;
    stop();
    const clip = target.closest('[data-clip]').dataset.clip;
    selected=clip;
    if(target.dataset.shift) reorder(order.indexOf(clip),order.indexOf(clip)+Number(target.dataset.shift));
    else render(clip);
  });
  slate.addEventListener('dragstart',event=>{drag=event.target.closest('[data-clip]')?.dataset.clip || '';if(drag){stop();event.dataTransfer.setData('text/plain',drag);event.dataTransfer.effectAllowed='move';}});
  slate.addEventListener('dragover',event=>{if(drag && event.target.closest('[data-clip]'))event.preventDefault();});
  slate.addEventListener('dragend',()=>{drag='';});
  slate.addEventListener('drop',event=>{
    const target=event.target.closest('[data-clip]')?.dataset.clip;
    if(!target || !drag || target===drag)return;
    event.preventDefault();reorder(order.indexOf(drag),order.indexOf(target));drag='';
  });
  trim.addEventListener('input',()=>{stop();trims[selected]=Number(trim.value);render();});
  listen(room,'[data-play]',()=>play());listen(room,'[data-stop]',stop);
  listen(room,'[data-check]',()=>{
    if(order.join() !== 'wide,action,detail,end'){feedback('Beginne mit der Totale. Zeige dann die Handlung, das Detail und das Ergebnis.',false);return;}
    feedback('Dein Schnitt führt vom Ort über die Handlung und das Detail zum Ergebnis.',true);pass('timeline-sequence','Totale, Handlung, Detail und Schlussbild montieren');
  });
  render();
  return stop;
}

function astronomy(room, {feedback,pass}) {
  room.innerHTML = `<div class="st-toolbar"><label>Modell <select data-mode><option value="orbits">Planetenbahnen</option><option value="moon">Mondphasen</option></select></label><label>Modellzeit <output data-date></output><input data-date-control type="range" min="0" max="730" value="0"></label><label>Abstand eines Modellplaneten <output data-distance-label></output><input data-distance type="range" min="60" max="200" value="150"></label>${btn('Animation starten','data-play aria-pressed="false"')}</div><div class="st-astro"><svg viewBox="0 0 720 320" role="img" aria-label="Interaktives Modell für Umlaufbahnen und Mondphasen"><defs><pattern id="st-stars" width="119" height="113" patternUnits="userSpaceOnUse"><circle cx="23" cy="29" r="1" fill="#f6e3a2"/><circle cx="64" cy="71" r=".7" fill="#c0dbd8"/><circle cx="104" cy="10" r="1.2" fill="#abc6c1"/><circle cx="10" cy="99" r=".6" fill="#d8e3e6"/></pattern></defs><rect width="720" height="320" fill="#151f2b"/><rect width="720" height="320" fill="url(#st-stars)"/><g data-orbits></g><g data-moon-row hidden></g></svg></div><p class="st-caption">Schematisches Modell. Größen und Abstände einzelner Himmelskörper sind zur besseren Sichtbarkeit verändert.</p><p data-astro-info></p><div class="st-panel" data-question></div>${changes()}`;
  const mode = room.querySelector('[data-mode]');
  const day = room.querySelector('[data-date-control]');
  const distance = room.querySelector('[data-distance]');
  const orbitArea = room.querySelector('[data-orbits]');
  const moonArea = room.querySelector('[data-moon-row]');
  const answerArea = room.querySelector('[data-question]');
  let clock = 0;
  const planetData = [
    {name:'Merkur',angle:1,days:88,radius:43,size:5,color:'#b6b8b5'},
    {name:'Venus',angle:2,days:225,radius:72,size:7,color:'#f5b281'},
    {name:'Erde',angle:0,days:365,radius:99,size:8,color:'#73c2e6'},
    {name:'Mars',angle:3,days:687,radius:132,size:6,color:'#ec9565'}
  ];
  const normalize = angle => (angle % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
  const point = (angle,radius,x=360,y=160)=>[x + Math.cos(angle)*radius, y + Math.sin(angle)*radius*.87];
  function draw() {
    const dayNumber = Number(day.value);
    const moon = mode.value === 'moon';
    orbitArea.style.display = moon?'none':'';
    moonArea.style.display = moon?'':'none';
    distance.disabled = moon;
    room.querySelector('[data-date]').textContent=`Tag ${dayNumber}`;
    const au=Number(distance.value)/100;
    room.querySelector('[data-distance-label]').textContent=`${au.toLocaleString('de-DE')} AE`;
    if (moon) {
      const fraction=(dayNumber % 29.53)/29.53;
      const phase=Math.round(fraction*8) % 8;
      const phaseLabels=['Neumond','zunehmende Sichel','erstes Viertel','zunehmender Mond','Vollmond','abnehmender Mond','letztes Viertel','abnehmende Sichel'];
      const phaseLight=(1-Math.cos(fraction*2*Math.PI))/2;
      const [x,y]=point((fraction*2+1)*Math.PI,86,350,159);
      const crescent=Math.max(.01,Math.abs(1-2*phaseLight))*36;
      const sweep = (phaseLight >= .5) === (fraction < .5) ? 1 : 0;
      const first = fraction < .5 ? 1 : 0;
      moonArea.innerHTML=`<circle cx="83" cy="158" r="29" fill="#fbcf72"/><text x="58" y="208" fill="#f6ebaf">Sonne</text><ellipse cx="350" cy="159" rx="86" ry="74.8" fill="none" stroke="#52656d"/><circle cx="350" cy="159" r="26" fill="#75cce5"/><text x="332" y="205" fill="#daecf3">Erde</text><circle cx="${x}" cy="${y}" r="12" fill="#c9c5a9"/><circle cx="582" cy="159" r="36" fill="#2c3540" stroke="#637077"/><path d="M582 123 A36 36 0 0 ${first} 582 195 A${crescent} 36 0 0 ${sweep} 582 123" fill="#ece9d1"/><text x="550" y="219" fill="#daecf3">Ansicht</text>`;
      room.querySelector('[data-astro-info]').textContent=`${phaseLabels[phase][0].toUpperCase()}${phaseLabels[phase].slice(1)} · etwa ${Math.round(phaseLight*100)} % der sichtbaren Seite beleuchtet.`;
    } else {
      const extra={name:'Modell',angle:3.4,days:365*au**1.5,radius:56*au+12,size:7,color:'#bda6ef'};
      const planets=[...planetData,extra];
      orbitArea.innerHTML=planets.map(planet=>`<ellipse cx="360" cy="160" rx="${planet.radius}" ry="${planet.radius*.87}" stroke="#57737b" fill="none" ${planet.name==='Modell'?'stroke-dasharray="5 5"':''}/>`).join('')+'<circle cx="360" cy="160" r="19" fill="#f8c467"/>'+planets.map(planet=>{
        const [x,y]=point(normalize(planet.angle+dayNumber/planet.days*2*Math.PI),planet.radius);
        return `<circle cx="${x}" cy="${y}" r="${planet.size}" fill="${planet.color}"/><text x="${x+9}" y="${y-8}" fill="#e4edf1">${planet.name}</text>`;
      }).join('');
      room.querySelector('[data-astro-info]').textContent=`Modellplanet · ${Math.round(extra.days)} Erdtage pro Umlauf. Die Erde braucht im Modell 365 Tage.`;
    }
  }
  function stop() {
    clearInterval(clock);clock=0;
    const button=room.querySelector('[data-play]');
    button.textContent='Animation starten';button.setAttribute('aria-pressed','false');
  }
  function question() {
    const moon = mode.value==='moon';
    day.max = moon?'30':'730';day.value='0';
    answerArea.innerHTML=moon?'<h3>Vollmond einstellen</h3><p>Verschiebe die Modellzeit, bis von der Erde aus mindestens 97 % der sichtbaren Seite beleuchtet sind.</p>':'<h3>Längere Umlaufzeit einstellen</h3><p>Stelle den Abstand so ein, dass der Modellplanet länger als 650 Tage pro Runde benötigt.</p>';
    answerArea.innerHTML+=btn('Einstellung prüfen','data-check','st-primary');
    listen(room,'[data-check]',()=>{
      const lit=(1-Math.cos(Number(day.value)/29.53*2*Math.PI))/2;
      const period=365*(Number(distance.value)/100)**1.5;
      if(moon ? lit < .97 : period < 650) {feedback(moon?'Die beleuchtete Seite ist noch nicht vollständig sichtbar. Bewege den Mond näher an die der Sonne gegenüberliegende Seite.':'Vergrößere den Abstand. Ein weiter entfernter Planet braucht in diesem Modell länger.',false);return;}
      const title=moon?'Vollmond im Modell einstellen':'Abstand und Umlaufzeit verknüpfen';
      feedback(moon?'Der Mond steht ungefähr gegenüber der Sonne. Die zu uns gewandte Seite ist fast vollständig beleuchtet.':'Im Modell wächst die Umlaufzeit, wenn die Entfernung zur Sonne zunimmt.',true);
      pass(moon?'astronomy-moon':'astronomy-orbit',title);
    });
    feedback('');draw();
  }
  listen(room,'[data-mode]',()=>{stop();question();},'change');
  listen(room,'[data-date-control], [data-distance]',draw,'input');
  listen(room,'[data-play]',event=>{
    if(clock){stop();return;}
    event.currentTarget.textContent='Animation stoppen';event.currentTarget.setAttribute('aria-pressed','true');
    clock=setInterval(()=>{day.value=String((Number(day.value)+(mode.value==='moon'?1:4))%(Number(day.max)+1));draw();},110);
  });
  question();
  return stop;
}

const europeanPlaces = [
  {id:'de',name:'Deutschland',capital:'Berlin',x:49,y:54,color:'#93c6ad',region:'Mitteleuropa, östlich von Frankreich'},
  {id:'fr',name:'Frankreich',capital:'Paris',x:33,y:66,color:'#a2c8de',region:'Westeuropa, nördlich von Spanien'},
  {id:'es',name:'Spanien',capital:'Madrid',x:21,y:83,color:'#efd69f',region:'Iberische Halbinsel im Südwesten'},
  {id:'it',name:'Italien',capital:'Rom',x:55,y:81,color:'#e7b99f',region:'Stiefelförmige Halbinsel im Mittelmeer'},
  {id:'no',name:'Norwegen',capital:'Oslo',x:49,y:23,color:'#d5c4eb',region:'Westseite der skandinavischen Halbinsel'},
  {id:'pl',name:'Polen',capital:'Warschau',x:64,y:54,color:'#edc6b2',region:'Mitteleuropa, östlich von Deutschland'},
  {id:'fi',name:'Finnland',capital:'Helsinki',x:69,y:21,color:'#c4d9a2',region:'Nordeuropa, östlich von Schweden'}
];

function geography(room, {feedback,pass}) {
  const order = [2,4,1,5,6,3,0];
  let round = 0;
  let latched = false;
  room.innerHTML = `${task('Europäische Hauptstädte','Wähle auf der Karte das Land zur gesuchten Hauptstadt. Die Karte zeigt schematische Positionen und ungefähre Umrisse.')}<div class="st-geo"><svg viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label="Schematisch gezeichnete Umrisse europäischer Regionen"><path fill="#c9d8c7" stroke="#edf3e7" stroke-width=".7" d="M6 83L13 74L25 73L31 63L29 57L34 52L39 51L41 47L50 49L54 44L65 44L73 40L83 40L99 36L100 87L85 88L75 83L70 92L63 82L56 87L57 91L53 96L48 88L50 79L43 74L39 77L28 88L20 90L6 88Z M34 37L38 25L43 30L39 44L28 47L30 40Z M46 37L42 32L45 26L49 14L56 8L61 9L56 24L54 40L48 46L46 42Z M65 40L61 32L62 23L67 9L72 12L77 28L72 41Z"/></svg>${europeanPlaces.map(x=>`<button type="button" data-country="${x.id}" style="--st-place-x:${x.x}%;--st-place-y:${x.y}%;--st-place-tone:${x.color}" aria-label="${x.name}. ${x.region}">${x.name}</button>`).join('')}</div><div class="st-toolbar"><p data-target></p>${btn('Weiter','data-next')}</div>${changes()}`;
  const show = () => {
    const place=europeanPlaces[order[round]];
    room.querySelector('[data-target]').textContent=`${round+1} von ${order.length}: Zu welchem Land gehört ${place.capital}?`;
    room.querySelector('[data-next]').disabled=true;
    room.querySelectorAll('[data-country]').forEach(button=>button.removeAttribute('aria-current'));
    feedback('');latched=false;
  };
  listen(room,'[data-country]',event=>{
    if(latched)return;
    const choice=event.currentTarget.dataset.country;
    const place=europeanPlaces[order[round]];
    if(choice!==place.id){feedback('Prüfe die Lage und versuche ein anderes Land.',false);return;}
    latched=true;event.currentTarget.setAttribute('aria-current','true');
    room.querySelector('[data-next]').disabled=false;
    room.querySelector('[data-next]').textContent=round===order.length-1?'Neu starten':'Weiter';
    feedback(`${place.capital} ist die Hauptstadt von ${place.name}.`,true);
    if(round===order.length-1)pass('geo-europe-capitals','Sieben europäische Hauptstädte zuordnen');
  });
  listen(room,'[data-next]',()=>{round=(round+1)%order.length;show();room.querySelector('[data-country]').focus();});
  show();
}

const languagePhrases = {
  en:{name:'Englisch',locale:'en-GB',phrases:[['Hello! How are you?', ['Fine, thank you.','No, it is blue.','It opens tomorrow.'],0,'Hallo! Wie geht es dir?'],['How much is this book?', ['It’s over there.','It costs eight pounds.','I am from Leeds.'],1,'Wie viel kostet dieses Buch?'],['Where is the station?', ['I like trains.','It is cold.','It’s next to the park.'],2,'Wo ist der Bahnhof?']]},
  fr:{name:'Französisch',locale:'fr-FR',phrases:[['Bonjour ! Comment ça va ?', ['Ça va bien, merci.','Non, il est bleu.','Ça ouvre demain.'],0,'Hallo! Wie geht es dir?'],['Combien coûte ce livre ?', ['Il est là-bas.','Il coûte huit euros.','Je viens de Lyon.'],1,'Wie viel kostet dieses Buch?'],['Où est la gare ?', ['J’aime le train.','Il fait froid.','Elle est à côté du parc.'],2,'Wo ist der Bahnhof?']]},
  es:{name:'Spanisch',locale:'es-ES',phrases:[['¡Hola! ¿Cómo estás?', ['Bien, gracias.','No, es azul.','Abre mañana.'],0,'Hallo! Wie geht es dir?'],['¿Cuánto cuesta este libro?', ['Está allí.','Cuesta ocho euros.','Soy de Toledo.'],1,'Wie viel kostet dieses Buch?'],['¿Dónde está la estación?', ['Me gustan los trenes.','Hace frío.','Está al lado del parque.'],2,'Wo ist der Bahnhof?']]},
  it:{name:'Italienisch',locale:'it-IT',phrases:[['Ciao! Come stai?', ['Bene, grazie.','No, è blu.','Apre domani.'],0,'Hallo! Wie geht es dir?'],['Quanto costa questo libro?', ['È laggiù.','Costa otto euro.','Sono di Parma.'],1,'Wie viel kostet dieses Buch?'],['Dov’è la stazione?', ['Mi piacciono i treni.','Fa freddo.','È accanto al parco.'],2,'Wo ist der Bahnhof?']]}
};

function languages(room, {feedback,pass,audioEnabled}) {
  let round=0;
  const topics=['Begrüßung','Einkaufen','Unterwegs'];
  room.innerHTML=`<div class="st-toolbar"><label>Sprache <select data-language>${Object.entries(languagePhrases).map(([id,x])=>`<option value="${id}">${x.name}</option>`).join('')}</select></label><label>Thema <select data-topic>${topics.map((name,index)=>`<option value="${index}">${name}</option>`).join('')}</select></label></div><div class="st-panel" data-dialog></div>${changes()}`;
  const area=room.querySelector('[data-dialog]');
  const lang=room.querySelector('[data-language]');
  const topic=room.querySelector('[data-topic]');
  function paint() {
    const selected=languagePhrases[lang.value];
    const [question,options,answer,translation]=selected.phrases[round];
    area.innerHTML=`<h3>${topics[round]}</h3><p class="st-bubble" lang="${selected.locale}">${question}</p><div class="st-toolbar">${btn('Frage anhören',audioEnabled?'data-listen':'data-listen disabled')}${btn('Thema wechseln','data-change')}</div>${audioEnabled?'':'<p class="st-caption">Die Tonwiedergabe ist in deinen Einstellungen ausgeschaltet.</p>'}<details><summary>Deutsche Übersetzung</summary><p>${translation}</p></details><p>Wähle eine passende Antwort für den Dialog.</p><div class="st-toolbar">${options.map((item,i)=>btn(item,`lang="${selected.locale}" data-response="${i}"`)).join('')}</div>`;
    listen(area,'[data-listen]',()=>{
      if(!('speechSynthesis' in window) || !window.SpeechSynthesisUtterance){feedback('Diese Browserumgebung unterstützt keine Sprachausgabe. Nutze die geschriebene Frage.');return;}
      const utterance=new SpeechSynthesisUtterance(question);
      utterance.lang=selected.locale;utterance.rate=.8;
      const matching=speechSynthesis.getVoices().find(voice=>voice.lang.toLowerCase().startsWith(selected.locale.split('-')[0]) && voice.localService);
      if(!matching){feedback('Für diese Sprache ist keine lokale Stimme verfügbar. Du kannst die geschriebene Frage verwenden.');return;}
      utterance.voice=matching;speechSynthesis.cancel();speechSynthesis.speak(utterance);
    });
    listen(area,'[data-change]',()=>{round=(round+1)%topics.length;topic.value=String(round);paint();area.querySelector('[data-change]').focus();});
    listen(area,'[data-response]',event=>{
      if(Number(event.currentTarget.dataset.response)!==answer){feedback('Diese Antwort passt nicht zur Frage. Lies die Übersetzung und überprüfe den Zusammenhang.',false);return;}
      feedback('Diese Antwort passt zur Frage und führt das Gespräch weiter.',true);
      pass(`language-${lang.value}-${round}`,`${selected.name} · ${topics[round]} im Dialog`);
    });
    feedback('');
  }
  listen(room,'[data-language]',paint,'change');listen(room,'[data-topic]',()=>{round=Number(topic.value);paint();},'change');paint();
  if (audioEnabled && 'speechSynthesis' in window) speechSynthesis.getVoices();
  return ()=>{if(audioEnabled && 'speechSynthesis' in window)speechSynthesis.cancel();};
}

function cook(room, {feedback,pass}) {
  const ingredients=[{name:'Naturjoghurt',unit:'g',base:200},{name:'Haferflocken',unit:'g',base:80},{name:'Beeren',unit:'g',base:100}];
  room.innerHTML=`${task('Ein Frühstück für mehr Personen planen','Das Rezept für zwei Portionen soll für mehr oder weniger Personen reichen. Trage die Mengen ein.')}<div class="st-toolbar"><label>Gewünschte Portionen <select data-portions>${[1,3,4,5,6].map(number=>`<option value="${number}" ${number===4?'selected':''}>${number}</option>`).join('')}</select></label></div><form class="st-recipe" data-recipe><div class="st-recipe-row st-recipe-head"><span>Zutat</span><span>Für 2 Portionen</span><span>Neue Menge</span></div>${ingredients.map((x,index)=>`<label class="st-recipe-row" for="st-recipe-${index}"><strong>${x.name}</strong><span>${x.base} ${x.unit}</span><span><input type="number" required min="1" max="12000" step="1" inputmode="numeric" data-amount="${index}" id="st-recipe-${index}"> ${x.unit}</span></label>`).join('')}<button class="st-button st-primary" type="submit">Mengen prüfen</button></form><details><summary>Rechenhilfe</summary><p>Teile jede Ausgangsmenge durch zwei. Multipliziere die Menge für eine Portion mit der neuen Anzahl.</p></details><p class="st-caption">Wenn du das Rezept praktisch ausprobierst, wasche frische Beeren und prüfe, ob alle die Zutaten vertragen.</p>${changes()}`;
  const portions=room.querySelector('[data-portions]');
  const form=room.querySelector('[data-recipe]');
  const inputs=[...form.querySelectorAll('[data-amount]')];
  form.addEventListener('submit',event=>{
    event.preventDefault();
    const amount=Number(portions.value);
    const wrong=inputs.filter((input,index)=>{
      const mismatch=Number(input.value)!==ingredients[index].base/2*amount;
      input.setAttribute('aria-invalid',String(mismatch));return mismatch;
    });
    if(wrong.length){feedback('Überprüfe die markierten Mengen. Der Faktor ist gewünschte Portionen geteilt durch zwei.',false);wrong[0].focus();return;}
    feedback(`Die Mengen passen zu ${amount} ${amount===1?'Portion':'Portionen'}. Du hast alle Zutaten mit demselben Faktor skaliert.`,true);pass(`cook-portions-${amount}`,`Zutaten für ${amount} ${amount===1?'Portion':'Portionen'} umrechnen`);
  });
  portions.addEventListener('change',()=>{form.querySelectorAll('[data-amount]').forEach(input=>{input.value='';input.removeAttribute('aria-invalid');});feedback('');});
}

function pixel(room, {feedback,pass}) {
  room.innerHTML=`${task('Ein Symbol aus Pixeln gestalten','Zeichne ein kleines Blatt. Arbeite mit mindestens zwei sichtbaren Farben und hebe Form und Blattader voneinander ab.')}<div class="st-toolbar"><label>Farbe <input type="color" value="#468a51" data-color></label><label><input type="checkbox" data-eraser> Radierer</label>${btn('Mitte spiegeln','data-symmetry aria-pressed="false"')}${btn('Raster leeren','data-clear')}</div><div class="st-pixel" data-pixels aria-label="Pixelraster mit zwölf Zeilen und zwölf Spalten"></div><p class="st-caption">Pfeiltasten wählen die benachbarten Felder. Leertaste oder Enter malen im gewählten Feld.</p><div class="st-toolbar">${btn('Entwurf dokumentieren','data-check')}${btn('PNG exportieren','data-export','st-primary')}</div>${changes()}`;
  const grid=room.querySelector('[data-pixels]');
  const size=12;
  const colors=Array(size*size).fill('');
  let reflect=false;
  let pointer=false;
  let dragIndex=-1;
  grid.innerHTML=colors.map((_,i)=>`<button type="button" tabindex="${i===0?0:-1}" data-pixel="${i}" aria-label="Zeile ${Math.floor(i/size)+1}, Spalte ${i%size+1}, leer"></button>`).join('');
  const paint = (index,color) => {
    const tile=grid.children[index];if(!tile)return;
    colors[index]=color;tile.style.backgroundColor=color;
    tile.setAttribute('aria-label',`Zeile ${Math.floor(index/size)+1}, Spalte ${index%size+1}, ${color || 'leer'}`);
  };
  const apply=index=>{
    const color=room.querySelector('[data-eraser]').checked?'':room.querySelector('[data-color]').value;
    paint(index,color);
    if(reflect)paint(Math.floor(index/size)*size+size-1-index%size,color);
  };
  grid.addEventListener('click',event=>{const tile=event.target.closest('[data-pixel]');if(tile)apply(Number(tile.dataset.pixel));});
  grid.addEventListener('pointerdown',event=>{pointer=event.button===0;dragIndex=Number(event.target.dataset.pixel);if(pointer && Number.isInteger(dragIndex))apply(dragIndex);});
  grid.addEventListener('pointermove',event=>{
    if(!pointer || !event.buttons)return;
    const index=Number(document.elementFromPoint(event.clientX,event.clientY)?.dataset.pixel);
    if(index!==dragIndex && Number.isInteger(index)){apply(index);dragIndex=index;}
  });
  grid.addEventListener('pointerup',()=>{pointer=false;});
  grid.addEventListener('pointercancel',()=>{pointer=false;});
  grid.addEventListener('keydown',event=>{
    const delta={ArrowDown:size,ArrowUp:-size,ArrowLeft:-1,ArrowRight:1}[event.key];
    if(delta===undefined)return;
    event.preventDefault();const tile=grid.children[Number(event.target.dataset.pixel)+delta];
    if(tile){event.target.tabIndex=-1;tile.tabIndex=0;tile.focus();}
  });
  listen(room,'[data-symmetry]',event=>{reflect=!reflect;event.currentTarget.setAttribute('aria-pressed',String(reflect));});
  listen(room,'[data-clear]',()=>colors.forEach((_,index)=>paint(index,'')));
  listen(room,'[data-check]',()=>{
    const colored=colors.filter(Boolean);
    if(colored.length<8 || new Set(colored).size<2){feedback('Setze mindestens acht Pixel in zwei Farben. Prüfe anschließend selbst, ob sich die Blattader gut abhebt.',false);return;}
    feedback('Dein Raster enthält mindestens acht gesetzte Pixel und zwei Farben.',true);pass('practice-pixel-leaf','Pixelentwurf mit mindestens zwei Farben');
  });
  listen(room,'[data-export]',()=>{
    const canvas=Object.assign(document.createElement('canvas'),{width:240,height:240});const ctx=canvas.getContext('2d');
    colors.forEach((color,i)=>{if(color){ctx.fillStyle=color;ctx.fillRect((i%size)*20,Math.floor(i/size)*20,20,20);}});
    canvas.toBlob(blob=>{if(blob)download('hobbymaxing-pixel.png',blob);},'image/png');
  });
}

const claimCases = [
  {name:'Ist der Test aussagekräftig?',story:'In einer Klasse lesen die zehn freiwilligen Teilnehmenden mehr Bücher als vor Beginn eines Leseprojekts. Das Projekt habe deshalb an der ganzen Schule dieselbe Wirkung.',prompt:'Welche Ergänzung stärkt die Aussage am meisten?',choices:['Eine größere Vergleichsgruppe mit ähnlichen Ausgangsbedingungen.','Ein neues Logo für das Leseprojekt.','Die Meinung einer Person aus der freiwilligen Gruppe.'],answer:0,explain:'Eine Vergleichsgruppe hilft, die Wirkung des Projekts von Auswahl- und Zeiteffekten zu unterscheiden.'},
  {name:'Mögliche Ursachen unterscheiden',story:'Der Park wurde im April renoviert. Gleichzeitig begann eine ungewöhnlich warme Woche. Gleich darauf kamen mehr Menschen.',prompt:'Welche Schlussfolgerung ist durch die Beobachtung gedeckt?',choices:['Die Renovierung war die einzige Ursache.','Mehr Besuche folgten auf beides. Ihr jeweiliger Einfluss ist noch offen.','Wetter hat grundsätzlich keinen Einfluss.'],answer:1,explain:'Eine zeitliche Abfolge allein zeigt keine Ursache. Das Wetter könnte einen Teil der Veränderung erklären.'},
  {name:'Begründen und abwägen',story:'Der Schulgarten soll bei großer Hitze früher öffnen. Einige würden dadurch teilnehmen können, andere könnten so früh kaum ankommen.',prompt:'Welche Rückfrage macht die Entscheidung transparenter?',choices:['Wer findet die Idee spontan am besten?','Wie viele Zeichen hat der Vorschlag?','Wer kann zu welchen Zeiten teilnehmen, und welche Alternativen haben wir?'],answer:2,explain:'Die Frage macht konkrete Folgen für verschiedene Gruppen sichtbar und eröffnet weitere Möglichkeiten.'}
];

function logic(room, {feedback,pass}) {
  let index=0;
  room.innerHTML=`<div class="st-panel" data-case></div>${changes()}`;
  const area=room.querySelector('[data-case]');
  function present() {
    const selected=claimCases[index];
    area.innerHTML=`<h3>${selected.name}</h3><p>${selected.story}</p><p><strong>${selected.prompt}</strong></p><div class="st-choice-stack">${selected.choices.map((choice,i)=>btn(choice,`data-answer="${i}"`)).join('')}</div>${btn('Nächster Fall','data-next')}`;
    listen(area,'[data-answer]',event=>{
      const correct=Number(event.currentTarget.dataset.answer)===selected.answer;
      if(!correct){feedback('Schau darauf, welche Information die konkrete Frage beantwortet und welche Annahmen noch offen sind.',false);return;}
      feedback(selected.explain,true);pass(`logic-reason-${index}`,selected.name);
    });
    listen(area,'[data-next]',()=>{index=(index+1)%claimCases.length;present();area.querySelector('[data-next]').focus();});feedback('');
  }
  present();
}

const mounts = {chess,code,music,drawing,camera,sudoku,design,timeline,astronomy,geography,languages,cook,pixel,logic};

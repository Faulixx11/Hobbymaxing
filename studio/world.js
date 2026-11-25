const canvasWidth = 960;
const canvasHeight = 630;
const tileWidth = 45;
const tileHeight = 23;
const gridSize = 9;
const missionNoteLimit = 160;

const districts = [
  {name:'Musikstudio', at:[2,2], hobbies:['klavier','gitarre','ukulele','geige','musiktheorie','rhythmustraining'], roof:'#8068ab', wall:'#e0d8fa'},
  {name:'Atelier', at:[6,2], hobbies:['zeichnen','aquarellmalerei','acrylmalerei','digital-art','pixel-art','illustration','grafikdesign'], roof:'#b26f62', wall:'#f6d1aa'},
  {name:'Technikwerkstatt', at:[6,5], hobbies:['html-css','javascript','python','webentwicklung','spieleentwicklung'], roof:'#5676a4', wall:'#cee2eb'},
  {name:'Observatorium', at:[1,5], hobbies:['astronomie'], roof:'#576fa3', wall:'#dce5f5'},
  {name:'Inselgarten', at:[2,7], hobbies:['gartenarbeit','pflanzenkunde','naturbeobachtung'], roof:'#64945a', wall:'#d3e6a8'},
  {name:'Bibliothek', at:[5,1], hobbies:['kreatives-schreiben','geschichten-schreiben','journalismus','englisch','franzoesisch'], roof:'#a87957', wall:'#f7dda8'},
  {name:'Fotostudio', at:[7,4], hobbies:['fotografie','bildbearbeitung','videografie'], roof:'#617976', wall:'#d7e5cd'},
  {name:'Strategieraum', at:[5,7], hobbies:['schach','sudoku','logikraetsel','brettspiele'], roof:'#78739a', wall:'#eee0ec'}
];

const expedition = [
  {id:'basislager', name:'Basislager', xp:0, at:[3,7], title:'Dein Lagerbuch', reward:'Lagerbuch', intro:'Such dir ein Blatt und zeichne es in dein Lagerbuch.', criteria:['Ich habe die Umrisse eines Blatts skizziert.','Ich habe mindestens drei Blattadern eingezeichnet.'], hobbies:['naturbeobachtung','zeichnen']},
  {id:'waldlichtung', name:'Waldlichtung', xp:30, at:[1,4], title:'Wähle deine Spur', reward:'Foto-Spur', intro:'Halte die Lichtung als Foto oder Naturbeobachtung fest. Beides geht auch im Park oder am Fenster.', criteria:['Ich habe ein Foto mit bewusstem Bildausschnitt gemacht oder eine Naturbeobachtung notiert.','Ich kann ein sichtbares Detail benennen und beschreiben.'], hobbies:['fotografie','naturbeobachtung']},
  {id:'taktbruecke', name:'Taktbrücke', xp:100, at:[6,6], title:'Beat über die Brücke', reward:'Taktprobe', intro:'Entwirf einen kurzen Beat. Probiere danach ein langsameres Tempo aus.', criteria:['Ich habe ein kurzes rhythmisches Muster aufgebaut.','Ich habe es in zwei Tempi ausprobiert und kann sagen, welches leichter fiel.'], hobbies:['rhythmustraining','musikproduktion']},
  {id:'sternwarte', name:'Sternwarte', xp:225, at:[3,2], title:'Expedition in drei Etappen', reward:'Etappenplan', intro:'Plane drei verschiedene Etappen in einer Woche. Gib dir bei der anspruchsvollsten Zeit für einen zweiten Versuch.', criteria:['Ich habe drei unterschiedliche Etappen mit Tagen im Wochenplan gespeichert.','Ich habe die anspruchsvollste Etappe auf einen Tag mit Zeit für einen zweiten Versuch gelegt.']},
  {id:'gipfel', name:'Gipfel', xp:450, at:[6,3], title:'Dein Meisterstück', reward:'Gipfelabzeichen', intro:'Wähle ein Abschlussprojekt aus einem Hobby und dokumentiere das Ergebnis.', criteria:['Ich habe ein persönliches Abschlussprojekt fertiggestellt.','Ich habe das Ergebnis und eine Erkenntnis aus dem Projekt festgehalten.']}
];

const decorations = {
  tree:{name:'Kiefer', minimum:0},
  flowers:{name:'Wildblumen', minimum:0},
  bench:{name:'Holzbank', minimum:1},
  lantern:{name:'Insellaterne', minimum:2},
  telescope:{name:'Teleskop', minimum:4}
};

const palette = [
  {name:'Moosgrün', hex:'#387655'},
  {name:'Sonnengelb', hex:'#e0a13a'},
  {name:'Korallrot', hex:'#bf594b'},
  {name:'Lagunenblau', hex:'#346e99'},
  {name:'Flieder', hex:'#805ca1'}
];

const scenery = {
  '0,3':'tree','0,5':'tree','0,6':'flowers','1,2':'flowers','1,3':'tree','1,6':'rock','2,0':'tree','2,1':'tree','2,6':'flowers',
  '2,8':'tree','3,1':'rock','3,8':'tree','4,1':'flowers','4,8':'lantern','5,0':'tree','5,8':'flowers','6,0':'tree',
  '6,1':'flowers','6,8':'tree','7,1':'tree','7,2':'rock','7,3':'tree','7,7':'tree','8,3':'flowers','8,4':'tree','8,6':'rock'
};

const movement = {
  up:[0,-1], down:[0,1], left:[-1,0], right:[1,0]
};

function hasExpeditionWeek(events) {
  const weeks=new Map();
  for(const event of events??[]) {
    if(typeof event?.day!=='string'||typeof event.title!=='string'||!event.title.trim()) continue;
    const day=new Date(`${event.day}T00:00:00Z`);
    if(!Number.isFinite(day.getTime())) continue;
    const monday=day.getTime()-((day.getUTCDay()+6)%7)*86400000;
    if(!weeks.has(monday)) weeks.set(monday,new Set());
    weeks.get(monday).add(event.title.trim().toLowerCase());
  }
  return Array.from(weeks.values()).some(steps=>steps.size>=3);
}

function onIsland(x,y) {
  return Number.isInteger(x) && Number.isInteger(y) && x>=0 && y>=0 && x<gridSize && y<gridSize && x+y>=2 && x+y<=14 && x-y<=6 && y-x<=6;
}

function position(x,y) {
  return [canvasWidth/2+(x-y)*tileWidth, 136+(x+y)*tileHeight];
}

function randomAt(x,y) {
  const n = Math.sin(x*73.173+y*34.93)*11947.421;
  return n-Math.floor(n);
}

function polygon(ctx, points, fill, stroke) {
  ctx.beginPath();
  points.forEach(([x,y],index) => index ? ctx.lineTo(x,y) : ctx.moveTo(x,y));
  ctx.closePath();
  if (fill) {
    ctx.fillStyle=fill;
    ctx.fill();
  }
  if (stroke) {
    ctx.strokeStyle=stroke;
    ctx.stroke();
  }
}

function ellipse(ctx,x,y,width,height,color) {
  ctx.beginPath();
  ctx.ellipse(x,y,width,height,0,0,Math.PI*2);
  ctx.fillStyle=color;
  ctx.fill();
}

function line(ctx,points,color,width=2) {
  ctx.beginPath();
  points.forEach(([x,y],index) => index ? ctx.lineTo(x,y) : ctx.moveTo(x,y));
  ctx.strokeStyle=color;
  ctx.lineWidth=width;
  ctx.lineCap='round';
  ctx.lineJoin='round';
  ctx.stroke();
  ctx.lineWidth=1;
}

function ground(ctx,x,y) {
  const [sx,sy]=position(x,y);
  const left=[sx-tileWidth,sy];
  const right=[sx+tileWidth,sy];
  const front=[sx,sy+tileHeight];
  const back=[sx,sy-tileHeight];
  const path=(x===4 || y===4 || (y===6 && x>2 && x<7) || (x===2 && y===3) || (x===6 && y===3)) && x>0 && y>0 && x<8 && y<8;
  if (!onIsland(x+1,y)) {
    polygon(ctx,[right,front,[sx,front[1]+25],[right[0],right[1]+19]],'#70674e');
    polygon(ctx,[right,front,[sx,front[1]+6],[right[0],right[1]+5]],'#577d46');
  }
  if (!onIsland(x,y+1)) {
    polygon(ctx,[left,front,[sx,front[1]+25],[left[0],left[1]+19]],'#8a775a');
    polygon(ctx,[left,front,[sx,front[1]+6],[left[0],left[1]+5]],'#699352');
  }
  const shades=path?['#d8c38a','#d5be84','#d4bc80','#dbc78e']:['#9dbf72','#a4c67a','#a0c477','#a8c87d'];
  polygon(ctx,[back,right,front,left],shades[Math.floor(randomAt(x,y)*4)]);
  for (let i=0;i<4;i++) {
    const px=sx+(randomAt(x+i+17,y+11)-.5)*42;
    const py=sy+(randomAt(x+7,y+i+21)-.5)*18;
    if (path) ellipse(ctx,px,py,1.4,0.8,'#a28e60');
    else line(ctx,[[px-2,py],[px,py-2],[px+1,py]],i%2 ? '#8eae69' : '#b9d18f',1);
  }
}

function drawTree(ctx,x,y,variant=false) {
  ellipse(ctx,x+5,y+2,19,6,'#38534035');
  line(ctx,[[x,y+1],[x,y-33]],'#725137',7);
  const colors=variant?['#487753','#62945d','#8caf64']:['#376c52','#4f855d','#72a567'];
  for (let i=0;i<3;i++) {
    const top=y-47-i*10;
    const width=24-i*5;
    polygon(ctx,[[x,top],[x+width,top+34],[x+2,top+39],[x-width,top+32]],colors[i]);
    polygon(ctx,[[x,top],[x+3,top+39],[x-width,top+32]],'#e1f7ac18');
  }
}

function drawDecoration(ctx,type,x,y,seed=0) {
  if (type==='tree') drawTree(ctx,x,y,seed%2===0);
  if (type==='rock') {
    ellipse(ctx,x+3,y,13,5,'#38534030');
    polygon(ctx,[[x-11,y],[x-9,y-10],[x+1,y-15],[x+10,y-9],[x+10,y-1],[x+2,y+3]],'#798980');
    polygon(ctx,[[x-11,y],[x-9,y-10],[x+1,y-15],[x+3,y-7],[x+2,y+3]],'#a4afa0');
  }
  if (type==='flowers') {
    for(let index=0;index<5;index++) {
      const fx=x+(index-2)*5;
      const fy=y-((index+seed)%3)*5;
      line(ctx,[[fx,fy+1],[fx+2,fy-8]],'#4d854b',1.5);
      ellipse(ctx,fx+2,fy-8,3.6,2.9,['#fff0a9','#e9989a','#f8f2d1'][index%3]);
      ellipse(ctx,fx+2,fy-8,1,1,'#cd9b3c');
    }
  }
  if (type==='bench') {
    ellipse(ctx,x+1,y+2,16,5,'#38534030');
    line(ctx,[[x-11,y+2],[x-11,y-10],[x+11,y-16],[x+11,y-4]],'#644b3d',3);
    polygon(ctx,[[x-15,y-7],[x+8,y-14],[x+15,y-9],[x-8,y-2]],'#bb8d60');
    line(ctx,[[x-15,y-12],[x+8,y-19]],'#a47652',4);
  }
  if (type==='lantern') {
    ellipse(ctx,x+1,y+2,9,4,'#38534035');
    line(ctx,[[x,y+1],[x,y-34],[x+9,y-34],[x+9,y-26]],'#566450',3);
    polygon(ctx,[[x+3,y-27],[x+15,y-27],[x+13,y-15],[x+6,y-15]],'#ffe5a0','#665c41');
  }
  if (type==='telescope') {
    ellipse(ctx,x+1,y+2,16,5,'#38534035');
    line(ctx,[[x-9,y+1],[x,y-19],[x+12,y],[x,y-19],[x,y+2]],'#786451',3);
    line(ctx,[[x-8,y-15],[x+13,y-29]],'#40586a',8);
    line(ctx,[[x+10,y-28],[x+15,y-31]],'#c0dada',7);
  }
}

function drawBuilding(ctx,x,y,roof,wall,hub=false) {
  ctx.save();
  ctx.translate(x,y+3);
  if(hub) ctx.scale(1.2,1.2);
  ellipse(ctx,5,3,44,13,'#34574339');
  polygon(ctx,[[-34,-35],[3,-19],[3,15],[-34,-3]],wall,'#5851434b');
  polygon(ctx,[[3,-19],[36,-35],[36,-2],[3,15]],wall,'#5851434b');
  polygon(ctx,[[3,-19],[36,-35],[36,-2],[3,15]],'#3c3d5a27');
  polygon(ctx,[[-11,-19],[-1,-14],[-1,10],[-11,5]],'#596266');
  polygon(ctx,[[-8,-11],[-3,-8],[-3,-1],[-8,-4]],'#b2e1db');
  polygon(ctx,[[-27,-25],[-17,-20],[-17,-10],[-27,-15]],'#547481','#fff1bd');
  polygon(ctx,[[12,-12],[24,-18],[24,-7],[12,-1]],'#547481','#fff1bd');
  polygon(ctx,[[-40,-33],[-12,-67],[25,-53],[3,-17]],roof,'#4d405564');
  polygon(ctx,[[25,-53],[43,-33],[3,-17]],roof,'#4d405564');
  polygon(ctx,[[25,-53],[43,-33],[3,-17]],'#3c394750');
  line(ctx,[[-12,-67],[25,-53],[43,-33]],'#fff0bf5e',2);
  for(let i=1;i<4;i++) line(ctx,[[-40+i*7,-33-i*8],[3+i*5,-17-i*9]],'#3b2e3b2a',1.3);
  if(hub) {
    line(ctx,[[-9,-59],[-9,-84]],'#e2d8b6',2.6);
    polygon(ctx,[[-8,-84],[12,-79],[-8,-73]],'#efd178');
  }
  ctx.restore();
}

function drawSign(ctx,x,y,marked) {
  ellipse(ctx,x+3,y,10,4,'#3659493d');
  line(ctx,[[x,y+3],[x,y-18]],'#77604a',3.4);
  polygon(ctx,[[x-10,y-20],[x+11,y-25],[x+11,y-15],[x-10,y-10]],marked?'#efd89a':'#c6ad78','#806c4a');
  line(ctx,[[x-6,y-16],[x+7,y-20]],'#8e714b',1.5);
}

function drawCheckpoint(ctx,x,y,index,unlocked,done) {
  ellipse(ctx,x+3,y+2,12,4,'#3659493d');
  line(ctx,[[x,y],[x,y-27]],'#786348',3);
  const fill=done?'#5d934f':unlocked?'#e5a451':'#9c927b';
  polygon(ctx,[[x,y-36],[x+10,y-30],[x+10,y-19],[x,y-13],[x-10,y-19],[x-10,y-30]],fill,'#554e3d');
  ctx.font='bold 11px system-ui';
  ctx.textAlign='center';
  ctx.fillStyle='#fff5d6';
  ctx.fillText(done?'✓':String(index+1),x,y-21);
}

function drawAvatar(ctx,x,y,color,direction,time,walking) {
  const leg=walking?Math.sin(time/78)*4:0;
  ellipse(ctx,x,y+3,11,4,'#2b463c50');
  line(ctx,[[x-5,y-10],[x-5+leg,y]],'#34414b',4);
  line(ctx,[[x+5,y-10],[x+5-leg,y]],'#34414b',4);
  line(ctx,[[x-6,y-18],[x-11,y-9+leg]],'#ddb091',3);
  line(ctx,[[x+6,y-18],[x+11,y-9-leg]],'#ddb091',3);
  ellipse(ctx,x,y-15,9,9,color);
  ellipse(ctx,x,y-27,8,8,'#efc0a2');
  ellipse(ctx,x,y-32,9,4.5,'#4b403e');
  const right=direction==='right' || direction==='up';
  ellipse(ctx,x+(right?3:-3),y-27,1.1,1.35,'#453e40');
  ellipse(ctx,x+(right?6:-6),y-31,3,4,'#4b403e');
}

function drawWater(ctx,time) {
  const gradient=ctx.createLinearGradient(0,0,960,630);
  gradient.addColorStop(0,'#569a9e');
  gradient.addColorStop(.59,'#46868a');
  gradient.addColorStop(1,'#386f77');
  ctx.fillStyle=gradient;
  ctx.fillRect(0,0,canvasWidth,canvasHeight);
  ellipse(ctx,480,335,340,213,'#77b6aa5e');
  ellipse(ctx,480,348,292,181,'#83c2b079');
  ellipse(ctx,480,364,262,167,'#214e5342');
  for(let i=0;i<104;i++) {
    const x=20+randomAt(i,51)*920;
    const y=12+randomAt(47,i)*606;
    const distance=((x-480)/332)**2+((y-330)/201)**2;
    const width=4+randomAt(i,2)*17;
    const shift=Math.sin(time/1600+i*1.01)*5;
    const alpha=(distance>.66?.14:.08)+randomAt(4,i)*.13;
    line(ctx,[[x+shift,y],[x+width+shift,y]],`rgba(207,245,226,${alpha})`,i%6===0?2:1);
  }
  for(const [x,y] of [[132,365],[806,416],[776,199],[212,182],[688,526],[278,534]]) {
    ellipse(ctx,x,y+4,7,2.2,'#c2e7ce48');
    polygon(ctx,[[x-5,y],[x,y-4],[x+6,y-1],[x+2,y+2]],'#7c9f8d');
  }
}

function normWorld(source) {
  const data=source && typeof source==='object'?source:{};
  const tiles={};
  for(const [key,type] of Object.entries(data.tiles??{})) {
    const [x,y]=key.split(',').map(Number);
    if (allowedDecorationTile(x,y) && Object.hasOwn(decorations,type)) tiles[`${x},${y}`]=type;
  }
  const x=Number(data.x);
  const y=Number(data.y);
  const valid=onIsland(x,y) && !reserved(x,y) && scenery[`${x},${y}`]!=='tree';
  return {
    x:valid?x:4, y:valid?y:5,
    color:palette.some(color=>color.hex===data.color)?data.color:palette[0].hex,
    name:typeof data.name==='string'?data.name.slice(0,24):'',
    tiles,
    discoveries:Array.isArray(data.discoveries)?[...new Set(data.discoveries.filter(number=>Number.isInteger(number)&&number>=0&&number<districts.length))]:[],
    memoryWins:Number.isSafeInteger(data.memoryWins)?Math.max(0,data.memoryWins):0,
    expedition:Object.fromEntries(expedition.filter(station=>typeof data.expedition?.[station.id]==='string').map(station=>[station.id,data.expedition[station.id].slice(0,missionNoteLimit)]))
  };
}

function reserved(x,y) {
  return (x===4 && y===3) || districts.some(({at})=>at[0]===x && at[1]===y);
}

function allowedDecorationTile(x,y) {
  return onIsland(x,y) && !reserved(x,y) && !scenery[`${x},${y}`] && !expedition.some(({at})=>at[0]===x && at[1]===y);
}

function button(text, action, attributes='') {
  return `<button type="button" class="hw-button" data-world-action="${action}" ${attributes}>${text}</button>`;
}

function shuffleTiles() {
  const tiles=['Welle','Knospe','Stern','Welle','Knospe','Stern'];
  for(let i=tiles.length-1;i>0;i--) {
    const j=Math.floor(Math.random()*(i+1));
    [tiles[i],tiles[j]]=[tiles[j],tiles[i]];
  }
  return tiles;
}

export function mountWorld(root,{state,save,go,notify}) {
  state.world=normWorld(state.world);
  const data=state.world;
  const learned=Object.keys(state.completed??{}).filter(key=>state.completed[key]);
  const hobbyIDs=new Set(learned.map(key=>key.split(':')[0]));
  const freeDistricts=districts.map(district=>district.hobbies.some(id=>hobbyIDs.has(id)));
  const xp=Number.isFinite(Number(state.xp))?Math.max(0,Number(state.xp)):learned.length*25;
  const tabs={quest:'Inselbuch', expedition:'Expedition', build:'Bauen', avatar:'Figur', play:'Minispiel'};
  let tab='quest';
  let selected=0;
  let stationIndex=Math.max(0,expedition.findLastIndex(station=>station.xp<=xp));
  let placement='';
  let picked=null;
  let focusTile=null;
  let zoom=1;
  let follow=false;
  let direction='down';
  let oldX=data.x;
  let oldY=data.y;
  let movedAt=-1000;
  let raf=0;
  let timer=0;
  let mapTransform={tx:0,ty:0,scale:1};
  let memory={tiles:shuffleTiles(),active:[],done:[],message:''};
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const motionDisabled=()=>reduced.matches||state.settings?.motion===false;
  const startingTasks=[
    {label:'Besuche zwei Bauplätze. Wähle ein Schild auf der Karte aus.',done:()=>data.discoveries.length>=2},
    {label:'Setze eine eigene Dekoration auf ein freies Feld.',done:()=>Object.keys(data.tiles).length>0},
    {label:'Finde alle drei Paare im Insel-Gedächtnisspiel.',done:()=>data.memoryWins>0},
    {label:'Schalte mit einer abgeschlossenen Hobby-Lektion ein Gebäude frei.',done:()=>freeDistricts.some(Boolean)}
  ];

  function stationRequirement(index) {
    if(index===3 && !hasExpeditionWeek(state.events)) return 'Für diese Mission brauchst du drei verschiedene Termine in derselben Kalenderwoche.';
    if(index===4 && !state.projects?.some(project=>project.status==='done')) return 'Für diese Mission brauchst du ein Projekt mit dem Status „Abgeschlossen“.';
    return '';
  }
  root.innerHTML=`
    <section class="hw" aria-labelledby="hw-title">
      <header class="hw-header"><div><h1 id="hw-title">HobbyWorld</h1><p>Eine Insel, die mit deinen Hobbys wächst.</p></div></header>
      <div class="hw-layout">
        <div class="hw-play">
          <div class="hw-stage">
            <canvas width="${canvasWidth}" height="${canvasHeight}" tabindex="0" aria-label="Isometrische Hobbyinsel. Bewege die Figur mit den Pfeiltasten. Enter verwendet das nächste Objekt." aria-describedby="hw-guide"></canvas>
            <span class="hw-loc">Kreativinsel</span>
            <div class="hw-mapzoom" aria-label="Kartenausschnitt">
              <button type="button" data-world-action="zoom-out" aria-label="Karte verkleinern">−</button>
              <button type="button" data-world-action="zoom-reset" aria-label="Karte zentrieren">◎</button>
              <button type="button" data-world-action="zoom-in" aria-label="Figur vergrößern und verfolgen">+</button>
            </div>
          </div>
          <div class="hw-controls">
            <div class="hw-dpad" aria-label="Figur bewegen">
              ${button('↖','left','aria-label="Nach links oben"')}${button('↗','up','aria-label="Nach rechts oben"')}
              ${button('↙','down','aria-label="Nach links unten"')}${button('↘','right','aria-label="Nach rechts unten"')}
            </div>
            ${button('Interagieren','interact')}
            <p id="hw-guide">Pfeiltasten, W A S D oder Tippen auf die Karte. Enter interagiert.</p>
            <b data-world-status role="status" aria-live="polite">Du bist am Inselplatz.</b>
          </div>
        </div>
        <aside class="hw-panel" aria-label="Inselmenü">
          <div class="hw-tabs" aria-label="Inselmenübereiche">${Object.entries(tabs).map(([key,name])=>button(name,`tab-${key}`,'aria-pressed="false"')).join('')}</div>
          <div data-world-panel></div>
        </aside>
      </div>
    </section>`;
  const canvas=root.querySelector('canvas');
  const ctx=canvas.getContext('2d');
  const terrain=document.createElement('canvas');
  terrain.width=canvasWidth;
  terrain.height=canvasHeight;
  const terrainContext=terrain.getContext('2d');
  if(terrainContext) {
    for(let row=0;row<=16;row++) {
      for(let x=0;x<gridSize;x++) {
        const y=row-x;
        if(onIsland(x,y)) ground(terrainContext,x,y);
      }
    }
  }
  const panel=root.querySelector('[data-world-panel]');
  const status=root.querySelector('[data-world-status]');

  function say(message) {
    status.textContent=message;
  }

  function questHTML() {
    const district=districts[selected];
    const progress=startingTasks.filter(task=>task.done()).length;
    return `<h2>Deine Insel entdecken</h2>
      <p class="hw-muted">${data.discoveries.length} von ${districts.length} Bauplätzen erkundet · ${freeDistricts.filter(Boolean).length} Gebäude freigeschaltet</p>
      <div class="hw-cards"><div class="hw-card"><h3>${district.name}</h3><span class="hw-muted">${freeDistricts[selected]?'Mit Lernfortschritt freigeschaltet':'Abgeschlossene Lektionen aus dem passenden Hobby schalten dieses Gebäude frei.'}</span>${button(freeDistricts[selected]?'Lernpfad öffnen':'Passendes Hobby ansehen',`hobby-${selected}`)}</div></div>
      <details class="hw-district-picker"><summary>Alle Bauplätze</summary><div class="hw-expedition-links">${districts.map((item,index)=>button(item.name,`district-${index}`,`aria-pressed="${index===selected}"`)).join('')}</div></details>
      <h3>Inselrundgang · ${progress}/${startingTasks.length}</h3>
      <ul class="hw-list">${startingTasks.map(task=>`<li>${task.done()?'<strong>Erledigt.</strong> ':''}${task.label}</li>`).join('')}</ul>
      ${progress===startingTasks.length?'<p><strong>Errungenschaft · Inselexpert:in</strong></p>':''}`;
  }

  function expeditionHTML() {
    const station=expedition[stationIndex];
    const reached=xp>=station.xp;
    const complete=reached && Object.hasOwn(data.expedition,station.id);
    const unmet=stationRequirement(stationIndex);
    const next=expedition.find(item=>item.xp>xp);
    const routes=(station.hobbies??[]).map(id=>button(({naturbeobachtung:'Naturbeobachtung',zeichnen:'Zeichnen',fotografie:'Fotografie',rhythmustraining:'Rhythmustraining',musikproduktion:'Musikproduktion'})[id],`expedition-hobby-${id}`)).join(' ');
    return `<h2>Die Lernexpedition</h2><p class="hw-muted">${xp} XP · ${next?`Noch ${next.xp-xp} XP bis ${next.name}`:'Alle Orte freigeschaltet'}</p>
      <ol class="hw-expedition-list">${expedition.map((item,index)=>`<li>${button(item.name,`station-${index}`,`aria-pressed="${index===stationIndex}"`)}<small>${xp>=item.xp&&Object.hasOwn(data.expedition,item.id)?'Erledigt':`${item.xp} XP`}</small></li>`).join('')}</ol>
      <h3>${station.title}</h3><p>${station.intro}</p>
      ${reached?complete?`<p><strong>Mission erledigt · ${station.reward} gesammelt</strong></p><p class="hw-muted" data-world-expedition-note></p>`:unmet?`<p class="hw-muted">${unmet}</p>`:`<form data-world-expedition><fieldset><legend>Dein Ergebnis</legend>${station.criteria.map(text=>`<label><input type="checkbox" required> ${text}</label>`).join('')}<label for="hw-expedition-note">Erkenntnis (freiwillig)</label><textarea id="hw-expedition-note" maxlength="${missionNoteLimit}" rows="2"></textarea></fieldset><button class="hw-button" type="submit">Mission dokumentieren</button></form>`:`<p class="hw-muted">Noch ${station.xp-xp} XP bis zur Freischaltung.</p>`}
      ${routes?`<div class="hw-expedition-links">${routes}</div>`:''}
      ${stationIndex===3?`<div class="hw-expedition-links">${button('Wochenplan öffnen','open-calendar')}</div>`:''}
      ${stationIndex===4?`<div class="hw-expedition-links">${button('Projekte öffnen','open-projects')}</div>`:''}
      <p><a class="hw-muted" href="../#karte">Ursprüngliche Spielkarte</a></p>`;
  }

  function buildHTML() {
    const options=Object.entries(decorations).map(([type,item])=>{
      const unlocked=learned.length>=item.minimum;
      return `<div class="hw-card"><h3>${item.name}</h3>${unlocked?button('Platzieren',`item-${type}`,`aria-pressed="${placement===type}"`):`<span class="hw-muted">Ab ${item.minimum} abgeschlossenen Lektionen</span>`}</div>`;
    }).join('');
    return `<h2>Dekoration</h2><p class="hw-muted">Wähle etwas aus und tippe auf ein freies Feld. Mit Enter wählst du das Feld deiner Figur.</p>
      <div class="hw-cards">${options}</div>
      ${button(picked?'Verschieben abbrechen':'Verschieben','relocate',`aria-pressed="${placement==='relocate'}"`)}
      ${button('Entfernen','remove',`aria-pressed="${placement==='remove'}"`)}
      ${placement?button('Abbrechen','cancel'):''}`;
  }

  function avatarHTML() {
    return `<h2>Deine Inselfigur</h2><p class="hw-muted">Wähle eine Jackenfarbe und einen optionalen Namen.</p>
    <div class="hw-colors">${palette.map((color,i)=>`<button type="button" data-world-action="color-${i}" style="--swatch:${color.hex}" aria-label="${color.name}" aria-pressed="${data.color===color.hex}"></button>`).join('')}</div>
    <form data-world-avatar><label for="hw-avatar-name">Name</label><br><input id="hw-avatar-name" type="text" maxlength="24" autocomplete="off"><br><button class="hw-button" type="submit">Speichern</button></form>`;
  }

  function playHTML() {
    return `<h2>Insel-Gedächtnis</h2><p class="hw-muted">Decke zwei Karten auf. Finde die Paare in deinem Tempo.</p>
    <div class="hw-mini">${memory.tiles.map((tile,index)=>{
      const visible=memory.done.includes(index)||memory.active.includes(index);
      return button(visible?tile:`Karte ${index+1}`,`memory-${index}`,`${visible?'disabled ':''}aria-label="Karte ${index+1}${visible?` ${tile}`:', verdeckt'}"`);
    }).join('')}</div>
    <p aria-live="polite">${memory.message||`${memory.done.length/2} von 3 Paaren gefunden.`}</p>
    ${button('Neu mischen','shuffle')}`;
  }

  function renderPanel(restoreFocus=null,openDistrictPicker=false) {
    root.querySelectorAll('[data-world-action^="tab-"]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.worldAction===`tab-${tab}`)));
    panel.innerHTML=({quest:questHTML,expedition:expeditionHTML,build:buildHTML,avatar:avatarHTML,play:playHTML})[tab]();
    const name=panel.querySelector('#hw-avatar-name');
    if(name) name.value=data.name;
    const note=panel.querySelector('[data-world-expedition-note]');
    if(note) note.textContent=data.expedition[expedition[stationIndex].id];
    const districtPicker=panel.querySelector('.hw-district-picker');
    if(districtPicker && openDistrictPicker) districtPicker.open=true;
    if(restoreFocus) {
      const replacement=Array.from(panel.querySelectorAll('[data-world-action]')).find(el=>el.dataset.worldAction===restoreFocus&&!el.disabled);
      (replacement??panel.querySelector('[data-world-action]:not(:disabled)'))?.focus({preventScroll:true});
    }
  }

  function camera() {
    const [targetX,targetY]=follow?position(data.x,data.y):[480,315];
    return {tx:480-targetX*zoom,ty:315-targetY*zoom,scale:zoom};
  }

  function paint(time) {
    if (!ctx) return;
    const noMotion=motionDisabled();
    const pace=noMotion?0:time;
    drawWater(ctx,pace);
    ctx.save();
    mapTransform=camera();
    ctx.translate(mapTransform.tx,mapTransform.ty);
    ctx.scale(mapTransform.scale,mapTransform.scale);
    ctx.drawImage(terrain,0,0);
    if(tab==='expedition') {
      ctx.setLineDash([4,5]);
      line(ctx,expedition.map(({at})=>position(...at)),'#694d3c89',2.5);
      ctx.setLineDash([]);
    }
    const cursor=placement && (focusTile??[data.x,data.y]);
    if(cursor) {
      const [x,y]=position(...cursor);
      polygon(ctx,[[x,y-21],[x+42,y],[x,y+21],[x-42,y]],'#f7efa449','#f9f1bd');
    }
    const phase=noMotion?1:Math.min(Math.max((time-movedAt)/145,0),1);
    const px=oldX+(data.x-oldX)*phase;
    const py=oldY+(data.y-oldY)*phase;
    const objects=[{depth:px+py+.48,draw:()=>drawAvatar(ctx,...position(px,py),data.color,direction,pace,phase<1)}];
    for(const [key,type] of Object.entries({...scenery,...data.tiles})) {
      const [x,y]=key.split(',').map(Number);
      objects.push({depth:x+y,draw:()=>drawDecoration(ctx,type,...position(x,y),x+y)});
    }
    objects.push({depth:7,draw:()=>drawBuilding(ctx,...position(4,3),'#b26756','#f8deb2',true)});
    districts.forEach((district,index)=>{
      const [x,y]=district.at;
      objects.push({depth:x+y,draw:()=>{
        const [sx,sy]=position(x,y);
        if (freeDistricts[index]) drawBuilding(ctx,sx,sy,district.roof,district.wall);
        else drawSign(ctx,sx,sy,selected===index);
      }});
    });
    expedition.forEach((station,index)=>{
      const [x,y]=station.at;
      objects.push({depth:x+y+.22,draw:()=>drawCheckpoint(ctx,...position(x,y),index,xp>=station.xp,Object.hasOwn(data.expedition,station.id))});
    });
    objects.sort((first,second)=>first.depth-second.depth).forEach(item=>item.draw());
    if(data.name) {
      const [x,y]=position(px,py);
      ctx.font='600 12px system-ui';
      ctx.textAlign='center';
      const width=ctx.measureText(data.name).width+14;
      ctx.fillStyle='#2e4544eb';
      ctx.fillRect(x-width/2,y-57,width,16);
      ctx.fillStyle='#fff0d4';
      ctx.fillText(data.name,x,y-45);
    }
    ctx.restore();
    if(!noMotion) raf=requestAnimationFrame(paint);
  }

  function redraw() {
    if(motionDisabled()) paint(performance.now());
  }

  function move(destX,destY,dir=direction) {
    if(!onIsland(destX,destY) || reserved(destX,destY) || scenery[`${destX},${destY}`]==='tree') {
      say('Dieses Feld ist belegt oder liegt im Wasser.');
      return;
    }
    direction=dir;
    focusTile=null;
    const distance=Math.abs(data.x-destX)+Math.abs(data.y-destY);
    oldX=distance===1?data.x:destX;
    oldY=distance===1?data.y:destY;
    data.x=destX;
    data.y=destY;
    movedAt=performance.now();
    save();
    say(`Du bist auf Feld ${destX+1}, ${destY+1}.`);
    redraw();
  }

  function inspect(index,fromButton=false) {
    const district=districts[index];
    selected=index;
    tab='quest';
    if(!data.discoveries.includes(index)) {
      data.discoveries.push(index);
      save();
    }
    say(`${district.name}. ${freeDistricts[index]?'Gebäude freigeschaltet.':'Bauplatz entdeckt.'}`);
    renderPanel(fromButton?`district-${index}`:null,fromButton);
    redraw();
  }

  function openStation(index,fromButton=false) {
    stationIndex=index;
    tab='expedition';
    const station=expedition[index];
    say(`${station.name}. ${xp<station.xp?`Freigabe ab ${station.xp} XP.`:'Mission verfügbar.'}`);
    renderPanel(fromButton?`station-${index}`:null);
    redraw();
  }

  function buildAt(x,y) {
    const key=`${x},${y}`;
    const available=allowedDecorationTile(x,y) && !data.tiles[key];
    if(placement==='remove') {
      if(!data.tiles[key]) return say('Wähle eine eigene Dekoration zum Entfernen.');
      delete data.tiles[key];
      say('Dekoration entfernt. Du kannst sie jederzeit wieder setzen.');
      placement='';
    } else if(placement==='relocate') {
      if(!picked) {
        if(!data.tiles[key]) return say('Wähle zuerst eine eigene Dekoration.');
        picked=key;
        focusTile=[x,y];
        say('Wähle jetzt ein freies Zielfeld.');
        renderPanel();
        redraw();
        return;
      }
      if(!available) return say('Das Zielfeld muss frei sein.');
      data.tiles[key]=data.tiles[picked];
      delete data.tiles[picked];
      picked=null;
      placement='';
      say('Dekoration verschoben.');
    } else {
      if(!available) return say('Wähle ein freies Feld auf der Insel.');
      data.tiles[key]=placement;
      say(`${decorations[placement].name} platziert.`);
      placement='';
    }
    focusTile=null;
    save();
    renderPanel();
    redraw();
  }

  function interact() {
    if(placement) return buildAt(data.x,data.y);
    const station=expedition.findIndex(({at:[x,y]})=>x===data.x && y===data.y);
    if(station!==-1) return openStation(station);
    const index=districts.findIndex(({at:[x,y]})=>Math.abs(x-data.x)+Math.abs(y-data.y)<=1);
    if(index!==-1) return inspect(index);
    if(Math.abs(data.x-4)+Math.abs(data.y-3)<=1) {
      tab='play';
      renderPanel();
      say('Willkommen im Inselhaus. Das Gedächtnisspiel ist geöffnet.');
    } else if(data.tiles[`${data.x},${data.y}`]) {
      say(`Du stehst bei deiner Dekoration: ${decorations[data.tiles[`${data.x},${data.y}`]].name}.`);
    } else say('Geh neben ein Schild oder Gebäude, oder wähle es direkt auf der Karte.');
  }

  function memoryTurn(index) {
    if(memory.active.length===2||memory.done.includes(index)||memory.active.includes(index)) return;
    memory.active.push(index);
    memory.message='';
    if(memory.active.length===2) {
      const [first,second]=memory.active;
      if(memory.tiles[first]===memory.tiles[second]) {
        memory.done.push(first,second);
        memory.active=[];
        memory.message=`Paar gefunden: ${memory.tiles[first]}.`;
        if(memory.done.length===memory.tiles.length) {
          data.memoryWins+=1;
          save();
          memory.message='Alle Paare gefunden. Der Inselrundgang wurde aktualisiert.';
          notify?.('Insel-Gedächtnis geschafft');
        }
      } else {
        memory.message='Zwei verschiedene Karten. Merke dir ihre Positionen.';
        timer=setTimeout(()=>{
          memory.active=[];
          if(tab==='play') {
            const focused=panel.contains(document.activeElement) ? document.activeElement.dataset.worldAction : null;
            renderPanel(focused);
          }
        },950);
      }
    }
    renderPanel(`memory-${index}`);
  }

  function click(event) {
    const trigger=event.target.closest('[data-world-action]');
    if(!trigger||!root.contains(trigger)) return;
    const action=trigger.dataset.worldAction;
    if (Object.hasOwn(movement,action)) {
      const [x,y]=movement[action];
      return move(data.x+x,data.y+y,action);
    }
    if(action==='interact') return interact();
    if(action.startsWith('tab-')) {
      tab=action.slice(4);
      placement='';
      picked=null;
      renderPanel();
      redraw();
      return;
    }
    if(action.startsWith('zoom-')) {
      if(action==='zoom-reset') zoom=1;
      else zoom=Math.min(1.75,Math.max(.8,zoom+(action==='zoom-in'?.25:-.25)));
      follow=zoom>1;
      say(`Kamera bei ${Math.round(zoom*100)} Prozent.`);
      redraw();
      return;
    }
    if(action.startsWith('hobby-')) {
      const district=districts[Number(action.slice(6))];
      return go(`hobby/${district.hobbies.find(id=>hobbyIDs.has(id))??district.hobbies[0]}`);
    }
    if(action.startsWith('district-')) return inspect(Number(action.slice(9)),true);
    if(action.startsWith('station-')) return openStation(Number(action.slice(8)),true);
    if(action.startsWith('expedition-hobby-')) return go(`hobby/${action.slice(17)}`);
    if(action==='open-calendar') return go('calendar');
    if(action==='open-projects') return go('projects');
    if(action.startsWith('color-')) {
      data.color=palette[Number(action.slice(6))].hex;
      root.querySelectorAll('[data-world-action^="color-"]').forEach(option=>option.setAttribute('aria-pressed',String(option===trigger)));
      save();
      say('Jackenfarbe gespeichert.');
      redraw();
      return;
    }
    if(action.startsWith('memory-')) return memoryTurn(Number(action.slice(7)));
    if(action==='shuffle') {
      clearTimeout(timer);
      memory={tiles:shuffleTiles(),active:[],done:[],message:''};
      return renderPanel('shuffle');
    }
    if(action.startsWith('item-')) {
      placement=action.slice(5);
      say(`Wähle ein Feld für ${decorations[placement].name}.`);
    } else {
      placement=action==='cancel' || (action==='relocate' && picked)?'':action;
      say(({relocate:'Wähle eine eigene Dekoration zum Verschieben.',remove:'Wähle eine eigene Dekoration zum Entfernen.'})[placement]??'Baumodus verlassen.');
    }
    focusTile=null;
    picked=null;
    renderPanel(action);
    redraw();
  }

  function submit(event) {
    if(event.target.matches('[data-world-expedition]')) {
      event.preventDefault();
      const station=expedition[stationIndex];
      if(xp<station.xp || stationRequirement(stationIndex) || !event.target.checkValidity()) return;
      data.expedition[station.id]=event.target.querySelector('textarea').value.trim().slice(0,missionNoteLimit);
      save();
      say(`${station.reward} gesammelt. Die Mission ist dokumentiert.`);
      renderPanel(`station-${stationIndex}`);
      redraw();
      return;
    }
    if(!event.target.matches('[data-world-avatar]')) return;
    event.preventDefault();
    data.name=event.target.querySelector('input').value.trim().slice(0,24);
    save();
    say(data.name?`${data.name} erkundet die Insel.`:'Figur ohne Namen gespeichert.');
    redraw();
  }

  function stagePoint(event) {
    const rect=canvas.getBoundingClientRect();
    return [((event.clientX-rect.left)*canvasWidth/rect.width-mapTransform.tx)/mapTransform.scale,((event.clientY-rect.top)*canvasHeight/rect.height-mapTransform.ty)/mapTransform.scale];
  }

  function tileAt(event) {
    const [x,y]=stagePoint(event);
    const a=(x-canvasWidth/2)/tileWidth;
    const b=(y-136)/tileHeight;
    return [Math.round((a+b)/2),Math.round((b-a)/2)];
  }

  function mapClick(event) {
    const [x,y]=tileAt(event);
    if(placement) return buildAt(x,y);
    const [sx,sy]=stagePoint(event);
    const matches=(at,rx,ry,height)=>{
      const [cx,cy]=position(...at);
      return (x===at[0]&&y===at[1]) || (Math.abs(sx-cx)<=rx && Math.abs(sy-cy+height)<=ry);
    };
    const station=expedition.findIndex(({at})=>matches(at,12,19,18));
    if(station!==-1) return openStation(station);
    const index=districts.findIndex(({at},index)=>freeDistricts[index]?matches(at,30,34,33):matches(at,13,15,14));
    if(index!==-1) return inspect(index);
    if(matches([4,3],36,36,39)) {
      tab='play';
      renderPanel();
      return say('Das Gedächtnisspiel im Inselhaus ist geöffnet.');
    }
    move(x,y,x>=data.x?'right':'left');
  }

  function hover(event) {
    if(!placement) return;
    const [x,y]=tileAt(event);
    focusTile=onIsland(x,y)?[x,y]:null;
    redraw();
  }

  function keyboard(event) {
    const action=({ArrowUp:'up',w:'up',ArrowDown:'down',s:'down',ArrowLeft:'left',a:'left',ArrowRight:'right',d:'right'})[event.key.length===1?event.key.toLowerCase():event.key];
    if(action) {
      event.preventDefault();
      const [x,y]=movement[action];
      move(data.x+x,data.y+y,action);
    } else if(event.key==='Enter'||event.key===' ') {
      event.preventDefault();
      interact();
    }
  }

  function motionChanged() {
    cancelAnimationFrame(raf);
    paint(performance.now());
  }

  root.addEventListener('click',click);
  root.addEventListener('submit',submit);
  canvas.addEventListener('click',mapClick);
  canvas.addEventListener('pointermove',hover);
  canvas.addEventListener('keydown',keyboard);
  reduced.addEventListener('change',motionChanged);
  renderPanel();
  paint(performance.now());
  return ()=>{
    cancelAnimationFrame(raf);
    clearTimeout(timer);
    root.removeEventListener('click',click);
    root.removeEventListener('submit',submit);
    canvas.removeEventListener('click',mapClick);
    canvas.removeEventListener('pointermove',hover);
    canvas.removeEventListener('keydown',keyboard);
    reduced.removeEventListener('change',motionChanged);
  };
}

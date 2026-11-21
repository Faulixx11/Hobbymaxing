import {createHash,randomBytes} from 'node:crypto';
import {DatabaseSync} from 'node:sqlite';
import {challenges} from './catalog.mjs';

const expiresIn=30*86400000;
const roomCode=/^[A-Za-z0-9_-]{24}$/;
const memberKey=/^[A-Fa-f\d-]{36}$/;
const scoreChallenges=new Map(challenges.filter(quest=>quest.max).map(quest=>[quest.id,quest]));

function reply(response,status,payload) {
  response.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','Referrer-Policy':'no-referrer'});
  response.end(JSON.stringify(payload));
}
async function body(request) {
  let size=0;
  const chunks=[];
  for await(const block of request) {
    size+=block.length;
    if(size>4096) return null;
    chunks.push(block);
  }
  try {return JSON.parse(Buffer.concat(chunks).toString('utf8'));} catch {return null;}
}
export function roomApi(path) {
  const db=new DatabaseSync(path);
  db.exec(`PRAGMA journal_mode=WAL;
    PRAGMA foreign_keys=ON;
    CREATE TABLE IF NOT EXISTS rooms (code TEXT PRIMARY KEY, quest TEXT NOT NULL, expires INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS results (room TEXT NOT NULL REFERENCES rooms(code) ON DELETE CASCADE, player TEXT NOT NULL,
      name TEXT NOT NULL, score INTEGER NOT NULL, PRIMARY KEY(room,player));`);
  const find=db.prepare('SELECT quest,expires FROM rooms WHERE code=?');
  const clean=db.prepare('DELETE FROM rooms WHERE expires<=?');
  const insert=db.prepare('INSERT INTO rooms VALUES(?,?,?)');
  const results=db.prepare('SELECT name,score,player FROM results WHERE room=? ORDER BY score DESC,name COLLATE NOCASE');
  const update=db.prepare('INSERT INTO results VALUES(?,?,?,?) ON CONFLICT(room,player) DO UPDATE SET name=excluded.name,score=excluded.score');
  const rate=new Map();

  function limited(request) {
    const now=Date.now(), id=request.socket.remoteAddress||'local';
    if(rate.size>500) for(const [key,value] of rate) if(value.reset<now) rate.delete(key);
    if(rate.size>1000&&!rate.has(id)) return true;
    const prior=rate.get(id);
    const current=prior&&prior.reset>now?prior:{number:0,reset:now+60000};
    current.number++;
    rate.set(id,current);
    return current.number>45;
  }
  return async function handle(request,response,path) {
    const method=request.method;
    if(path==='/api/rooms/health'&&method==='GET') return reply(response,200,{available:true});
    if(method!=='GET'&&limited(request)) return reply(response,429,{error:'Zu viele Versuche. Warte kurz und probiere es erneut.'});
    const now=Date.now();
    if(path==='/api/rooms'&&method==='POST') {
      const data=await body(request);
      if(!scoreChallenges.has(data?.quest)) return reply(response,400,{error:'Wähle eine Challenge mit Punktwertung.'});
      clean.run(now);
      const code=randomBytes(18).toString('base64url');
      insert.run(code,data.quest,now+expiresIn);
      return reply(response,201,{code});
    }
    const [,code]=path.match(/^\/api\/rooms\/([^/]+)$/)||[];
    if(!roomCode.test(code||'')) return reply(response,404,{error:'Raum ist abgelaufen oder der Einladungslink ist ungültig.'});
    const found=find.get(code);
    if(!found||found.expires<=now) return reply(response,404,{error:'Raum ist abgelaufen oder der Einladungslink ist ungültig.'});
    const quest=scoreChallenges.get(found.quest);
    if(!quest) return reply(response,404,{error:'Diese Challenge ist nicht mehr verfügbar.'});
    const auth=request.headers.authorization?.split(' ')[1]||'';
    const player=memberKey.test(auth)?createHash('sha256').update(auth).digest('hex'):'';
    if(method==='PUT') {
      if(!player) return reply(response,401,{error:'Das Gastprofil konnte nicht erkannt werden.'});
      const data=await body(request);
      const name=typeof data?.name==='string'?data.name.trim():'';
      if(!name||name.length>28||!Number.isInteger(data.score)||data.score<0||data.score>quest.max) {
        return reply(response,400,{error:'Prüfe den Namen und die Punktzahl.'});
      }
      const existing=results.all(code);
      if(existing.length>=20&&!existing.some(row=>row.player===player)) return reply(response,409,{error:'Dieser Raum hat bereits 20 Teilnehmende.'});
      update.run(code,player,name,data.score);
    } else if(method!=='GET') return reply(response,405,{error:'Diese Aktion wird nicht unterstützt.'});
    return reply(response,200,{quest:quest.id,expires:found.expires,rows:results.all(code).map(({name,score,player:id})=>({name,score,mine:id===player}))});
  };
}

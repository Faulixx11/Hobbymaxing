import {createHash,randomBytes} from 'node:crypto';
import {DatabaseSync} from 'node:sqlite';
import {challenges,hobbies,quests} from './catalog.mjs';

const expiresIn=30*86400000;
const roomCode=/^[A-Za-z0-9_-]{24}$/;
const memberKey=/^[A-Fa-f\d-]{36}$/;
const scoreChallenges=new Map(challenges.filter(quest=>quest.max).map(quest=>[quest.id,quest]));
const activityRooms=new Map([['buddy-week',2],['team-week',20]]);
const guest=request=>{
  const match=(request.headers.authorization||'').match(/^Bearer ([^ ]+)$/);
  return memberKey.test(match?.[1]||'')?createHash('sha256').update(match[1]).digest('hex'):'';
};

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
      name TEXT NOT NULL, score INTEGER NOT NULL, PRIMARY KEY(room,player));
    CREATE TABLE IF NOT EXISTS snapshots (code TEXT PRIMARY KEY, owner TEXT NOT NULL, kind TEXT NOT NULL,
      payload TEXT NOT NULL, expires INTEGER NOT NULL);`);
  const find=db.prepare('SELECT quest,expires FROM rooms WHERE code=?');
  const clean=db.prepare('DELETE FROM rooms WHERE expires<=?');
  const insert=db.prepare('INSERT INTO rooms VALUES(?,?,?)');
  const results=db.prepare('SELECT name,score,player FROM results WHERE room=? ORDER BY score DESC,name COLLATE NOCASE');
  const update=db.prepare('INSERT INTO results VALUES(?,?,?,?) ON CONFLICT(room,player) DO UPDATE SET name=excluded.name,score=excluded.score');
  const cleanSnapshots=db.prepare('DELETE FROM snapshots WHERE expires<=?');
  const snapshotList=db.prepare('SELECT code,kind,expires FROM snapshots WHERE owner=? AND expires>? ORDER BY expires DESC');
  const snapshotAdd=db.prepare('INSERT INTO snapshots VALUES(?,?,?,?,?)');
  const snapshotRead=db.prepare('SELECT kind,payload,expires FROM snapshots WHERE code=? AND expires>?');
  const snapshotRemove=db.prepare('DELETE FROM snapshots WHERE code=? AND owner=?');
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
    if(path==='/api/rooms/shares') {
      const owner=guest(request);
      if(!owner) return reply(response,401,{error:'Das Gastprofil konnte nicht erkannt werden.'});
      const shares=snapshotList.all(owner,now);
      if(method==='GET') return reply(response,200,{shares});
      if(method!=='POST') return reply(response,405,{error:'Diese Aktion wird nicht unterstützt.'});
      const data=await body(request);
      if(snapshotList.all(owner,now).length>=20) return reply(response,409,{error:'Widerrufe zuerst einen deiner 20 aktiven Links.'});
      let payload;
      if(data?.kind==='project'&&typeof data.quest==='string'&&quests[data.quest]?.stage===4) {
        payload={quest:data.quest};
      } else if(data?.kind==='progress'&&Number.isInteger(data.stations)&&data.stations>=0&&data.stations<=hobbies.length*4&&
        Number.isInteger(data.projects)&&data.projects>=0&&data.projects<=hobbies.length&&data.projects<=data.stations&&
        Number.isInteger(data.days)&&data.days>=0&&data.days<=7) {
        payload={stations:data.stations,projects:data.projects,days:data.days};
      }
      if(!payload) return reply(response,400,{error:'Diese Freigabe enthält ungültige Angaben.'});
      cleanSnapshots.run(now);
      const code=randomBytes(18).toString('base64url');
      snapshotAdd.run(code,owner,data.kind,JSON.stringify(payload),now+expiresIn);
      return reply(response,201,{code});
    }
    const shareCode=path.match(/^\/api\/rooms\/shares\/([A-Za-z0-9_-]{24})$/)?.[1];
    if(shareCode) {
      if(method==='DELETE') {
        const owner=guest(request);
        if(!owner) return reply(response,401,{error:'Das Gastprofil konnte nicht erkannt werden.'});
        const removed=snapshotRemove.run(shareCode,owner).changes;
        if(removed) return reply(response,200,{revoked:true});
      } else if(method==='GET') {
        const share=snapshotRead.get(shareCode,now);
        if(share) return reply(response,200,{kind:share.kind,expires:share.expires,...JSON.parse(share.payload)});
      } else return reply(response,405,{error:'Diese Aktion wird nicht unterstützt.'});
      return reply(response,404,{error:'Dieser Link wurde widerrufen, ist abgelaufen oder ist ungültig.'});
    }
    if(path==='/api/rooms'&&method==='POST') {
      const data=await body(request);
      if(!scoreChallenges.has(data?.quest)&&!activityRooms.has(data?.quest)) return reply(response,400,{error:'Wähle eine Challenge oder einen Wochenraum.'});
      clean.run(now);
      const code=randomBytes(18).toString('base64url');
      insert.run(code,data.quest,now+(activityRooms.has(data.quest)?7*86400000:expiresIn));
      return reply(response,201,{code});
    }
    const [,code]=path.match(/^\/api\/rooms\/([^/]+)$/)||[];
    if(!roomCode.test(code||'')) return reply(response,404,{error:'Raum ist abgelaufen oder der Einladungslink ist ungültig.'});
    const found=find.get(code);
    if(!found||found.expires<=now) return reply(response,404,{error:'Raum ist abgelaufen oder der Einladungslink ist ungültig.'});
    const quest=scoreChallenges.get(found.quest);
    const capacity=activityRooms.get(found.quest);
    if(!quest&&!capacity) return reply(response,404,{error:'Diese Challenge ist nicht mehr verfügbar.'});
    const player=guest(request);
    if(method==='PUT') {
      if(!player) return reply(response,401,{error:'Das Gastprofil konnte nicht erkannt werden.'});
      const data=await body(request);
      const existing=results.all(code), own=existing.find(row=>row.player===player);
      const name=capacity?(own?.name||'Person '+(existing.length+1)):typeof data?.name==='string'?data.name.trim():'';
      if(!name||name.length>28||!Number.isInteger(data?.score)||data.score<0||data.score>(capacity?7:quest.max)) {
        return reply(response,400,{error:'Prüfe den Namen und die Punktzahl.'});
      }
      if(existing.length>=(capacity||20)&&!own) return reply(response,409,{error:'Dieser Raum ist voll.'});
      update.run(code,player,name,data.score);
    } else if(method!=='GET') return reply(response,405,{error:'Diese Aktion wird nicht unterstützt.'});
    return reply(response,200,{quest:found.quest,expires:found.expires,rows:results.all(code).map(({name,score,player:id})=>({name,score,mine:id===player}))});
  };
}

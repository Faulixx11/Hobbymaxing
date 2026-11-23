import test from 'node:test';
import assert from 'node:assert/strict';
import {Readable} from 'node:stream';
import {randomUUID} from 'node:crypto';
import {roomApi} from './room-server.mjs';

function roomRequests() {
  const rooms=roomApi(':memory:');
  return async function request(path,method='GET',data,token) {
    const request=Readable.from(data?[Buffer.from(JSON.stringify(data))]:[]);
    request.method=method;
    request.headers=token?{authorization:'Bearer '+token}:{};
    request.socket={remoteAddress:'test'};
    let status,payload;
    await rooms(request,{writeHead(code){status=code;},end(body){payload=JSON.parse(body);}},path);
    return {status,payload};
  };
}

test('two guests see the same private room and can update only their own results',async()=>{
  const request=roomRequests();
  const created=await request('/api/rooms','POST',{quest:'challenge-pass'});
  assert.equal(created.status,201);
  const path='/api/rooms/'+created.payload.code;
  const a=randomUUID(), b=randomUUID();
  assert.equal((await request(path,'PUT',{name:'A',score:3})).status,401);
  assert.equal((await request(path,'PUT',{name:'A',score:11},a)).status,400);
  assert.equal((await request(path,'PUT',{name:'A',score:3},a)).status,200);
  assert.equal((await request(path,'PUT',{name:'B',score:7},b)).status,200);
  const both=await request(path,'GET',undefined,a);
  assert.deepEqual(both.payload.rows,[{name:'B',score:7,mine:false},{name:'A',score:3,mine:true}]);
  await request(path,'PUT',{name:'A',score:9},a);
  assert.deepEqual((await request(path,'GET',undefined,b)).payload.rows,[{name:'A',score:9,mine:false},{name:'B',score:7,mine:true}]);
  assert.equal((await request('/api/rooms/unknown')).status,404);
});

test('private buddy rooms cap membership and weekly points without storing submitted names',async()=>{
  const request=roomRequests();
  const created=await request('/api/rooms','POST',{quest:'buddy-week'});
  const path='/api/rooms/'+created.payload.code;
  const a=randomUUID(), b=randomUUID();
  assert.equal((await request(path,'PUT',{name:'Name that should be ignored',score:8},a)).status,400);
  assert.equal((await request(path,'PUT',{name:'Name that should be ignored',score:3},a)).status,200);
  assert.equal((await request(path,'PUT',{score:7},b)).status,200);
  assert.equal((await request(path,'PUT',{score:1},randomUUID())).status,409);
  const room=(await request(path,'GET',undefined,a)).payload;
  assert.equal(room.quest,'buddy-week');
  assert.deepEqual(room.rows,[{name:'Person 2',score:7,mine:false},{name:'Person 1',score:3,mine:true}]);
  await request(path,'PUT',{score:5},a);
  assert.equal((await request(path)).payload.rows[1].score,5);
});

test('anonymous share snapshots only expose approved fields and only their owner can revoke them',async()=>{
  const request=roomRequests(), owner=randomUUID(), stranger=randomUUID();
  const route='/api/rooms/shares';
  const snapshot={kind:'progress',stations:8,projects:2,days:3,name:'Private name',note:'Private journal'};
  assert.equal((await request(route,'POST',snapshot)).status,401);
  assert.equal((await request(route,'POST',{...snapshot,projects:10},owner)).status,400);
  const created=await request(route,'POST',snapshot,owner);
  assert.equal(created.status,201);
  const path=route+'/'+created.payload.code;
  assert.deepEqual(Object.keys((await request(path)).payload).sort(),['days','expires','kind','projects','stations']);
  assert.equal((await request(route,'GET',undefined,stranger)).payload.shares.length,0);
  assert.equal((await request(path,'DELETE',undefined,stranger)).status,404);
  assert.equal((await request(path,'DELETE',undefined,owner)).status,200);
  assert.equal((await request(path)).status,404);

  const project=await request(route,'POST',{kind:'project',quest:'fotografie-meisterwerk',note:'Private'},owner);
  assert.equal(project.status,201);
  const shared=(await request(route+'/'+project.payload.code)).payload;
  assert.equal(shared.quest,'fotografie-meisterwerk');
  assert.equal(shared.note,undefined);
});

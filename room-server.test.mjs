import test from 'node:test';
import assert from 'node:assert/strict';
import {Readable} from 'node:stream';
import {randomUUID} from 'node:crypto';
import {roomApi} from './room-server.mjs';

test('two guests see the same private room and can update only their own results',async()=>{
  const rooms=roomApi(':memory:');
  async function request(path,method='GET',data,token) {
    const request=Readable.from(data?[Buffer.from(JSON.stringify(data))]:[]);
    request.method=method;
    request.headers=token?{authorization:'Bearer '+token}:{};
    request.socket={remoteAddress:'test'};
    let status,payload;
    await rooms(request,{writeHead(code){status=code;},end(body){payload=JSON.parse(body);}},path);
    return {status,payload};
  }
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

import {createServer} from 'node:http';
import {mkdir,readFile} from 'node:fs/promises';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {roomApi} from './room-server.mjs';

const root=fileURLToPath(new URL('.',import.meta.url));
const contentTypes={html:'text/html; charset=utf-8',css:'text/css; charset=utf-8',mjs:'text/javascript; charset=utf-8',jpg:'image/jpeg'};
const port=Number(process.env.PORT || 4173);
const host=process.env.HOST || '127.0.0.1';
const data=process.env.HOBBYMAXING_DATA || join(root,'.hobbymaxing');
await mkdir(data,{recursive:true});
const rooms=roomApi(join(data,'rooms.sqlite'));

createServer(async (request,response)=>{
  const path=new URL(request.url,'http://localhost').pathname;
  if(path.startsWith('/api/rooms')) {
    try {return await rooms(request,response,path);}
    catch {if(!response.headersSent) response.writeHead(500,{'Content-Type':'application/json'});return response.end(JSON.stringify({error:'Der Raum ist vorübergehend nicht verfügbar.'}));}
  }
  const file=path==='/'?'index.html':path.slice(1);
  const extension=file.split('.').at(-1);
  const isPublic=/^(?:[\w-]+\.(?:mjs|html|css)|assets\/[\w-]+\.jpg)$/.test(file) && !/(?:server|\.test)\.mjs$/.test(file);
  if(isPublic) {
    try {
      const content=await readFile(join(root,file));
      response.writeHead(200,{'Content-Type':contentTypes[extension]});
      return response.end(content);
    } catch(error) {
      if(error.code!=='ENOENT') {
        response.writeHead(500);
        return response.end('Fehler beim Lesen');
      }
    }
  }
  response.writeHead(404);
  response.end('Nicht gefunden');
}).listen(port,host,()=>console.log('Hobbymaxing: http://'+host+':'+port));

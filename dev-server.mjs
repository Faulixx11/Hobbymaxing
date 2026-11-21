import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=fileURLToPath(new URL('.',import.meta.url));
const contentTypes={html:'text/html; charset=utf-8',css:'text/css; charset=utf-8',mjs:'text/javascript; charset=utf-8',jpg:'image/jpeg'};
const port=Number(process.env.PORT || 4173);

createServer(async (request,response)=>{
  const path=new URL(request.url,'http://localhost').pathname;
  const file=path==='/'?'index.html':path.slice(1);
  const extension=file.split('.').at(-1);
  const isPublic=/^(?:[\w-]+\.(?:mjs|html|css)|assets\/[\w-]+\.jpg)$/.test(file) && file!=='dev-server.mjs';
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
}).listen(port,'127.0.0.1',()=>console.log('Hobbymaxing: http://127.0.0.1:'+port));

import {createServer} from 'node:http';
import {createReadStream} from 'node:fs';
import {stat} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = fileURLToPath(new URL('.',import.meta.url));
const base = resolve(root);
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.woff2':'font/woff2','.jpg':'image/jpeg','.txt':'text/plain; charset=utf-8'};
const port = Number(process.env.HOBBYMAXING_PORT || 4317);
createServer(async(request,response)=>{
  try {
    let path = decodeURIComponent(new URL(request.url,'http://localhost').pathname);
    path = path.replace(/^\/studio(?=\/|$)/,'');
    if (path.endsWith('/') || !path) path += 'index.html';
    const file = resolve(base,'.'+path);
    const mime = types[extname(file)];
    if (!mime || !file.startsWith(base+sep) || !(await stat(file)).isFile()) throw new Error('Missing file');
    response.writeHead(200,{'Content-Type':mime,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
    if (request.method === 'HEAD') response.end();
    else createReadStream(file).pipe(response);
  } catch {
    response.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'}).end('Datei nicht gefunden.');
  }
}).listen(port,'127.0.0.1',()=>console.log(`HobbyMaxing läuft auf http://127.0.0.1:${port}/studio/`));

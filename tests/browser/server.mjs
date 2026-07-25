import {createReadStream} from 'node:fs';
import {stat} from 'node:fs/promises';
import {createServer} from 'node:http';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const port=Number(process.env.PLAYWRIGHT_PORT)||4174;
const mime={
  '.css':'text/css; charset=utf-8',
  '.html':'text/html; charset=utf-8',
  '.js':'text/javascript; charset=utf-8',
  '.json':'application/json; charset=utf-8',
  '.m4a':'audio/mp4',
  '.mp3':'audio/mpeg',
  '.ogg':'audio/ogg',
  '.png':'image/png',
  '.svg':'image/svg+xml',
  '.wav':'audio/wav',
  '.webp':'image/webp'
};

export const server=createServer(async(request,response)=>{
  try{
    const pathname=decodeURIComponent(new URL(request.url,'http://127.0.0.1').pathname);
    const requested=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
    if(requested!==root&&!requested.startsWith(root+path.sep)){
      response.writeHead(403).end('Forbidden');
      return;
    }
    const file=await stat(requested);
    if(!file.isFile())throw new Error('Not a file');
    response.writeHead(200,{
      'Content-Type':mime[path.extname(requested).toLowerCase()]||'application/octet-stream',
      'Cache-Control':'no-store'
    });
    createReadStream(requested).pipe(response);
  }catch{
    response.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'}).end('Not found');
  }
});

export const ready=new Promise((resolve,reject)=>{
  server.once('error',reject);
  server.listen(port,'127.0.0.1',resolve);
});

await ready;

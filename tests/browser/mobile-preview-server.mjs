import {createReadStream} from 'node:fs';
import {stat} from 'node:fs/promises';
import {createServer} from 'node:http';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const port=Number(process.env.MOBILE_PREVIEW_PORT)||4175;
const publicFiles=new Set([
  'index.html',
  'style.css',
  'guild-terrain.js',
  'infinite-world.js',
  'progression.js',
  'script.js',
]);
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

createServer(async(request,response)=>{
  try{
    const pathname=decodeURIComponent(new URL(request.url,'http://localhost').pathname);
    const relative=pathname==='/'?'index.html':pathname.replace(/^\/+/, '');
    if(!publicFiles.has(relative)&&!relative.startsWith('assets/'))throw new Error('Not public');
    const requested=path.resolve(root,relative);
    if(requested!==root&&!requested.startsWith(root+path.sep))throw new Error('Invalid path');
    const file=await stat(requested);
    if(!file.isFile())throw new Error('Not a file');
    response.writeHead(200,{
      'Content-Type':mime[path.extname(requested).toLowerCase()]||'application/octet-stream',
      'Cache-Control':'no-store',
      'X-Content-Type-Options':'nosniff'
    });
    createReadStream(requested).pipe(response);
  }catch{
    response.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'}).end('Not found');
  }
}).listen(port,'0.0.0.0',()=>{
  console.log(`Mobile preview available on port ${port}`);
});

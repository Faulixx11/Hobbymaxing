import {cp,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';

const root = fileURLToPath(new URL('.',import.meta.url));
const out = resolve(root,'dist');
await mkdir(out,{recursive:true});
const runtime = ['index.html','app.js','ui.js','style.css','pages.js','planner.js','state.js','learning.js','content.js','world.js','world.css','studios.js','studios.css','assets'];
for (const name of runtime) await cp(resolve(root,name),resolve(out,name),{recursive:true,force:true});
console.log('Statische Website liegt in dist/.');

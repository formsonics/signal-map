import {existsSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
const url='https://github.com/uaudio-labs/luna-builder-sdk.git';
const revision='62b8d383a1a33502d6dd170c92c359dcc0014f90';
function run(args){const r=spawnSync('git',args,{stdio:'inherit'});if(r.status!==0)process.exit(r.status||1);}
if(!existsSync('.sdk'))run(['clone','--filter=blob:none','--no-checkout',url,'.sdk']);
run(['-C','.sdk','checkout','--detach',revision]);
console.log('SDK ready. Local-only .sdk is excluded from Git and release packages.');

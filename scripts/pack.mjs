import {readFileSync,mkdirSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
const manifest=JSON.parse(readFileSync('app/manifest.json'));
mkdirSync('dist',{recursive:true});
const file=`dist/${manifest.package_name.replaceAll(' ','-')}-${manifest.version}.lunaaddon`;
const result=spawnSync(process.execPath,['.sdk/plugins/ua-luna-builder/sdk/cli.js','pack','app','--out',file],{stdio:'inherit'});
process.exit(result.status??1);

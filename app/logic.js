/* Read-only graph and diagnostics. No DOM, routing writes or control writes. */
(function(root){
'use strict';
function boolean(v){return v===true||v===1?true:v===false||v===0?false:null;}
function scalar(v){return typeof v==='number'&&Number.isFinite(v)?v:null;}
function meter(m){const levels=m?.level?.value,peaks=m?.peak?.value;return {level:Array.isArray(levels)&&levels.length&&levels.every(x=>scalar(x)!==null&&x>=0)?Math.max(...levels):null,peak:Array.isArray(peaks)&&peaks.length&&peaks.every(x=>scalar(x)!==null&&x>=0)?Math.max(...peaks):null,clipped:Array.isArray(m?.clip?.value)?m.clip.value.some(x=>x===1):null,enabled:boolean(m?.enabled?.value)};}
function db(v){if(v===null||v===undefined||!Number.isFinite(v)||v<0)return 'Unavailable';return v===0?'−∞ dBFS':`${(20*Math.log10(v)).toFixed(1)} dBFS`;}
function channelRow(ch){const input=ch.inputDesc?.value;return {id:ch.id,name:ch.name.value||ch.id,kind:ch.busType?'bus':'track',type:ch.busType?.value||ch.trackType?.value||'unknown',input:typeof input==='string'?input:input&&typeof input==='object'?(input.name||input.description||'Unavailable'):'Unavailable',mute:boolean(ch.mute.real.value),solo:boolean(ch.controls.get('solo').real.value),record:ch.recordEnabled?boolean(ch.recordEnabled.value):null,meter:meter(ch.meter),outputs:ch.outputs.items.filter(o=>o.id==='main'||o.isSend).map(o=>({id:o.id,kind:o.isSend?'send':'main',gain:scalar(o.gain.real.value),gainText:o.gain.display.value||null,pre:boolean(o.preFader.real.value),enabled:o.isSend?boolean(o.enabled.real.value):true,mute:boolean(o.mute.real.value),assignments:Array.isArray(o.assignments.value)?o.assignments.value.map(a=>({id:typeof a.value==='string'?a.value:null,name:a.name||'Unnamed destination',type:a.type||null,error:a.connection_error||null})):null}))};}
function graph(rows){const nodes=new Map(rows.map(r=>[r.id,{...r}])),edges=[];for(const r of rows)for(const output of r.outputs){if(!output.assignments)continue;for(let i=0;i<output.assignments.length;i++){const a=output.assignments[i];let target=a.id;if(!target||!nodes.has(target)){
 target=`endpoint:${r.id}:${output.id}:${i}`;const isHardware=/^(hardware|device|physical|output)$/.test(a.type||'');nodes.set(target,{id:target,name:a.name,kind:'endpoint',type:a.error?'missing':isHardware?'hardware':'unresolved',destinationId:a.id,error:a.error,meter:{level:null,peak:null},outputs:[]});
 }edges.push({id:`${r.id}:${output.id}:${i}`,from:r.id,to:target,kind:output.kind,slot:output.id,gain:output.gain,gainText:output.gainText,pre:output.pre,enabled:output.enabled,mute:output.mute,error:a.error});}}
 return {nodes,edges};}
function project(g,start,{showSends=true,expanded=true,whole=false,isolate=true,limit=100}={}){
 if(!g.nodes.has(start)&&!whole)return {nodes:[],edges:[],truncated:false,cycles:[]};
 const allowed=g.edges.filter(e=>showSends||e.kind==='main'),ids=new Set(),queue=whole?[...g.nodes.keys()]:[start];let depth=new Map([[start,0]]);
 while(queue.length&&ids.size<limit){const id=queue.shift();if(ids.has(id))continue;ids.add(id);if(!whole&&(expanded||id===start))for(const e of allowed.filter(e=>e.from===id)){if(!depth.has(e.to))depth.set(e.to,(depth.get(id)||0)+1);queue.push(e.to);}}
 if(!whole&&!isolate)for(const e of allowed)if(ids.has(e.to)&&ids.size<limit){ids.add(e.from);if(!depth.has(e.from))depth.set(e.from,0);}
 const edges=allowed.filter(e=>ids.has(e.from)&&ids.has(e.to));
 // DFS colors: shared downstream destinations are not cycles.
 const color=new Map(),cycles=[];function visit(id){color.set(id,1);for(const e of edges.filter(e=>e.from===id)){if(color.get(e.to)===1)cycles.push(e.id);else if(!color.has(e.to))visit(e.to);}color.set(id,2);}for(const id of ids)if(!color.has(id))visit(id);
 return {nodes:[...ids].map(id=>g.nodes.get(id)),edges,truncated:queue.length>0,cycles,depth};
}
// Layer by actual routing, excluding only DFS back edges to keep cycles finite.
function layout(p){
 const depth=new Map(p.nodes.map(n=>[n.id,0])),incoming=new Map(p.nodes.map(n=>[n.id,0]));
 const edges=p.edges.filter(e=>!p.cycles.includes(e.id));
 for(const e of edges)incoming.set(e.to,incoming.get(e.to)+1);
 const queue=p.nodes.filter(n=>!incoming.get(n.id)).map(n=>n.id);
 for(let i=0;i<queue.length;i++)for(const e of edges.filter(e=>e.from===queue[i])){
 depth.set(e.to,Math.max(depth.get(e.to),depth.get(e.from)+1));incoming.set(e.to,incoming.get(e.to)-1);if(!incoming.get(e.to))queue.push(e.to);
 }
 const columns=new Map();for(const n of p.nodes){const d=depth.get(n.id);if(!columns.has(d))columns.set(d,[]);columns.get(d).push(n);}
 const positions=new Map();for(const [d,nodes]of [...columns].sort((a,b)=>a[0]-b[0])){
 const anchor=n=>{const ys=edges.filter(e=>e.to===n.id&&positions.has(e.from)).map(e=>positions.get(e.from).y);return ys.length?ys.reduce((a,b)=>a+b,0)/ys.length:Infinity;};
 nodes.sort((a,b)=>anchor(a)-anchor(b)||a.name.localeCompare(b.name));
 nodes.forEach((n,i)=>positions.set(n.id,{x:30+d*260,y:55+i*90}));
 }return positions;
}
// Keep labels >= roughly 10px instead of shrinking tall sessions to fit.
function frame(bounds,width,height,selected){
 width=Math.max(300,width);height=Math.max(240,height);
 const scale=Math.min(1.25,Math.max(1,bounds[2]/width,bounds[3]/height));
 const w=width*scale,h=height*scale;
 return [Math.max(0,Math.min(bounds[2]-w,(selected?.x||0)-80)),Math.max(0,Math.min(bounds[3]-h,(selected?.y||0)-h/2+31)),w,h];
}
function diagnose(g,start,{stale=false,loading=false}={}){
 if(stale)return {status:'unknown',title:'CONNECTION LOST · DATA STALE',findings:[{level:'unknown',text:'Reconnect and refresh before drawing conclusions.'}]};
 if(loading)return {status:'unknown',title:'READING SESSION DATA',findings:[]};
 if(!g.nodes.has(start))return {status:'unknown',title:'SELECT A CHANNEL',findings:[]};
 const path=project(g,start,{limit:512}),findings=[];
 for(const n of path.nodes){if(n.kind==='endpoint'){if(n.error)findings.push({level:'warning',channel:n.id,text:`${n.name}: LUNA reports ${n.error}.`});else findings.push({level:'unknown',channel:n.id,text:`${n.name}: ${n.type==='hardware'?'external output; physical monitoring is not inspected':'destination is not resolved to a loaded session channel'}.`});continue;}
 if(n.mute===true)findings.push({level:'warning',channel:n.id,text:`${n.name} main output is muted. This may be intentional; pre-fader/send behavior is not inferred.`});
 if(n.mute===null)findings.push({level:'unknown',channel:n.id,text:`${n.name}: mute state is unavailable.`});
 if(n.solo===true)findings.push({level:'info',channel:n.id,text:`${n.name} is soloed. Solo mode and safe states affect what is heard.`});
 const main=n.outputs.find(o=>o.kind==='main');
 if(!main||main.assignments===null)findings.push({level:'unknown',channel:n.id,text:`${n.name}: main routing information is unavailable.`});
 else if(!main.assignments.length&&n.type!=='master')findings.push({level:'warning',channel:n.id,text:`${n.name} has no assigned main output. It may still feed sends.`});
 else if(!main.assignments.length&&n.type==='master')findings.push({level:'unknown',channel:n.id,text:`${n.name}: hardware monitor destination is not exposed here.`});
 for(const o of n.outputs.filter(o=>o.kind==='send'&&o.assignments?.length)){if(o.enabled===false)findings.push({level:'info',channel:n.id,text:`${n.name} ${o.id} is disabled.`});if(o.mute===true)findings.push({level:'info',channel:n.id,text:`${n.name} ${o.id} is muted.`});if(o.enabled===null||o.pre===null)findings.push({level:'unknown',channel:n.id,text:`${n.name} ${o.id}: send enable or pre/post state is unavailable.`});}
 if(n.meter?.level===null)findings.push({level:'unknown',channel:n.id,text:`${n.name}: live meter data is unavailable.`});
 }
 if(path.cycles.length)findings.unshift({level:'warning',text:'A routing cycle is present. This alone does not prove audible feedback.'});
 if(path.truncated)findings.unshift({level:'unknown',text:'The routing analysis limit was reached; remaining channels were not checked.'});
 const outside=[...g.nodes.values()].filter(n=>n.solo===true&&!path.nodes.some(p=>p.id===n.id));if(outside.length)findings.push({level:'info',text:`Solo active outside this path: ${outside.map(n=>n.name).join(', ')}. Audibility depends on LUNA solo behavior.`});
 const status=findings.some(f=>f.level==='warning')?'warning':findings.some(f=>f.level==='unknown')?'unknown':'clear';return {status,title:status==='warning'?'CHECK OBSERVED STATES':status==='unknown'?'NO FAULT CONFIRMED · CHECKS INCOMPLETE':'NO ISSUE FOUND IN AVAILABLE DATA',findings};
}
async function readSession(session,{refresh=false}={}){
 await session.ready();if(refresh){await session.tracks.reload();await session.buses.reload();}
 const channels=[...session.tracks.items,...session.buses.items];
 // Bounded concurrency keeps large sessions from flooding the engine.
 for(let i=0;i<channels.length;i+=8)await Promise.all(channels.slice(i,i+8).map(async ch=>{await ch.loadStrip();await ch.controls[refresh?'reload':'load']();await ch.outputs[refresh?'reload':'load']();await ch.outputs.membersReady();for(const o of ch.outputs.items.filter(o=>o.id==='main'||o.isSend)){await o[refresh?'reload':'load']({levels:3,commands:false,flatvalue:true});await o.controls[refresh?'reload':'load']();}}));
 return {channels,rows:channels.map(channelRow)};
}
async function locate(luna,session,id){const channel=session.tracks.byId(id)||session.buses.byId(id);if(!channel)throw Error('This endpoint is not a selectable session channel.');if(luna.sessions.current()?.uid!==session.uid)throw Error('Focused session changed. Refresh first.');if(!await luna.gui.available())throw Error('Locate is available inside LUNA only.');await luna.gui.windows.load();await session.context.select({trackUids:[id]});await session.context.lastSelectedTrack.set(id);await luna.gui.setPage('mixer');return {selected:session.context.selectionTracks.value?.includes(id)===true,page:luna.gui.main.page.value};}
root.SignalLogic={boolean,scalar,meter,db,channelRow,graph,project,layout,frame,diagnose,readSession,locate};
})(globalThis);

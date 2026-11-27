(function(root){
function demo(scenario='normal'){
 const output=(id,kind,to,name,extra={})=>({id,kind,gain:kind==='main'?0:-14,gainText:kind==='main'?'0.0':'-14.0',pre:false,enabled:true,mute:false,assignments:to?[{id:to,name,type:'aux',error:null}]:[],...extra});
 const row=(id,name,kind='track',type='audio')=>({id,name,kind,type,input:kind==='track'?'Mic/Line 1':'Bus inputs',mute:false,solo:false,record:false,meter:{level:.24,peak:.49,clipped:false,enabled:true},outputs:[output('main','main','mix','Mix Bus')]});
 const rows=['Kick In','Kick Out','Snare Top','Snare Bottom','Hi Hat','Tom 1','Tom 2','OH L','OH R','Room','Bass DI','Bass Amp','Guitar L','Guitar R','Vocal','Vocal Doubles','Harm Vox','Vox FX'].map((n,i)=>row('t'+i,n));
 rows[14].outputs=[output('main','main','vocal','Vocal Bus'),output('send_0','send','verb','Vox Verb'),output('send_1','send','delay','Vox Delay',{gain:-18,gainText:'-18.0'})];
 rows.push(row('vocal','Vocal Bus','bus','aux'),row('verb','Vox Verb','bus','aux'),row('delay','Vox Delay','bus','aux'),row('mix','Mix Bus','bus','aux'));
 const master=row('master','Stereo Out','bus','master');master.outputs=[output('main','main','physical-12','Out 1–2',{assignments:[{id:'physical-12',name:'Out 1–2',type:'hardware',error:null}]})];rows.push(master);rows.find(n=>n.id==='mix').outputs=[output('main','main','master','Stereo Out')];
 if(scenario==='muted')rows.find(n=>n.id==='vocal').mute=true;
 if(scenario==='missing')rows[14].outputs[0].assignments=[{id:null,name:'Deleted Vocal Bus',type:'aux',error:'device.missing_bus'}];
 if(scenario==='unknown'){rows[14].outputs[0].assignments=null;rows[14].meter={level:null,peak:null};}
 if(scenario==='cycle')rows.find(n=>n.id==='mix').outputs=[output('main','main','vocal','Vocal Bus')];
 return rows;
}
root.SignalDemo=demo;
})(globalThis);

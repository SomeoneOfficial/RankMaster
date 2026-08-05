/*
LEARNING FILE CARD
File: assets/js/app\import-migrator.js
Purpose:
- General app script.
Tips for new developers:
- This file runs in global browser scope (no import/export modules yet).
- Keep function names descriptive and side effects intentional.
- After state changes, most flows should end in renderAll().
*/
function normalizeImportedState(raw){
  const out=raw&&typeof raw==='object'?JSON.parse(JSON.stringify(raw)):{};
  // Legacy exports predate sport tracking. All historical matches were Table Tennis.
  const defaultSports=[{id:'table-tennis',name:'Table Tennis',emoji:'🏓',scoring:'points',target:11,baseRating:1000},{id:'soccer',name:'Soccer',emoji:'⚽',scoring:'points',target:1,baseRating:1000},{id:'basketball',name:'Basketball',emoji:'🏀',scoring:'points',target:1,baseRating:1000},{id:'badminton',name:'Badminton',emoji:'🏸',scoring:'points',target:21,baseRating:1000}];
  if(!Array.isArray(out.sports)||!out.sports.length)out.sports=defaultSports;
  out.sports.forEach(s=>{if(typeof s.baseRating!=='number')s.baseRating=1000;});
  if(!Array.isArray(out.players))out.players=[];
  if(!Array.isArray(out.history))out.history=[];
  if(typeof out.nextId!=='number'||!isFinite(out.nextId)){
    const maxPid=Math.max(0,...out.players.map(p=>parseInt(p.id)||0));
    const maxHid=Math.max(0,...out.history.map(h=>parseInt(h.id)||0));
    out.nextId=Math.max(maxPid,maxHid)+1;
  }
  out.players=out.players.map((p,i)=>({
    id:parseInt(p.id)||i+1,
    name:String(p.name||`Player ${i+1}`),
    rating:parseInt(p.rating)||1000,
    color:p.color||COLORS[i%COLORS.length],
    avatarEmoji:normalizeCreatorEmojiInput(p.avatarEmoji||p.profileEmoji||p.emoji||p.creatorEmoji||''),
    creatorEmoji:normalizeCreatorEmojiInput(p.creatorEmoji||''),
    wins:parseInt(p.wins)||0,
    losses:parseInt(p.losses)||0,
    sportRatings:(p.sportRatings&&typeof p.sportRatings==='object')?{...p.sportRatings}:{'table-tennis':parseInt(p.rating)||1000}
  }));
  const byId={};
  const byName={};
  out.players.forEach(p=>{
    byId[p.id]=p;
    const key=String(p.name||'').trim().toLowerCase();
    if(key&&!byName[key])byName[key]=p.id;
  });
  out.history=out.history.map((h,i)=>({
    id:parseInt(h.id)||0,
    time:h.time||formatTime(new Date()),
    p1id:parseInt(h.p1id)||0,p2id:parseInt(h.p2id)||0,
    p1name:String(h.p1name||''),p2name:String(h.p2name||''),
    p1delta:parseInt(h.p1delta)||0,p2delta:parseInt(h.p2delta)||0,
    p1ratBefore:parseInt(h.p1ratBefore)||1000,p2ratBefore:parseInt(h.p2ratBefore)||1000,
    p1score:h.p1score??'',p2score:h.p2score??'',
    reasoning:String(h.reasoning||''),context:String(h.context||''),notes:String(h.notes||''),
    mode:h.mode||'offline',lhTag:h.lhTag||'',
    manualAdjust:!!h.manualAdjust,tournamentMatch:!!h.tournamentMatch,seriesData:h.seriesData||null,
    // Preserve explicit sport data from newer exports; otherwise migrate the old
    // free-text match to Table Tennis because that is what the legacy data represents.
    sportId:'table-tennis',scoringType:'points'
  })).map((h,i)=>{
    const p1nameKey=h.p1name.trim().toLowerCase();
    const p2nameKey=h.p2name.trim().toLowerCase();
    if(!h.p1id&&p1nameKey&&byName[p1nameKey])h.p1id=byName[p1nameKey];
    if(!h.p2id&&p2nameKey&&byName[p2nameKey])h.p2id=byName[p2nameKey];
    if(!h.p1name&&byId[h.p1id])h.p1name=byId[h.p1id].name;
    if(!h.p2name&&byId[h.p2id])h.p2name=byId[h.p2id].name;
    if(!h.id||!isFinite(h.id))h.id=out.nextId+i+1;
    return h;
  });
  const maxPid=Math.max(0,...out.players.map(p=>parseInt(p.id)||0));
  const maxHid=Math.max(0,...out.history.map(h=>parseInt(h.id)||0));
  out.nextId=Math.max(maxPid,maxHid)+1;
  out.players.forEach(p=>{p.wins=0;p.losses=0;});
  out.players.forEach(p=>{
    if(typeof p.sportRatings['table-tennis']!=='number')p.sportRatings['table-tennis']=p.rating||1000;
    out.sports.forEach(s=>{p.sportRatings[s.id]=s.id==='table-tennis'?(p.rating||1000):(s.baseRating||1000);});
  });
  out.history.forEach(h=>{
    if(h.manualAdjust)return;
    const p1=byId[h.p1id],p2=byId[h.p2id];
    if(!p1||!p2)return;
    const p1Won=didP1WinMatch(h);
    if(p1Won){p1.wins++;p2.losses++;}
    else{p2.wins++;p1.losses++;}
  });
  if(!out.achievements)out.achievements={};
  if(!out.lowestRatings)out.lowestRatings={};
  if(typeof out.matchPoints!=='number')out.matchPoints=10;
  out.topRankEmoji=normalizeCreatorEmojiInput(out.topRankEmoji||'🐦')||'🐦';
  if(!out.theme)out.theme='neon';
  if(!out.density)out.density='comfort';
  if(typeof out.dailyGoal!=='number')out.dailyGoal=5;
  if(typeof out.dailyDate!=='string')out.dailyDate='';
  if(typeof out.dailyCount!=='number')out.dailyCount=0;
  if(typeof out.boldText!=='boolean')out.boldText=false;
  if(typeof out.mobileLock!=='boolean')out.mobileLock=true;
  if(!out.featureFlags)out.featureFlags={};
  FEATURE_TOGGLES.forEach(f=>{if(out.featureFlags[f.id]===undefined)out.featureFlags[f.id]=false;});
  return out;
}
function openJsonMigrator(){
  const ta=document.getElementById('json-migrator-input');
  const status=document.getElementById('json-migrator-status');
  if(ta)ta.value=JSON.stringify(state,null,2);
  if(status)status.textContent='Loaded current state.';
  document.getElementById('json-migrator-modal').classList.add('show');
}
function loadJsonMigratorFile(e){
  const f=e.target.files?.[0];if(!f)return;
  const r=new FileReader();
  r.onload=ev=>{
    document.getElementById('json-migrator-input').value=String(ev.target?.result||'');
    document.getElementById('json-migrator-status').textContent=`Loaded file: ${f.name}`;
  };
  r.readAsText(f);e.target.value='';
}
function formatMigratorJson(){
  try{
    const ta=document.getElementById('json-migrator-input');
    const obj=JSON.parse(ta.value);
    ta.value=JSON.stringify(obj,null,2);
    document.getElementById('json-migrator-status').textContent='Formatted JSON.';
  }catch(e){document.getElementById('json-migrator-status').textContent='Invalid JSON.';}
}
function migrateJsonPreview(){
  try{
    const ta=document.getElementById('json-migrator-input');
    const obj=JSON.parse(ta.value);
    const migrated=normalizeImportedState(obj);
    const validLinks=migrated.history.filter(h=>migrated.players.some(p=>p.id===h.p1id)&&migrated.players.some(p=>p.id===h.p2id)).length;
    const avatarEmojiCount=migrated.players.filter(p=>normalizeCreatorEmojiInput(p.avatarEmoji||'')).length;
    ta.value=JSON.stringify(migrated,null,2);
    document.getElementById('json-migrator-status').textContent=`Migrated preview: ${migrated.players.length} players, ${migrated.history.length} matches (${validLinks} fully linked), ${avatarEmojiCount} player emojis, top #1 emoji: ${migrated.topRankEmoji||'🐦'}.`;
  }catch(e){document.getElementById('json-migrator-status').textContent='Migration failed: invalid JSON.';}
}
function applyMigratedJson(){
  try{
    const ta=document.getElementById('json-migrator-input');
    const obj=JSON.parse(ta.value);
    state=normalizeImportedState(obj);
    ensureStateDefaults();
    saveState();
    renderAll();
    document.getElementById('json-migrator-status').textContent='Applied migrated state to local storage.';
    showToast('Migrated JSON applied. ✅','success');
  }catch(e){
    document.getElementById('json-migrator-status').textContent='Apply failed: invalid JSON.';
    showToast('Could not apply migrated JSON.','error');
  }
}



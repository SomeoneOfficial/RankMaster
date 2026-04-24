/*
LEARNING FILE CARD
File: assets/js/app\appearance-features.js
Purpose:
- General app script.
Tips for new developers:
- This file runs in global browser scope (no import/export modules yet).
- Keep function names descriptive and side effects intentional.
- After state changes, most flows should end in renderAll().
*/
function applyFeatureEffects(){
  document.body.classList.toggle('focus-mode',!!state.featureFlags?.ft_focus_mode);
  document.body.classList.toggle('compact-history',!!state.featureFlags?.ft_compact_history);
  document.body.classList.toggle('colorful-badges',!!state.featureFlags?.ft_colorful_badges);
  document.body.classList.toggle('bold-titles',!!state.featureFlags?.ft_bold_titles);
  document.body.classList.toggle('hot-streak-fx',!!state.featureFlags?.ft_hot_streak_fx);
  document.body.classList.toggle('feature-party',!!state.featureFlags?.ft_feature_party);
  const app=document.querySelector('.app');
  if(app)app.style.maxWidth=state.featureFlags?.ft_cinematic_mode?'1240px':'1160px';
}

function applyAppearance(){
  document.body.classList.remove('theme-neon','theme-sunset','theme-arena');
  document.body.classList.add(`theme-${state.theme||'neon'}`);
  document.body.classList.toggle('bold-text',!!state.boldText);
  applyMobileLock();
  const app=document.querySelector('.app');
  if(app){
    app.classList.toggle('compact',state.density==='compact');
  }
}
function applyMobileLock(){
  document.body.classList.toggle('mobile-lock',!!state.mobileLock);
  const vm=document.getElementById('viewport-meta');
  if(vm){
    vm.setAttribute('content',state.mobileLock?'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no':'width=device-width, initial-scale=1.0');
  }
}
function setAppearanceInputs(){
  const t=document.getElementById('theme-select');
  const d=document.getElementById('density-select');
  const g=document.getElementById('daily-goal-input');
  const b=document.getElementById('bold-text-toggle');
  const ml=document.getElementById('mobile-lock-toggle');
  if(t)t.value=state.theme||'neon';
  if(d)d.value=state.density||'comfort';
  if(g)g.value=state.dailyGoal||5;
  if(b)b.checked=!!state.boldText;
  if(ml)ml.checked=!!state.mobileLock;
}
function setTheme(v){
  state.theme=v||'neon';
  applyAppearance();
  saveState();
}
function setDensity(v){
  state.density=v||'comfort';
  applyAppearance();
  saveState();
}
function saveDailyGoal(){
  const el=document.getElementById('daily-goal-input');
  const v=parseInt(el?.value);
  if(isNaN(v)||v<1||v>50){showToast('Daily goal must be 1-50.','error');return;}
  state.dailyGoal=v;
  updateDailyGoalStatus();
  saveState();
  showToast('Daily goal saved. 🎯','success');
}
function updateDailyGoalStatus(){
  const box=document.getElementById('daily-goal-status');
  if(!box)return;
  const goal=state.dailyGoal||5;
  const cnt=state.dailyCount||0;
  box.textContent=`${cnt} / ${goal} today`;
  box.style.color=cnt>=goal?'var(--green)':'var(--muted)';
  if(cnt===goal&&state.featureFlags?.ft_daily_goal_toast){
    showToast('Daily goal reached! 🎉','success');
  }
}
function setBoldText(v){
  state.boldText=!!v;
  applyAppearance();
  saveState();
}
function setMobileLock(v){
  state.mobileLock=!!v;
  applyMobileLock();
  saveState();
  showToast(state.mobileLock?'Mobile lock enabled.':'Mobile lock disabled.','success');
}
function getFeatureCollection(typeFilter='core',stateFilter='all',query=''){
  const q=(query||'').trim().toLowerCase();
  return FEATURE_TOGGLES.filter(f=>{
    if(stateFilter==='enabled'&&!state.featureFlags?.[f.id])return false;
    if(stateFilter==='disabled'&&state.featureFlags?.[f.id])return false;
    if(typeFilter==='core'&&(f.group!=='core'||VISUAL_FEATURE_IDS.has(f.id)))return false;
    if(typeFilter==='visual'&&!VISUAL_FEATURE_IDS.has(f.id))return false;
    if(!q)return true;
    return f.name.toLowerCase().includes(q)||f.desc.toLowerCase().includes(q)||f.id.includes(q);
  });
}
function switchFeatureTypeTab(type){
  currentFeatureType=['core','visual'].includes(type)?type:'core';
  document.querySelectorAll('.feature-type-tab').forEach(b=>b.classList.toggle('active',b.dataset.ftype===currentFeatureType));
  saveFeaturePrefs();
  renderFeaturesCatalog();
}
function renderAppearanceFeatureGrid(){
  const wrap=document.getElementById('appearance-feature-grid');
  if(!wrap)return;
  const visualCore=CORE_FEATURE_TOGGLES.filter(f=>VISUAL_FEATURE_IDS.has(f.id));
  wrap.innerHTML=visualCore.map(f=>`<label class="feature-item ${state.featureFlags?.[f.id]?'active':''}">
    <input type="checkbox" ${state.featureFlags?.[f.id]?'checked':''} onchange="setFeatureFlag('${f.id}',this.checked)">
    <div><div class="fi-title">${state.featureFlags?.[f.id]?'✅':'⬜'} ${f.name}</div><div class="fi-desc">${f.desc}</div></div>
  </label>`).join('');
}
function renderFeaturesCatalog(){
  const wrap=document.getElementById('feature-catalog-grid');
  if(!wrap)return;
  const filterEl=document.getElementById('feature-state-filter');
  const searchEl=document.getElementById('feature-search');
  const filter=filterEl?filterEl.value:'all';
  const query=searchEl?searchEl.value:'';
  document.querySelectorAll('.feature-type-tab').forEach(b=>b.classList.toggle('active',b.dataset.ftype===(currentFeatureType||'core')));
  const items=getFeatureCollection(currentFeatureType||'core',filter,query).sort((a,b)=>a.name.localeCompare(b.name));
  wrap.innerHTML=items.map(f=>`<label class="feature-item ${state.featureFlags?.[f.id]?'active':''}">
    <input type="checkbox" ${state.featureFlags?.[f.id]?'checked':''} onchange="setFeatureFlag('${f.id}',this.checked)">
    <div>
      <div class="fi-title">${state.featureFlags?.[f.id]?'✅':'⬜'} ${f.name}</div>
      <div class="fi-desc">${f.desc}</div>
      <small>${VISUAL_FEATURE_IDS.has(f.id)?'Visual':'Core'} • ${f.id}</small>
    </div>
  </label>`).join('');
  const enabledCount=FEATURE_TOGGLES.filter(f=>state.featureFlags?.[f.id]).length;
  const enabledReal=CORE_FEATURE_TOGGLES.filter(f=>!VISUAL_FEATURE_IDS.has(f.id)&&state.featureFlags?.[f.id]).length;
  const summary=document.getElementById('feature-catalog-summary');
  if(summary){
    summary.textContent=`Showing ${items.length} of ${FEATURE_TOGGLES.length} features • Enabled: ${enabledCount} • Core enabled: ${enabledReal}`;
  }
  const status=document.getElementById('feature-pack-status');
  if(status){
    status.textContent=enabledCount?`Enabled features: ${enabledCount}`:'No features enabled.';
    status.style.color=enabledCount?'var(--green)':'var(--muted)';
  }
}
function featurePackAll(on){
  FEATURE_TOGGLES.forEach(f=>{state.featureFlags[f.id]=!!on;});
  saveFeaturePrefs();
  renderAll();
  showToast(on?'Feature Pack: all enabled.':'Feature Pack: all disabled.','success');
}
function featurePackPresetFun(){
  const funSet=new Set([
    'ft_hot_streak_fx','ft_confetti','ft_rival_alert','ft_upset_alert',
    'ft_live_h2h','ft_daily_goal_toast',
    'ft_momentum_label','ft_match_quality','ft_colorful_badges','ft_bold_titles',
    'ft_auto_open_history','ft_feature_party','ft_emoji_hype','ft_cinematic_mode'
  ]);
  FEATURE_TOGGLES.forEach(f=>{state.featureFlags[f.id]=funSet.has(f.id);});
  saveFeaturePrefs();
  renderAll();
  showToast('Feature Pack: fun preset applied. 🎮','success');
}
function setFeatureFlag(id,val){
  state.featureFlags[id]=!!val;
  saveFeaturePrefs();
  renderAll();
  const f=FEATURE_TOGGLES.find(x=>x.id===id);
  if(f)showToast(`${val?'Enabled':'Disabled'}: ${f.name} ${val?'✅':'⭕'}`,'');
}



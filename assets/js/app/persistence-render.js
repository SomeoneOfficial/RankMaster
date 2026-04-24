/*
LEARNING FILE CARD
File: assets/js/app\persistence-render.js
Purpose:
- General app script.
Tips for new developers:
- This file runs in global browser scope (no import/export modules yet).
- Keep function names descriptive and side effects intentional.
- After state changes, most flows should end in renderAll().
*/
function saveFeaturePrefs(){
  try{
    const prefs={featureFlags:state.featureFlags||{},currentFeatureType:currentFeatureType||'core'};
    localStorage.setItem(FEATURE_PREFS_KEY,JSON.stringify(prefs));
  }catch(e){}
}
function loadFeaturePrefs(){
  try{
    const raw=localStorage.getItem(FEATURE_PREFS_KEY);
    if(!raw)return;
    const prefs=JSON.parse(raw);
    if(prefs&&typeof prefs==='object'){
      if(prefs.featureFlags&&typeof prefs.featureFlags==='object'){
        state.featureFlags={...(state.featureFlags||{}),...prefs.featureFlags};
      }
      if(typeof prefs.currentFeatureType==='string'&&['core','visual'].includes(prefs.currentFeatureType))currentFeatureType=prefs.currentFeatureType;
    }
  }catch(e){}
}
// Persist the single source of truth (`state`) to local storage,
// then schedule cloud sync when signed in.
function saveState(opts={}){
  try{
    localStorage.setItem(LOCAL_STATE_KEY,JSON.stringify(state));
    saveFeaturePrefs();
    if(!opts.skipCloud&&!isApplyingCloudState)scheduleCloudSave();
  }catch(e){}
}

// Central redraw entry point.
// Any action that changes state should eventually call renderAll().
function renderAll(){
  ensureStateDefaults();
  applyAppearance();
  renderLeaderboard();
  renderMatchSelects();
  renderHistory();
  renderPlayersManageList();
  setMatchPointsInput();
  updateTopRankEmojiUI();
  updateCreatorSettingsUI();
  setAppearanceInputs();
  updateDailyGoalStatus();
  renderAppearanceFeatureGrid();
  applyFeatureEffects();
  if(document.getElementById('tab-tournament').style.display!=='none')renderTournamentTab();
  if(document.getElementById('tab-achievements').style.display!=='none')renderAchievementsTab();
  if(document.getElementById('tab-settings').style.display!=='none')renderFeaturesCatalog();
  saveState();
}



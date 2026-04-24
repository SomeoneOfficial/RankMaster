/*
LEARNING FILE CARD
File: assets/js/app\bootstrap.js
Purpose:
- General app script.
Tips for new developers:
- This file runs in global browser scope (no import/export modules yet).
- Keep function names descriptive and side effects intentional.
- After state changes, most flows should end in renderAll().
*/
async function init(){
  try{const s=localStorage.getItem(LOCAL_STATE_KEY);if(s){const p=JSON.parse(s);if(p?.players){state=p;}}}catch(e){}
  loadFeaturePrefs();
  ensureStateDefaults();
  applyAppearance();
  renderColorSwatches('color-swatches',c=>{selectedColor=c;});
  renderColorSwatches('edit-color-swatches',c=>{editSelectedColor=c;},true);
  setMatchPointsInput();
  setAppearanceInputs();
  updateDailyGoalStatus();
  renderAll();
  await initCloudSync();
}



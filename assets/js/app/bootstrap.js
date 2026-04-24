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


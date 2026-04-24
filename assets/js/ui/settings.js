// ===================== SETTINGS =====================
function deleteHistory(){if(!confirm('Delete ALL history? Ratings unchanged.'))return;state.history=[];renderAll();showToast('History deleted. 🧹','');}
function resetAllRatings(){if(!confirm('Reset ALL ratings to 1000?'))return;state.players.forEach(p=>{p.rating=1000;p.wins=0;p.losses=0;});renderAll();showToast('Ratings reset. 🔄','');}
function fullReset(){if(!confirm('FULL RESET  wipe everything?'))return;state=createInitialState();ensureStateDefaults();setMatchPointsInput();renderAll();showToast('Fresh start! ✨','');}
function downloadJSON(){const b=new Blob([JSON.stringify(state,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='rankmaster-pro-data.json';a.click();showToast('Exported successfully. 📦','success');}
function importJSON(e){const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>{try{const d=JSON.parse(ev.target.result);if(d&&typeof d==='object'){state=normalizeImportedState(d);ensureStateDefaults();setMatchPointsInput();saveState();renderAll();showToast('Imported + migrated successfully. 🎉','success');}else showToast('Invalid file!','error');}catch{showToast("Couldn't read that file",'error');}};r.readAsText(f);e.target.value='';}
function switchSettingsTab(name){
  currentSettingsPane=name||'general';
  document.querySelectorAll('.settings-subtab').forEach(b=>b.classList.toggle('active',b.dataset.pane===currentSettingsPane));
  document.querySelectorAll('.settings-pane').forEach(p=>p.classList.remove('show'));
  const pane=document.getElementById('settings-pane-'+currentSettingsPane);
  if(pane)pane.classList.add('show');
  updateTopRankEmojiUI();
  updateCreatorSettingsUI();
  if(currentSettingsPane==='features')renderFeaturesCatalog();
  if(currentSettingsPane==='appearance')renderAppearanceFeatureGrid();
}


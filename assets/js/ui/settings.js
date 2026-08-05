/*
LEARNING FILE CARD
File: assets/js/ui\settings.js
Purpose:
- General app script.
Tips for new developers:
- This file runs in global browser scope (no import/export modules yet).
- Keep function names descriptive and side effects intentional.
- After state changes, most flows should end in renderAll().
*/
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
  if(currentSettingsPane==='sports')renderSportsSettings();
}
function addSport(){const name=document.getElementById('sport-name')?.value.trim();if(!name)return showToast('Enter a sport name.','error');const id=name.toLowerCase().replace(/[^a-z0-9]+/g,'-');if(state.sports.some(s=>s.id===id))return showToast('That sport already exists.','error');state.sports.push({id,name,emoji:document.getElementById('sport-emoji')?.value.trim()||'🎯',scoring:document.getElementById('sport-scoring')?.value||'points',target:parseInt(document.getElementById('sport-target')?.value)||1,baseRating:parseInt(document.getElementById('sport-base-rating')?.value)||1000});ensureStateDefaults();saveState();renderSportsSettings();renderAll();}
function deleteSport(id){const s=state.sports.find(x=>x.id===id);if(!s)return;const played=state.history.some(h=>!h.manualAdjust&&h.sportId===id);if(played)return showToast('This sport has recorded games and cannot be deleted.','error');if(state.sports.length<=1)return showToast('Keep at least one sport configured.','error');if(!confirm(`Delete ${s.name}?`))return;state.sports=state.sports.filter(x=>x.id!==id);state.players.forEach(p=>{if(p.sportRatings)delete p.sportRatings[id];});if(state.activeSportId===id)state.activeSportId='master';saveState();renderSportsSettings();renderAll();}
function saveSportEdits(id){const s=state.sports.find(x=>x.id===id);if(!s)return;const val=n=>document.getElementById(`sport-${n}-${id}`)?.value;const name=val('name')?.trim();if(!name)return showToast('Sport name is required.','error');s.name=name;s.emoji=val('emoji')?.trim()||s.emoji;s.scoring=val('scoring')||s.scoring;s.target=Math.max(1,parseInt(val('target'))||s.target);s.baseRating=Math.max(0,parseInt(val('base'))||s.baseRating||1000);ensureStateDefaults();saveState();renderSportsSettings();renderAll();showToast(`${s.name} settings saved.`,'success');}
function renderSportsSettings(){const el=document.getElementById('sports-list');if(!el)return;el.innerHTML=state.sports.map(s=>`<div class="settings-action sport-setting-card"><div style="display:grid;grid-template-columns:1fr 80px;gap:7px"><input id="sport-name-${s.id}" value="${s.name}" aria-label="Sport name"><input id="sport-emoji-${s.id}" value="${s.emoji}" aria-label="Sport emoji"></div><div style="display:grid;grid-template-columns:1fr 90px 105px;gap:7px;margin-top:7px"><select id="sport-scoring-${s.id}"><option value="points" ${s.scoring==='points'?'selected':''}>Points</option><option value="sets" ${s.scoring==='sets'?'selected':''}>Sets</option><option value="win-loss" ${s.scoring==='win-loss'?'selected':''}>Win/Loss</option></select><input id="sport-target-${s.id}" type="number" min="1" value="${s.target}" aria-label="Target"><input id="sport-base-${s.id}" type="number" min="0" value="${s.baseRating||1000}" aria-label="Base rating"></div><div class="sa-desc" style="margin-top:5px">Target and base rating apply to players with no games in this sport.</div><div style="display:flex;gap:7px;margin-top:8px"><button class="btn btn-primary btn-sm" onclick="saveSportEdits('${s.id}')">Save changes</button><button class="btn btn-danger btn-sm" onclick="deleteSport('${s.id}')">Delete</button></div></div>`).join('');}



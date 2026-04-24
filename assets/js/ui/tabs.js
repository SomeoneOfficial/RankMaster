/*
LEARNING FILE CARD
File: assets/js/ui\tabs.js
Purpose:
- General app script.
Tips for new developers:
- This file runs in global browser scope (no import/export modules yet).
- Keep function names descriptive and side effects intentional.
- After state changes, most flows should end in renderAll().
*/
// ===================== TABS =====================
function switchTab(name){
  const names=['leaderboard','match','history','tournament','achievements'];
  document.querySelectorAll('.tab').forEach((t,i)=>t.classList.toggle('active',names[i]===name));
  document.querySelectorAll('.tab-content').forEach(c=>c.style.display='none');
  document.getElementById('tab-'+name).style.display='block';
  if(name==='match')renderMatchSelects();
  if(name==='tournament')renderTournamentTab();
  if(name==='achievements')renderAchievementsTab();
  if(name==='settings')switchSettingsTab(currentSettingsPane||'general');
}



/*
LEARNING FILE CARD
File: assets/js/ui\match-selects.js
Purpose:
- General app script.
Tips for new developers:
- This file runs in global browser scope (no import/export modules yet).
- Keep function names descriptive and side effects intentional.
- After state changes, most flows should end in renderAll().
*/
// ===================== MATCH SELECTS =====================
function renderMatchSelects(){
  const sport=document.getElementById('match-sport');if(sport){sport.innerHTML=(state.sports||[]).map(s=>`<option value="${s.id}">${s.emoji} ${s.name} (${s.scoring})</option>`).join('');sport.value=window.currentMatchSport||state.sports?.[0]?.id||'';}
  ['p1-select','p2-select'].forEach(id=>{
    const sel=document.getElementById(id);if(!sel)return;
    const cur=sel.value;
    sel.innerHTML='<option value=""> Select Player </option>'+
      state.players.map(p=>`<option value="${p.id}">${p.name}  ${p.rating} pts (${p.wins||0}W ${p.losses||0}L)</option>`).join('');
    if(cur)sel.value=cur;
  });
  ['p1-team-select','p2-team-select'].forEach(id=>{const sel=document.getElementById(id);if(!sel)return;const cur=sel.value;sel.innerHTML='<option value="">Select teammate</option>'+state.players.map(p=>`<option value="${p.id}">${p.name}</option>`).join('');if(cur)sel.value=cur;});
  onPlayerSelect();
}
function toggleTeamMode(on){document.querySelectorAll('.team-player-select').forEach(e=>e.style.display=on?'block':'none');if(!on){document.getElementById('p1-team-select').value='';document.getElementById('p2-team-select').value='';}}
function getMatchTeams(){const p1=state.players.find(p=>p.id===parseInt(document.getElementById('p1-select')?.value));const p2=state.players.find(p=>p.id===parseInt(document.getElementById('p2-select')?.value));const teamMode=document.getElementById('team-mode-toggle')?.checked;const t1=teamMode&&document.getElementById('p1-team-select')?.value?state.players.find(p=>p.id===parseInt(document.getElementById('p1-team-select').value)):null;const t2=teamMode&&document.getElementById('p2-team-select')?.value?state.players.find(p=>p.id===parseInt(document.getElementById('p2-team-select').value)):null;return{team1:[p1,t1].filter(Boolean),team2:[p2,t2].filter(Boolean)};}



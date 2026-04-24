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
  ['p1-select','p2-select'].forEach(id=>{
    const sel=document.getElementById(id);if(!sel)return;
    const cur=sel.value;
    sel.innerHTML='<option value=""> Select Player </option>'+
      state.players.map(p=>`<option value="${p.id}">${p.name}  ${p.rating} pts (${p.wins||0}W ${p.losses||0}L)</option>`).join('');
    if(cur)sel.value=cur;
  });
  onPlayerSelect();
}



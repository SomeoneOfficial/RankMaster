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


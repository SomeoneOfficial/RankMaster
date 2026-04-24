/*
LEARNING FILE CARD
File: assets/js/ui\spinner.js
Purpose:
- General app script.
Tips for new developers:
- This file runs in global browser scope (no import/export modules yet).
- Keep function names descriptive and side effects intentional.
- After state changes, most flows should end in renderAll().
*/
// ===================== SPINNER =====================
function openSpinner(){
  if(state.players.length<2){showToast('Need at least 2 players!','error');return;}
  spinP1=null;spinP2=null;
  document.getElementById('spinner-result').textContent='Press spin to pick!';
  document.getElementById('spin-anim').textContent='';
  document.getElementById('spin-use-btn').style.display='none';
  document.getElementById('spinner-modal').classList.add('show');
}
function spinMatch(){
  const btn=document.getElementById('spin-btn');btn.disabled=true;
  const anim=document.getElementById('spin-anim');
  const emojis=['','','','','','','',''];
  let count=0;
  const interval=setInterval(()=>{anim.textContent=emojis[count%emojis.length];count++;},80);
  setTimeout(()=>{
    clearInterval(interval);
    const shuffled=[...state.players].sort(()=>Math.random()-.5);
    spinP1=shuffled[0];spinP2=shuffled[1];
    anim.textContent='';
    document.getElementById('spinner-result').innerHTML=`<span style="color:${spinP1.color}">${spinP1.name}</span> <span style="color:var(--muted)">vs</span> <span style="color:${spinP2.color}">${spinP2.name}</span>`;
    document.getElementById('spin-use-btn').style.display='inline-flex';
    btn.disabled=false;
  },1200);
}
function useSpinResult(){
  if(!spinP1||!spinP2)return;
  closeModal('spinner-modal');switchTab('match');
  setTimeout(()=>{
    document.getElementById('p1-select').value=spinP1.id;
    document.getElementById('p2-select').value=spinP2.id;
    onPlayerSelect();
    showToast(`${spinP1.name} vs ${spinP2.name}  let's go! `,'success');
  },100);
}



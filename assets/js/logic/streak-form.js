// ===================== STREAK + FORM =====================
function getStreak(pid){
  const ms=state.history.filter(h=>(h.p1id===pid||h.p2id===pid)&&!h.manualAdjust);
  if(!ms.length)return null;
  const last=ms[ms.length-1];
  const isWin=getOutcomeForPlayer(last,pid)>0;
  let count=1;
  for(let i=ms.length-2;i>=0;i--){
    const m=ms[i],mw=getOutcomeForPlayer(m,pid)>0;
    if(mw===isWin)count++;else break;
  }
  return{isWin,count};
}
function streakBadgeHTML(s){
  if(!s||s.count<2)return'';
  if(s.isWin&&s.count>=5)return`<span class="streak-badge streak-hot">🔥 ${s.count}W STREAK</span>`;
  if(s.isWin)return`<span class="streak-badge streak-win">🔥 ${s.count}W</span>`;
  return`<span class="streak-badge streak-loss"> ${s.count}L</span>`;
}
function getFormDots(pid){
  const ms=state.history.filter(h=>(h.p1id===pid||h.p2id===pid)&&!h.manualAdjust).slice(-6);
  return ms.map(m=>{const o=getOutcomeForPlayer(m,pid);return o>0?'w':o<0?'l':'d';});
}
function formDotsHTML(pid){
  const d=getFormDots(pid);if(!d.length)return'';
  return'<div class="form-dots">'+d.map(x=>`<div class="form-dot ${x}"></div>`).join('')+'</div>';
}


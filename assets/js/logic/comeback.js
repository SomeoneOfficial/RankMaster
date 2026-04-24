// ===================== COMEBACK =====================
function getComeback(playerId){
  const ms=state.history.filter(h=>(h.p1id===playerId||h.p2id===playerId)&&!h.manualAdjust);
  if(!ms.length)return null;
  const p=state.players.find(x=>x.id===playerId);
  let running=p.rating;
  const snapshots=[p.rating];
  for(let i=ms.length-1;i>=0;i--){const delta=ms[i].p1id===playerId?ms[i].p1delta:ms[i].p2delta;running-=delta;snapshots.unshift(running);}
  const lowest=Math.min(...snapshots);
  const highest=Math.max(...snapshots.slice(snapshots.indexOf(lowest)));
  const comeback=highest-lowest;
  if(comeback<50)return null;
  if(!state.lowestRatings[playerId]||lowest<state.lowestRatings[playerId])state.lowestRatings[playerId]=lowest;
  return{comeback,lowest,current:p.rating};
}


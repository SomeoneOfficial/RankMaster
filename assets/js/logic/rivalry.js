/*
LEARNING FILE CARD
File: assets/js/logic\rivalry.js
Purpose:
- General app script.
Tips for new developers:
- This file runs in global browser scope (no import/export modules yet).
- Keep function names descriptive and side effects intentional.
- After state changes, most flows should end in renderAll().
*/
// ===================== RIVAL =====================
function getRival(playerId){
  const matches=state.history.filter(h=>(h.p1id===playerId||h.p2id===playerId)&&!h.manualAdjust);
  const oppCount={};
  matches.forEach(h=>{
    const oid=h.p1id===playerId?h.p2id:h.p1id;
    const oname=h.p1id===playerId?h.p2name:h.p1name;
    if(!oppCount[oid])oppCount[oid]={name:oname,count:0,w:0,l:0};
    oppCount[oid].count++;
    const won=getOutcomeForPlayer(h,playerId)>0;
    if(won)oppCount[oid].w++;else oppCount[oid].l++;
  });
  const sorted=Object.entries(oppCount).sort((a,b)=>b[1].count-a[1].count);
  if(!sorted.length||sorted[0][1].count<2)return null;
  return {...sorted[0][1],id:parseInt(sorted[0][0])};
}



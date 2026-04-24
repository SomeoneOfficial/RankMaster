/*
LEARNING FILE CARD
File: assets/js/logic\rating-graph.js
Purpose:
- General app script.
Tips for new developers:
- This file runs in global browser scope (no import/export modules yet).
- Keep function names descriptive and side effects intentional.
- After state changes, most flows should end in renderAll().
*/
// ===================== RATING GRAPH =====================
function drawRatingGraph(playerId,canvasId){
  const canvas=document.getElementById(canvasId);if(!canvas)return;
  const ctx=canvas.getContext('2d');
  const ms=state.history.filter(h=>(h.p1id===playerId||h.p2id===playerId)&&!h.manualAdjust);
  const p=state.players.find(x=>x.id===playerId);
  let running=p.rating;
  const snaps=[p.rating];
  for(let i=ms.length-1;i>=0;i--){const delta=ms[i].p1id===playerId?ms[i].p1delta:ms[i].p2delta;running-=delta;snaps.unshift(running);}
  if(snaps.length<2){ctx.fillStyle=getComputedStyle(document.documentElement).getPropertyValue('--muted');ctx.font='12px DM Sans';ctx.fillText('Play more matches to see graph',10,40);return;}
  const W=canvas.offsetWidth||300,H=canvas.offsetHeight||120;
  canvas.width=W;canvas.height=H;
  const min=Math.min(...snaps)-20,max=Math.max(...snaps)+20;
  const scaleX=W/(snaps.length-1),scaleY=H/(max-min);
  if(min<=1000&&max>=1000){
    const y=H-(1000-min)*scaleY;
    ctx.strokeStyle='rgba(107,107,136,.25)';ctx.lineWidth=1;ctx.setLineDash([3,3]);
    ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();ctx.setLineDash([]);
  }
  ctx.strokeStyle=p.color;ctx.lineWidth=2.5;ctx.lineJoin='round';
  ctx.beginPath();
  snaps.forEach((v,i)=>{const x=i*scaleX,y=H-(v-min)*scaleY;i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);});
  ctx.stroke();
  ctx.lineTo((snaps.length-1)*scaleX,H);ctx.lineTo(0,H);ctx.closePath();
  ctx.fillStyle=p.color+'18';ctx.fill();
  snaps.forEach((v,i)=>{
    const x=i*scaleX,y=H-(v-min)*scaleY;
    ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(x,y,3,0,Math.PI*2);ctx.fill();
  });
}



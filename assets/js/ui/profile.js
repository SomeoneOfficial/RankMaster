/*
LEARNING FILE CARD
File: assets/js/ui\profile.js
Purpose:
- General app script.
Tips for new developers:
- This file runs in global browser scope (no import/export modules yet).
- Keep function names descriptive and side effects intentional.
- After state changes, most flows should end in renderAll().
*/
// ===================== PROFILE =====================
function openProfile(id){
  const p=state.players.find(x=>x.id===id);if(!p)return;
  const creator=isCreatorPlayer(p);
  const ms=state.history.filter(h=>(h.p1id===id||h.p2id===id)&&!h.manualAdjust);
  const wins=ms.filter(h=>getOutcomeForPlayer(h,id)>0).length;
  const losses=ms.filter(h=>getOutcomeForPlayer(h,id)<0).length;
  const draws=ms.length-wins-losses;
  const streak=getStreak(id);const rival=getRival(id);const comeback=getComeback(id);
  const winRate=ms.length?Math.round(wins/ms.length*100):0;
  const deltas=ms.map(h=>h.p1id===id?h.p1delta:h.p2delta);
  const avg=deltas.length?(deltas.reduce((a,b)=>a+b,0)/deltas.length).toFixed(1):'';
  const avatar=getPlayerAvatarDisplay(p);
  const earnedAch=computeAchievements(id);
  const t=getTitle(p.rating);
  const lv=getLevel(p.wins||0,ms.length);
  let bestWin=null,worstLoss=null;
  ms.forEach(h=>{
    const md=h.p1id===id?h.p1delta:h.p2delta,on=h.p1id===id?h.p2name:h.p1name;
    if(md>0&&(!bestWin||md>bestWin.delta))bestWin={delta:md,opp:on,time:h.time};
    if(md<0&&(!worstLoss||md<worstLoss.delta))worstLoss={delta:md,opp:on,time:h.time};
  });
  const opps={};
  ms.forEach(h=>{
    const oid=h.p1id===id?h.p2id:h.p1id,on=h.p1id===id?h.p2name:h.p1name;
    const outcome=getOutcomeForPlayer(h,id);
    const won=outcome>0;
    const lost=outcome<0;
    if(!opps[oid])opps[oid]={name:on,w:0,l:0,d:0};
    if(won)opps[oid].w++;else if(lost)opps[oid].l++;else opps[oid].d++;
  });
  const h2hHTML=Object.values(opps).length
    ?Object.values(opps).sort((a,b)=>(b.w+b.l+b.d)-(a.w+a.l+a.d)).map(o=>`<div class="h2h-item"><span style="font-weight:700">${o.name}</span><div style="display:flex;gap:5px"><span style="color:var(--green);font-weight:700">${o.w}W</span><span style="color:var(--muted)">-</span><span style="color:var(--red);font-weight:700">${o.l}L</span>${o.d?`<span style="color:var(--muted)">-${o.d}D</span>`:''}</div></div>`).join('')
    :'<div style="color:var(--muted);font-size:.82rem">No opponents yet</div>';
  document.getElementById('profile-content').innerHTML=`
    <div style="display:flex;align-items:center;gap:14px;margin-bottom:18px;flex-wrap:wrap">
      <div style="width:60px;height:60px;border-radius:50%;background:${p.color}20;color:${p.color};border:3px solid ${p.color}60;display:flex;align-items:center;justify-content:center;font-family:'Bebas Neue',sans-serif;font-size:1.7rem;flex-shrink:0">${avatar}</div>
      <div style="flex:1">
        <div style="font-family:'Bebas Neue',sans-serif;font-size:1.9rem;color:${p.color};line-height:1">${p.name}</div>
        <div style="display:flex;gap:7px;align-items:center;flex-wrap:wrap;margin-top:5px">${titleHTML(p.rating)} ${streakBadgeHTML(streak)} ${creator?creatorBadgesHTML(false):''}</div>
        <div style="font-size:.75rem;color:var(--muted);margin-top:4px">Level ${lv.level}  ${lv.xp} XP</div>
        <div class="xp-bar-wrap" style="max-width:180px;margin-top:5px;"><div class="xp-bar" style="width:${lv.pct}%"></div></div>
        <div style="margin-top:6px">${formDotsHTML(id)}</div>
        ${creator?`<div class="creator-highlight">This player is the creator of this app.</div>`:''}
        ${rival?`<div style="font-size:.78rem;color:var(--accent2);margin-top:4px"> Rival: <strong>${rival.name}</strong> (${rival.w}W-${rival.l}L)</div>`:''}
      </div>
    </div>
    <div class="profile-stats-grid">
      <div class="stat-box"><div class="stat-val" style="color:var(--green)">${wins}</div><div class="stat-lbl">Wins</div></div>
      <div class="stat-box"><div class="stat-val" style="color:var(--red)">${losses}</div><div class="stat-lbl">Losses</div></div>
      <div class="stat-box"><div class="stat-val" style="color:var(--muted)">${draws}</div><div class="stat-lbl">Draws</div></div>
      <div class="stat-box"><div class="stat-val" style="color:var(--accent)">${winRate}%</div><div class="stat-lbl">Win Rate</div></div>
      <div class="stat-box"><div class="stat-val">${ms.length}</div><div class="stat-lbl">Games</div></div>
      <div class="stat-box"><div class="stat-val" style="color:${parseFloat(avg)>=0?'var(--green)':'var(--red)'}">${parseFloat(avg)>0?'+':''}${avg}</div><div class="stat-lbl">Avg </div></div>
    </div>
    ${comeback?`<div class="highlight-box"><div class="hl-label"> Biggest Comeback</div><div style="color:var(--green);font-weight:700">+${comeback.comeback} pts (from ${comeback.lowest} low)</div></div>`:''}
    ${bestWin?`<div class="highlight-box"><div class="hl-label"> Best Win</div><div style="color:var(--green);font-weight:700">+${bestWin.delta} pts vs ${bestWin.opp}</div><div style="color:var(--muted);font-size:.72rem">${bestWin.time}</div></div>`:''}
    ${worstLoss?`<div class="highlight-box"><div class="hl-label"> Worst Loss</div><div style="color:var(--red);font-weight:700">${worstLoss.delta} pts vs ${worstLoss.opp}</div><div style="color:var(--muted);font-size:.72rem">${worstLoss.time}</div></div>`:''}
    <div style="font-family:'Bebas Neue',sans-serif;color:var(--accent);margin-bottom:6px;letter-spacing:.05em"> Rating History</div>
    <div class="graph-wrap"><canvas class="rating-graph" id="profile-graph-${id}"></canvas></div>
    <div style="font-family:'Bebas Neue',sans-serif;color:var(--accent);margin:14px 0 8px;letter-spacing:.05em"> Recent Badges (${earnedAch.length}/${ACHIEVEMENTS_DEF.length})</div>
    <div class="ach-grid">${ACHIEVEMENTS_DEF.slice(0,9).map(a=>{const got=earnedAch.includes(a.id);return`<div class="ach-badge ${got?'earned':'locked'}"><div class="ach-icon">${a.icon}</div><div class="ach-name">${a.name}</div></div>`;}).join('')}</div>
    <div style="font-family:'Bebas Neue',sans-serif;color:var(--accent);margin:14px 0 8px;letter-spacing:.05em">Head-to-Head</div>
    <div class="h2h-list">${h2hHTML}</div>`;
  document.getElementById('profile-modal').classList.add('show');
  setTimeout(()=>drawRatingGraph(id,`profile-graph-${id}`),60);
}



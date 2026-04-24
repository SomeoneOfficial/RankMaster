// ===================== LEADERBOARD =====================
function renderLeaderboard(){
  const list=document.getElementById('leaderboard-list');
  if(!state.players.length){
    list.innerHTML='<div class="empty-state"><div class="icon"></div><p>No players yet! Add some in Settings.</p></div>';return;
  }
  const sorted=[...state.players].sort((a,b)=>b.rating-a.rating);
  list.innerHTML=sorted.map((p,i)=>{
    const rc=i===0?'rank-1':i===1?'rank-2':i===2?'rank-3':'';
    const creator=isCreatorPlayer(p);
    const avatar=getPlayerAvatarDisplay(p);
    const streak=getStreak(p.id);
    const rival=getRival(p.id);
    const t=getTitle(p.rating);
    const totalG=state.history.filter(h=>(h.p1id===p.id||h.p2id===p.id)&&!h.manualAdjust).length;
    const lv=getLevel(p.wins||0,totalG);
    const ms=state.history.filter(h=>(h.p1id===p.id||h.p2id===p.id)&&!h.manualAdjust);
    const lastMatch=ms[ms.length-1];
    const lastDelta=lastMatch?(lastMatch.p1id===p.id?lastMatch.p1delta:lastMatch.p2delta):null;

    return`<div class="player-card ${rc} ${creator?'creator-card':''}" onclick="openProfile(${p.id})" style="cursor:pointer">
      <div class="rank-badge">${i===0?`<span class="rank-crown">${getTopRankEmoji()}</span>`:''}#${i+1}</div>
      <div class="player-avatar" style="background:${p.color}20;color:${p.color};border-color:${p.color}50">
        ${avatar}
        <div class="lv-badge">Lv${lv.level}</div>
      </div>
      <div class="player-info">
        <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
          ${creator?creatorBadgesHTML(true):''}
          <div class="player-name" style="color:${p.color}">${p.name}</div>
          <span class="title-badge" style="color:${t.color};background:${t.bg};border-color:${t.color}40">${t.icon} ${t.label}</span>
        </div>
        <div class="player-meta">
          <span style="font-size:.75rem;color:var(--muted)">${p.wins||0}W${p.losses||0}L${totalG}G</span>
          ${formDotsHTML(p.id)}
          ${streakBadgeHTML(streak)}
          ${rival?`<span class="rival-badge"> ${rival.name}</span>`:''}
        </div>
      </div>
      <div class="rating-col">
        <div class="player-rating" style="color:${p.color}">${p.rating}</div>
        ${lastDelta!==null?`<div class="rating-delta-mini" style="color:${lastDelta>=0?'var(--green)':'var(--red)'}">${lastDelta>0?'+':''}${lastDelta} last</div>`:''}
      </div>
    </div>`;
  }).join('');
}


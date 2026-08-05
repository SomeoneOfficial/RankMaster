/*
LEARNING FILE CARD
File: assets/js/ui\leaderboard.js
Purpose:
- General app script.
Tips for new developers:
- This file runs in global browser scope (no import/export modules yet).
- Keep function names descriptive and side effects intentional.
- After state changes, most flows should end in renderAll().
*/
// ===================== LEADERBOARD =====================
function renderLeaderboard(){
  const list=document.getElementById('leaderboard-list');
  const sports=state.sports||[];
  const active=state.activeSportId||'master';
  const ratingFor=p=>active==='master'?Math.round(sports.reduce((n,s)=>n+(p.sportRatings?.[s.id]??p.rating??1000),0)/Math.max(1,sports.length)):Math.round(p.sportRatings?.[active]??p.rating??1000);
  const tabs=`<div class="sport-tabs"><button class="btn ${active==='master'?'btn-primary':'btn-secondary'} btn-sm" onclick="setLeaderboardSport('master')">🌐 Master Average</button>${sports.map(s=>`<button class="btn ${active===s.id?'btn-primary':'btn-secondary'} btn-sm" onclick="setLeaderboardSport('${s.id}')">${s.emoji} ${s.name}</button>`).join('')}</div>`;
  if(!state.players.length){
    list.innerHTML=tabs+'<div class="empty-state"><div class="icon"></div><p>No players yet! Add some in Settings.</p></div>';return;
  }
  const sorted=[...state.players].sort((a,b)=>ratingFor(b)-ratingFor(a));
  list.innerHTML=tabs+sorted.map((p,i)=>{
    const rc=i===0?'rank-1':i===1?'rank-2':i===2?'rank-3':'';
    const creator=isCreatorPlayer(p);
    const avatar=getPlayerAvatarDisplay(p);
    const streak=getStreak(p.id);
    const rival=getRival(p.id);
    const shownRating=ratingFor(p),t=getTitle(shownRating);
    const totalG=state.history.filter(h=>(h.p1id===p.id||h.p2id===p.id)&&!h.manualAdjust&&(active==='master'||h.sportId===active)).length;
    const lv=getLevel(p.wins||0,totalG);
    const ms=state.history.filter(h=>(h.p1id===p.id||h.p2id===p.id)&&!h.manualAdjust&&(active==='master'||h.sportId===active));
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
        <div class="player-rating" style="color:${p.color}">${shownRating}</div>
        ${lastDelta!==null?`<div class="rating-delta-mini" style="color:${lastDelta>=0?'var(--green)':'var(--red)'}">${lastDelta>0?'+':''}${lastDelta} last</div>`:''}
      </div>
    </div>`;
  }).join('');
}

function setLeaderboardSport(id){state.activeSportId=id;renderLeaderboard();}



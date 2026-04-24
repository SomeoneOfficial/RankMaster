// ===================== ACHIEVEMENTS =====================
function computeAchievements(playerId){
  const p=state.players.find(x=>x.id===playerId);if(!p)return[];
  const ms=state.history.filter(h=>(h.p1id===playerId||h.p2id===playerId)&&!h.manualAdjust);
  const wins=ms.filter(h=>getOutcomeForPlayer(h,playerId)>0).length;
  const streak=getStreak(playerId);const comeback=getComeback(playerId);
  const upsets=ms.filter(h=>{
    const myRat=h.p1id===playerId?h.p1ratBefore:h.p2ratBefore;
    const oppRat=h.p1id===playerId?h.p2ratBefore:h.p1ratBefore;
    const won=getOutcomeForPlayer(h,playerId)>0;
    return won&&oppRat&&myRat&&(oppRat-myRat)>=100;
  }).length;
  const lhWins=ms.filter(h=>h.lhTag&&h.lhTag.includes(p.name)&&getOutcomeForPlayer(h,playerId)>0).length;
  const maxMargin=Math.max(...ms.map(h=>{
    const s1=parseScore(h.p1score),s2=parseScore(h.p2score);
    if(s1===null||s2===null)return 0;
    const won=getOutcomeForPlayer(h,playerId)>0;
    return won?Math.abs((h.p1id===playerId?s1:s2)-(h.p1id===playerId?s2:s1)):0;
  }).concat([0]));
  const hadPerfect=ms.some(h=>{
    const s1=parseScore(h.p1score),s2=parseScore(h.p2score);
    if(s1===null||s2===null)return false;
    const won=getOutcomeForPlayer(h,playerId)>0;
    if(!won)return false;
    const myScore=h.p1id===playerId?s1:s2,oppScore=h.p1id===playerId?s2:s1;
    return oppScore===0;
  });
  const seriesWins=ms.filter(h=>h.seriesData&&getOutcomeForPlayer(h,playerId)>0).length;
  const sweeps=ms.filter(h=>h.seriesData?.wasSwept&&getOutcomeForPlayer(h,playerId)>0).length;
  const longGames=ms.filter(h=>h.seriesData?.wentFull).length;
  const tourneyWins=(state.tournament?.champion?.id===playerId)?1:0;
  // KOTH defenses
  const kothDefs=ms.filter(h=>h.kothDefense&&(h.p1id===playerId||h.p2id===playerId)&&getOutcomeForPlayer(h,playerId)>0).length;
  const earned=[];
  if(wins>=1)earned.push('first_win');
  if(wins>=5)earned.push('win5');
  if(wins>=20)earned.push('win20');
  if(wins>=50)earned.push('win50');
  if(wins>=100)earned.push('win100');
  if(streak?.isWin&&streak.count>=3)earned.push('streak3');
  if(streak?.isWin&&streak.count>=5)earned.push('streak5');
  if(streak?.isWin&&streak.count>=10)earned.push('streak10');
  if(streak?.isWin&&streak.count>=15)earned.push('streak15');
  if(upsets>=1)earned.push('upset');
  if(upsets>=3)earned.push('upset3');
  if(upsets>=5)earned.push('upset5');
  if(maxMargin>=5)earned.push('domination');
  if(hadPerfect)earned.push('perfgame');
  if(comeback?.comeback>=200)earned.push('comeback');
  if(p.rating>=1200)earned.push('rating1200');
  if(p.rating>=1500)earned.push('rating1500');
  if(p.rating>=1800)earned.push('rating1800');
  if(p.rating>=2000)earned.push('rating2000');
  if(lhWins>=1)earned.push('lhwin');
  if(lhWins>=5)earned.push('lhwin5');
  if(ms.length>=10)earned.push('played10');
  if(ms.length>=50)earned.push('played50');
  if(ms.length>=100)earned.push('played100');
  if(seriesWins>=1)earned.push('serieswin');
  if(sweeps>=1)earned.push('sweep');
  if(tourneyWins>=1)earned.push('tourney');
  if(kothDefs>=3)earned.push('kothdefend');
  if(longGames>=1)earned.push('longgame');
  const stats={wins,games:ms.length,rating:p.rating,streak:(streak?.isWin?streak.count:0),upsets,lhwins:lhWins,serieswins:seriesWins,comeback:(comeback?.comeback||0)};
  BONUS_ACHIEVEMENTS_DEF.forEach(a=>{if((stats[a.metric]||0)>=a.min)earned.push(a.id);});
  return earned;
}

function renderAchievementsTab(){
  const div=document.getElementById('achievements-content');
  const sel=document.getElementById('ach-player-select');
  if(!state.players.length){
    if(sel)sel.innerHTML='<option value="">No players</option>';
    div.innerHTML='<div class="empty-state"><div class="icon">🏅</div><p>Add players to track badges!</p></div>';
    return;
  }
  const sorted=[...state.players].sort((a,b)=>b.rating-a.rating);
  if(sel){
    const cur=sel.value;
    sel.innerHTML=sorted.map(p=>`<option value="${p.id}">${p.name} (${p.rating})</option>`).join('');
    if(cur&&sorted.some(p=>String(p.id)===String(cur)))sel.value=cur;
  }
  const pid=parseInt(sel?.value||sorted[0].id);
  const p=state.players.find(x=>x.id===pid)||sorted[0];
  if(sel&&!sel.value)sel.value=String(p.id);
  const earned=computeAchievements(p.id);
  const ini=p.name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);
  const lv=getLevel(p.wins||0,state.history.filter(h=>h.p1id===p.id||h.p2id===p.id).length);
  let html=`<div class="section-card" style="margin-bottom:10px">
    <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px;">
      ${sorted.map(sp=>`<button class="chip-btn" style="border-color:${sp.id===p.id?'var(--accent)':'var(--border)'};color:${sp.id===p.id?'var(--accent)':'var(--text)'}" onclick="document.getElementById('ach-player-select').value='${sp.id}';renderAchievementsTab();">${sp.name}</button>`).join('')}
    </div>
  </div>
  <div class="section-card" style="margin-bottom:14px">
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">
      <div style="width:44px;height:44px;border-radius:50%;background:${p.color}20;color:${p.color};border:2px solid ${p.color}60;display:flex;align-items:center;justify-content:center;font-family:'Bebas Neue',sans-serif;font-size:1.2rem">${ini}</div>
      <div style="flex:1">
        <div style="font-weight:700;color:${p.color};font-size:1rem">${p.name} ${titleHTML(p.rating)}</div>
        <div style="font-size:.75rem;color:var(--muted)">${earned.length}/${ACHIEVEMENTS_DEF.length} badges · Lv.${lv.level}</div>
        <div class="xp-bar-wrap" style="max-width:220px;margin-top:5px;"><div class="xp-bar" style="width:${lv.pct}%"></div></div>
      </div>
    </div>
    <div class="ach-grid">`;
  const onlyEarned=!!state.featureFlags?.ft_ach_filter_earned;
  ACHIEVEMENTS_DEF.forEach(a=>{
    const got=earned.includes(a.id);
    if(onlyEarned&&!got)return;
    html+=`<div class="ach-badge ${got?'earned':'locked'}"><div class="ach-icon">${a.icon}</div><div class="ach-name">${a.name}</div><div class="ach-desc">${a.desc}</div></div>`;
  });
  html+='</div></div>';
  div.innerHTML=html;
}
function selectNextAchievementPlayer(step){
  const sel=document.getElementById('ach-player-select');
  if(!sel||!sel.options.length)return;
  let idx=sel.selectedIndex;
  idx=(idx+step+sel.options.length)%sel.options.length;
  sel.selectedIndex=idx;
  renderAchievementsTab();
}


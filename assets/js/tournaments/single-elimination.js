// ===================== SINGLE ELIMINATION =====================
function startElimination(players,settings){
  const seeded=[...players].sort((a,b)=>b.rating-a.rating);
  const size=Math.pow(2,Math.ceil(Math.log2(Math.max(seeded.length,2))));
  const padded=[...seeded];while(padded.length<size)padded.push(null);
  const matches=[];for(let i=0;i<size;i+=2)matches.push({id:matches.length,p1:padded[i],p2:padded[i+1],winner:null,scores:{}});
  state.tournament={format:'elimination',rounds:[matches],completed:false,champion:null,settings,losers:{}};
  autoAdvanceByes();renderAll();showToast('Single Elimination started!','success');
}
function autoAdvanceByes(){
  if(!state.tournament||state.tournament.format!=='elimination')return;
  let changed=true;
  while(changed){
    changed=false;
    const lr=state.tournament.rounds[state.tournament.rounds.length-1];
    lr.forEach(m=>{if(!m.winner&&m.p1&&!m.p2){m.winner=m.p1;changed=true;}if(!m.winner&&m.p2&&!m.p1){m.winner=m.p2;changed=true;}});
    if(lr.every(m=>m.winner)){
      const w=lr.map(m=>m.winner);if(w.length===1){state.tournament.completed=true;state.tournament.champion=w[0];return;}
      const next=[];for(let i=0;i<w.length;i+=2)next.push({id:next.length,p1:w[i],p2:w[i+1]||null,winner:null,scores:{}});
      state.tournament.rounds.push(next);changed=true;
    }
  }
}
function renderEliminationTournament(home){
  const t=state.tournament;
  let html='<div class="bracket-wrap"><div class="bracket">';
  t.rounds.forEach((round,ri)=>{
    const isFinal=t.completed&&ri===t.rounds.length-1;
    const name=t.rounds.length===1?'Final':isFinal?' Final':`Round ${ri+1}`;
    html+=`<div class="bracket-round"><div class="bracket-round-title">${name}</div>`;
    round.forEach(m=>{
      const p1n=m.p1?m.p1.name:'BYE',p2n=m.p2?m.p2.name:'BYE';
      const p1c=!m.p1?'bye':m.winner?.id===m.p1?.id?'winner':m.winner?'loser':'';
      const p2c=!m.p2?'bye':m.winner?.id===m.p2?.id?'winner':m.winner?'loser':'';
      const can=m.p1&&m.p2&&!m.winner;
      html+=`<div class="bracket-match">
        <div class="bracket-player ${p1c}" ${can?`onclick="openElimMatchModal(${ri},${m.id})"`:''}>
          <span>${p1n}</span>${m.winner?.id===m.p1?.id?'<span></span>':''}
        </div>
        <div class="bracket-divider"></div>
        <div class="bracket-player ${p2c}" ${can?`onclick="openElimMatchModal(${ri},${m.id})"`:''}>
          <span>${p2n}</span>${m.winner?.id===m.p2?.id?'<span></span>':''}
        </div>
      </div>`;
    });
    html+='</div>';
  });
  html+='</div></div>';
  const champ=t.champion?`<div class="champ-banner"><div style="font-size:2.5rem"></div><div style="font-family:'Bebas Neue',sans-serif;font-size:2.2rem;color:var(--accent)">${t.champion.name}</div><div style="color:var(--muted);margin-top:4px">${titleHTML(t.champion.rating)} Tournament Champion!</div></div>`:'';
  home.innerHTML=`<div class="section-card">
    <div class="section-header"><h2> Elimination Bracket</h2>
    <div style="display:flex;gap:7px;flex-wrap:wrap">
      <span style="font-size:.78rem;color:var(--muted);align-self:center">Mult: <strong style="color:var(--accent)">${t.settings.multiplier}x</strong></span>
      <button class="btn btn-danger btn-sm" onclick="endTournament()">End</button>
    </div></div>
    <p style="color:var(--muted);font-size:.8rem;margin-bottom:14px">Click a matchup to record the result.</p>
    ${champ}${html}
  </div>`;
}
function openElimMatchModal(ri,matchId){
  const match=state.tournament.rounds[ri].find(m=>m.id===matchId);
  if(!match||match.winner)return;
  const p1=match.p1,p2=match.p2;
  document.getElementById('tmatch-content').innerHTML=`
    <div class="challenge-vs">
      <div class="challenge-player"><div style="color:${p1.color};font-weight:700">${p1.name}</div><div style="font-size:.78rem;color:var(--muted)">${p1.rating} pts</div></div>
      <div class="challenge-vs-text">VS</div>
      <div class="challenge-player"><div style="color:${p2.color};font-weight:700">${p2.name}</div><div style="font-size:.78rem;color:var(--muted)">${p2.rating} pts</div></div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px">
      <div><label style="font-size:.7rem;color:var(--muted);font-weight:700;text-transform:uppercase;display:block;margin-bottom:4px">${p1.name} Score</label><input type="number" id="tm-p1sc" placeholder="e.g. 11" style="width:100%;background:var(--bg);border:1px solid var(--border);border-radius:7px;color:var(--text);padding:9px;font-family:'DM Sans',sans-serif;font-size:1rem;"></div>
      <div><label style="font-size:.7rem;color:var(--muted);font-weight:700;text-transform:uppercase;display:block;margin-bottom:4px">${p2.name} Score</label><input type="number" id="tm-p2sc" placeholder="e.g. 7" style="width:100%;background:var(--bg);border:1px solid var(--border);border-radius:7px;color:var(--text);padding:9px;font-family:'DM Sans',sans-serif;font-size:1rem;"></div>
    </div>
    <div style="margin-bottom:14px"><label style="font-size:.7rem;color:var(--muted);font-weight:700;text-transform:uppercase;display:block;margin-bottom:4px">Notes</label><input type="text" id="tm-notes" class="notes-input" style="margin-top:0" placeholder="Optional..."></div>
    <div style="display:flex;flex-direction:column;gap:8px">
      <button class="btn-winner" onclick="confirmElimMatch(${ri},${matchId},'p1')" style="width:100%;justify-content:center"> ${p1.name} Won!</button>
      <button class="btn-winner player2" onclick="confirmElimMatch(${ri},${matchId},'p2')" style="width:100%;justify-content:center"> ${p2.name} Won!</button>
    </div>`;
  document.getElementById('tmatch-modal').classList.add('show');
}
function confirmElimMatch(ri,matchId,wk){
  const match=state.tournament.rounds[ri].find(m=>m.id===matchId);if(!match)return;
  const p1sc=document.getElementById('tm-p1sc')?.value||'';
  const p2sc=document.getElementById('tm-p2sc')?.value||'';
  const notes=document.getElementById('tm-notes')?.value||'';
  const p1=match.p1,p2=match.p2,s=state.tournament.settings;
  match.winner=wk==='p1'?p1:p2;
  if(s.applyRatings==='yes'){
    let r=offlineAlgorithm(p1,p2,p1sc,p2sc,false,false,s.multiplier);
    r.p1_delta=Math.max(-s.maxPts,Math.min(s.maxPts,r.p1_delta));
    r.p2_delta=Math.max(-s.maxPts,Math.min(s.maxPts,r.p2_delta));
    if(wk==='p1'&&r.p1_delta<s.minWin)r.p1_delta=s.minWin;
    if(wk==='p2'&&r.p2_delta<s.minWin)r.p2_delta=s.minWin;
    applyChanges({p1,p2,p1delta:r.p1_delta,p2delta:r.p2_delta,reasoning:r.reasoning,context:'Tournament',notes,p1lh:false,p2lh:false,tournamentMatch:true});
  }
  closeModal('tmatch-modal');
  const round=state.tournament.rounds[ri];
  if(round.every(m=>m.winner)){
    const w=round.map(m=>m.winner);
    if(w.length===1){state.tournament.completed=true;state.tournament.champion=w[0];showMilestone('',`${w[0].name} is CHAMPION!`,'Tournament complete!');}
    else{const next=[];for(let i=0;i<w.length;i+=2)next.push({id:next.length,p1:w[i],p2:w[i+1]||null,winner:null,scores:{}});state.tournament.rounds.push(next);autoAdvanceByes();}
  }
  renderAll();showToast(`${match.winner.name} advances! `,'success');
}


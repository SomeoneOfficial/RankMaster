// ===================== DOUBLE ELIMINATION =====================
function startDoubleElimination(players,settings){
  // Simple double-elim: winners bracket + losers get one more chance
  const seeded=[...players].sort((a,b)=>b.rating-a.rating);
  const size=Math.pow(2,Math.ceil(Math.log2(Math.max(seeded.length,2))));
  const padded=[...seeded];while(padded.length<size)padded.push(null);
  const wMatches=[];for(let i=0;i<size;i+=2)wMatches.push({id:wMatches.length,p1:padded[i],p2:padded[i+1],winner:null,loser:null});
  state.tournament={format:'doubleelim',winnersRounds:[wMatches],losersRounds:[],losersBracket:[],completed:false,champion:null,settings};
  autoAdvanceByes_DE();renderAll();showToast('Double Elimination started!','success');
}
function autoAdvanceByes_DE(){
  // Similar to single but mark losers
  if(!state.tournament||state.tournament.format!=='doubleelim')return;
  const t=state.tournament;
  let changed=true;
  while(changed){
    changed=false;
    const lr=t.winnersRounds[t.winnersRounds.length-1];
    lr.forEach(m=>{if(!m.winner&&m.p1&&!m.p2){m.winner=m.p1;changed=true;}if(!m.winner&&m.p2&&!m.p1){m.winner=m.p2;changed=true;}});
    if(lr.every(m=>m.winner)){
      const w=lr.map(m=>m.winner);if(w.length===1)return;
      const next=[];for(let i=0;i<w.length;i+=2)next.push({id:next.length,p1:w[i],p2:w[i+1]||null,winner:null,loser:null});
      t.winnersRounds.push(next);changed=true;
    }
  }
}
function renderDoubleElimTournament(home){
  const t=state.tournament;
  // Collect losers
  const losers=[];t.winnersRounds.forEach(r=>r.forEach(m=>{if(m.winner&&(m.p1||m.p2)){const l=m.winner.id===m.p1?.id?m.p2:m.p1;if(l&&!losers.find(x=>x?.id===l.id))losers.push(l);}}));
  let wHtml='<div class="bracket-wrap"><div class="bracket">';
  t.winnersRounds.forEach((round,ri)=>{
    const name=ri===0?'Winners R1':`Winners R${ri+1}`;
    wHtml+=`<div class="bracket-round"><div class="bracket-round-title">${name}</div>`;
    round.forEach(m=>{
      const p1n=m.p1?m.p1.name:'BYE',p2n=m.p2?m.p2.name:'BYE';
      const p1c=!m.p1?'bye':m.winner?.id===m.p1?.id?'winner':m.winner?'loser':'';
      const p2c=!m.p2?'bye':m.winner?.id===m.p2?.id?'winner':m.winner?'loser':'';
      const can=m.p1&&m.p2&&!m.winner;
      wHtml+=`<div class="bracket-match">
        <div class="bracket-player ${p1c}" ${can?`onclick="openDEMatchModal('w',${ri},${m.id})"`:''}>
          <span>${p1n}</span>${m.winner?.id===m.p1?.id?'<span></span>':''}
        </div><div class="bracket-divider"></div>
        <div class="bracket-player ${p2c}" ${can?`onclick="openDEMatchModal('w',${ri},${m.id})"`:''}>
          <span>${p2n}</span>${m.winner?.id===m.p2?.id?'<span></span>':''}
        </div>
      </div>`;
    });
    wHtml+='</div>';
  });
  wHtml+='</div></div>';
  let lHtml='';
  if(losers.length>=2){
    lHtml=`<div style="margin-top:16px;padding-top:16px;border-top:1px solid var(--border)"><div style="font-family:'Bebas Neue',sans-serif;font-size:1.1rem;color:var(--red);margin-bottom:10px;letter-spacing:.05em"> Losers Bracket  Eliminated</div><div class="ladder-list">`;
    losers.forEach(p=>{
      const ini=p.name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);
      lHtml+=`<div class="ladder-item" style="border-color:rgba(240,90,90,.3)">
        <div style="width:32px;height:32px;border-radius:50%;background:${p.color}20;color:${p.color};border:2px solid ${p.color}50;display:flex;align-items:center;justify-content:center;font-family:'Bebas Neue',sans-serif;font-size:.9rem;">${ini}</div>
        <div style="flex:1"><div style="font-weight:700;color:var(--red);text-decoration:line-through">${p.name}</div><div style="font-size:.72rem;color:var(--muted)">Eliminated</div></div>
      </div>`;
    });
    lHtml+='</div></div>';
  }
  const champ=t.champion?`<div class="champ-banner"><div style="font-size:2.5rem"></div><div style="font-family:'Bebas Neue',sans-serif;font-size:2.2rem;color:var(--accent)">${t.champion.name}</div><div style="margin-top:4px">${titleHTML(t.champion.rating)}</div></div>`:'';
  home.innerHTML=`<div class="section-card">
    <div class="section-header"><h2> Double Elimination</h2><button class="btn btn-danger btn-sm" onclick="endTournament()">End</button></div>
    ${champ}${wHtml}${lHtml}
  </div>`;
}
function openDEMatchModal(bracket,ri,matchId){
  const match=state.tournament.winnersRounds[ri].find(m=>m.id===matchId);
  if(!match||match.winner)return;
  const p1=match.p1,p2=match.p2;
  document.getElementById('tmatch-content').innerHTML=`
    <div class="challenge-vs">
      <div class="challenge-player"><div style="color:${p1.color};font-weight:700">${p1.name}</div><div style="font-size:.78rem;color:var(--muted)">${p1.rating}</div></div>
      <div class="challenge-vs-text">VS</div>
      <div class="challenge-player"><div style="color:${p2.color};font-weight:700">${p2.name}</div><div style="font-size:.78rem;color:var(--muted)">${p2.rating}</div></div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px">
      <div><label style="font-size:.7rem;color:var(--muted);font-weight:700;text-transform:uppercase;display:block;margin-bottom:4px">${p1.name}</label><input type="number" id="tm-p1sc" placeholder="11" style="width:100%;background:var(--bg);border:1px solid var(--border);border-radius:7px;color:var(--text);padding:9px;font-family:'DM Sans',sans-serif;"></div>
      <div><label style="font-size:.7rem;color:var(--muted);font-weight:700;text-transform:uppercase;display:block;margin-bottom:4px">${p2.name}</label><input type="number" id="tm-p2sc" placeholder="7" style="width:100%;background:var(--bg);border:1px solid var(--border);border-radius:7px;color:var(--text);padding:9px;font-family:'DM Sans',sans-serif;"></div>
    </div>
    <div style="display:flex;flex-direction:column;gap:8px">
      <button class="btn-winner" onclick="confirmDEMatch(${ri},${matchId},'p1')"> ${p1.name} Won!</button>
      <button class="btn-winner player2" onclick="confirmDEMatch(${ri},${matchId},'p2')"> ${p2.name} Won!</button>
    </div>`;
  document.getElementById('tmatch-modal').classList.add('show');
}
function confirmDEMatch(ri,matchId,wk){
  const match=state.tournament.winnersRounds[ri].find(m=>m.id===matchId);if(!match)return;
  const p1sc=document.getElementById('tm-p1sc')?.value||'';
  const p2sc=document.getElementById('tm-p2sc')?.value||'';
  const p1=match.p1,p2=match.p2,s=state.tournament.settings;
  match.winner=wk==='p1'?p1:p2;match.loser=wk==='p1'?p2:p1;
  if(s.applyRatings==='yes'){
    let r=offlineAlgorithm(p1,p2,p1sc,p2sc,false,false,s.multiplier);
    r.p1_delta=Math.max(-s.maxPts,Math.min(s.maxPts,r.p1_delta));
    r.p2_delta=Math.max(-s.maxPts,Math.min(s.maxPts,r.p2_delta));
    applyChanges({p1,p2,p1delta:r.p1_delta,p2delta:r.p2_delta,reasoning:r.reasoning,context:'Double Elim',notes:'',p1lh:false,p2lh:false,tournamentMatch:true});
  }
  closeModal('tmatch-modal');
  const round=state.tournament.winnersRounds[ri];
  if(round.every(m=>m.winner)){
    const w=round.map(m=>m.winner);
    if(w.length===1){state.tournament.completed=true;state.tournament.champion=w[0];showMilestone('',`${w[0].name} CHAMPION!`,'Double Elimination complete!');}
    else{const next=[];for(let i=0;i<w.length;i+=2)next.push({id:next.length,p1:w[i],p2:w[i+1]||null,winner:null,loser:null});state.tournament.winnersRounds.push(next);}
  }
  renderAll();showToast(`${match.winner.name} advances!`,'success');
}


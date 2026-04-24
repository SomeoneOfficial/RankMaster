// ===================== LADDER =====================
function startLadder(players,settings){
  const sorted=[...players].sort((a,b)=>b.rating-a.rating);
  state.tournament={format:'ladder',ladder:sorted.map(p=>p.id),settings,challenges:[],completed:false};
  renderAll();showToast('Ladder started! 🪜','success');
}
function renderLadderTournament(home){
  const t=state.tournament;
  const ladder=t.ladder.map(id=>state.players.find(p=>p.id===id)).filter(Boolean);
  let html='<div class="ladder-list">';
  ladder.forEach((p,i)=>{
    const ini=p.name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);
    const maxChalRange=2;
    const canChallenge=i>=1?ladder.slice(Math.max(0,i-maxChalRange),i):[];
    html+=`<div class="ladder-item" ${i===0?'style="border-color:var(--accent);background:rgba(240,192,64,.05)"':''}>
      <div class="ladder-pos">${i===0?'':i+1}</div>
      <div style="width:36px;height:36px;border-radius:50%;background:${p.color}20;color:${p.color};border:2px solid ${p.color}50;display:flex;align-items:center;justify-content:center;font-family:'Bebas Neue',sans-serif;font-size:1rem;flex-shrink:0">${ini}</div>
      <div style="flex:1"><div style="font-weight:700;color:${p.color}">${p.name}</div><div style="font-size:.72rem;color:var(--muted)">${p.rating} pts</div></div>
      ${i>0?`<div style="display:flex;gap:5px;flex-wrap:wrap">${canChallenge.map(op=>`<button class="btn btn-sm btn-primary ladder-challenge-btn" onclick="openLadderChallenge(${p.id},${op.id})"> vs #${ladder.indexOf(op)+1}</button>`).join('')}</div>`:'<span style="font-size:.75rem;color:var(--accent);font-weight:700">TOP SEED</span>'}
    </div>`;
  });
  html+='</div>';
  // Recent challenges
  let recentHTML='';
  if(t.challenges?.length){
    recentHTML=`<div style="margin-top:16px;border-top:1px solid var(--border);padding-top:14px"><div style="font-family:'Bebas Neue',sans-serif;font-size:1rem;color:var(--accent);margin-bottom:8px;letter-spacing:.05em">Recent Challenges</div>`;
    [...t.challenges].reverse().slice(0,5).forEach(c=>{
      recentHTML+=`<div style="display:flex;align-items:center;gap:8px;font-size:.8rem;margin-bottom:5px;padding:6px 10px;background:var(--surface2);border-radius:7px;border:1px solid var(--border)">
        <span style="color:var(--green);font-weight:700">${c.winner}</span> <span style="color:var(--muted)">beat</span> <span style="color:var(--red)">${c.loser}</span>
        <span style="color:var(--muted);font-size:.72rem;margin-left:auto">${c.scoreStr}</span>
      </div>`;
    });
    recentHTML+='</div>';
  }
  home.innerHTML=`<div class="section-card">
    <div class="section-header"><h2> Ladder Rankings</h2><button class="btn btn-danger btn-sm" onclick="endTournament()">End</button></div>
    <p style="color:var(--muted);font-size:.8rem;margin-bottom:14px">Challenge someone up to 2 positions above you. Win to take their spot!</p>
    ${html}${recentHTML}
  </div>`;
}
function openLadderChallenge(challengerId,defenderId){
  const ch=state.players.find(x=>x.id===challengerId);
  const def=state.players.find(x=>x.id===defenderId);
  const t=state.tournament;
  const challengerPos=t.ladder.indexOf(challengerId)+1;
  const defPos=t.ladder.indexOf(defenderId)+1;
  document.getElementById('challenge-title').textContent=` Ladder Challenge`;
  document.getElementById('challenge-content').innerHTML=`
    <div class="challenge-vs">
      <div class="challenge-player"><div style="font-size:.7rem;color:var(--muted);margin-bottom:4px">CHALLENGER #${challengerPos}</div><div style="color:${ch.color};font-weight:700;font-size:1rem">${ch.name}</div><div style="font-size:.78rem;color:var(--muted)">${ch.rating} pts</div></div>
      <div class="challenge-vs-text"></div>
      <div class="challenge-player"><div style="font-size:.7rem;color:var(--muted);margin-bottom:4px">DEFENDER #${defPos}</div><div style="color:${def.color};font-weight:700;font-size:1rem">${def.name}</div><div style="font-size:.78rem;color:var(--muted)">${def.rating} pts</div></div>
    </div>
    <div style="font-size:.8rem;color:var(--muted);text-align:center;margin-bottom:14px">Win to take position #${defPos}!</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px">
      <div><input type="number" id="lc-p1sc" placeholder="${ch.name} score" style="width:100%;background:var(--bg);border:1px solid var(--border);border-radius:7px;color:var(--text);padding:9px;font-family:'DM Sans',sans-serif;"></div>
      <div><input type="number" id="lc-p2sc" placeholder="${def.name} score" style="width:100%;background:var(--bg);border:1px solid var(--border);border-radius:7px;color:var(--text);padding:9px;font-family:'DM Sans',sans-serif;"></div>
    </div>
    <div style="display:flex;flex-direction:column;gap:8px">
      <button class="btn-winner" onclick="recordLadderChallenge(${challengerId},${defenderId},'challenger')"> ${ch.name} Won! (Climbs to #${defPos})</button>
      <button class="btn-winner player2" onclick="recordLadderChallenge(${challengerId},${defenderId},'defender')"> ${def.name} Defended! (Stays #${defPos})</button>
    </div>`;
  document.getElementById('challenge-modal').classList.add('show');
}
function recordLadderChallenge(chId,defId,winner){
  const t=state.tournament;
  const chPos=t.ladder.indexOf(chId);const defPos=t.ladder.indexOf(defId);
  const ch=state.players.find(x=>x.id===chId);const def=state.players.find(x=>x.id===defId);
  const p1sc=document.getElementById('lc-p1sc')?.value||'';
  const p2sc=document.getElementById('lc-p2sc')?.value||'';
  const s=t.settings;
  if(s.applyRatings==='yes'){
    let r=offlineAlgorithm(ch,def,p1sc,p2sc,false,false,s.multiplier);
    applyChanges({p1:ch,p2:def,p1delta:r.p1_delta,p2delta:r.p2_delta,reasoning:r.reasoning,context:'Ladder Challenge',notes:'',p1lh:false,p2lh:false,tournamentMatch:true});
  }
  if(winner==='challenger'){
    t.ladder.splice(chPos,1);t.ladder.splice(defPos,0,chId);
    showToast(`${ch.name} climbs to #${defPos+1}! `,'success');
  }else{
    showToast(`${def.name} defends position! `,'success');
  }
  if(!t.challenges)t.challenges=[];
  t.challenges.push({winner:winner==='challenger'?ch.name:def.name,loser:winner==='challenger'?def.name:ch.name,scoreStr:`${p1sc||'?'}${p2sc||'?'}`});
  closeModal('challenge-modal');renderAll();
}


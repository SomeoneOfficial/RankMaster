// ===================== ROUND ROBIN =====================
function startRoundRobin(players,settings){
  const results={};
  players.forEach(p=>{results[p.id]={};players.forEach(q=>{if(p.id!==q.id)results[p.id][q.id]=null;});});
  state.tournament={format:'roundrobin',players:players.map(p=>p.id),results,completed:false,settings};
  renderAll();showToast('Round Robin started!','success');
}
function renderRoundRobinTournament(home){
  const t=state.tournament;
  const players=t.players.map(id=>state.players.find(p=>p.id===id)).filter(Boolean);
  let tableHTML=`<div class="rr-table-wrap"><table class="rr-table"><thead><tr><th>Player</th>`;
  players.forEach(p=>{tableHTML+=`<th style="color:${p.color}">${p.name.split(' ')[0]}</th>`;});
  tableHTML+=`<th>Pts</th><th>W-L</th></tr></thead><tbody>`;
  players.forEach(p1=>{
    let pts=0,w=0,l=0;
    players.forEach(p2=>{if(p1.id!==p2.id){const r=t.results[p1.id][p2.id];if(r==='win'){pts+=3;w++;}else if(r==='draw')pts+=1;else if(r==='loss')l++;}});
    tableHTML+=`<tr><td class="player-col" style="color:${p1.color}">${p1.name}</td>`;
    players.forEach(p2=>{
      if(p1.id===p2.id){tableHTML+=`<td class="self-cell"></td>`;return;}
      const r=t.results[p1.id][p2.id];
      if(r==='win')tableHTML+=`<td class="win-cell">W</td>`;
      else if(r==='loss')tableHTML+=`<td class="loss-cell">L</td>`;
      else if(r==='draw')tableHTML+=`<td style="color:var(--muted)">D</td>`;
      else tableHTML+=`<td class="pending-cell" onclick="openRRMatch(${p1.id},${p2.id})">vs</td>`;
    });
    tableHTML+=`<td style="color:var(--accent);font-weight:700;font-family:'Bebas Neue',sans-serif;font-size:1.1rem">${pts}</td><td style="font-size:.78rem;color:var(--muted)">${w}W${l}L</td></tr>`;
  });
  tableHTML+=`</tbody></table></div>`;
  const standings=players.map(p=>{let pts=0,w=0,l=0,d=0;players.forEach(q=>{if(p.id===q.id)return;const r=t.results[p.id][q.id];if(r==='win'){pts+=3;w++;}else if(r==='draw'){pts+=1;d++;}else if(r==='loss')l++;});return{p,pts,w,l,d};}).sort((a,b)=>b.pts-a.pts);
  let sHTML=`<div style="margin-top:16px"><div style="font-family:'Bebas Neue',sans-serif;font-size:1.1rem;color:var(--accent);margin-bottom:10px;letter-spacing:.05em">Standings</div>`;
  standings.forEach((s,i)=>{
    const ini=s.p.name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);
    sHTML+=`<div style="display:flex;align-items:center;gap:10px;background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:10px 14px;margin-bottom:5px;font-size:.85rem">
      <div style="font-family:'Bebas Neue',sans-serif;font-size:1.4rem;color:var(--muted);min-width:26px">${i+1}</div>
      <div style="width:28px;height:28px;border-radius:50%;background:${s.p.color}20;color:${s.p.color};border:2px solid ${s.p.color}50;display:flex;align-items:center;justify-content:center;font-family:'Bebas Neue',sans-serif;font-size:.85rem;flex-shrink:0">${ini}</div>
      <div style="flex:1;font-weight:700">${s.p.name}</div>
      <div style="font-size:.75rem;color:var(--muted)">${s.w}W${s.d}D${s.l}L</div>
      <div style="font-family:'Bebas Neue',sans-serif;font-size:1.4rem;color:var(--accent)">${s.pts}pts</div>
    </div>`;
  });
  sHTML+='</div>';
  const allDone=players.every(p1=>players.every(p2=>p1.id===p2.id||t.results[p1.id][p2.id]!==null));
  home.innerHTML=`<div class="section-card">
    <div class="section-header"><h2> Round Robin</h2><button class="btn btn-danger btn-sm" onclick="endTournament()">End</button></div>
    <p style="color:var(--muted);font-size:.8rem;margin-bottom:12px">Click "vs" to record. Mult: <strong style="color:var(--accent)">${t.settings.multiplier}x</strong></p>
    ${allDone?`<div style="text-align:center;padding:10px;background:rgba(61,214,140,.08);border:1px solid var(--green);border-radius:8px;margin-bottom:12px;color:var(--green);font-weight:700"> All matches complete! ${standings[0].p.name} leads.</div>`:''}
    ${tableHTML}${sHTML}
  </div>`;
}
function openRRMatch(p1id,p2id){
  const p1=state.players.find(x=>x.id===p1id),p2=state.players.find(x=>x.id===p2id);
  document.getElementById('tmatch-content').innerHTML=`
    <div class="challenge-vs">
      <div class="challenge-player"><div style="color:${p1.color};font-weight:700">${p1.name}</div><div style="font-size:.78rem;color:var(--muted)">${p1.rating}</div></div>
      <div class="challenge-vs-text">VS</div>
      <div class="challenge-player"><div style="color:${p2.color};font-weight:700">${p2.name}</div><div style="font-size:.78rem;color:var(--muted)">${p2.rating}</div></div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px">
      <div><label style="font-size:.7rem;color:var(--muted);font-weight:700;text-transform:uppercase;display:block;margin-bottom:4px">${p1.name}</label><input type="number" id="rrm-p1sc" placeholder="11" style="width:100%;background:var(--bg);border:1px solid var(--border);border-radius:7px;color:var(--text);padding:9px;font-family:'DM Sans',sans-serif;"></div>
      <div><label style="font-size:.7rem;color:var(--muted);font-weight:700;text-transform:uppercase;display:block;margin-bottom:4px">${p2.name}</label><input type="number" id="rrm-p2sc" placeholder="7" style="width:100%;background:var(--bg);border:1px solid var(--border);border-radius:7px;color:var(--text);padding:9px;font-family:'DM Sans',sans-serif;"></div>
    </div>
    <input type="text" id="rrm-notes" class="notes-input" style="margin-top:0;margin-bottom:12px" placeholder="Notes (optional)...">
    <div style="display:flex;flex-direction:column;gap:8px">
      <button class="btn-winner" onclick="recordRR(${p1id},${p2id},'win')"> ${p1.name} Won!</button>
      <button class="btn btn-secondary" onclick="recordRR(${p1id},${p2id},'draw')" style="width:100%;justify-content:center"> Draw</button>
      <button class="btn-winner player2" onclick="recordRR(${p1id},${p2id},'loss')"> ${p2.name} Won!</button>
    </div>`;
  document.getElementById('tmatch-modal').classList.add('show');
}
function recordRR(p1id,p2id,result){
  const t=state.tournament;
  t.results[p1id][p2id]=result;t.results[p2id][p1id]=result==='win'?'loss':result==='loss'?'win':'draw';
  const p1sc=document.getElementById('rrm-p1sc')?.value||'';
  const p2sc=document.getElementById('rrm-p2sc')?.value||'';
  const notes=document.getElementById('rrm-notes')?.value||'';
  const p1=state.players.find(x=>x.id===p1id),p2=state.players.find(x=>x.id===p2id);
  const s=t.settings;
  if(s.applyRatings==='yes'){
    let r=offlineAlgorithm(p1,p2,p1sc,p2sc,false,false,s.multiplier);
    r.p1_delta=Math.max(-s.maxPts,Math.min(s.maxPts,r.p1_delta));
    r.p2_delta=Math.max(-s.maxPts,Math.min(s.maxPts,r.p2_delta));
    if(result==='win'&&r.p1_delta<s.minWin)r.p1_delta=s.minWin;
    if(result==='loss'&&r.p2_delta<s.minWin)r.p2_delta=s.minWin;
    applyChanges({p1,p2,p1delta:r.p1_delta,p2delta:r.p2_delta,reasoning:r.reasoning,context:'Round Robin',notes,p1lh:false,p2lh:false,tournamentMatch:true});
  }
  closeModal('tmatch-modal');renderAll();showToast('Match recorded! ✅','success');
}


/*
LEARNING FILE CARD
File: assets/js/tournaments\round-robin-groups.js
Purpose:
- General app script.
Tips for new developers:
- This file runs in global browser scope (no import/export modules yet).
- Keep function names descriptive and side effects intentional.
- After state changes, most flows should end in renderAll().
*/
// ===================== RR GROUPS =====================
function startRRGroups(players,settings){
  const shuffled=[...players].sort(()=>Math.random()-.5);
  const g=settings.groups,groups=Array.from({length:g},()=>[]);
  shuffled.forEach((p,i)=>groups[i%g].push(p));
  const groupResults=groups.map(gp=>{
    const r={};gp.forEach(p=>{r[p.id]={};gp.forEach(q=>{if(p.id!==q.id)r[p.id][q.id]=null;});});return r;
  });
  state.tournament={format:'rrgroups',groups:groups.map(g=>g.map(p=>p.id)),groupResults,phase:'group',settings,completed:false};
  renderAll();showToast(`${g} Groups started!`,'success');
}
function renderRRGroupsTournament(home){
  const t=state.tournament;
  let html='';
  t.groups.forEach((gids,gi)=>{
    const gplayers=gids.map(id=>state.players.find(p=>p.id===id)).filter(Boolean);
    html+=`<div style="margin-bottom:14px"><div style="font-family:'Bebas Neue',sans-serif;font-size:1rem;color:var(--accent);margin-bottom:8px;letter-spacing:.05em">Group ${gi+1}</div>`;
    html+=`<div class="rr-table-wrap"><table class="rr-table"><thead><tr><th>Player</th>`;
    gplayers.forEach(p=>html+=`<th style="color:${p.color}">${p.name.split(' ')[0]}</th>`);
    html+=`<th>Pts</th></tr></thead><tbody>`;
    gplayers.forEach(p1=>{
      let pts=0;gplayers.forEach(p2=>{if(p1.id===p2.id)return;const r=t.groupResults[gi][p1.id]?.[p2.id];if(r==='win')pts+=3;else if(r==='draw')pts+=1;});
      html+=`<tr><td class="player-col" style="color:${p1.color}">${p1.name}</td>`;
      gplayers.forEach(p2=>{
        if(p1.id===p2.id){html+=`<td class="self-cell"></td>`;return;}
        const r=t.groupResults[gi][p1.id]?.[p2.id];
        if(r==='win')html+=`<td class="win-cell">W</td>`;
        else if(r==='loss')html+=`<td class="loss-cell">L</td>`;
        else if(r==='draw')html+=`<td style="color:var(--muted)">D</td>`;
        else html+=`<td class="pending-cell" onclick="openGroupMatch(${gi},${p1.id},${p2.id})">vs</td>`;
      });
      html+=`<td style="color:var(--accent);font-family:'Bebas Neue',sans-serif;font-size:1.1rem">${pts}</td></tr>`;
    });
    html+=`</tbody></table></div></div>`;
  });
  home.innerHTML=`<div class="section-card">
    <div class="section-header"><h2> RR Groups</h2><button class="btn btn-danger btn-sm" onclick="endTournament()">End</button></div>
    <p style="color:var(--muted);font-size:.8rem;margin-bottom:14px">Click "vs" to record a group match.</p>
    ${html}
  </div>`;
}
function openGroupMatch(gi,p1id,p2id){
  const p1=state.players.find(x=>x.id===p1id),p2=state.players.find(x=>x.id===p2id);
  document.getElementById('tmatch-content').innerHTML=`
    <div class="challenge-vs">
      <div class="challenge-player"><div style="color:${p1.color};font-weight:700">${p1.name}</div></div>
      <div class="challenge-vs-text">VS</div>
      <div class="challenge-player"><div style="color:${p2.color};font-weight:700">${p2.name}</div></div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px">
      <div><input type="number" id="gm-p1sc" placeholder="${p1.name} score" style="width:100%;background:var(--bg);border:1px solid var(--border);border-radius:7px;color:var(--text);padding:9px;font-family:'DM Sans',sans-serif;"></div>
      <div><input type="number" id="gm-p2sc" placeholder="${p2.name} score" style="width:100%;background:var(--bg);border:1px solid var(--border);border-radius:7px;color:var(--text);padding:9px;font-family:'DM Sans',sans-serif;"></div>
    </div>
    <div style="display:flex;flex-direction:column;gap:8px">
      <button class="btn-winner" onclick="recordGroupMatch(${gi},${p1id},${p2id},'win')"> ${p1.name} Won!</button>
      <button class="btn btn-secondary" onclick="recordGroupMatch(${gi},${p1id},${p2id},'draw')" style="width:100%;justify-content:center"> Draw</button>
      <button class="btn-winner player2" onclick="recordGroupMatch(${gi},${p1id},${p2id},'loss')"> ${p2.name} Won!</button>
    </div>`;
  document.getElementById('tmatch-modal').classList.add('show');
}
function recordGroupMatch(gi,p1id,p2id,result){
  const t=state.tournament;
  if(!t.groupResults[gi][p1id])t.groupResults[gi][p1id]={};
  if(!t.groupResults[gi][p2id])t.groupResults[gi][p2id]={};
  t.groupResults[gi][p1id][p2id]=result;
  t.groupResults[gi][p2id][p1id]=result==='win'?'loss':result==='loss'?'win':'draw';
  const p1=state.players.find(x=>x.id===p1id),p2=state.players.find(x=>x.id===p2id);
  const s=t.settings;
  const p1sc=document.getElementById('gm-p1sc')?.value||'';
  const p2sc=document.getElementById('gm-p2sc')?.value||'';
  if(s.applyRatings==='yes'){
    let r=offlineAlgorithm(p1,p2,p1sc,p2sc,false,false,s.multiplier);
    applyChanges({p1,p2,p1delta:r.p1_delta,p2delta:r.p2_delta,reasoning:r.reasoning,context:`Group ${gi+1}`,notes:'',p1lh:false,p2lh:false,tournamentMatch:true});
  }
  closeModal('tmatch-modal');renderAll();showToast('Match recorded! ✅','success');
}



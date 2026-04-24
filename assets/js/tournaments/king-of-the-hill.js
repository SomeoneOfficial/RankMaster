// ===================== KING OF THE HILL =====================
function startKoth(players,settings){
  const sorted=[...players].sort((a,b)=>b.rating-a.rating);
  const king=sorted[0];
  const challengers=sorted.slice(1);
  state.tournament={format:'koth',king:king.id,challengers:challengers.map(p=>p.id),defenses:0,history:[],settings,completed:false};
  renderAll();showToast(`${king.name} starts as King! `,'success');
}
function renderKothTournament(home){
  const t=state.tournament;
  const king=state.players.find(p=>p.id===t.king);
  const challengers=t.challengers.map(id=>state.players.find(p=>p.id===id)).filter(Boolean);
  if(!king){endTournament();return;}
  const ini=king.name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);
  let chalHtml='<div class="challenger-list">';
  challengers.forEach((c,i)=>{
    const ci=c.name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);
    chalHtml+=`<div class="challenger-item">
      <div style="font-family:'Bebas Neue',sans-serif;font-size:1.3rem;color:var(--muted);min-width:28px">${i+1}</div>
      <div style="width:32px;height:32px;border-radius:50%;background:${c.color}20;color:${c.color};border:2px solid ${c.color}50;display:flex;align-items:center;justify-content:center;font-family:'Bebas Neue',sans-serif;font-size:.9rem;flex-shrink:0">${ci}</div>
      <div style="flex:1"><div style="font-weight:700;color:${c.color}">${c.name}</div><div style="font-size:.72rem;color:var(--muted)">${c.rating} pts</div></div>
      ${i===0?`<button class="btn btn-primary btn-sm" onclick="openKothChallenge(${c.id})"> Challenge!</button>`:`<span style="font-size:.72rem;color:var(--muted)">Waiting</span>`}
    </div>`;
  });
  chalHtml+='</div>';
  let histHtml='';
  if(t.history?.length){
    histHtml=`<div style="margin-top:14px;border-top:1px solid var(--border);padding-top:12px"><div style="font-family:'Bebas Neue',sans-serif;font-size:.9rem;color:var(--accent);margin-bottom:8px;letter-spacing:.05em">Throne History</div>`;
    [...t.history].reverse().slice(0,5).forEach(h=>{
      histHtml+=`<div style="font-size:.78rem;padding:5px 10px;background:var(--surface2);border-radius:6px;margin-bottom:4px;border:1px solid var(--border)">
        ${h.defenderKept?`<span style="color:${king.color}"> ${h.defenderName}</span> <span style="color:var(--muted)">defended vs</span> <span style="color:var(--muted)">${h.challengerName}</span>`
        :`<span style="color:var(--green)"> NEW KING: ${h.challengerName}</span> <span style="color:var(--muted)">dethroned</span> <span style="color:var(--red)">${h.defenderName}</span>`}
      </div>`;
    });
    histHtml+='</div>';
  }
  home.innerHTML=`<div class="section-card">
    <div class="section-header"><h2> King of the Hill</h2><button class="btn btn-danger btn-sm" onclick="endTournament()">End</button></div>
    <div class="koth-throne">
      <div class="king-icon"></div>
      <div class="king-name" style="color:${king.color}">${king.name}</div>
      <div style="margin-top:4px">${titleHTML(king.rating)}</div>
      <div class="koth-defenses">${t.defenses} ${t.defenses===1?'Defense':'Defenses'}</div>
    </div>
    <div style="font-family:'Bebas Neue',sans-serif;font-size:.9rem;color:var(--muted);margin-bottom:8px;letter-spacing:.05em">Challengers Queue</div>
    ${challengers.length?chalHtml:'<div style="color:var(--muted);text-align:center;padding:16px">No challengers remain!</div>'}
    ${histHtml}
  </div>`;
}
function openKothChallenge(challengerId){
  const t=state.tournament;
  const ch=state.players.find(x=>x.id===challengerId);
  const king=state.players.find(x=>x.id===t.king);
  document.getElementById('challenge-title').textContent=' Throne Challenge';
  document.getElementById('challenge-content').innerHTML=`
    <div class="challenge-vs">
      <div class="challenge-player"><div style="font-size:.7rem;color:var(--accent);margin-bottom:4px;font-weight:700"> KING</div><div style="color:${king.color};font-weight:700">${king.name}</div><div style="font-size:.78rem;color:var(--muted)">${king.rating} pts  ${t.defenses} defenses</div></div>
      <div class="challenge-vs-text"></div>
      <div class="challenge-player"><div style="font-size:.7rem;color:var(--muted);margin-bottom:4px;font-weight:700">CHALLENGER</div><div style="color:${ch.color};font-weight:700">${ch.name}</div><div style="font-size:.78rem;color:var(--muted)">${ch.rating} pts</div></div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px;margin-top:10px">
      <div><input type="number" id="kc-king-sc" placeholder="${king.name} score" style="width:100%;background:var(--bg);border:1px solid var(--border);border-radius:7px;color:var(--text);padding:9px;font-family:'DM Sans',sans-serif;"></div>
      <div><input type="number" id="kc-chal-sc" placeholder="${ch.name} score" style="width:100%;background:var(--bg);border:1px solid var(--border);border-radius:7px;color:var(--text);padding:9px;font-family:'DM Sans',sans-serif;"></div>
    </div>
    <div style="display:flex;flex-direction:column;gap:8px">
      <button class="btn-winner" onclick="recordKothChallenge(${challengerId},'king')"> ${king.name} Defends!</button>
      <button class="btn-winner player2" onclick="recordKothChallenge(${challengerId},'challenger')"> ${ch.name} Takes the Throne!</button>
    </div>`;
  document.getElementById('challenge-modal').classList.add('show');
}
function recordKothChallenge(challengerId,winner){
  const t=state.tournament;
  const king=state.players.find(x=>x.id===t.king);
  const ch=state.players.find(x=>x.id===challengerId);
  const kingsc=document.getElementById('kc-king-sc')?.value||'';
  const chalsc=document.getElementById('kc-chal-sc')?.value||'';
  const s=t.settings;
  if(s.applyRatings==='yes'){
    let r=offlineAlgorithm(king,ch,kingsc,chalsc,false,false,s.multiplier);
    applyChanges({p1:king,p2:ch,p1delta:r.p1_delta,p2delta:r.p2_delta,reasoning:r.reasoning,context:'KOTH',notes:'',p1lh:false,p2lh:false,tournamentMatch:true,kothDefense:true});
  }
  if(!t.history)t.history=[];
  if(winner==='king'){
    t.defenses++;
    t.challengers=t.challengers.filter(id=>id!==challengerId);
    t.challengers.push(challengerId);
    t.history.push({defenderKept:true,defenderName:king.name,challengerName:ch.name});
    if(t.defenses>=3)showMilestone('',`${king.name}  3 Defenses!`,'Master Defender!');
    showToast(`${king.name} defends the throne! `,'success');
  }else{
    const oldKingId=t.king;t.king=challengerId;
    t.challengers=t.challengers.filter(id=>id!==challengerId);
    t.challengers.push(oldKingId);t.defenses=0;
    t.history.push({defenderKept:false,challengerName:ch.name,defenderName:king.name});
    showMilestone('',`${ch.name} is the NEW KING!`,'Throne has changed hands!');
    showToast(`${ch.name} takes the throne! `,'success');
  }
  closeModal('challenge-modal');renderAll();
}

function endTournament(){if(!confirm('End tournament?'))return;state.tournament=null;renderAll();showToast('Tournament ended. 🏁','');}


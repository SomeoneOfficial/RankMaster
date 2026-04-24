// ===================== TOURNAMENT =====================
function renderTournamentTab(){
  const home=document.getElementById('tournament-home');
  if(!state.tournament){renderTournamentSetup(home);return;}
  switch(state.tournament.format){
    case'elimination':renderEliminationTournament(home);break;
    case'roundrobin':renderRoundRobinTournament(home);break;
    case'ladder':renderLadderTournament(home);break;
    case'koth':renderKothTournament(home);break;
    case'rrgroups':renderRRGroupsTournament(home);break;
    case'doubleelim':renderDoubleElimTournament(home);break;
    default:renderEliminationTournament(home);
  }
}

function renderTournamentSetup(home){
  home.innerHTML=`
    <div class="card-lg">
      <h2 class="card-title">🥇 New Tournament</h2>
      <div style="font-size:.75rem;color:var(--muted);font-weight:700;text-transform:uppercase;letter-spacing:.08em;margin-bottom:8px">Format</div>
      <div class="format-pills">
        <div class="format-opt active" id="fmt-elimination" onclick="selectFormat('elimination')">🏆 Single Elim</div>
        <div class="format-opt" id="fmt-doubleelim" onclick="selectFormat('doubleelim')">🔀 Double Elim</div>
        <div class="format-opt" id="fmt-roundrobin" onclick="selectFormat('roundrobin')">🔄 Round Robin</div>
        <div class="format-opt" id="fmt-rrgroups" onclick="selectFormat('rrgroups')">🔢 RR Groups</div>
        <div class="format-opt" id="fmt-ladder" onclick="selectFormat('ladder')">🪜 Ladder</div>
        <div class="format-opt" id="fmt-koth" onclick="selectFormat('koth')">👑 King of Hill</div>
      </div>
      <div id="format-description" style="font-size:.8rem;color:var(--muted);margin-bottom:14px;padding:8px 12px;background:var(--bg);border-radius:7px;border:1px solid var(--border)">
         Single Elimination: Losers are out. Last one standing wins!
      </div>
      <div style="background:rgba(240,192,64,.06);border:1px solid rgba(240,192,64,.2);border-radius:10px;padding:14px;margin-bottom:14px;">
        <div style="font-family:'Bebas Neue',sans-serif;font-size:1rem;color:var(--accent);margin-bottom:10px;letter-spacing:.05em">⚙️ Match Settings</div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:8px;">
          <div class="form-group"><label>Points Multiplier</label><input type="number" id="t-multiplier" value="1.5" min="0.1" max="10" step="0.25" style="background:var(--bg);border:1px solid var(--border);border-radius:6px;color:var(--text);padding:8px;font-family:'DM Sans',sans-serif;width:100%;"></div>
          <div class="form-group"><label>Min Win Pts</label><input type="number" id="t-minwin" value="5" min="0" max="50" style="background:var(--bg);border:1px solid var(--border);border-radius:6px;color:var(--text);padding:8px;font-family:'DM Sans',sans-serif;width:100%;"></div>
          <div class="form-group"><label>Max Pts/Match</label><input type="number" id="t-maxpts" value="150" min="10" max="500" step="10" style="background:var(--bg);border:1px solid var(--border);border-radius:6px;color:var(--text);padding:8px;font-family:'DM Sans',sans-serif;width:100%;"></div>
          <div class="form-group"><label>Apply Ratings?</label>
            <select id="t-apply-ratings" style="background:var(--bg);border:1px solid var(--border);border-radius:6px;color:var(--text);padding:8px;font-family:'DM Sans',sans-serif;width:100%;">
              <option value="yes">Yes  Live update</option>
              <option value="no">No  Tour only</option>
            </select>
          </div>
          <div class="form-group" id="t-bestof-group"><label>Best-of Series</label>
            <select id="t-bestof" style="background:var(--bg);border:1px solid var(--border);border-radius:6px;color:var(--text);padding:8px;font-family:'DM Sans',sans-serif;width:100%;">
              <option value="1">Single Game</option>
              <option value="3">Best of 3</option>
              <option value="5">Best of 5</option>
              <option value="7">Best of 7</option>
            </select>
          </div>
          <div class="form-group" id="t-groups-group" style="display:none"><label>Groups</label>
            <input type="number" id="t-groups" value="2" min="2" max="8" style="background:var(--bg);border:1px solid var(--border);border-radius:6px;color:var(--text);padding:8px;font-family:'DM Sans',sans-serif;width:100%;">
          </div>
        </div>
      </div>
      <div style="font-size:.75rem;color:var(--muted);font-weight:700;text-transform:uppercase;letter-spacing:.08em;margin-bottom:8px">Select Players</div>
      <div class="player-checklist" id="player-checklist"></div>
      <button class="btn btn-primary btn-lg" onclick="startTournament()" style="width:100%;justify-content:center;">🚀 Start Tournament</button>
    </div>`;
  renderPlayerChecklist();
}

const FORMAT_DESCRIPTIONS={
  elimination:' Single Elimination: Losers are out. Last one standing wins!',
  doubleelim:' Double Elimination: Everyone gets a second chance. Lose twice to be eliminated.',
  roundrobin:' Round Robin: Everyone plays everyone. Most points wins.',
  rrgroups:' RR Groups: Split into groups first, then knockout. Great for big fields!',
  ladder:' Ladder: Ranked list  challenge players above you to climb! Only challenges nearby allowed.',
  koth:' King of the Hill: One player defends the throne against all challengers!'
};

function selectFormat(fmt){
  selectedFormat=fmt;
  Object.keys(FORMAT_DESCRIPTIONS).forEach(k=>{const el=document.getElementById('fmt-'+k);if(el)el.className='format-opt'+(fmt===k?' active':'');});
  const desc=document.getElementById('format-description');if(desc)desc.textContent=FORMAT_DESCRIPTIONS[fmt]||'';
  const gg=document.getElementById('t-groups-group');if(gg)gg.style.display=fmt==='rrgroups'?'block':'none';
}

function renderPlayerChecklist(){
  const cl=document.getElementById('player-checklist');if(!cl)return;
  if(!state.players.length){cl.innerHTML='<div style="color:var(--muted);text-align:center;padding:16px">No players! Add them in Settings.</div>';return;}
  cl.innerHTML=state.players.map(p=>{
    const ini=p.name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);
    return`<label class="player-check-item" id="chk-item-${p.id}">
      <input type="checkbox" value="${p.id}" onchange="toggleChk(${p.id},this.checked)">
      <div style="width:30px;height:30px;border-radius:50%;background:${p.color}20;color:${p.color};border:2px solid ${p.color}50;display:flex;align-items:center;justify-content:center;font-family:'Bebas Neue',sans-serif;font-size:.88rem;flex-shrink:0">${ini}</div>
      <span style="font-weight:700">${p.name}</span>
      <span style="color:var(--muted);font-size:.8rem;margin-left:auto">${p.rating}</span>
    </label>`;
  }).join('');
}
function toggleChk(id,checked){const el=document.getElementById('chk-item-'+id);if(el)el.className='player-check-item'+(checked?' selected':'');}
function getCheckedPlayers(){return Array.from(document.querySelectorAll('#player-checklist input[type=checkbox]:checked')).map(cb=>state.players.find(p=>p.id===parseInt(cb.value))).filter(Boolean);}
function getTSettings(){return{multiplier:parseFloat(document.getElementById('t-multiplier')?.value)||1.5,minWin:parseInt(document.getElementById('t-minwin')?.value)||5,maxPts:parseInt(document.getElementById('t-maxpts')?.value)||150,applyRatings:document.getElementById('t-apply-ratings')?.value||'yes',bestOf:parseInt(document.getElementById('t-bestof')?.value)||1,groups:parseInt(document.getElementById('t-groups')?.value)||2};}

function startTournament(){
  const players=getCheckedPlayers();
  if(players.length<2){showToast('Select at least 2 players!','error');return;}
  const s=getTSettings();
  switch(selectedFormat){
    case'elimination':startElimination(players,s);break;
    case'doubleelim':startDoubleElimination(players,s);break;
    case'roundrobin':startRoundRobin(players,s);break;
    case'rrgroups':startRRGroups(players,s);break;
    case'ladder':startLadder(players,s);break;
    case'koth':startKoth(players,s);break;
  }
}


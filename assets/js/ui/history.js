/*
LEARNING FILE CARD
File: assets/js/ui\history.js
Purpose:
- General app script.
Tips for new developers:
- This file runs in global browser scope (no import/export modules yet).
- Keep function names descriptive and side effects intentional.
- After state changes, most flows should end in renderAll().
*/
// ===================== HISTORY =====================
function filterHistory(type,el){
  historyFilter=type;
  document.querySelectorAll('.filter-chip').forEach(c=>c.classList.remove('active'));
  el.classList.add('active');
  renderHistory();
}

function renderHistory(){
  const list=document.getElementById('history-list');if(!list)return;
  const sportFilters=document.getElementById('sport-history-filters');if(sportFilters)sportFilters.innerHTML=(state.sports||[]).filter(s=>s.id!=='table-tennis').map(s=>`<div class="filter-chip ${historyFilter===`sport:${s.id}`?'active':''}" onclick="filterHistory('sport:${s.id}',this)">${s.emoji} ${s.name}</div>`).join('');
  const search=(document.getElementById('history-search')?.value||'').toLowerCase();
  let items=state.history;
  if(historyFilter==='match')items=items.filter(h=>!h.tournamentMatch&&!h.manualAdjust&&!h.seriesData);
  else if(historyFilter==='tournament')items=items.filter(h=>h.tournamentMatch);
  else if(historyFilter==='series')items=items.filter(h=>h.seriesData);
  else if(historyFilter==='manual')items=items.filter(h=>h.manualAdjust);
  else if(historyFilter.startsWith('sport:'))items=items.filter(h=>h.sportId===historyFilter.slice(6));
  if(search)items=items.filter(h=>h.p1name.toLowerCase().includes(search)||h.p2name.toLowerCase().includes(search));
  if(!items.length){list.innerHTML='<div class="empty-state"><div class="icon"></div><p>No matches found.</p></div>';return;}
  const ordered=state.featureFlags?.ft_history_oldest_first?[...items]:[...items].reverse();
  list.innerHTML=ordered.map(h=>`
    <div class="history-item">
      <div class="timestamp">${h.time}</div>
      <div class="match-desc">
        <div><strong>${h.p1name}</strong> vs <strong>${h.p2name}</strong>${h.context?` <span style="color:var(--muted)"> ${h.context}</span>`:''}
        ${h.lhTag?`<span style="font-size:.72rem;color:var(--accent3);margin-left:5px">${h.lhTag}</span>`:''}
        ${h.manualAdjust?`<span class="badge neutral" style="margin-left:4px"> Manual</span>`:''}
        ${h.tournamentMatch?`<span class="badge series-badge" style="margin-left:4px"> Tour</span>`:''}
        ${h.seriesData?`<span class="badge series-badge" style="margin-left:4px"> Series ${h.seriesData.score}</span>`:''}
        ${h.sportId?`<span class="badge neutral" style="margin-left:4px">${(state.sports||[]).find(s=>s.id===h.sportId)?.emoji||'🎯'} ${(state.sports||[]).find(s=>s.id===h.sportId)?.name||h.sportId}</span>`:''}
        </div>
        ${(h.p1score||h.p2score)?`<div style="font-size:.76rem;color:var(--muted);margin-top:2px">Score: ${h.p1name} ${h.p1score||'?'}  ${h.p2score||'?'} ${h.p2name}</div>`:''}
        ${h.notes?`<div style="font-size:.75rem;color:#8ac8f0;font-style:italic;margin-top:2px"> ${h.notes}</div>`:''}
      </div>
      <div class="changes">
        <span class="badge ${h.p1delta>=0?'pos':'neg'}" style="font-size:20px;">
          ${h.p1name}: ${h.p1delta>0?'+':''}${h.p1delta}
        </span>

        <span class="badge ${h.p2delta>=0?'pos':'neg'}" style="font-size:20px;">
          ${h.p2name}: ${h.p2delta>0?'+':''}${h.p2delta}
        </span>
      </div>
    </div>`).join('');
}



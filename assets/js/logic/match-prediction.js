/*
LEARNING FILE CARD
File: assets/js/logic\match-prediction.js
Purpose:
- General app script.
Tips for new developers:
- This file runs in global browser scope (no import/export modules yet).
- Keep function names descriptive and side effects intentional.
- After state changes, most flows should end in renderAll().
*/
// ===================== PREDICTION =====================
function updatePrediction(){
  const p1id=parseInt(document.getElementById('p1-select').value);
  const p2id=parseInt(document.getElementById('p2-select').value);
  const box=document.getElementById('prediction-box');
  if(!p1id||!p2id||p1id===p2id){box.classList.remove('show');return;}
  const p1=state.players.find(x=>x.id===p1id),p2=state.players.find(x=>x.id===p2id);
  const exp1=1/(1+Math.pow(10,-(p1.rating-p2.rating)/400));
  const pct1=Math.round(exp1*100),pct2=100-pct1;
  document.getElementById('pred-bar-p1').style.width=pct1+'%';
  document.getElementById('pred-labels').innerHTML=`<span style="color:${p1.color}"> ${p1.name} ${pct1}%</span><span style="color:var(--accent3)"> ${p2.name} ${pct2}%</span>`;
  const fav=exp1>.5?p1:p2,favPct=Math.max(pct1,pct2);
  const intensity=favPct>80?'strongly favoured':favPct>65?'the favourite':'slight favourite';
  let extra='';
  if(state.featureFlags?.ft_match_quality){
    const quality=Math.max(1,100-Math.abs(p1.rating-p2.rating));
    extra=` Match quality: ${quality}/100.`;
  }
  document.getElementById('pred-text').textContent=`${fav.name} is ${intensity} based on ratings.${extra}`;
  box.classList.toggle('show',!!showWinProbability);
}
function togglePredictionVisibility(){
  const p1id=parseInt(document.getElementById('p1-select').value);
  const p2id=parseInt(document.getElementById('p2-select').value);
  if(!p1id||!p2id||p1id===p2id){
    showToast('Select both players first.','error');
    return;
  }
  showWinProbability=!showWinProbability;
  const btn=document.getElementById('pred-toggle-btn');
  if(btn)btn.textContent=showWinProbability?'📉 Hide Win Probability':'📈 Show Win Probability';
  updatePrediction();
}

function updateLiveStats(p1,p2){
  const div=document.getElementById('live-stats');
  const grid=document.getElementById('live-stats-grid');
  // H2H
  const h2h=state.history.filter(h=>(h.p1id===p1.id&&h.p2id===p2.id)||(h.p1id===p2.id&&h.p2id===p1.id));
  const p1wins=h2h.filter(h=>getOutcomeForPlayer(h,p1.id)>0).length;
  const p2wins=h2h.length-p1wins;
  const streak1=getStreak(p1.id),streak2=getStreak(p2.id);
  const streakText=s=>!s?'—':`${s.isWin?'🔥 ':''}${s.count}${s.isWin?'W':'L'}`;
  grid.innerHTML=`
    <div class="ls-item"><div class="ls-label">H2H Record</div><div class="ls-val" style="color:var(--accent)">${p1wins}${p2wins}</div></div>
    <div class="ls-item"><div class="ls-label">Total H2H Games</div><div class="ls-val">${h2h.length}</div></div>
    <div class="ls-item"><div class="ls-label">${p1.name} Streak</div><div class="ls-val" style="color:${streak1?.isWin?'var(--green)':'var(--red)'}">${streakText(streak1)}</div></div>
    <div class="ls-item"><div class="ls-label">${p2.name} Streak</div><div class="ls-val" style="color:${streak2?.isWin?'var(--green)':'var(--red)'}">${streakText(streak2)}</div></div>
  `;
  div.classList.add('show');
}

function onPlayerSelect(){
  let p1id=parseInt(document.getElementById('p1-select').value);
  let p2id=parseInt(document.getElementById('p2-select').value);
  if(state.featureFlags?.ft_auto_select_top_rivals){
    if(p1id&&!p2id){
      const rival=getRival(p1id);
      if(rival&&rival.id){
        const p2el=document.getElementById('p2-select');
        if(p2el){p2el.value=String(rival.id);p2id=parseInt(p2el.value);}
      }
    }else if(p2id&&!p1id){
      const rival=getRival(p2id);
      if(rival&&rival.id){
        const p1el=document.getElementById('p1-select');
        if(p1el){p1el.value=String(rival.id);p1id=parseInt(p1el.value);}
      }
    }
  }
  updatePlayerPreview(1,p1id);
  updatePlayerPreview(2,p2id);
  const live=document.getElementById('live-stats');
  if(p1id&&p2id&&p1id!==p2id){
    const p1=state.players.find(x=>x.id===p1id),p2=state.players.find(x=>x.id===p2id);
    if(p1&&p2)updateLiveStats(p1,p2);
  }else if(live){
    live.classList.remove('show');
  }
  updatePrediction();
  updateWhoWon();
  updateSeriesDisplay();
  if(state.featureFlags?.ft_context_memory&&p1id&&p2id){
    const ctx=document.getElementById('match-context');
    if(ctx&&!ctx.value.trim()){
      const last=[...state.history].reverse().find(h=>((h.p1id===p1id&&h.p2id===p2id)||(h.p1id===p2id&&h.p2id===p1id))&&h.context);
      if(last)ctx.value=last.context;
    }
  }
}

function updatePlayerPreview(num,pid){
  const el=document.getElementById(`p${num}-preview`);
  if(!pid){el.innerHTML=`<span style="color:var(--muted);font-size:.82rem">No player selected</span>`;return;}
  const p=state.players.find(x=>x.id===pid);if(!p)return;
  const ini=p.name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);
  const t=getTitle(p.rating);
  const ms=state.history.filter(h=>(h.p1id===pid||h.p2id===pid)&&!h.manualAdjust);
  el.innerHTML=`
    <div style="width:38px;height:38px;border-radius:50%;background:${p.color}20;color:${p.color};border:2px solid ${p.color}60;display:flex;align-items:center;justify-content:center;font-family:'Bebas Neue',sans-serif;font-size:1.1rem;flex-shrink:0">${ini}</div>
    <div style="flex:1;min-width:0">
      <div style="font-weight:700;color:${p.color};font-size:.95rem">${p.name}</div>
      <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin-top:2px;">
        <span style="font-family:'Bebas Neue',sans-serif;font-size:1.1rem;color:${p.color}">${p.rating}</span>
        ${titleHTML(p.rating)}
      </div>
      <div style="font-size:.72rem;color:var(--muted);margin-top:2px">${p.wins||0}W  ${p.losses||0}L  ${ms.length}G</div>
    </div>
  `;
  document.getElementById(`pick-card-${num}`).className=`player-pick-card selected-p${num}`;
}

function updateWhoWon(){
  const p1id=parseInt(document.getElementById('p1-select').value);
  const p2id=parseInt(document.getElementById('p2-select').value);
  const sec=document.getElementById('who-won-section');
  if(!p1id||!p2id||p1id===p2id){sec.style.display='none';return;}
  const p1=state.players.find(x=>x.id===p1id),p2=state.players.find(x=>x.id===p2id);
  document.getElementById('winner-label-p1').textContent=p1.name;
  document.getElementById('winner-label-p2').textContent=p2.name;
  document.getElementById('winner-btn-p1').style.borderColor=p1.color+'60';
  setWinnerButtonsDisabled(false);
  sec.style.display='block';
}
function setWinnerButtonsDisabled(disabled){
  const b1=document.getElementById('winner-btn-p1');
  const b2=document.getElementById('winner-btn-p2');
  if(b1)b1.disabled=!!disabled;
  if(b2)b2.disabled=!!disabled;
}



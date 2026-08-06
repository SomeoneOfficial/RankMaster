/*
LEARNING FILE CARD
File: assets/js/logic\series-engine.js
Purpose:
- General app script.
Tips for new developers:
- This file runs in global browser scope (no import/export modules yet).
- Keep function names descriptive and side effects intentional.
- After state changes, most flows should end in renderAll().
*/
// ===================== SERIES =====================
function setSeries(n){
  currentSeries=n;
  document.querySelectorAll('.series-opt').forEach(el=>el.classList.toggle('active',parseInt(el.dataset.series)===n));
  seriesScores={p1:0,p2:0};seriesGames=[];seriesActive=n>1;
  seriesSnapshot=null;awaitingSeriesConfirm=false;
  pendingChanges=null;
  document.getElementById('result-panel').classList.remove('show');
  updateSeriesDisplay();
}

function updateSeriesDisplay(){
  const tracker=document.getElementById('series-tracker');
  if(currentSeries===1){tracker.classList.remove('show');return;}
  const p1id=parseInt(document.getElementById('p1-select').value);
  const p2id=parseInt(document.getElementById('p2-select').value);
  if(!p1id||!p2id){tracker.classList.remove('show');return;}
  tracker.classList.add('show');
  const toWin=Math.ceil(currentSeries/2);
  document.getElementById('series-s1').textContent=seriesScores.p1;
  document.getElementById('series-s2').textContent=seriesScores.p2;
  let p1=state.players.find(x=>x.id===p1id),p2=state.players.find(x=>x.id===p2id);
  const teams=getMatchTeams();
  if(document.getElementById('team-mode-toggle')?.checked&&(!teams.team1[1]||!teams.team2[1])){showToast('Select one teammate for each team.','error');return;}
  if(teams.team1.length>1)p1={...p1,name:teams.team1.map(p=>p.name).join(' + '),rating:Math.round(teams.team1.reduce((n,p)=>n+p.rating,0)/teams.team1.length),teamMembers:teams.team1};
  if(teams.team2.length>1)p2={...p2,name:teams.team2.map(p=>p.name).join(' + '),rating:Math.round(teams.team2.reduce((n,p)=>n+p.rating,0)/teams.team2.length),teamMembers:teams.team2};
  document.getElementById('series-status').textContent=`First to ${toWin}  ${seriesGames.length}/${currentSeries} games`;
  // Dots
  let dotsHTML='';
  for(let i=0;i<currentSeries;i++){
    const g=seriesGames[i];
    const cls=g?'series-dot '+(g==='p1'?'w1':'w2'):'series-dot';
    dotsHTML+=`<div class="${cls}">${g?(g==='p1'?'':''):''}</div>`;
  }
  document.getElementById('series-dots').innerHTML=dotsHTML;
}

// Tracks whether we're waiting for the user to confirm/cancel a game result mid-series
let awaitingSeriesConfirm=false;
// Snapshot of series state before the last game was recorded (for cancel rollback)
let seriesSnapshot=null;

function getRequiredMatchPoints(){
  return Math.max(1,parseInt(state.matchPoints)||10);
}
function validateWinnerScores(winner,p1sc,p2sc){
  const s1=parseInt(p1sc),s2=parseInt(p2sc);
  if(isNaN(s1)||isNaN(s2))return'Both scores are required!';
  if(s1===s2)return'Scores cannot be tied.';
  if(winner==='p1'&&s1<=s2)return'Score must match the winner! Player 1 needs a higher score.';
  if(winner==='p2'&&s2<=s1)return'Score must match the winner! Player 2 needs a higher score.';
  const need=getRequiredMatchPoints();
  if(Math.max(s1,s2)<need)return`Winner must reach at least ${need} points (set in Settings).`;
  return'';
}

function previewWinner(winner){
  if(awaitingSeriesConfirm||pendingChanges){showToast('Confirm/cancel current result first.','error');return;}
  const p1id=parseInt(document.getElementById('p1-select').value);
  const p2id=parseInt(document.getElementById('p2-select').value);
  if(!p1id||!p2id||p1id===p2id){showToast('Select both players first.','error');return;}
  const p1sc=document.getElementById('p1-score').value;
  const p2sc=document.getElementById('p2-score').value;
  const vErr=validateWinnerScores(winner,p1sc,p2sc);
  if(vErr){showToast(vErr,'error');return;}
  const p1=state.players.find(x=>x.id===p1id),p2=state.players.find(x=>x.id===p2id);
  computeAndShowResult(p1,p2,winner,p1sc,p2sc,false,null,false,true);
}

// Main match-entry action.
// It validates user input, computes a pending result preview, and waits for applyChanges().
function recordWinner(winner){
  if(winnerActionLock){showToast('Please wait a moment...','error');return;}
  winnerActionLock=true;
  setTimeout(()=>{winnerActionLock=false;},350);
  // Prevent double-clicking while a result is already showing
  if(pendingChanges){showToast('Confirm or cancel the current result first!','error');return;}
  if(awaitingSeriesConfirm){showToast('Confirm or cancel the current result first!','error');return;}

  const p1id=parseInt(document.getElementById('p1-select').value);
  const p2id=parseInt(document.getElementById('p2-select').value);
  if(!p1id||!p2id||p1id===p2id){showToast('Select both players!','error');return;}
  const p1sc=document.getElementById('p1-score').value;
  const p2sc=document.getElementById('p2-score').value;
  const vErr=validateWinnerScores(winner,p1sc,p2sc);
  if(vErr){showToast(vErr,'error');return;}
  const p1=state.players.find(x=>x.id===p1id),p2=state.players.find(x=>x.id===p2id);
  if(state.featureFlags?.ft_rival_alert){
    const r1=getRival(p1.id),r2=getRival(p2.id);
    if((r1&&r1.name===p2.name)||(r2&&r2.name===p1.name))showToast('Rivalry match! ⚔️','');
  }
  if(state.featureFlags?.ft_upset_alert){
    const winnerP=winner==='p1'?p1:p2,loserP=winner==='p1'?p2:p1;
    if((loserP.rating-winnerP.rating)>=100)showToast('Upset alert! Giant-killer chance 👑','');
  }
  if(state.featureFlags?.ft_emoji_hype){
    showToast(winner==='p1'?`${p1.name} locked in 🔥🏓`:`${p2.name} locked in 🔥🏓`,'');
  }

  if(currentSeries===1){
    computeAndShowResult(p1,p2,winner,p1sc,p2sc,false);
  }else{
    // Snapshot state so we can roll back if user cancels
    seriesSnapshot={scores:{p1:seriesScores.p1,p2:seriesScores.p2},games:[...seriesGames]};

    const wonBy=winner==='p1'?'p1':'p2';
    seriesGames.push(wonBy);
    seriesScores[wonBy]++;
    updateSeriesDisplay();

    const toWin=Math.ceil(currentSeries/2);
    if(seriesScores.p1>=toWin||seriesScores.p2>=toWin){
      // Series is over  show final result (still needs confirmation)
      const wasSwept=Math.min(seriesScores.p1,seriesScores.p2)===0;
      const wentFull=seriesGames.length===currentSeries;
      awaitingSeriesConfirm=true;
      computeAndShowResult(p1,p2,winner,p1sc,p2sc,true,{
        seriesScore:`${seriesScores.p1}-${seriesScores.p2}`,
        wasSwept,wentFull
      });
    }else{
      // Between games  show result card, user must confirm before next game
      awaitingSeriesConfirm=true;
      computeAndShowResult(p1,p2,winner,p1sc,p2sc,false,null,/*midSeries=*/true);
    }
  }
}

// Recalculate: keep series position but let user change scores/winner
function recalculateResult(){
  // Roll back the last series game record if mid-series
  if(awaitingSeriesConfirm&&seriesSnapshot){
    seriesScores=seriesSnapshot.scores;
    seriesGames=seriesSnapshot.games;
    seriesSnapshot=null;
    updateSeriesDisplay();
  }
  awaitingSeriesConfirm=false;
  pendingChanges=null;
  document.getElementById('result-panel').classList.remove('show');
  // Re-show who-won and keep entered values so algorithm can be rerun quickly
  updateWhoWon();
  setWinnerButtonsDisabled(false);
  document.getElementById('p1-score').focus();
  showToast('Ready to rerun with current values.','');
}

// Cancel: roll back series state fully and hide result
function cancelResult(){
  if(awaitingSeriesConfirm&&seriesSnapshot){
    seriesScores=seriesSnapshot.scores;
    seriesGames=seriesSnapshot.games;
    seriesSnapshot=null;
    updateSeriesDisplay();
  }
  awaitingSeriesConfirm=false;
  pendingChanges=null;
  document.getElementById('result-panel').classList.remove('show');
  setWinnerButtonsDisabled(false);
  showToast('Result cancelled. Inputs kept.','');
}

function computeAndShowResult(p1,p2,winner,p1sc,p2sc,isSeries=false,seriesInfo=null,midSeries=false,previewOnly=false){
  const p1lh=document.getElementById('p1-lh').checked;
  const p2lh=document.getElementById('p2-lh').checked;
  const context=document.getElementById('match-context').value.trim();
  const notes=document.getElementById('match-notes').value.trim();
  const mult=parseFloat(document.getElementById('points-multiplier')?.value||'1');
  const vErr=validateWinnerScores(winner,p1sc,p2sc);
  if(vErr){showToast(vErr,'error');return;}
  const sportId=document.getElementById('match-sport')?.value||state.sports?.[0]?.id||'table-tennis';
  const sportP1={...p1,rating:p1.sportRatings?.[sportId]??p1.rating??1000};
  const sportP2={...p2,rating:p2.sportRatings?.[sportId]??p2.rating??1000};
  const r=offlineAlgorithm(sportP1,sportP2,p1sc,p2sc,p1lh,p2lh,mult);
  let titleText=' Match Result';
  if(midSeries){
    const toWin=Math.ceil(currentSeries/2);
    titleText=` Game ${seriesGames.length} of ${currentSeries}  ${p1.name} ${seriesScores.p1}${seriesScores.p2} ${p2.name} (First to ${toWin})`;
  }else if(isSeries&&seriesInfo){
    if(seriesInfo.wasSwept)r.reasoning='Dominant series sweep! '+r.reasoning;
    if(seriesInfo.wentFull)r.reasoning='Series went the full distance! '+r.reasoning;
    titleText=` Series Complete  ${seriesInfo.seriesScore}`;
  }
  if(!previewOnly){
    pendingChanges={p1,p2,p1delta:r.p1_delta,p2delta:r.p2_delta,reasoning:r.reasoning,context,notes,p1lh,p2lh,
      midSeries,
      seriesData:(isSeries&&!midSeries)?{score:seriesInfo?.seriesScore,games:currentSeries,wasSwept:seriesInfo?.wasSwept,wentFull:seriesInfo?.wentFull}:null};
  }else{
    pendingChanges=null;
  }
  if(state.featureFlags?.ft_momentum_label){
    const swing=Math.abs((r.p1_delta||0)-(r.p2_delta||0));
    const tag=swing>=40?'Momentum Surge':'Steady Momentum';
    r.reasoning=`[${tag}] ${r.reasoning}`;
  }
  document.getElementById('result-title').textContent=titleText;
  const lbTag=lh=>lh?` <span style="font-size:.68rem;color:var(--accent3)">LH</span>`:'';
  document.getElementById('rating-changes').innerHTML=`
    <div class="rating-change">
      <div class="rc-name" style="color:${p1.color}">${p1.name}${lbTag(p1lh)}</div>
      <div class="rc-delta ${r.p1_delta>=0?'pos':'neg'}">${r.p1_delta>0?'+':''}${r.p1_delta}</div>
      <div style="font-size:.75rem;color:var(--muted)">${sportP1.rating}  ${sportP1.rating+r.p1_delta}</div>
    </div>
    <div class="rating-change">
      <div class="rc-name" style="color:${p2.color}">${p2.name}${lbTag(p2lh)}</div>
      <div class="rc-delta ${r.p2_delta>=0?'pos':'neg'}">${r.p2_delta>0?'+':''}${r.p2_delta}</div>
      <div style="font-size:.75rem;color:var(--muted)">${sportP2.rating}  ${sportP2.rating+r.p2_delta}</div>
    </div>`;
  // For mid-series games, change confirm button text
  const confirmBtn=document.querySelector('#result-panel .btn-success');
  if(confirmBtn){
    if(previewOnly){
      confirmBtn.textContent='Preview only  choose winner button to log';
      confirmBtn.disabled=true;
      setWinnerButtonsDisabled(false);
    }else if(midSeries){
      const toWin=Math.ceil(currentSeries/2);
      confirmBtn.textContent=` Confirm Game ${seriesGames.length}  Next Game `;
      confirmBtn.disabled=false;
      setWinnerButtonsDisabled(true);
    }else{
      confirmBtn.textContent=' ✅ Confirm & Update Ratings';
      confirmBtn.disabled=false;
      setWinnerButtonsDisabled(true);
    }
  }
  document.getElementById('ai-reasoning').textContent=r.reasoning;
  document.getElementById('result-panel').classList.add('show');
  document.getElementById('result-panel').scrollIntoView({behavior:'smooth',block:'nearest'});
}

function swapScores(){
  const p1el=document.getElementById('p1-score');
  const p2el=document.getElementById('p2-score');
  const tmp=p1el.value;p1el.value=p2el.value;p2el.value=tmp;
}
function loadPreviousMatchSettings(){
  const last=[...state.history].reverse().find(h=>!h.manualAdjust&&h.p1id&&h.p2id&&h.p1id!==h.p2id);
  if(!last){showToast('No previous match found in history.','error');return;}
  const p1el=document.getElementById('p1-select');
  const p2el=document.getElementById('p2-select');
  if(!p1el||!p2el)return;
  p1el.value=String(last.p1id);
  p2el.value=String(last.p2id);
  onPlayerSelect();
  const p1s=document.getElementById('p1-score');
  const p2s=document.getElementById('p2-score');
  if(p1s)p1s.value=(last.p1score??'')!==''?String(last.p1score):'';
  if(p2s)p2s.value=(last.p2score??'')!==''?String(last.p2score):'';
  const ctx=document.getElementById('match-context');
  if(ctx)ctx.value=last.context||'';
  const notes=document.getElementById('match-notes');
  if(notes)notes.value=last.notes||'';
  const mult=parseFloat(last.multiplier);
  const multEl=document.getElementById('points-multiplier');
  const multLabel=document.getElementById('mult-display');
  if(multEl&&!isNaN(mult)){
    multEl.value=String(Math.max(0.25,Math.min(5,mult)));
    if(multLabel)multLabel.textContent=parseFloat(multEl.value).toFixed(2)+'x';
  }
  const p1lhEl=document.getElementById('p1-lh');
  const p2lhEl=document.getElementById('p2-lh');
  if(p1lhEl)p1lhEl.checked=!!last.p1lh||(last.lhTag||'').includes(`${last.p1name} (LH)`);
  if(p2lhEl)p2lhEl.checked=!!last.p2lh||(last.lhTag||'').includes(`${last.p2name} (LH)`);
  const sGames=parseInt(last.seriesData?.games);
  setSeries([1,3,5,7,9].includes(sGames)?sGames:1);
  pendingChanges=null;
  awaitingSeriesConfirm=false;
  document.getElementById('result-panel').classList.remove('show');
  showToast('Loaded previous match settings from history.','success');
}
function undoLastMatch(){
  const last=state.history[state.history.length-1];
  if(!last){showToast('No match to undo.','error');return;}
  if(!state.featureFlags?.ft_undo_without_prompt&& !confirm('Undo the most recent match and revert ratings/stats?'))return;
  state.history.pop();
  const p1=state.players.find(x=>x.id===last.p1id);
  const p2=state.players.find(x=>x.id===last.p2id);
  const team1=(last.team1ids||[last.p1id]).map(id=>state.players.find(x=>x.id===id)).filter(Boolean);
  const team2=(last.team2ids||[last.p2id]).map(id=>state.players.find(x=>x.id===id)).filter(Boolean);
  const sportId=last.sportId||'table-tennis';
  if(last.team1ids||last.team2ids){team1.forEach(x=>{x.sportRatings=x.sportRatings||{};x.sportRatings[sportId]=(x.sportRatings[sportId]||0)-(last.p1delta||0);});team2.forEach(x=>{x.sportRatings=x.sportRatings||{};x.sportRatings[sportId]=(x.sportRatings[sportId]||0)-(last.p2delta||0);});}
  if(!last.team1ids&&!last.team2ids){if(p1){p1.sportRatings=p1.sportRatings||{};p1.sportRatings[sportId]=(p1.sportRatings[sportId]||0)-(last.p1delta||0);}if(p2&&p2.id!==last.p1id){p2.sportRatings=p2.sportRatings||{};p2.sportRatings[sportId]=(p2.sportRatings[sportId]||0)-(last.p2delta||0);}}
  if(!last.team1ids&&!last.team2ids&&p1&&p2&&p1.id!==p2.id&&!last.manualAdjust){
    const p1Won=didP1WinMatch(last);
    if(p1Won){p1.wins=Math.max(0,(p1.wins||0)-1);p2.losses=Math.max(0,(p2.losses||0)-1);}
    else{p2.wins=Math.max(0,(p2.wins||0)-1);p1.losses=Math.max(0,(p1.losses||0)-1);}
  }
  if(last.team1ids||last.team2ids){const p1Won=didP1WinMatch(last);if(p1Won){team1.forEach(x=>x.wins=Math.max(0,(x.wins||0)-1));team2.forEach(x=>x.losses=Math.max(0,(x.losses||0)-1));}else{team2.forEach(x=>x.wins=Math.max(0,(x.wins||0)-1));team1.forEach(x=>x.losses=Math.max(0,(x.losses||0)-1));}}
  state.dailyCount=Math.max(0,(state.dailyCount||0)-1);
  renderAll();
  showToast('Last match undone. ↩️','success');
}

// Commit step: this is where pendingChanges become official.
// Flow: mutate ratings -> append history -> update daily goal -> refresh UI -> persist local/cloud.
function applyChanges(opts){
  if(!pendingChanges&&!opts){showToast('Pick a winner to create an official result first.','error');return;}
  const{p1,p2,p1delta,p2delta,reasoning,context,notes,p1lh,p2lh,tournamentMatch,seriesData,midSeries}=opts||pendingChanges;
  const sportId=document.getElementById('match-sport')?.value||state.sports?.[0]?.id||'table-tennis';
  const sportRating=p=>(p?.sportRatings?.[sportId]??p?.rating??1000);
  if(state.featureFlags?.ft_confirm_upset){
    const bigDiff=Math.abs(sportRating(p1)-sportRating(p2));
    if(bigDiff>=250&&!confirm('Large rating gap detected. Confirm this upset result?'))return;
  }
  const oldR1=sportRating(p1),oldR2=sportRating(p2),oldW1=p1.wins||0,oldW2=p2.wins||0;
  const team1=p1.teamMembers||[p1],team2=p2.teamMembers||[p2];
  team1.forEach(member=>{member.sportRatings=member.sportRatings||{};member.sportRatings[sportId]=(member.sportRatings[sportId]??oldR1)+p1delta;});
  team2.forEach(member=>{member.sportRatings=member.sportRatings||{};member.sportRatings[sportId]=(member.sportRatings[sportId]??oldR2)+p2delta;});
  const p1sc=document.getElementById('p1-score')?.value??'';
  const p2sc=document.getElementById('p2-score')?.value??'';
  const usedMult=parseFloat(document.getElementById('points-multiplier')?.value||'1');
  const p1WonNow=(parseScore(p1sc)!==null&&parseScore(p2sc)!==null)?(parseScore(p1sc)>parseScore(p2sc)):(p1delta>p2delta);
  if(p1WonNow){team1.forEach(member=>member.wins=(member.wins||0)+1);team2.forEach(member=>member.losses=(member.losses||0)+1);}
  else{team2.forEach(member=>member.wins=(member.wins||0)+1);team1.forEach(member=>member.losses=(member.losses||0)+1);}
  const now=new Date();
  const lhTag=[p1lh?p1.name+' (LH)':'',p2lh?p2.name+' (LH)':''].filter(Boolean).join(', ');
  state.history.push({
    id:state.nextId++,time:formatTime(now),
    p1id:p1.id,p2id:p2.id,p1name:p1.name,p2name:p2.name,
    p1delta,p2delta,p1ratBefore:oldR1,p2ratBefore:oldR2,
    p1score:p1sc,p2score:p2sc,
    reasoning,context,notes,mode:'offline',lhTag,multiplier:usedMult,p1lh:!!p1lh,p2lh:!!p2lh,
    tournamentMatch:!!tournamentMatch,
    seriesData:seriesData||null,sportId,scoringType:state.sports?.find(s=>s.id===sportId)?.scoring||'points',team1ids:team1.map(x=>x.id),team2ids:team2.map(x=>x.id)
  });
  const today=new Date().toISOString().slice(0,10);
  if(state.dailyDate!==today){state.dailyDate=today;state.dailyCount=0;}
  state.dailyCount=(state.dailyCount||0)+1;
  updateDailyGoalStatus();
  checkMilestones(p1,oldR1,oldW1);
  checkMilestones(p2,oldR2,oldW2);

  if(!opts){
    pendingChanges=null;
    awaitingSeriesConfirm=false;
    seriesSnapshot=null;

    if(midSeries){
      // Between-game confirm: just clear scores and let them play next game
      document.getElementById('result-panel').classList.remove('show');
      document.getElementById('p1-score').value='';
      document.getElementById('p2-score').value='';
      setWinnerButtonsDisabled(false);
      const toWin=Math.ceil(currentSeries/2);
      saveState();
      renderMatchSelects();
      renderHistory();
      renderPlayersManageList();
      saveState();
      if(state.featureFlags?.ft_auto_focus_notes){
        const notesEl=document.getElementById('match-notes');
        if(notesEl)notesEl.focus();
      }
      showToast(`Confirmed! ${p1.name} ${seriesScores.p1}${seriesScores.p2} ${p2.name}  enter next game scores.`,'success');
    }else{
      // Full match done  reset everything
      document.getElementById('result-panel').classList.remove('show');
      document.getElementById('prediction-box').classList.remove('show');
      document.getElementById('live-stats').classList.remove('show');
      showWinProbability=false;
      const predBtn=document.getElementById('pred-toggle-btn');
      if(predBtn)predBtn.textContent='📈 Show Win Probability';
      const clearIds=['p1-select','p2-select','match-notes'];
      if(state.featureFlags?.ft_auto_clear_scores!==false)clearIds.push('p1-score','p2-score');
      if(!state.featureFlags?.ft_keep_context_after_confirm)clearIds.push('match-context');
      clearIds.forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
      document.getElementById('p1-lh').checked=false;document.getElementById('p2-lh').checked=false;
      document.getElementById('p1-preview').innerHTML='<span style="color:var(--muted);font-size:.82rem">No player selected</span>';
      document.getElementById('p2-preview').innerHTML='<span style="color:var(--muted);font-size:.82rem">No player selected</span>';
      document.getElementById('pick-card-1').className='player-pick-card';
      document.getElementById('pick-card-2').className='player-pick-card';
      document.getElementById('who-won-section').style.display='none';
      setWinnerButtonsDisabled(false);
      seriesScores={p1:0,p2:0};seriesGames=[];
      updateSeriesDisplay();
      renderAll();showToast(state.featureFlags?.ft_emoji_hype?'Ratings updated! 🎉📈🏆':'Ratings updated! ','success');
      if(state.featureFlags?.ft_auto_open_history)switchTab('history');else switchTab('leaderboard');
      if(state.featureFlags?.ft_confetti&&Math.abs((p1delta||0)-(p2delta||0))>40)showMilestone('🎉','Big Swing!','Confetti moment');
    }
    if(state.featureFlags?.ft_win_sound){
      try{
        const ctx=new (window.AudioContext||window.webkitAudioContext)();
        const osc=ctx.createOscillator();const gain=ctx.createGain();
        osc.connect(gain);gain.connect(ctx.destination);osc.type='triangle';
        osc.frequency.value=880;gain.gain.value=0.02;osc.start();osc.stop(ctx.currentTime+0.08);
      }catch(e){}
    }
  }else{
    renderAll();
  }
}



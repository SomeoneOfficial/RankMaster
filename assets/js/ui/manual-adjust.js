// ===================== MANUAL ADJUST =====================
function openManualAdjustModal(){
  const sel=document.getElementById('adjust-player-select');
  sel.innerHTML=state.players.map(p=>`<option value="${p.id}">${p.name} (${p.rating})</option>`).join('');
  prefillAdjustRating();document.getElementById('adjust-reason').value='';
  document.getElementById('adjust-modal').classList.add('show');
}
function prefillAdjustRating(){
  const pid=parseInt(document.getElementById('adjust-player-select').value);
  const p=state.players.find(x=>x.id===pid);if(p)document.getElementById('adjust-rating-val').value=p.rating;
}
function applyManualAdjust(){
  const pid=parseInt(document.getElementById('adjust-player-select').value);
  const newR=parseInt(document.getElementById('adjust-rating-val').value);
  const reason=document.getElementById('adjust-reason').value.trim();
  if(!pid||isNaN(newR)){showToast('Fill in player and new rating!','error');return;}
  const p=state.players.find(x=>x.id===pid);
  const oldR=p.rating,delta=newR-oldR;p.rating=newR;
  state.history.push({id:state.nextId++,time:formatTime(new Date()),p1id:p.id,p2id:p.id,p1name:p.name,p2name:p.name,p1delta:delta,p2delta:0,p1ratBefore:oldR,p2ratBefore:oldR,reasoning:reason||'Manual adjustment',context:'',notes:'',mode:'manual',lhTag:'',manualAdjust:true});
  closeModal('adjust-modal');renderAll();showToast(`${p.name}  ${newR} `,'success');
}

function setMatchPointsInput(){
  const el=document.getElementById('match-points-input');
  if(!el)return;
  const need=getRequiredMatchPoints();
  el.value=need;
  const p1=document.getElementById('p1-score');
  const p2=document.getElementById('p2-score');
  if(p1)p1.placeholder=String(need);
  if(p2)p2.placeholder=String(Math.max(0,need-2));
}
function saveMatchPoints(){
  const el=document.getElementById('match-points-input');
  if(!el)return;
  const v=parseInt(el.value);
  if(isNaN(v)||v<1||v>99){showToast('Enter a value between 1 and 99.','error');return;}
  state.matchPoints=v;
  setMatchPointsInput();
  saveState();
  showToast(`Full match points saved: ${v} 🎯`,'success');
}
function updateTopRankEmojiUI(){
  const input=document.getElementById('top-rank-emoji-input');
  if(input&&document.activeElement!==input)input.value=getTopRankEmoji();
  const preview=document.getElementById('top-rank-emoji-preview');
  if(preview)preview.textContent=`Preview: ${normalizeCreatorEmojiInput(input?.value)||getTopRankEmoji()} above #1`;
}
function previewTopRankEmoji(){
  updateTopRankEmojiUI();
}
function saveTopRankEmoji(){
  const input=document.getElementById('top-rank-emoji-input');
  const emoji=normalizeCreatorEmojiInput(input?.value)||'🐦';
  state.topRankEmoji=emoji;
  if(input)input.value=emoji;
  renderAll();
  showToast('Top rank emoji saved.','success');
}
function updateCreatorSettingsUI(){
  const card=document.getElementById('creator-emoji-action');
  if(!card)return;
  const creator=getCreatorPlayer();
  if(!creator){card.style.display='none';return;}
  card.style.display='block';
  const input=document.getElementById('creator-emoji-input');
  if(input&&document.activeElement!==input)input.value=creator.avatarEmoji||creator.creatorEmoji||'';
  const preview=document.getElementById('creator-emoji-preview');
  if(preview){
    const activeVal=input?input.value:(creator.avatarEmoji||creator.creatorEmoji||'');
    const emoji=normalizeCreatorEmojiInput(activeVal)||'👤';
    preview.textContent=`Preview: ${emoji} ${creator.name}`;
  }
}
function previewCreatorEmoji(){
  updateCreatorSettingsUI();
}
function saveCreatorEmoji(){
  const creator=getCreatorPlayer();
  if(!creator){showToast('Creator player (ASS) not found.','error');return;}
  const input=document.getElementById('creator-emoji-input');
  const emoji=normalizeCreatorEmojiInput(input?.value||'');
  creator.avatarEmoji=emoji;
  creator.creatorEmoji=emoji;
  if(input)input.value=emoji;
  renderAll();
  showToast(emoji?'Creator emoji saved.':'Creator emoji cleared.','success');
}


// ===================== PLAYERS CRUD =====================
function addPlayer(){
  const name=document.getElementById('new-name').value.trim();
  const rating=parseInt(document.getElementById('new-rating').value)||1000;
  const avatarEmoji=normalizeCreatorEmojiInput(document.getElementById('new-emoji')?.value||'');
  if(!name){showToast('Please enter a name!','error');return;}
  if(state.players.some(p=>p.name.toLowerCase()===name.toLowerCase())){showToast('Player name already exists!','error');return;}
  state.players.push({id:state.nextId++,name,rating,color:selectedColor,avatarEmoji,creatorEmoji:'',wins:0,losses:0});
  document.getElementById('new-name').value='';document.getElementById('new-rating').value='1000';
  const ne=document.getElementById('new-emoji');if(ne)ne.value='';
  renderAll();showToast(`${name} added! `,'success');
}
function savePlayerEmoji(id){
  const p=state.players.find(x=>x.id===id);if(!p)return;
  const input=document.getElementById(`player-emoji-${id}`);
  const emoji=normalizeCreatorEmojiInput(input?.value||'');
  p.avatarEmoji=emoji;
  if(isCreatorPlayer(p))p.creatorEmoji=emoji;
  if(input)input.value=emoji;
  renderAll();
  showToast(emoji?`${p.name} emoji saved.`:`${p.name} emoji cleared.`,'success');
}
function deletePlayer(id){
  const p=state.players.find(x=>x.id===id);
  if(!confirm(`Remove ${p.name}? This won't delete their match history.`))return;
  state.players=state.players.filter(x=>x.id!==id);renderAll();showToast('Player removed.','');
}
function openEdit(id){
  const p=state.players.find(x=>x.id===id);editingId=id;editSelectedColor=p.color;
  document.getElementById('edit-name').value=p.name;document.getElementById('edit-rating').value=p.rating;
  const ee=document.getElementById('edit-emoji');
  if(ee)ee.value=normalizeCreatorEmojiInput(p.avatarEmoji||p.creatorEmoji||'');
  renderColorSwatches('edit-color-swatches',c=>{editSelectedColor=c;},true);
  setTimeout(()=>{const sw=document.getElementById('edit-color-swatches');if(sw){sw.querySelectorAll('.color-swatch').forEach(s=>{if(s.style.background===p.color||s.style.backgroundColor===p.color)s.classList.add('selected');});}},50);
  document.getElementById('edit-modal').classList.add('show');
}
function saveEdit(){
  const p=state.players.find(x=>x.id===editingId);
  p.name=document.getElementById('edit-name').value.trim()||p.name;
  p.rating=parseInt(document.getElementById('edit-rating').value)||p.rating;
  p.avatarEmoji=normalizeCreatorEmojiInput(document.getElementById('edit-emoji')?.value||'');
  if(isCreatorPlayer(p))p.creatorEmoji=p.avatarEmoji;
  p.color=editSelectedColor;
  closeModal('edit-modal');renderAll();showToast('Player updated! ','success');
}


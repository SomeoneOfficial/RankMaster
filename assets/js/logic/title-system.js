// ===================== TITLE SYSTEM =====================
function getTitle(rating){
  return TITLES.find(t=>rating>=t.min)||TITLES[TITLES.length-1];
}
function titleHTML(rating){
  const t=getTitle(rating);
  return `<span class="title-badge" style="color:${t.color};background:${t.bg};border-color:${t.color}40">${t.icon} ${t.label}</span>`;
}
function isCreatorName(name){
  return String(name||'').trim().toUpperCase()==='ASS';
}
function isCreatorPlayer(p){
  return !!p&&isCreatorName(p.name);
}
function getCreatorPlayer(){
  return state.players.find(p=>isCreatorPlayer(p))||null;
}
function normalizeCreatorEmojiInput(raw){
  return Array.from(String(raw||'').trim()).slice(0,2).join('');
}
function getTopRankEmoji(){
  return normalizeCreatorEmojiInput(state.topRankEmoji)||'🐦';
}
function getPlayerInitials(name){
  const txt=String(name||'').trim();
  if(!txt)return'??';
  return txt.split(' ').filter(Boolean).map(w=>w[0]).join('').toUpperCase().slice(0,2)||'??';
}
function getPlayerAvatarDisplay(p){
  const avatarEmoji=normalizeCreatorEmojiInput(p?.avatarEmoji);
  if(avatarEmoji)return avatarEmoji;
  if(isCreatorPlayer(p)){
    const legacyCreatorEmoji=normalizeCreatorEmojiInput(p?.creatorEmoji);
    if(legacyCreatorEmoji)return legacyCreatorEmoji;
  }
  return getPlayerInitials(p?.name);
}
function creatorBadgesHTML(compact=false){
  if(compact)return `<span class="creator-badge">👑 Creator</span>`;
  return `<span class="creator-badge">👑 App Creator</span><span class="creator-badge">⚡ Original Builder</span>`;
}


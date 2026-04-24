// ===================== PLAYERS MANAGE LIST =====================
function renderPlayersManageList(){
  const list=document.getElementById('players-manage-list');if(!list)return;
  if(!state.players.length){list.innerHTML='<div style="color:var(--muted);font-size:.82rem;text-align:center;padding:12px">No players yet</div>';return;}
  list.innerHTML=state.players.map(p=>{
    const creator=isCreatorPlayer(p);
    const avatar=getPlayerAvatarDisplay(p);
    const emojiValue=normalizeCreatorEmojiInput(p.avatarEmoji||p.creatorEmoji||'');
    return`<div style="display:flex;align-items:center;gap:10px;background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:9px 12px;">
      <div style="width:30px;height:30px;border-radius:50%;background:${p.color}20;color:${p.color};border:2px solid ${p.color}50;display:flex;align-items:center;justify-content:center;font-family:'Bebas Neue',sans-serif;font-size:.9rem;flex-shrink:0">${avatar}</div>
      <div style="flex:1;min-width:0">
        <div style="font-weight:700;font-size:.88rem;color:${p.color}">${p.name} ${creator?creatorBadgesHTML(true):''}</div>
        <div style="font-size:.72rem;color:var(--muted)">${p.rating} pts  ${p.wins||0}W ${p.losses||0}L</div>
        <div style="display:flex;gap:6px;align-items:center;margin-top:6px;flex-wrap:wrap">
          <input type="text" id="player-emoji-${p.id}" maxlength="8" value="${emojiValue}" placeholder="Emoji" style="width:72px;background:var(--bg);border:1px solid var(--border);border-radius:7px;color:var(--text);padding:5px 7px;font-family:'DM Sans',sans-serif;font-size:.8rem;">
          <button class="btn btn-secondary btn-sm" onclick="savePlayerEmoji(${p.id})" style="padding:5px 9px">Save Emoji</button>
        </div>
      </div>
      <button class="btn btn-secondary btn-sm" onclick="openEdit(${p.id})" style="padding:5px 9px"></button>
      <button class="btn btn-danger btn-sm" onclick="deletePlayer(${p.id})" style="padding:5px 9px"></button>
    </div>`;
  }).join('');
}


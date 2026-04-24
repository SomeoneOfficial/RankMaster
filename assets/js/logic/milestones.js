// ===================== MILESTONES =====================
function checkMilestones(player,oldRating,oldWins){
  MILESTONES.forEach(m=>{
    if(m.key==='rating'&&oldRating<m.val&&player.rating>=m.val)showMilestone('',m.msg,m.sub);
    if(m.key==='wins'&&oldWins<m.val&&(player.wins||0)>=m.val)showMilestone('',m.msg,m.sub);
  });
}
function showMilestone(icon,title,sub){
  const t=document.getElementById('milestone-toast');
  document.getElementById('mt-icon').textContent=icon;
  document.getElementById('mt-title').textContent=title;
  document.getElementById('mt-sub').textContent=sub;
  t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'),4000);
}


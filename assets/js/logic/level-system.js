// ===================== LEVEL SYSTEM =====================
function getLevel(wins,gamesPlayed){
  const xp=(wins||0)*100+(gamesPlayed||0)*20;
  const level=Math.floor(Math.sqrt(xp/50))+1;
  const xpForLevel=(level-1)*(level-1)*50;
  const xpNext=level*level*50;
  const pct=Math.min(100,Math.round((xp-xpForLevel)/(xpNext-xpForLevel)*100));
  return{level,xp,pct};
}


/*
LEARNING FILE CARD
File: assets/js/logic\level-system.js
Purpose:
- General app script.
Tips for new developers:
- This file runs in global browser scope (no import/export modules yet).
- Keep function names descriptive and side effects intentional.
- After state changes, most flows should end in renderAll().
*/
// ===================== LEVEL SYSTEM =====================
function getLevel(wins,gamesPlayed){
  const xp=(wins||0)*100+(gamesPlayed||0)*20;
  const level=Math.floor(Math.sqrt(xp/50))+1;
  const xpForLevel=(level-1)*(level-1)*50;
  const xpNext=level*level*50;
  const pct=Math.min(100,Math.round((xp-xpForLevel)/(xpNext-xpForLevel)*100));
  return{level,xp,pct};
}



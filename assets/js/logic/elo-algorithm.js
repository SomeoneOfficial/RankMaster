// ===================== ALGORITHM =====================
function parseScore(s){if(!s&&s!==0)return null;const n=parseFloat(String(s).replace(/[^0-9.]/g,''));return isNaN(n)?null:n;}
function didP1WinMatch(h){
  const s1=parseScore(h?.p1score),s2=parseScore(h?.p2score);
  if(s1!==null&&s2!==null&&s1!==s2)return s1>s2;
  return (h?.p1delta||0)>(h?.p2delta||0);
}
function getOutcomeForPlayer(h,pid){
  if(!h||!pid||h.manualAdjust)return 0;
  const p1Won=didP1WinMatch(h);
  if(pid===h.p1id)return p1Won?1:-1;
  if(pid===h.p2id)return p1Won?-1:1;
  return 0;
}

function offlineAlgorithm(p1,p2,p1scoreStr,p2scoreStr,p1lh,p2lh,multiplierOverride){
  const ratingDiff=p1.rating-p2.rating;
  const s1=parseScore(p1scoreStr),s2=parseScore(p2scoreStr);
  let marginFactor=.5,isDraw=false,reasoning='';
  if(s1!==null&&s2!==null){
    const total=s1+s2;
    marginFactor=total===0?.5:s1/total;
    if(Math.abs(s1-s2)===0)isDraw=true;
  }else isDraw=true;
  const expected1=1/(1+Math.pow(10,-ratingDiff/400)),expected2=1-expected1;
  // Use true match result as Elo "actual", then scale by score margin.
  const p1won=!isDraw&&s1!==null&&s2!==null?s1>s2:marginFactor>.5;
  const actual1=isDraw?.5:(p1won?1:0),actual2=1-actual1;
  const K_BASE=40;
  const multiplier=multiplierOverride!==undefined?multiplierOverride:(parseFloat(document.getElementById('points-multiplier').value)||1);
  const ma=isDraw?0:Math.abs(marginFactor-.5)*2; // 0..1
  const marginBonus=1+ma*.8;
  let p1d=Math.round((K_BASE*multiplier*marginBonus)*(actual1-expected1));
  let p2d=Math.round((K_BASE*multiplier*marginBonus)*(actual2-expected2));
  const gap=Math.abs(ratingDiff);
  const floorBase=gap>=450?3:gap>=300?2:1;
  const winnerMin=Math.max(1,Math.round(floorBase*multiplier));
  if(p1lh){p1d+=p1d>0?12:6;}
  if(p2lh){p2d+=p2d>0?12:6;}
  if(!isDraw){
    if(p1won){
      if(p1d<winnerMin)p1d=winnerMin;
      if(p2d>-winnerMin)p2d=-winnerMin;
    }else{
      if(p2d<winnerMin)p2d=winnerMin;
      if(p1d>-winnerMin)p1d=-winnerMin;
    }
  }
  if(!reasoning){
    const up=Math.abs(actual1-expected1);
    if(isDraw)reasoning=ratingDiff>50?'Draw favours underdog  small rating swing.':'Close draw, minimal changes.';
    else if(up>.35)reasoning=marginFactor>.5?'Major upset! Big rating swing.':'Favourite dominated convincingly.';
    else reasoning=marginFactor>.5?`P1 won${ma>.5?' convincingly':' closely'}.`:`P2 won${ma>.5?' convincingly':' closely'}.`;
    if(p1lh||p2lh)reasoning+=' Left-hand handicap bonus applied.';
  }
  return{p1_delta:p1d,p2_delta:p2d,reasoning:reasoning.trim()};
}


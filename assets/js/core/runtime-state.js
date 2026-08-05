/*
LEARNING FILE CARD
File: assets/js/core\runtime-state.js
Purpose:
- General app script.
Tips for new developers:
- This file runs in global browser scope (no import/export modules yet).
- Keep function names descriptive and side effects intentional.
- After state changes, most flows should end in renderAll().
*/
function createInitialState(){
  return{
    players:[],
    history:[],
    nextId:1,
    tournament:null,
    achievements:{},
    lowestRatings:{},
    matchPoints:10,
    topRankEmoji:'🐦',
    theme:'neon',
    density:'comfort',
    dailyGoal:5,
    dailyDate:'',
    dailyCount:0,
    boldText:false,
    mobileLock:true,
    featureFlags:{}
    ,sports:[{id:'table-tennis',name:'Table Tennis',emoji:'🏓',scoring:'points',target:11,baseRating:1000},{id:'soccer',name:'Soccer',emoji:'⚽',scoring:'points',target:1,baseRating:1000},{id:'basketball',name:'Basketball',emoji:'🏀',scoring:'points',target:1,baseRating:1000},{id:'badminton',name:'Badminton',emoji:'🏸',scoring:'points',target:21,baseRating:1000}]
    ,activeSportId:'master'
  };
}

let state=createInitialState();
let selectedColor=COLORS[0], editSelectedColor=COLORS[0], editingId=null, pendingChanges=null;
let selectedFormat='elimination', spinP1=null, spinP2=null;
let currentSeries=1, seriesScores={p1:0,p2:0}, seriesGames=[], seriesActive=false;
let historyFilter='all';
let winnerActionLock=false;
let currentSettingsPane='general';
let currentFeatureType='core';
let showWinProbability=false;
let cloudAuthMode='login';
let supabaseClient=null;
let cloudUser=null;
let cloudSaveTimer=null;
let isApplyingCloudState=false;
let cloudSyncInFlight=false;
let cloudLastSyncAt='';
let cloudRealtimeChannel=null;
let cloudSuppressEchoUntilMs=0;

function ensureStateDefaults(){
  if(!state.achievements)state.achievements={};
  if(!state.lowestRatings)state.lowestRatings={};
  if(!state.matchPoints||isNaN(state.matchPoints))state.matchPoints=10;
  if(!state.topRankEmoji)state.topRankEmoji='🐦';
  if(!state.theme)state.theme='neon';
  if(!state.density)state.density='comfort';
  if(state.boldText===undefined)state.boldText=false;
  if(state.mobileLock===undefined)state.mobileLock=true;
  if(!state.featureFlags)state.featureFlags={};
  if(!Array.isArray(state.sports)||!state.sports.length)state.sports=createInitialState().sports;
  if(!state.activeSportId)state.activeSportId='master';
  state.sports.forEach(s=>{if(typeof s.baseRating!=='number'||!isFinite(s.baseRating))s.baseRating=1000;});
  state.players.forEach(p=>{if(!p.sportRatings)p.sportRatings={};state.sports.forEach(s=>{const played=state.history.some(h=>!h.manualAdjust&&h.sportId===s.id&&(h.p1id===p.id||h.p2id===p.id));if(!played)p.sportRatings[s.id]=s.baseRating;else if(typeof p.sportRatings[s.id]!=='number')p.sportRatings[s.id]=p.rating||1000;});});
  // Initialize flags for both built-in and newly registered feature toggles.
  seedFeatureDefaults(state.featureFlags);
  if(!state.dailyGoal||isNaN(state.dailyGoal))state.dailyGoal=5;
  const today=new Date().toISOString().slice(0,10);
  if(!state.dailyDate){state.dailyDate=today;state.dailyCount=0;}
  if(state.dailyDate!==today){state.dailyDate=today;state.dailyCount=0;}
}



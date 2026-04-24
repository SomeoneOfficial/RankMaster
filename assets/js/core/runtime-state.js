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
  const defaults={ft_live_h2h:true,ft_colorful_badges:true,ft_auto_clear_scores:true};
  FEATURE_TOGGLES.forEach(f=>{if(state.featureFlags[f.id]===undefined)state.featureFlags[f.id]=!!defaults[f.id];});
  if(!state.dailyGoal||isNaN(state.dailyGoal))state.dailyGoal=5;
  const today=new Date().toISOString().slice(0,10);
  if(!state.dailyDate){state.dailyDate=today;state.dailyCount=0;}
  if(state.dailyDate!==today){state.dailyDate=today;state.dailyCount=0;}
}


/*
BEGINNER MAP (read this first)
1) Constants + Config: global options, colors, feature flags, cloud config.
2) Core State: one object called "state" stores app data (players, history, settings).
3) Pure Logic: rating math, achievements, streaks, helpers.
4) UI Render: functions that draw tabs/cards/lists from current state.
5) Actions: add player, record winner, apply changes, tournament actions.
6) Persistence: save/load local storage + cloud sync.
7) Boot: init() loads data, renders UI, and sets up listeners.
For a friendlier walkthrough, open BEGINNER_GUIDE.md in this repo.
*/
// ===================== CONSTANTS =====================
const COLORS=['#f0c040','#e05a30','#3dd68c','#5ab4f0','#c07af0','#f05a8a','#40c0c0','#e09030','#90c040','#f06060','#f0a050','#70d0f0'];

const TITLES=[
  {min:2200,label:'LEGEND',icon:'👑',color:'#ff4aff',bg:'rgba(255,74,255,.15)'},
  {min:2000,label:'GRANDMASTER',icon:'💎',color:'#ff4aff',bg:'rgba(255,74,255,.13)'},
  {min:1800,label:'MASTER',icon:'🌟',color:'#f0c040',bg:'rgba(240,192,64,.15)'},
  {min:1600,label:'EXPERT',icon:'⚡',color:'#5ab4f0',bg:'rgba(90,180,240,.15)'},
  {min:1400,label:'ADVANCED',icon:'🔥',color:'#3dd68c',bg:'rgba(61,214,140,.15)'},
  {min:1200,label:'COMPETITOR',icon:'⭐',color:'#e09030',bg:'rgba(224,144,48,.15)'},
  {min:1000,label:'PLAYER',icon:'🎮',color:'#6b6b88',bg:'rgba(107,107,136,.15)'},
  {min:0,   label:'BEGINNER',icon:'🌱',color:'#4a4a60',bg:'rgba(74,74,96,.15)'},
];

const BASE_ACHIEVEMENTS_DEF=[
  {id:'first_win',icon:'🥇',name:'First Blood',desc:'Win your first match'},
  {id:'win5',icon:'🔥',name:'On Fire',desc:'Win 5 matches'},
  {id:'win20',icon:'💪',name:'Veteran',desc:'Win 20 matches'},
  {id:'win50',icon:'🏆',name:'Champion',desc:'Win 50 matches'},
  {id:'win100',icon:'🚀',name:'Century',desc:'Win 100 matches'},
  {id:'streak3',icon:'⚡',name:'Hat Trick',desc:'3 wins in a row'},
  {id:'streak5',icon:'🌪️',name:'Unstoppable',desc:'5 wins in a row'},
  {id:'streak10',icon:'☄️',name:'Legendary',desc:'10 wins in a row'},
  {id:'streak15',icon:'🔱',name:'Deity',desc:'15 wins in a row'},
  {id:'upset',icon:'😤',name:'Upset King',desc:'Beat someone 100+ pts higher'},
  {id:'upset3',icon:'👑',name:'Giant Slayer',desc:'Pull off 3 upsets'},
  {id:'upset5',icon:'🐉',name:'Dragon Slayer',desc:'Pull off 5 upsets'},
  {id:'domination',icon:'💀',name:'Domination',desc:'Win by 5+ points margin'},
  {id:'perfgame',icon:'🎯',name:'Perfect Game',desc:'Win 11-0 (or similar shutout)'},
  {id:'comeback',icon:'🦅',name:'The Comeback',desc:'Reach 200+ pts above your lowest'},
  {id:'rating1200',icon:'⭐',name:'Rising Star',desc:'Hit 1200 rating'},
  {id:'rating1500',icon:'🌟',name:'Elite',desc:'Hit 1500 rating'},
  {id:'rating1800',icon:'🏅',name:'Master',desc:'Hit 1800 rating'},
  {id:'rating2000',icon:'💎',name:'Diamond',desc:'Hit 2000 rating'},
  {id:'lhwin',icon:'🫲',name:'Wrong Hand',desc:'Win with left hand handicap'},
  {id:'lhwin5',icon:'🤹',name:'Ambidextrous',desc:'Win 5 times with left hand'},
  {id:'played10',icon:'🎮',name:'Regular',desc:'Play 10 matches total'},
  {id:'played50',icon:'📌',name:'Dedicated',desc:'Play 50 matches total'},
  {id:'played100',icon:'🏋️',name:'Obsessed',desc:'Play 100 matches total'},
  {id:'serieswin',icon:'🎬',name:'Series Winner',desc:'Win a Best-of series'},
  {id:'sweep',icon:'🧹',name:'The Sweep',desc:'Win a Best-of-3 (or more) 2-0'},
  {id:'tourney',icon:'🎖️',name:'Champion',desc:'Win a tournament'},
  {id:'kothdefend',icon:'🛡️',name:'Defender',desc:'Defend King of the Hill 3 times'},
  {id:'comeback2',icon:'🌊',name:'Phoenix',desc:'Win after being match point down in a series'},
  {id:'longgame',icon:'⏳',name:'Marathon',desc:'Play a series that goes to the final game'},
];
function buildBonusAchievements(){
  const out=[];
  const BONUS_EMOJIS=['🧠','🛰️','🧿','🪙','🧱','🪄','🧭','🧰','🕹️','🎲','🧊','🧨','🧬','🛸','🧪','🧵','🪡','🪢','🛶','🚲','🏎️','🛵','✈️','🚁','🚂','🚢','🛥️','⛵','🚤','🧳','🎈','🎊','🎁','🎀','🎐','🎎','🎭','🎼','🎹','🎷','🎺','🪘','🎸','🎻','🪕','🥁','📯','🪗','🎤','🎧','📻','📸','📹','📼','📺','🕯️','🔭','🔬','🧮','⌛','⏰','🕰️','📡','💡','🔑','🪓','🔨','⚙️','⛓️','🧲'];
  let i=1, ei=0;
  const nextEmoji=()=>BONUS_EMOJIS[ei++]||'✨';
  const push=(metric,min,name,desc)=>out.push({id:`bonus_${String(i++).padStart(3,'0')}`,icon:nextEmoji(),name,desc,metric,min});
  for(let n=1;n<=20;n++)push('wins',n*5,`Win Stack ${n}`,`Reach ${n*5} career wins.`);
  for(let n=1;n<=15;n++)push('games',n*10,`Grinder ${n}`,`Play ${n*10} total matches.`);
  for(let n=1;n<=15;n++)push('rating',1050+n*50,`Rating Climb ${n}`,`Reach rating ${1050+n*50}.`);
  for(let n=1;n<=8;n++)push('streak',n+2,`Streak Lane ${n}`,`Hit a ${n+2}-game win streak.`);
  for(let n=1;n<=5;n++)push('upsets',n,`Upset Route ${n}`,`Record ${n} upset wins.`);
  for(let n=1;n<=3;n++)push('lhwins',n,`Lefty Skill ${n}`,`Win ${n} matches with left-hand handicap.`);
  for(let n=1;n<=2;n++)push('serieswins',n*2-1,`Series Boss ${n}`,`Win ${n*2-1} completed series.`);
  for(let n=1;n<=2;n++)push('comeback',n*100,`Comeback Arc ${n}`,`Achieve a ${n*100}+ rating comeback.`);
  return out;
}
const BONUS_ACHIEVEMENTS_DEF=buildBonusAchievements();
const ACHIEVEMENTS_DEF=[...BASE_ACHIEVEMENTS_DEF,...BONUS_ACHIEVEMENTS_DEF];

const MILESTONES=[
  {key:'rating',val:1200,msg:'Rating 1200!',sub:'Rising Star status achieved '},
  {key:'rating',val:1400,msg:'Rating 1400!',sub:'Advanced status achieved '},
  {key:'rating',val:1500,msg:'Rating 1500!',sub:'Elite level reached '},
  {key:'rating',val:1600,msg:'Rating 1600!',sub:'Expert unlocked '},
  {key:'rating',val:1800,msg:'Rating 1800!',sub:'Master class '},
  {key:'rating',val:2000,msg:'Rating 2000!',sub:'GRANDMASTER '},
  {key:'rating',val:2200,msg:'Rating 2200!',sub:'LEGENDARY STATUS '},
  {key:'wins',val:5,msg:'5 Wins!',sub:'On Fire badge earned '},
  {key:'wins',val:10,msg:'10 Wins!',sub:'Double digits!'},
  {key:'wins',val:25,msg:'25 Wins!',sub:'Quarter century of victories'},
  {key:'wins',val:50,msg:'50 Wins!',sub:'Champion badge earned '},
  {key:'wins',val:100,msg:'100 Wins!',sub:'CENTURY! '},
];

const CORE_FEATURE_TOGGLES=[
  {id:'ft_hot_streak_fx',name:'Hot Streak FX',desc:'Stronger visual highlight for streaks.',group:'core'},
  {id:'ft_win_sound',name:'Win Sound Cue',desc:'Optional future sound hook.',group:'core'},
  {id:'ft_confetti',name:'Confetti Win',desc:'Celebrate major wins.',group:'core'},
  {id:'ft_rival_alert',name:'Rival Alert',desc:'Extra flag for rivalry matchups.',group:'core'},
  {id:'ft_upset_alert',name:'Upset Alert',desc:'Highlight giant-killer wins.',group:'core'},
  {id:'ft_auto_open_history',name:'Auto Open History',desc:'Jump to history after confirm.',group:'core'},
  {id:'ft_live_h2h',name:'Live H2H',desc:'Always show head-to-head panel.',group:'core'},
  {id:'ft_daily_goal_toast',name:'Goal Toast',desc:'Toast when daily goal reached.',group:'core'},
  {id:'ft_momentum_label',name:'Momentum Label',desc:'Extra momentum label in results.',group:'core'},
  {id:'ft_match_quality',name:'Match Quality',desc:'Show quality score in preview.',group:'core'},
  {id:'ft_ach_filter_earned',name:'Earned Badge Filter',desc:'Toggle earned-only badges.',group:'core'},
  {id:'ft_emoji_hype',name:'Emoji Hype',desc:'Adds extra emoji flair in win messages.',group:'core'},
  {id:'ft_auto_clear_scores',name:'Auto Clear Scores',desc:'After confirm, clear score inputs automatically.',group:'core'},
  {id:'ft_keep_context_after_confirm',name:'Keep Context',desc:'Preserve context between matches in same session.',group:'core'},
  {id:'ft_context_memory',name:'Context Memory',desc:'Autofill context from recent head-to-head games.',group:'core'},
  {id:'ft_confirm_upset',name:'Upset Guard',desc:'Ask confirmation before huge upsets are logged.',group:'core'},
  {id:'ft_undo_without_prompt',name:'Fast Undo',desc:'Skip the confirmation dialog when undoing.',group:'core'},
  {id:'ft_auto_focus_notes',name:'Auto Focus Notes',desc:'After each confirmed game in a series, focus notes input.',group:'core'},
  {id:'ft_auto_select_top_rivals',name:'Auto Pick Rival',desc:'Auto-select most-played opponent when only one player is chosen.',group:'core'},
  {id:'ft_history_oldest_first',name:'History Oldest First',desc:'Show oldest matches first instead of newest first.',group:'core'},
  {id:'ft_focus_mode',name:'Focus Mode',desc:'Reduce non-essential clutter.',group:'core'},
  {id:'ft_compact_history',name:'Compact History',desc:'Tighter history rows.',group:'core'},
  {id:'ft_colorful_badges',name:'Colorful Badges',desc:'Enhanced badge card glow.',group:'core'},
  {id:'ft_bold_titles',name:'Bold Titles',desc:'Heavier title badge styling.',group:'core'},
  {id:'ft_cinematic_mode',name:'Cinematic Mode',desc:'Larger spacing and animations.',group:'core'},
  {id:'ft_feature_party',name:'Feature Party',desc:'Big visual pop so enabled features are obvious.',group:'core'}
];
const FEATURE_TOGGLES=[...CORE_FEATURE_TOGGLES];
const VISUAL_FEATURE_IDS=new Set(['ft_focus_mode','ft_compact_history','ft_colorful_badges','ft_bold_titles','ft_cinematic_mode','ft_feature_party','ft_hot_streak_fx']);
const LOCAL_STATE_KEY='rankmaster_pro_state';
const FEATURE_PREFS_KEY='rankmaster_pro_feature_prefs';
const CLOUD_USER_KEY='rankmaster_cloud_user';
const CLOUD_TABLE_URL='https://wkoohtlkjmkeeirvlcah.supabase.co/rankmaster_user_state';
const SUPABASE_PUBLISHABLE_KEY='sb_publishable_uT5AH2KLsTu5-e_SBE9BxA_DpS9FHeA';
const CLOUD_SYNC_DEBOUNCE_MS=350;

function getSupabaseProjectUrl(tableUrl){
  try{
    const u=new URL(tableUrl);
    return `${u.protocol}//${u.host}`;
  }catch(e){
    return 'https://wkoohtlkjmkeeirvlcah.supabase.co';
  }
}
function getSupabaseTableName(tableUrl){
  try{
    const u=new URL(tableUrl);
    const parts=u.pathname.split('/').filter(Boolean);
    if(parts[0]==='rest'&&parts[1]==='v1'&&parts[2])return parts[2];
    return parts[parts.length-1]||'rankmaster_user_state';
  }catch(e){
    return 'rankmaster_user_state';
  }
}
const SUPABASE_URL=getSupabaseProjectUrl(CLOUD_TABLE_URL);
const CLOUD_STATE_TABLE=getSupabaseTableName(CLOUD_TABLE_URL);

/*
Core data model for beginners:
- players: list of tracked players and ratings
- history: every saved match (manual adjust/tournament/series included)
- nextId: incremental id source for new records
- tournament: active tournament runtime object (or null)
- settings fields: matchPoints/theme/density/etc.
*/


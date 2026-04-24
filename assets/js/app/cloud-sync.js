/*
LEARNING FILE CARD
File: assets/js/app\cloud-sync.js
Purpose:
- General app script.
Tips for new developers:
- This file runs in global browser scope (no import/export modules yet).
- Keep function names descriptive and side effects intentional.
- After state changes, most flows should end in renderAll().
*/
// ===================== INIT =====================
function canUseCloudSync(){
  return !!(window.supabase&&typeof window.supabase.createClient==='function'&&SUPABASE_URL&&SUPABASE_PUBLISHABLE_KEY);
}
function countSavedItems(snapshot){
  if(!snapshot||typeof snapshot!=='object')return 0;
  const pCount=Array.isArray(snapshot.players)?snapshot.players.length:0;
  const hCount=Array.isArray(snapshot.history)?snapshot.history.length:0;
  return pCount+hCount;
}
function setCloudStatusText(msg,color='var(--muted)'){
  const el=document.getElementById('cloud-status-text');
  if(!el)return;
  el.textContent=msg;
  el.style.color=color;
}
function updateCloudAuthUI(){
  const chip=document.getElementById('cloud-user-chip');
  const authView=document.getElementById('cloud-auth-view');
  const sessionView=document.getElementById('cloud-session-view');
  const mail=document.getElementById('cloud-user-email');
  const syncInfo=document.getElementById('cloud-last-sync');
  const loginBtn=document.getElementById('cloud-mode-login');
  const signupBtn=document.getElementById('cloud-mode-signup');

  if(loginBtn)loginBtn.style.borderColor=cloudAuthMode==='login'?'var(--accent)':'var(--border)';
  if(signupBtn)signupBtn.style.borderColor=cloudAuthMode==='signup'?'var(--accent)':'var(--border)';

  if(!canUseCloudSync()){
    if(chip)chip.textContent='Cloud: unavailable';
    if(authView)authView.style.display='none';
    if(sessionView)sessionView.style.display='none';
    setCloudStatusText('Cloud client could not initialize.','var(--red)');
    return;
  }
  if(cloudUser){
    if(chip)chip.textContent=`Cloud: ${cloudUser.email||'Signed in'}`;
    if(authView)authView.style.display='none';
    if(sessionView)sessionView.style.display='block';
    if(mail)mail.textContent=cloudUser.email||'Signed in user';
    if(syncInfo)syncInfo.textContent=cloudLastSyncAt?`Last cloud sync: ${formatTime(new Date(cloudLastSyncAt))}`:'Cloud sync is ready.';
    setCloudStatusText('Account connected. Your changes auto-sync to cloud.');
  }else{
    if(chip)chip.textContent='Cloud: Local only';
    if(authView)authView.style.display='block';
    if(sessionView)sessionView.style.display='none';
    if(syncInfo)syncInfo.textContent='';
    setCloudStatusText('Sign in or create an account to sync data across devices.');
  }
}
function switchCloudAuthMode(mode){
  cloudAuthMode=mode==='signup'?'signup':'login';
  updateCloudAuthUI();
}
function openCloudModal(){
  updateCloudAuthUI();
  document.getElementById('cloud-modal').classList.add('show');
}
function getCloudAuthInput(){
  const email=(document.getElementById('cloud-email')?.value||'').trim();
  const password=(document.getElementById('cloud-password')?.value||'').trim();
  return{email,password};
}
async function submitCloudAuth(){
  if(!supabaseClient){showToast('Cloud sync is not available yet.','error');return;}
  const {email,password}=getCloudAuthInput();
  if(!email||!password){showToast('Enter email and password first.','error');return;}
  try{
    if(cloudAuthMode==='signup'){
      const {error}=await supabaseClient.auth.signUp({
        email,
        password,
        options:{emailRedirectTo:window.location.href}
      });
      if(error)throw error;
      showToast('Account created. Check email if confirmation is required.','success');
    }else{
      const {error}=await supabaseClient.auth.signInWithPassword({email,password});
      if(error)throw error;
      showToast('Signed in.','success');
    }
  }catch(err){
    showToast(err?.message||'Cloud auth failed.','error');
  }
}
async function sendCloudPasswordReset(){
  if(!supabaseClient){showToast('Cloud sync is not available yet.','error');return;}
  const email=(document.getElementById('cloud-email')?.value||'').trim();
  if(!email){showToast('Enter your email to reset password.','error');return;}
  try{
    const {error}=await supabaseClient.auth.resetPasswordForEmail(email,{redirectTo:window.location.href});
    if(error)throw error;
    showToast('Password reset email sent.','success');
  }catch(err){
    showToast(err?.message||'Password reset failed.','error');
  }
}
async function signOutCloud(){
  if(!supabaseClient)return;
  try{
    stopCloudRealtimeSync();
    const {error}=await supabaseClient.auth.signOut();
    if(error)throw error;
    showToast('Signed out of cloud account.','');
  }catch(err){
    showToast(err?.message||'Could not sign out.','error');
  }
}
function scheduleCloudSave(){
  if(!supabaseClient||!cloudUser||isApplyingCloudState)return;
  clearTimeout(cloudSaveTimer);
  cloudSaveTimer=setTimeout(()=>{syncNowToCloud(true);},CLOUD_SYNC_DEBOUNCE_MS);
}
function toMs(ts){
  const n=Date.parse(ts||'');
  return Number.isFinite(n)?n:0;
}
function safeJson(v){
  try{return JSON.stringify(v);}catch(e){return'';}
}
function isIncomingCloudUpdateNewer(incomingTs){
  const incomingMs=toMs(incomingTs);
  const currentMs=toMs(cloudLastSyncAt);
  if(!incomingMs)return true;
  if(!currentMs)return true;
  return incomingMs>currentMs;
}
function stopCloudRealtimeSync(){
  if(!supabaseClient||!cloudRealtimeChannel)return;
  supabaseClient.removeChannel(cloudRealtimeChannel);
  cloudRealtimeChannel=null;
}
function startCloudRealtimeSync(){
  if(!supabaseClient||!cloudUser)return;
  stopCloudRealtimeSync();
  cloudRealtimeChannel=supabaseClient
    .channel(`rankmaster-live-${cloudUser.id}`)
    .on('postgres_changes',{
      event:'*',
      schema:'public',
      table:CLOUD_STATE_TABLE,
      filter:`user_id=eq.${cloudUser.id}`
    },payload=>{
      const row=payload?.new||payload?.record||null;
      if(!row||!row.app_state)return;
      const incomingTs=row.updated_at||'';

      // Ignore stale events.
      if(!isIncomingCloudUpdateNewer(incomingTs))return;

      // Ignore short-window local echo events after our own upsert.
      if(Date.now()<cloudSuppressEchoUntilMs){
        const samePayload=safeJson(row.app_state)===safeJson(state);
        if(samePayload){
          cloudLastSyncAt=incomingTs||cloudLastSyncAt;
          updateCloudAuthUI();
          return;
        }
      }

      const localBefore=safeJson(state);
      applyCloudSnapshot(row.app_state);
      cloudLastSyncAt=incomingTs||new Date().toISOString();
      updateCloudAuthUI();

      // Show a small status only when remote content actually changed local state.
      if(localBefore!==safeJson(state) && document.visibilityState==='visible'){
        showToast('Live cloud update received.','success');
      }
    })
    .subscribe(status=>{
      if(status==='SUBSCRIBED'){
        setCloudStatusText('Live sync connected. Changes sync instantly across devices.');
      }else if(status==='CHANNEL_ERROR'||status==='TIMED_OUT'){
        setCloudStatusText('Live sync disconnected. Retrying in background.','var(--red)');
      }
    });
}
// Best-effort final sync used before refresh/close.
function flushCloudSaveNow(){
  if(!supabaseClient||!cloudUser||isApplyingCloudState)return;
  if(cloudSaveTimer){
    clearTimeout(cloudSaveTimer);
    cloudSaveTimer=null;
  }
  syncNowToCloud(true);
}
async function fetchCloudSnapshot(){
  if(!supabaseClient||!cloudUser)return null;
  const {data,error}=await supabaseClient
    .from(CLOUD_STATE_TABLE)
    .select('app_state,updated_at')
    .eq('user_id',cloudUser.id)
    .maybeSingle();
  if(error)throw error;
  return data||null;
}
function applyCloudSnapshot(cloudRaw){
  if(!cloudRaw||typeof cloudRaw!=='object')return false;
  const migrated=normalizeImportedState(cloudRaw);
  isApplyingCloudState=true;
  try{
    state=migrated;
    ensureStateDefaults();
    setMatchPointsInput();
    renderAll();
  }finally{
    isApplyingCloudState=false;
  }
  return true;
}
// Refresh behavior when authenticated:
// always prefer cloud state if it exists; if cloud row is empty, upload local state once.
async function maybeLoadCloudOnSignIn(){
  if(!supabaseClient||!cloudUser)return;
  let snap=null;
  try{
    snap=await fetchCloudSnapshot();
  }catch(err){
    setCloudStatusText(err?.message||'Could not fetch cloud data.','var(--red)');
    return;
  }
  if(!snap?.app_state){
    if(countSavedItems(state)>0){
      await syncNowToCloud(true);
      setCloudStatusText('No cloud save existed, so your local data was uploaded.');
      updateCloudAuthUI();
    }
    return;
  }
  applyCloudSnapshot(snap.app_state);
  cloudLastSyncAt=snap.updated_at||'';
  setCloudStatusText('Loaded latest cloud data for this account.');
  updateCloudAuthUI();
}
async function downloadCloudState(){
  if(!supabaseClient||!cloudUser){showToast('Sign in first to download cloud data.','error');return;}
  try{
    const snap=await fetchCloudSnapshot();
    if(!snap?.app_state){showToast('No cloud save found yet for this account.','');return;}
    if(countSavedItems(state)>0&&!confirm('Replace current local data with cloud data?'))return;
    applyCloudSnapshot(snap.app_state);
    cloudLastSyncAt=snap.updated_at||'';
    updateCloudAuthUI();
    showToast('Cloud data downloaded.','success');
  }catch(err){
    showToast(err?.message||'Cloud download failed.','error');
  }
}
async function syncNowToCloud(isAuto=false){
  if(!supabaseClient||!cloudUser)return;
  if(cloudSyncInFlight)return;
  cloudSyncInFlight=true;
  try{
    const nowIso=new Date().toISOString();
    const payload=JSON.parse(JSON.stringify(state));
    cloudSuppressEchoUntilMs=Date.now()+2500;
    const {error}=await supabaseClient
      .from(CLOUD_STATE_TABLE)
      .upsert({user_id:cloudUser.id,app_state:payload,updated_at:nowIso},{onConflict:'user_id'});
    if(error)throw error;
    cloudLastSyncAt=nowIso;
    localStorage.setItem(CLOUD_USER_KEY,cloudUser.id);
    updateCloudAuthUI();
    if(!isAuto)showToast('Cloud sync complete.','success');
  }catch(err){
    if(!isAuto)showToast(err?.message||'Cloud sync failed.','error');
    setCloudStatusText(err?.message||'Cloud sync failed.','var(--red)');
  }finally{
    cloudSyncInFlight=false;
  }
}
async function initCloudSync(){
  if(!canUseCloudSync()){
    updateCloudAuthUI();
    return;
  }
  supabaseClient=window.supabase.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY,{
    auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}
  });
  try{
    const {data:{session}}=await supabaseClient.auth.getSession();
    cloudUser=session?.user||null;
    if(cloudUser){
      localStorage.setItem(CLOUD_USER_KEY,cloudUser.id);
      await maybeLoadCloudOnSignIn();
      startCloudRealtimeSync();
    }
  }catch(err){
    setCloudStatusText(err?.message||'Could not initialize cloud session.','var(--red)');
  }
  updateCloudAuthUI();
  supabaseClient.auth.onAuthStateChange(async (event,session)=>{
    cloudUser=session?.user||null;
    if(!cloudUser){
      localStorage.removeItem(CLOUD_USER_KEY);
      cloudLastSyncAt='';
      stopCloudRealtimeSync();
    }else{
      localStorage.setItem(CLOUD_USER_KEY,cloudUser.id);
      if(event==='SIGNED_IN'||event==='INITIAL_SESSION'){
        await maybeLoadCloudOnSignIn();
      }
      startCloudRealtimeSync();
    }
    updateCloudAuthUI();
  });
  document.addEventListener('visibilitychange',()=>{
    if(document.visibilityState==='hidden')flushCloudSaveNow();
  });
  window.addEventListener('pagehide',flushCloudSaveNow);
  window.addEventListener('beforeunload',flushCloudSaveNow);
}
// App startup lifecycle:
// 1) Load local cache
// 2) Normalize defaults
// 3) Render UI
// 4) Connect cloud sync/auth



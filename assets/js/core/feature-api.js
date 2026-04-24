/*
LEARNING FILE CARD
Role:
- Gives you one place to register new feature toggles without hunting through many files.

How to use:
- Call `registerFeatureToggle(...)` in startup scripts for new toggles.
- `ensureStateDefaults()` calls `seedFeatureDefaults(...)` so new flags are initialized safely.
*/

function registerFeatureToggle(def){
  if(!def||typeof def!=='object')return false;
  const id=String(def.id||'').trim();
  if(!id)return false;
  if(FEATURE_TOGGLES.some(f=>f.id===id))return false;

  const item={
    id,
    name:String(def.name||id),
    desc:String(def.desc||'Custom feature toggle.'),
    group:String(def.group||'core')
  };
  CORE_FEATURE_TOGGLES.push(item);
  FEATURE_TOGGLES.push(item);

  if(def.isVisual)VISUAL_FEATURE_IDS.add(id);
  if(def.defaultEnabled)FEATURE_DEFAULTS[id]=true;
  return true;
}

function seedFeatureDefaults(featureFlags){
  if(!featureFlags||typeof featureFlags!=='object')return;
  FEATURE_TOGGLES.forEach(f=>{
    if(featureFlags[f.id]===undefined)featureFlags[f.id]=!!FEATURE_DEFAULTS[f.id];
  });
}

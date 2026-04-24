# RankMaster Beginner Guide

This guide is for someone new to coding who wants to understand the app safely.

## 1) How The App Is Structured

The app is split by responsibility:

- `index.html`: page layout and script includes
- `assets/css/app.css`: styling
- `assets/js/core/`: constants + state defaults
- `assets/js/logic/`: game/rating/business logic
- `assets/js/app/`: initialization, storage, cloud sync, migration
- `assets/js/ui/`: rendering and interaction handlers
- `assets/js/tournaments/`: tournament systems by mode
- `public/manifest.webmanifest` + `sw.js`: PWA setup

## 2) Most Important Concept: `state`

`state` is the single source of truth.

When you change app data:

1. Update `state`
2. Call `renderAll()`
3. Let `saveState()` persist local + cloud

Key `state` fields:

- `players`
- `history`
- `nextId`
- `tournament`
- `featureFlags`

## 3) Core Flow (Click -> Save)

Most important path:

1. `recordWinner(...)`
2. `computeAndShowResult(...)`
3. `applyChanges(...)`
4. `renderAll()`
5. `saveState(...)`

## 4) Local + Cloud Persistence

- Local key: `rankmaster_pro_state`
- Feature prefs key: `rankmaster_pro_feature_prefs`
- Cloud config starts in `assets/js/core/config-constants.js`
- Cloud sync is debounced and flushed on tab hide/unload

Startup path:

- `init()` loads local state first
- then `initCloudSync()` hydrates from cloud when signed in

## 5) Safe First Edits

1. Change theme colors in `assets/css/app.css`
2. Add a title in `TITLES` (`assets/js/core/config-constants.js`)
3. Add an achievement in `BASE_ACHIEVEMENTS_DEF` (`assets/js/core/config-constants.js`)
4. Change default full-match points in `createInitialState()` (`assets/js/core/runtime-state.js`)

After each edit:

1. Refresh app
2. Create a test match
3. Confirm leaderboard + history still update

## 6) Rules To Avoid Breaking Things

1. Prefer changing `state`, then call `renderAll()`
2. Keep imported data shape consistent with `normalizeImportedState(...)`
3. If adding fields to `state`, update both `createInitialState()` and `ensureStateDefaults()`

## 7) Debug Checklist

1. Check browser console for errors
2. Verify `state` has expected values
3. Verify `renderAll()` ran after your change
4. Verify `saveState()` ran
5. For cloud issues, verify auth/session + table policies

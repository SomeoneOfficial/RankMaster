# RankMaster Beginner Guide

This guide is for someone who is brand new to coding and wants to understand this app safely.

## 1) How The App Is Structured

Everything is currently in one file: `index.html`.

- HTML: page layout and controls
- CSS: colors, spacing, card styles, responsive behavior
- JavaScript: all game logic, state, rendering, storage, and cloud sync

Inside the JavaScript, follow this order:

1. `CONSTANTS` section: configuration and reusable lists
2. `state` + `createInitialState()`: the main app data model
3. algorithm/helper sections: rating math and utility logic
4. render sections: drawing UI from `state`
5. action sections: what happens when user clicks buttons
6. persistence sections: local save + cloud sync
7. `init()`: app startup

## 2) The Most Important Concept: `state`

`state` is the single source of truth.

If you change app data correctly, it should happen in this order:

1. Update `state`
2. Call `renderAll()`
3. Let `saveState()` persist local storage + cloud sync

Key fields in `state`:

- `players`: all players and ratings
- `history`: all recorded matches
- `nextId`: id generator
- `tournament`: active tournament runtime data
- `featureFlags`: enabled/disabled features

## 3) Core Beginner Flow (Click → Save)

Most important path:

1. `recordWinner(...)`
2. `computeAndShowResult(...)`
3. `applyChanges(...)`
4. `renderAll()`
5. `saveState(...)`

This is the best path to study first.

## 4) Local + Cloud Persistence

- Local save key: `rankmaster_pro_state`
- Cloud table URL config: `CLOUD_TABLE_URL`
- Cloud sync is debounced and also flushed on tab hide/unload.

On startup:

- `init()` loads local state first
- then `initCloudSync()` authenticates and can load cloud state

## 5) Safe First Edits For Beginners

Try these edits first:

1. Change a theme color in `:root`
2. Add a new title in `TITLES`
3. Add a new achievement in `BASE_ACHIEVEMENTS_DEF`
4. Change the default full-match points in `createInitialState()`

After each edit:

1. Refresh app
2. Create a test match
3. Confirm history + leaderboard still update

## 6) Rules To Avoid Breaking Things

1. Do not mutate DOM and `state` in contradictory ways.
2. Prefer changing `state`, then call `renderAll()`.
3. Keep data shape consistent with `normalizeImportedState(...)`.
4. If adding fields to `state`, also update `createInitialState()` and `ensureStateDefaults()`.

## 7) Debug Checklist

If something looks wrong:

1. Open browser console for errors
2. Check if `state` has expected values
3. Check if `renderAll()` is called after your change
4. Check if `saveState()` ran
5. For cloud issues, verify auth/session + table policies


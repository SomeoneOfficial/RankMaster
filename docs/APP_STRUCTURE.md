# App Structure

This app is organized into domain folders so each file has one clear job.

## Root
- `index.html`: Markup + script wiring.
- `sw.js`: Service worker cache/runtime.

## JS Domains

### Core (`assets/js/core/`)
- `config-constants.js`: Global constants, achievements definitions, feature flags, cloud config helpers.
- `feature-api.js`: Helper API to register new feature toggles and seed default flag values.
- `runtime-state.js`: `createInitialState()`, runtime globals, `ensureStateDefaults()`.

### Logic (`assets/js/logic/`)
- `level-system.js`: Level/xp math.
- `title-system.js`: Rank titles, avatar helpers.
- `elo-algorithm.js`: Match rating algorithm.
- `match-prediction.js`: Win probability and live matchup preview.
- `series-engine.js`: Best-of series flow + winner confirmation.
- `streak-form.js`: Streak and recent form helpers.
- `rivalry.js`: Rival detection.
- `comeback.js`: Comeback calculations.
- `achievements.js`: Badge unlock logic and rendering.
- `milestones.js`: Milestone toasts.
- `rating-graph.js`: Canvas rating history graph.

### App Systems (`assets/js/app/`)
- `import-migrator.js`: JSON normalization + migration modal actions.
- `color-swatches.js`: Shared color picker rendering.
- `appearance-features.js`: Theme/density/feature effects and catalog UI state.
- `persistence-render.js`: Local save, feature pref save, global `renderAll()`.
- `cloud-sync.js`: Supabase auth/session/realtime sync.
- `bootstrap.js`: `init()` startup lifecycle.

### UI (`assets/js/ui/`)
- `leaderboard.js`, `players-manage.js`, `match-selects.js`, `history.js`, `players-crud.js`, `profile.js`, `spinner.js`, `manual-adjust.js`, `settings.js`, `tabs.js`.

### Tournament (`assets/js/tournaments/`)
- `core.js`: setup + common tournament orchestration.
- `single-elimination.js`
- `double-elimination.js`
- `round-robin.js`
- `round-robin-groups.js`
- `ladder.js`
- `king-of-the-hill.js`

### Utility/Boot
- `assets/js/utils-boot.js`: shared UI helpers (`showToast`, `closeModal`, `formatTime`) and boot trigger.
- `assets/js/service-worker-register.js`: service-worker registration.

## PWA Assets
- `public/manifest.webmanifest`
- `public/icons/*`

## Docs
- `docs/BEGINNER_GUIDE.md`
- `docs/FEATURE_DEVELOPMENT_GUIDE.md`
- `docs/pwa-manifest-notes.txt`

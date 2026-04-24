# Feature Development Guide

This guide shows the safest path for adding new features in RankMaster.

## 1) Feature Types

- `Core feature`: behavior or workflow changes (logic, UX flow).
- `Visual feature`: purely style/display change (classes, spacing, effects).

## 2) Fast Path: Add a Feature Toggle

1. Register a toggle in `assets/js/core/config-constants.js` by adding an item to `CORE_FEATURE_TOGGLES`.
2. If needed, add default-on behavior in `FEATURE_DEFAULTS`.
3. For visual-only toggles, add id to `VISUAL_FEATURE_IDS`.
4. Implement behavior in:
   - `assets/js/app/appearance-features.js` for class/style effects, or
   - relevant `assets/js/ui/*.js` / `assets/js/logic/*.js` modules.

## 3) Optional Dynamic Registration API

Use `registerFeatureToggle(...)` from `assets/js/core/feature-api.js` when you want to add toggles in code:

```js
registerFeatureToggle({
  id: 'ft_example_mode',
  name: 'Example Mode',
  desc: 'Demonstrates a new feature toggle.',
  group: 'core',
  isVisual: false,
  defaultEnabled: false
});
```

State defaults are auto-seeded by `seedFeatureDefaults(...)` via `ensureStateDefaults()`.

## 4) Where New Code Should Go

- Data/constants: `assets/js/core/`
- Rules/math/algorithms: `assets/js/logic/`
- App lifecycle/save/sync/import: `assets/js/app/`
- UI rendering and click handlers: `assets/js/ui/`
- Tournament-specific runtime: `assets/js/tournaments/`

## 5) Implementation Checklist

1. Add data/state shape if needed (`createInitialState()` + `ensureStateDefaults()`).
2. Add UI controls in `index.html` with descriptive ids.
3. Add logic/actions in the correct domain module.
4. Call `renderAll()` after state changes.
5. Verify local save via `saveState()`.
6. If cloud-relevant, confirm sync still works.

## 6) Beginner Safety Rules

1. Keep one source of truth: update `state`, then render.
2. Avoid duplicating the same logic in multiple modules.
3. Name ids/functions by feature intent, not by screen position.
4. Add short comments for non-obvious logic branches.

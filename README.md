# TableTennisRatings

A modular, static web app for tracking ratings, matches, achievements, and tournaments.

## Project Layout

- `index.html`: Main app shell and script wiring.
- `assets/css/app.css`: Styling.
- `assets/js/core/`: Constants and runtime state.
- `assets/js/logic/`: Rating, prediction, series, achievements, graph logic.
- `assets/js/app/`: Initialization, persistence, import/migration, cloud sync, appearance/feature systems.
- `assets/js/ui/`: Leaderboard/match/history/player/settings UI actions.
- `assets/js/tournaments/`: Tournament engine split by mode.
- `assets/js/utils-boot.js`: Shared utils + app boot call.
- `assets/js/service-worker-register.js`: Service worker registration.
- `public/manifest.webmanifest`: PWA manifest.
- `public/icons/`: PWA icons.
- `sw.js`: Service worker (kept at root for full-app scope).
- `supabase/`: SQL + CSV setup helpers for cloud sync.
- `docs/`: Beginner and architecture docs.

## Script Load Order

### Core
1. `assets/js/core/config-constants.js`
2. `assets/js/core/runtime-state.js`

### Logic
3. `assets/js/logic/level-system.js`
4. `assets/js/logic/title-system.js`
5. `assets/js/logic/elo-algorithm.js`
6. `assets/js/logic/match-prediction.js`
7. `assets/js/logic/series-engine.js`
8. `assets/js/logic/streak-form.js`
9. `assets/js/logic/rivalry.js`
10. `assets/js/logic/comeback.js`
11. `assets/js/logic/achievements.js`
12. `assets/js/logic/milestones.js`
13. `assets/js/logic/rating-graph.js`

### App
14. `assets/js/app/import-migrator.js`
15. `assets/js/app/color-swatches.js`
16. `assets/js/app/appearance-features.js`
17. `assets/js/app/persistence-render.js`
18. `assets/js/app/cloud-sync.js`
19. `assets/js/app/bootstrap.js`

### UI
20. `assets/js/ui/leaderboard.js`
21. `assets/js/ui/players-manage.js`
22. `assets/js/ui/match-selects.js`
23. `assets/js/ui/history.js`
24. `assets/js/ui/players-crud.js`
25. `assets/js/ui/profile.js`
26. `assets/js/ui/spinner.js`
27. `assets/js/ui/manual-adjust.js`
28. `assets/js/ui/settings.js`
29. `assets/js/ui/tabs.js`

### Tournament
30. `assets/js/tournaments/core.js`
31. `assets/js/tournaments/single-elimination.js`
32. `assets/js/tournaments/double-elimination.js`
33. `assets/js/tournaments/round-robin.js`
34. `assets/js/tournaments/round-robin-groups.js`
35. `assets/js/tournaments/ladder.js`
36. `assets/js/tournaments/king-of-the-hill.js`

### Boot
37. `assets/js/utils-boot.js`
38. `assets/js/service-worker-register.js`

## Notes

- `sw.js` is intentionally at root so service-worker scope covers the whole app.
- Local backup snapshots are kept under `archive/` and ignored by git.

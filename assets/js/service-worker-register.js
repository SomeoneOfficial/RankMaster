/*
LEARNING FILE CARD
File: assets/js/service-worker-register.js
Purpose:
- Registers the service worker in the browser.
Tips for new developers:
- This file runs in global browser scope (no import/export modules yet).
- Keep function names descriptive and side effects intentional.
- After state changes, most flows should end in renderAll().
*/

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js')
    .then(reg => console.log("Service Worker registered!", reg))
    .catch(err => console.error("Service Worker error:", err));
}


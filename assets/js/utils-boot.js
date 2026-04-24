/*
LEARNING FILE CARD
File: assets/js/utils-boot.js
Purpose:
- Utility helpers + boot call for app startup.
Tips for new developers:
- This file runs in global browser scope (no import/export modules yet).
- Keep function names descriptive and side effects intentional.
- After state changes, most flows should end in renderAll().
*/
// ===================== UTILS =====================
function closeModal(id){document.getElementById(id).classList.remove('show');}
function showToast(msg,type){
  const t=document.getElementById('toast');t.textContent=msg;t.className=`toast show ${type}`;
  setTimeout(()=>t.className='toast',3000);
}
function formatTime(d){return d.toLocaleDateString('en-US',{month:'short',day:'numeric'})+' '+d.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'});}

// ===================== BOOT =====================
init();



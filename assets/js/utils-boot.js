// ===================== UTILS =====================
function closeModal(id){document.getElementById(id).classList.remove('show');}
function showToast(msg,type){
  const t=document.getElementById('toast');t.textContent=msg;t.className=`toast show ${type}`;
  setTimeout(()=>t.className='toast',3000);
}
function formatTime(d){return d.toLocaleDateString('en-US',{month:'short',day:'numeric'})+' '+d.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'});}

// ===================== BOOT =====================
init();


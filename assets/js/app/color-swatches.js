function renderColorSwatches(cid,onSelect,isEdit=false){
  const w=document.getElementById(cid);if(!w)return;w.innerHTML='';
  COLORS.forEach(c=>{
    const s=document.createElement('div');
    s.className='color-swatch'+((!isEdit&&c===selectedColor)||(isEdit&&c===editSelectedColor)?' selected':'');
    s.style.background=c;
    s.onclick=()=>{w.querySelectorAll('.color-swatch').forEach(x=>x.classList.remove('selected'));s.classList.add('selected');onSelect(c);};
    w.appendChild(s);
  });
  const cw=document.createElement('div');
  const ci=document.createElement('input');ci.type='color';ci.title='Custom';ci.style.cssText='width:28px;height:28px;border-radius:50%;border:none;cursor:pointer;padding:0;background:none;';
  ci.onchange=e=>onSelect(e.target.value);
  cw.appendChild(ci);w.appendChild(cw);
}


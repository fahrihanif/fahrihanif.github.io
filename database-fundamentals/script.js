/* Navigasi slide dan timer */
(function(){
  const slides=[...document.querySelectorAll('.slide')];
  const N=slides.length, stage=document.getElementById('stage');
  let cur=0;

  function fit(){
    const cw=document.documentElement.clientWidth, ch=document.documentElement.clientHeight;
    let s=cw/1280;
    if(720*s>ch) s=ch/720;                 
    const h=Math.max(720, Math.round(ch/s));
    stage.style.height=h+'px';
    stage.style.transform='scale('+s+')';
  }
  function fromHash(){const n=parseInt(location.hash.slice(1),10);return (n>=1&&n<=N)?n-1:0;}

  function show(i){
    i=Math.max(0,Math.min(N-1,i)); cur=i;
    slides.forEach((s,k)=>s.classList.toggle('active',k===i));
    if(location.hash!=='#'+(i+1)) history.replaceState(null,'','#'+(i+1)+'');
    document.querySelector('#bar i').style.width=((i+1)/N*100)+'%';
  }

  // timer
  document.querySelectorAll('.timer').forEach(t=>{
    const total=parseInt(t.dataset.min,10)*60, d=t.querySelector('.tm-d'), b=t.querySelector('.tm-start');
    let left=total, id=null;
    const paint=()=>{const m=Math.floor(left/60),s=left%60;d.textContent=String(m).padStart(2,'0')+':'+String(s).padStart(2,'0');};
    const stop=()=>{clearInterval(id);id=null;b.textContent=left>0?'Lanjut':'Selesai';};
    t.toggle=()=>{ if(left<=0) return; if(id){stop();return;}
      b.textContent='Jeda'; id=setInterval(()=>{left--;paint();if(left<=0){stop();t.classList.add('done');d.textContent='Waktu habis';}},1000);};
    b.addEventListener('click',t.toggle);
    t.querySelector('.tm-reset').addEventListener('click',()=>{clearInterval(id);id=null;left=total;paint();t.classList.remove('done');b.textContent='Mulai';});
  });

  function fullscreen(){const el=document.documentElement; if(!document.fullscreenElement&&el.requestFullscreen) el.requestFullscreen(); else if(document.exitFullscreen) document.exitFullscreen();}
  const help=document.getElementById('help');

  document.addEventListener('keydown',e=>{
    if(e.target.closest&&e.target.closest('input,textarea')) return;
    const k=e.key;
    if(help.classList.contains('on')&&k!=='?'){ if(k==='Escape') help.classList.remove('on'); return; }
    if(['ArrowRight','PageDown',' '].includes(k)){e.preventDefault();show(cur+1);}
    else if(['ArrowLeft','PageUp'].includes(k)){e.preventDefault();show(cur-1);}
    else if(k==='Home') show(0); else if(k==='End') show(N-1);
    else if(k==='f'||k==='F') fullscreen();
    else if(k==='t'||k==='T'){const t=slides[cur].querySelector('.timer'); if(t) t.toggle();}
    else if(k==='g'||k==='G'){const v=prompt('Pergi ke slide nomor (1–'+N+'):'); const n=parseInt(v,10); if(n) show(n-1);}
    else if(k==='?') help.classList.toggle('on');
  });
  document.getElementById('bPrev').onclick=()=>show(cur-1);
  document.getElementById('bNext').onclick=()=>show(cur+1);
  document.getElementById('bHelp').onclick=()=>help.classList.add('on');
  help.addEventListener('click',e=>{if(e.target===help) help.classList.remove('on');});

  // swipe 
  let sx=null; addEventListener('touchstart',e=>{sx=e.touches[0].clientX;},{passive:true});
  addEventListener('touchend',e=>{if(sx===null)return;const dx=e.changedTouches[0].clientX-sx;if(Math.abs(dx)>50) show(cur+(dx<0?1:-1));sx=null;});

  addEventListener('resize',fit); addEventListener('hashchange',()=>show(fromHash()));
  fit(); show(fromHash());
})();
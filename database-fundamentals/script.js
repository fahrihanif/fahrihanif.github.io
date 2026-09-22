/* Navigasi, catatan pembicara, presenter view, dan timer */
(function(){
  const slides=[...document.querySelectorAll('.slide')];
  const N=slides.length, stage=document.getElementById('stage');
  const isPresenter=new URLSearchParams(location.search).has('presenter');
  let cur=0, chan=null;
  try{chan=new BroadcastChannel('deck-'+location.pathname);}catch(e){}

  function fit(){const s=Math.min(innerWidth/1280,innerHeight/720);stage.style.transform='scale('+s+')';}
  function fromHash(){const n=parseInt(location.hash.slice(1),10);return (n>=1&&n<=N)?n-1:0;}
  function notesOf(i){return slides[i].querySelector('.notes').textContent.trim();}

  function show(i,silent){
    i=Math.max(0,Math.min(N-1,i)); cur=i;
    slides.forEach((s,k)=>s.classList.toggle('active',k===i));
    if(location.hash!=='#'+(i+1)) history.replaceState(null,'','#'+(i+1)+'');
    document.querySelector('#bar i').style.width=((i+1)/N*100)+'%';
    document.getElementById('notesText').textContent=notesOf(i)||'Tidak ada catatan.';
    renderPresenter();
    if(!silent&&chan) chan.postMessage({type:'go',i});
  }
  function renderPresenter(){
    if(!isPresenter) return;
    document.getElementById('pvNow').textContent=(cur+1)+' / '+N+'  '+slides[cur].dataset.title;
    document.getElementById('pvNext').textContent=cur<N-1?(cur+2)+'. '+slides[cur+1].dataset.title:'Akhir presentasi';
    document.getElementById('pvNotes').textContent=notesOf(cur)||'Tidak ada catatan.';
  }
  if(chan) chan.onmessage=e=>{if(e.data&&e.data.type==='go') show(e.data.i,true);};

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

  function toggleNotes(){document.getElementById('notesPanel').classList.toggle('on');}
  function openPresenter(){window.open(location.pathname+'?presenter#'+(cur+1),'presenter-'+location.pathname.split('/').pop(),'width=1100,height=720');}
  function fullscreen(){const el=document.documentElement; if(!document.fullscreenElement&&el.requestFullscreen) el.requestFullscreen(); else if(document.exitFullscreen) document.exitFullscreen();}
  const help=document.getElementById('help');

  document.addEventListener('keydown',e=>{
    if(e.target.closest&&e.target.closest('input,textarea')) return;
    const k=e.key;
    if(help.classList.contains('on')&&k!=='?'){ if(k==='Escape') help.classList.remove('on'); return; }
    if(['ArrowRight','PageDown',' '].includes(k)){e.preventDefault();show(cur+1);}
    else if(['ArrowLeft','PageUp'].includes(k)){e.preventDefault();show(cur-1);}
    else if(k==='Home') show(0); else if(k==='End') show(N-1);
    else if(k==='n'||k==='N') toggleNotes();
    else if((k==='p'||k==='P')&&!isPresenter) openPresenter();
    else if((k==='f'||k==='F')&&!isPresenter) fullscreen();
    else if(k==='t'||k==='T'){const t=slides[cur].querySelector('.timer'); if(t) t.toggle();}
    else if(k==='g'||k==='G'){const v=prompt('Pergi ke slide nomor (1–'+N+'):'); const n=parseInt(v,10); if(n) show(n-1);}
    else if(k==='?') help.classList.toggle('on');
  });
  document.getElementById('bPrev').onclick=()=>show(cur-1);
  document.getElementById('bNext').onclick=()=>show(cur+1);
  document.getElementById('bNotes').onclick=toggleNotes;
  document.getElementById('bPres').onclick=openPresenter;
  document.getElementById('bHelp').onclick=()=>help.classList.add('on');
  help.addEventListener('click',e=>{if(e.target===help) help.classList.remove('on');});
  document.getElementById('pPrev').onclick=()=>show(cur-1);
  document.getElementById('pNext').onclick=()=>show(cur+1);

  // swipe untuk layar sentuh
  let sx=null; addEventListener('touchstart',e=>{sx=e.touches[0].clientX;},{passive:true});
  addEventListener('touchend',e=>{if(sx===null)return;const dx=e.changedTouches[0].clientX-sx;if(Math.abs(dx)>50) show(cur+(dx<0?1:-1));sx=null;});

  if(isPresenter){
    document.body.classList.add('presenter');
    const t0=Date.now(); setInterval(()=>{const s=Math.floor((Date.now()-t0)/1000);
      document.getElementById('pvClock').textContent=[s/3600,(s%3600)/60,s%60].map(x=>String(Math.floor(x)).padStart(2,'0')).join(':');},1000);
  }
  addEventListener('resize',fit); addEventListener('hashchange',()=>show(fromHash()));
  fit(); show(fromHash(),true);
})();
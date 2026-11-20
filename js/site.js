(function(){
  document.documentElement.classList.add('js');
  var body=document.body;
  // Header shadow on scroll
  var hdr=document.querySelector('.hdr');
  function onScroll(){ if(hdr) hdr.classList.toggle('scrolled', window.scrollY>8); }
  window.addEventListener('scroll', onScroll, {passive:true}); onScroll();
  // Mobile nav
  var burger=document.querySelector('.burger'), mnav=document.getElementById('mnav');
  function setNav(open){
    body.classList.toggle('nav-open', open);
    if(burger){burger.setAttribute('aria-expanded', open?'true':'false'); burger.setAttribute('aria-label', open?'Close menu':'Open menu');}
    if(mnav){ if(hdr) mnav.style.top=Math.max(0,hdr.getBoundingClientRect().bottom)+'px'; mnav.hidden=!open; if(open){var f=mnav.querySelector('a'); f&&f.focus();} }
  }
  if(burger){ burger.addEventListener('click', function(){ setNav(!body.classList.contains('nav-open')); }); }
  document.addEventListener('keydown', function(e){ if(e.key==='Escape' && body.classList.contains('nav-open')){ setNav(false); burger&&burger.focus(); } });
  window.addEventListener('resize', function(){ if(window.innerWidth>1180 && body.classList.contains('nav-open')) setNav(false); });

  // Open-now indicator (America/New_York). Mon–Fri 8–20; weekends by appointment.
  try{
    var parts=new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',weekday:'short',hour:'numeric',hour12:false}).formatToParts(new Date());
    var wd='',hr=0; parts.forEach(function(p){ if(p.type==='weekday') wd=p.value; if(p.type==='hour') hr=parseInt(p.value,10)%24; });
    var weekday=['Mon','Tue','Wed','Thu','Fri'].indexOf(wd)>-1, open=weekday && hr>=8 && hr<20;
    document.querySelectorAll('[data-open-now]').forEach(function(el){
      el.classList.toggle('closed', !open);
      var t=el.querySelector('span');
      if(t) t.textContent = open ? 'Open now · until 8 PM' : (weekday ? 'Closed now · opens 8 AM' : 'Weekend · by appointment');
    });
  }catch(e){}

  // Reveal on scroll
  var els=document.querySelectorAll('.reveal');
  if('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    var io=new IntersectionObserver(function(entries){ entries.forEach(function(en){ if(en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target);} }); },{rootMargin:'0px 0px -8% 0px'});
    els.forEach(function(el){ io.observe(el); });
  } else { els.forEach(function(el){ el.classList.add('in'); }); }

  // Toast for placeholder links
  var toast=document.createElement('div'); toast.className='toast'; toast.setAttribute('role','status'); toast.setAttribute('aria-live','polite'); body.appendChild(toast);
  var tt; function showToast(msg){ toast.textContent=msg; toast.classList.add('show'); clearTimeout(tt); tt=setTimeout(function(){toast.classList.remove('show');},4200); }
  document.addEventListener('click', function(e){
    var a=e.target.closest('[data-placeholder]');
    if(a){ e.preventDefault(); showToast(a.getAttribute('data-placeholder')); }
  });

  // Appointment request form (demo: validates, no data leaves the browser)
  var form=document.getElementById('appt-form');
  if(form){
    var formLoadedAt=Date.now();
    var MIN_MS=4000;
    var EMAIL_RE=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    var URL_RE=/https?:\/\/|\bwww\.|[a-z0-9-]+\.(com|net|org|io|co|info|biz|us|edu|gov|xyz|app|me)\b/i;
    var gen=form.querySelector('#form-generic-error');
    function showGenericError(){
      if(!gen) return;
      gen.hidden=false;
      try{ gen.focus(); }catch(err){}
      gen.scrollIntoView({block:'nearest',behavior:'smooth'});
    }
    function hideGenericError(){ if(gen) gen.hidden=true; }
    function isPhone(val){
      var d=String(val||'').replace(/\D/g,'');
      return d.length===10 || (d.length===11 && d.charAt(0)==='1');
    }
    function tooLong(el){
      var max=el && el.getAttribute('maxlength');
      return !!(max && el.value && el.value.length>parseInt(max,10));
    }
    form.addEventListener('submit', function(e){
      e.preventDefault();
      hideGenericError();
      var hp=form.querySelector('[name="website"]');
      var tooFast=(Date.now()-formLoadedAt)<MIN_MS;
      var note=form.querySelector('#note');
      var hasLink=!!(note && note.value && URL_RE.test(note.value));
      // Honeypot, time trap, and links in the note: reject with a generic message (do not say why).
      if((hp && hp.value) || tooFast || hasLink){ showGenericError(); return; }
      var ok=true, first=null;
      form.querySelectorAll('[data-req]').forEach(function(f){
        var input=f.querySelector('input,select,textarea'), v=true;
        if(!input){ return; }
        if(input.type==='radio'){ v=!!f.querySelector('input:checked'); }
        else if(input.type==='checkbox'){ v=input.checked; }
        else if(input.type==='tel'){ v=isPhone(input.value); }
        else if(input.type==='email' && input.value){ v=EMAIL_RE.test(input.value) && !tooLong(input); }
        else { v=input.value.trim()!=='' && !tooLong(input); }
        f.classList.toggle('invalid', !v);
        input.setAttribute('aria-invalid', v?'false':'true');
        if(!v){ ok=false; if(!first) first=input; }
      });
      var em=form.querySelector('#email');
      if(em && em.value && (!EMAIL_RE.test(em.value) || tooLong(em))){
        ok=false; em.closest('.field').classList.add('invalid'); em.setAttribute('aria-invalid','true'); if(!first) first=em;
      }
      var noteEl=form.querySelector('#note');
      if(noteEl && tooLong(noteEl)){
        ok=false; noteEl.closest('.field').classList.add('invalid'); noteEl.setAttribute('aria-invalid','true'); if(!first) first=noteEl;
      }
      if(!ok){ first.focus(); return; }
      var card=form.closest('.form-card'); card.classList.add('done');
      var s=card.querySelector('.form-success'); s.setAttribute('tabindex','-1'); s.focus();
      window.scrollTo({top:card.getBoundingClientRect().top+window.scrollY-120});
    });
    form.querySelectorAll('input,select,textarea').forEach(function(i){
      function clear(){ var f=i.closest('.field'); if(f) f.classList.remove('invalid'); hideGenericError(); }
      i.addEventListener('input', clear); i.addEventListener('change', clear);
    });
  }
})();

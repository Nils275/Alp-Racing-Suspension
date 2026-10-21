'use strict';

const $ = (s,r=document) => r.querySelector(s);
const $$ = (s,r=document) => [...r.querySelectorAll(s)];

/* Announce bar height → CSS var */
(function(){
  const b=$('.announce-bar');if(!b)return;
  const set=()=>document.documentElement.style.setProperty('--ab',`${b.offsetHeight}px`);
  set();new ResizeObserver(set).observe(b);
})();

/* Logo du header : bascule sur le texte si le fichier image est introuvable */
(function(){
  $$('.hdr-logo').forEach(box=>{
    const img=box.querySelector('img');if(!img)return;
    const miss=()=>box.classList.add('is-missing');
    if(img.complete&&img.naturalWidth===0)miss();
    img.addEventListener('error',miss);
  });
})();

/* Header compact */
(function(){
  const h=$('#site-header');if(!h)return;
  let t=false;
  const ab=()=>parseInt(getComputedStyle(document.documentElement).getPropertyValue('--ab'))||32;
  const u=()=>{h.classList.toggle('is-compact',window.scrollY>ab()+10);t=false};
  window.addEventListener('scroll',()=>{if(!t){requestAnimationFrame(u);t=true}},{passive:true});
  u();
})();

/* Burger */
(function(){
  const btn=$('#burger-btn'),menu=$('#mobile-menu'),closeB=$('#mob-close');
  const links=$$('#mobile-menu a');
  if(!btn||!menu)return;
  const ov=Object.assign(document.createElement('div'),{className:'mobile-menu-overlay'});
  ov.setAttribute('aria-hidden','true');document.body.appendChild(ov);
  let open=false;
  const o=()=>{open=true;btn.classList.add('is-open');btn.setAttribute('aria-expanded','true');btn.setAttribute('aria-label','Fermer');menu.classList.add('is-open');menu.removeAttribute('aria-hidden');ov.classList.add('is-visible');document.body.style.overflow='hidden';setTimeout(()=>menu.querySelector('.mob-link')?.focus(),80)};
  const c=(refocus)=>{open=false;btn.classList.remove('is-open');btn.setAttribute('aria-expanded','false');btn.setAttribute('aria-label','Menu');menu.classList.remove('is-open');menu.setAttribute('aria-hidden','true');ov.classList.remove('is-visible');document.body.style.overflow='';if(refocus)btn.focus()};
  btn.addEventListener('click',()=>open?c(true):o());
  closeB?.addEventListener('click',()=>c(true));ov.addEventListener('click',()=>c(false));
  links.forEach(l=>l.addEventListener('click',()=>c(false)));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&open)c(true)});
  window.matchMedia('(min-width:961px)').addEventListener('change',e=>{if(e.matches&&open)c(false)});
})();

/* FAQ */
(function(){
  $$('.faq-item').forEach(item=>{
    const btn=item.querySelector('.faq-q'),ans=item.querySelector('.faq-a');
    if(!btn||!ans)return;
    btn.addEventListener('click',()=>{
      const isOpen=btn.getAttribute('aria-expanded')==='true';
      $$('.faq-item').forEach(o=>{
        o.querySelector('.faq-q')?.setAttribute('aria-expanded','false');
        const a=o.querySelector('.faq-a');if(a)a.setAttribute('hidden','');
      });
      btn.setAttribute('aria-expanded',String(!isOpen));
      if(!isOpen)ans.removeAttribute('hidden');
    });
  });
})();

/* Compteurs */
(function(){
  const nums=$$('.nb-num[data-target]');
  if(!nums.length||!('IntersectionObserver'in window))return;
  const ease=t=>t<.5?2*t*t:-1+(4-2*t)*t;
  const animate=(el,target,dur=1600)=>{
    const s=performance.now();
    const tick=now=>{const p=Math.min((now-s)/dur,1);el.textContent=Math.round(ease(p)*target);if(p<1)requestAnimationFrame(tick);else el.textContent=target};
    requestAnimationFrame(tick);
  };
  const obs=new IntersectionObserver(entries=>{
    entries.forEach(({isIntersecting,target})=>{if(!isIntersecting)return;animate(target,parseInt(target.dataset.target,10));obs.unobserve(target)});
  },{threshold:.5});
  nums.forEach(n=>obs.observe(n));
})();

/* Animations fade */
(function(){
  const sel=['.sv-row','.dp','.proc-step','.ab-tl-item','.ab-card','.testi-big','.testi-sm','.testi-stat','.ms-pillar','.gi','.rev-grid>*','.ct-grid>*','.ab-intro>*','.ms-grid>*','.part-head>*'].join(',');
  const targets=$$(sel);
  if(!targets.length||!('IntersectionObserver'in window))return;
  targets.forEach(el=>el.classList.add('js-fade'));
  const obs=new IntersectionObserver(entries=>{
    entries.forEach(({isIntersecting,target})=>{if(!isIntersecting)return;target.classList.add('in');obs.unobserve(target)});
  },{threshold:.08,rootMargin:'0px 0px -30px 0px'});
  targets.forEach((el,i)=>{el.style.animationDelay=`${(i%4)*70}ms`;obs.observe(el)});
})();

/* Nav active */
(function(){
  const sections=$$('section[id]'),links=$$('.nav-link');
  if(!sections.length)return;
  const obs=new IntersectionObserver(entries=>{
    entries.forEach(({isIntersecting,target})=>{
      if(!isIntersecting)return;
      links.forEach(l=>{
        const on=l.getAttribute('href')===`#${target.id}`;
        l.classList.toggle('active',on);
        if(on)l.setAttribute('aria-current','true');else l.removeAttribute('aria-current');
      });
    });
  },{rootMargin:'-45% 0px -50% 0px',threshold:0});
  sections.forEach(s=>obs.observe(s));
})();

/* Smooth scroll */
(function(){
  $$('a[href^="#"]').forEach(a=>{
    a.addEventListener('click',e=>{
      const id=a.getAttribute('href').slice(1),el=document.getElementById(id);
      if(!el)return;e.preventDefault();el.scrollIntoView({behavior:'smooth',block:'start'});
    });
  });
})();

/* Validation */
const ER=/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const TR=/^[+\d\s\-(). ]{7,20}$/;
function val(rules,id,v){
  const r=rules[id];if(!r)return'';
  if(r.req&&!v.trim())return`${r.label} est obligatoire.`;
  if(r.min&&v.trim().length<r.min)return`${r.label} est trop court.`;
  if(r.email&&!ER.test(v))return'Email invalide.';
  if(r.tel&&!TR.test(v))return'Téléphone invalide.';
  return'';
}
function setErr(form,id,msg,suf='-err'){
  const inp=form.querySelector(`#${id}`),err=form.querySelector(`#${id}${suf}`);
  if(inp){inp.classList.toggle('is-invalid',!!msg);inp.setAttribute('aria-invalid',msg?'true':'false')}
  if(err)err.textContent=msg;
}
function bindForm({formId,rules,successId,suf='-err'}){
  const form=$(`#${formId}`);if(!form)return;
  Object.keys(rules).forEach(id=>{
    const inp=form.querySelector(`#${id}`);if(!inp)return;
    inp.addEventListener('blur',()=>setErr(form,id,val(rules,id,inp.value),suf));
    inp.addEventListener('input',()=>{if(inp.classList.contains('is-invalid'))setErr(form,id,val(rules,id,inp.value),suf)});
  });
  form.addEventListener('submit',async e=>{
    e.preventDefault();let ok=true;
    Object.keys(rules).forEach(id=>{
      const inp=form.querySelector(`#${id}`),msg=val(rules,id,inp?.value||'');
      setErr(form,id,msg,suf);if(msg)ok=false;
    });
    if(!ok){form.querySelector('.is-invalid')?.focus();return}
    const btn=form.querySelector('[type="submit"]'),orig=btn.textContent;
    btn.disabled=true;btn.textContent='Envoi…';
    const res=await submitForm(formId,form);
    let errEl=form.querySelector('.ff-send-err');
    if(!errEl){errEl=document.createElement('div');errEl.className='ff-err ff-send-err';errEl.setAttribute('role','alert');form.appendChild(errEl)}
    if(res.ok){
      errEl.textContent='';
      const okEl=$(`#${successId}`);
      if(okEl){okEl.removeAttribute('hidden');okEl.scrollIntoView({behavior:'smooth',block:'nearest'})}
      form.reset();
    }else{errEl.textContent=`L'envoi a échoué. ${MAIL.fallback}`}
    btn.disabled=false;btn.textContent=orig;
  });
}

bindForm({formId:'service-form',successId:'sf-ok',suf:'-err',rules:{
  'sf-nom':{req:true,min:2,label:'Le nom'},
  'sf-email':{req:true,email:true,label:"L'email"},
  'sf-tel':{req:true,tel:true,label:'Le téléphone'},
  'sf-vehicule':{req:true,min:2,label:'Le véhicule'},
}});

bindForm({formId:'contact-form',successId:'cf-ok',suf:'-err',rules:{
  'cf-nom':{req:true,min:2,label:'Le nom'},
  'cf-email':{req:true,email:true,label:"L'email"},
  'cf-sujet':{req:true,label:'Le sujet'},
  'cf-msg':{req:true,min:10,label:'Le message'},
}});

/* Newsletter */
(function(){
  const form=$('#nl-form'),emailIn=form?.querySelector('#nl-email');
  const errEl=$('#nl-err'),consent=$('#nl-cb'),cerrEl=$('#nl-cerr'),okEl=$('#nl-ok');
  if(!form)return;
  form.addEventListener('submit',async e=>{
    e.preventDefault();let ok=true;
    if(!emailIn.value.trim()||!ER.test(emailIn.value)){if(errEl)errEl.textContent='Email invalide.';emailIn.classList.add('is-invalid');ok=false}
    else{if(errEl)errEl.textContent='';emailIn.classList.remove('is-invalid')}
    if(!consent.checked){if(cerrEl)cerrEl.textContent='Veuillez accepter.';ok=false}
    else{if(cerrEl)cerrEl.textContent=''}
    emailIn.setAttribute('aria-invalid',ok?'false':'true');
    if(!ok){(emailIn.classList.contains('is-invalid')?emailIn:consent).focus();return}
    const btn=form.querySelector('[type="submit"]');
    btn.disabled=true;btn.textContent='…';
    const res=await submitForm('nl-form',form);
    if(res.ok){if(okEl)okEl.removeAttribute('hidden');form.reset()}
    else if(cerrEl)cerrEl.textContent=`L'envoi a échoué. ${MAIL.fallback}`;
    btn.disabled=false;btn.textContent="S'inscrire";
  });
})();

/* ─── BOUTON TOP ────────────────────────────────────────── */
(function () {
  const btn = document.getElementById('top-btn');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('is-visible', window.scrollY > 400);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();


/* Année du pied de page */
(function(){const el=$('#fy');if(el)el.textContent=new Date().getFullYear()})();
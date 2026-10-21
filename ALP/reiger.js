'use strict';

const $ = (s,r=document) => r.querySelector(s);
const $$ = (s,r=document) => [...r.querySelectorAll(s)];

/* Burger */
(function(){
  const btn=$('#rg-burger'),menu=$('#rg-mob'),closeB=$('#rg-mob-close');
  if(!btn||!menu)return;
  const ov=Object.assign(document.createElement('div'),{className:'rg-mob-overlay'});
  document.body.appendChild(ov);
  let open=false;
  const o=()=>{open=true;btn.classList.add('is-open');btn.setAttribute('aria-expanded','true');btn.setAttribute('aria-label','Fermer le menu');setTimeout(()=>menu.querySelector('a')?.focus(),80);menu.classList.add('is-open');menu.removeAttribute('aria-hidden');ov.classList.add('is-visible');document.body.style.overflow='hidden'};
  const c=(refocus)=>{open=false;btn.classList.remove('is-open');btn.setAttribute('aria-expanded','false');btn.setAttribute('aria-label','Menu');menu.classList.remove('is-open');menu.setAttribute('aria-hidden','true');ov.classList.remove('is-visible');document.body.style.overflow='';if(refocus)btn.focus()};
  btn.addEventListener('click',()=>open?c(true):o());
  closeB?.addEventListener('click',()=>c(true));
  ov.addEventListener('click',()=>c(false));
  $$('#rg-mob a').forEach(l=>l.addEventListener('click',()=>c(false)));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&open)c(true)});
  window.matchMedia('(min-width:961px)').addEventListener('change',e=>{if(e.matches&&open)c(false)});
})();

/* Logos du header : bascule sur le texte si un fichier image est introuvable */
(function(){
  $$('.hdr-logo').forEach(box=>{
    const img=box.querySelector('img');if(!img)return;
    const miss=()=>box.classList.add('is-missing');
    if(img.complete&&img.naturalWidth===0)miss();
    img.addEventListener('error',miss);
  });
})();

/* Animations */
(function(){
  const targets=$$('.rg-intro-grid>*,.rg-prest,.rg-veh-card,.rg-prod,.rg-ct-grid>*');
  if(!targets.length||!('IntersectionObserver'in window))return;
  targets.forEach(el=>el.classList.add('rg-fade'));
  const obs=new IntersectionObserver(entries=>{
    entries.forEach(({isIntersecting,target})=>{
      if(!isIntersecting)return;target.classList.add('in');obs.unobserve(target);
    });
  },{threshold:.1,rootMargin:'0px 0px -30px 0px'});
  targets.forEach((el,i)=>{el.style.animationDelay=`${(i%4)*70}ms`;obs.observe(el)});
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

/* Formulaire */
const ER=/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
(function(){
  const form=$('#rg-form');if(!form)return;
  const rules={
    'rg-nom':  {req:true,min:2,label:'Le nom'},
    'rg-email':{req:true,email:true,label:"L'email"},
    'rg-objet':{req:true,label:"L'objet"},
    'rg-msg':  {req:true,min:10,label:'Le message'},
  };
  const val=(id,v)=>{const r=rules[id];if(!r)return'';if(r.req&&!v.trim())return`${r.label} est obligatoire.`;if(r.min&&v.trim().length<r.min)return`${r.label} est trop court.`;if(r.email&&!ER.test(v))return'Email invalide.';return''};
  const setErr=(id,msg)=>{const inp=form.querySelector(`#${id}`),err=form.querySelector(`#${id}-err`);if(inp){inp.classList.toggle('is-invalid',!!msg);inp.setAttribute('aria-invalid',msg?'true':'false')}if(err)err.textContent=msg};
  Object.keys(rules).forEach(id=>{const inp=form.querySelector(`#${id}`);if(!inp)return;inp.addEventListener('blur',()=>setErr(id,val(id,inp.value)));inp.addEventListener('input',()=>{if(inp.classList.contains('is-invalid'))setErr(id,val(id,inp.value))})});
  form.addEventListener('submit',async e=>{
    e.preventDefault();let ok=true;
    Object.keys(rules).forEach(id=>{const inp=form.querySelector(`#${id}`),msg=val(id,inp?.value||'');setErr(id,msg);if(msg)ok=false});
    if(!ok){form.querySelector('.is-invalid')?.focus();return}
    const btn=form.querySelector('[type="submit"]'),orig=btn.textContent;
    btn.disabled=true;btn.textContent='Envoi…';
    const res=await submitForm('rg-form',form);
    let errEl=form.querySelector('.ff-send-err');
    if(!errEl){errEl=document.createElement('div');errEl.className='ff-err ff-send-err';errEl.setAttribute('role','alert');form.appendChild(errEl)}
    if(res.ok){
      errEl.textContent='';
      const okEl=$('#rg-ok');if(okEl){okEl.removeAttribute('hidden');okEl.scrollIntoView({behavior:'smooth',block:'nearest'})}
      form.reset();
    }else{errEl.textContent=`L'envoi a échoué. ${MAIL.fallback}`}
    btn.disabled=false;btn.textContent=orig;
  });
})();

/* Footer année */
(function(){const el=$('#rg-year');if(el)el.textContent=new Date().getFullYear()})();
(function () {
  const btn = document.getElementById('top-btn');
  if (!btn) return;

  btn.removeAttribute('hidden');

  window.addEventListener('scroll', () => {
    btn.classList.toggle('is-visible', window.scrollY > 400);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();
/* ================================================
   CATALOGUE REIGER — ALP RACING
   regie.js
================================================ */

var EMAIL_DEVIS = 'info@alp-racing.fr';

/* ── PRODUITS ── */
var PRODUITS = [
  {
    id: '360',
    nom: 'Reiger 360',
    disciplines: ['Quad'],    
    resume: 'Référence compacte pour applications motocross, enduro et quad.',
    detail: 'La gamme 360 est notamment référencée dans les applications de motocross/enduro et de quad. La compatibilité dépend du véhicule et de la configuration.',
    image: 'image/360.png',
    url: 'https://www.reigersuspension.com/de-en/racing-suspension/motocross',
    pdf: 'reiger/360REIGER.pdf'
  },
  {
    id: '460',
    nom: 'Reiger 460',
    disciplines: ['Quad', 'Autocross', 'Rallye'],

    resume: 'Suspension polyvalente pour plusieurs disciplines de compétition.',
    detail: 'Reiger présente la 460 comme une suspension polyvalente utilisée en motocross, quad, side-car, autocross et rallye. Configuration à confirmer selon le véhicule.',
    image: 'https://res.cloudinary.com/dsahg7sfz/image/upload/t_1080x1080%20PDP%20Header/f_auto/q_auto/c_limit%2Cw_3840/v1749015021/460_MX_Spring_001_qsb6ff',
    url: 'https://www.reigersuspension.com/de-en/racing-damper/460',
    pdf: 'reiger/460REIGER.pdf'
  },
  {
    id: '550',
    nom: 'Reiger 550',
    disciplines: ['Rallye raid'],

    resume: 'Solution conçue pour les applications de rallye-raid exigeantes.',
    detail: 'La 550 est présentée pour le rallye-raid, avec des applications incluant SSV, voitures et camions selon la configuration. Fiabilité absolue sur le Dakar et le Baja.',
    image: 'https://res.cloudinary.com/dsahg7sfz/image/upload/t_1080x1080%20PDP%20Header/f_auto/q_auto/c_limit%2Cw_3840/v1749015073/550_Rally_Raid_Spring_001_b27ets',
    url: 'https://www.reigersuspension.com/de-en/racing-damper/550',
    pdf: 'reiger/550REIGER.pdf'
  },
  {
    id: '620R',
    nom: 'Reiger 620R',
    disciplines: ['Rallye raid'],

    resume: 'Architecture inversée, piston 62 mm, 3 voies de réglage indépendantes.',
    detail: 'La 620R figure dans la gamme rallye-raid. Architecture monotube inversée, dissipation thermique maximale. Dimensions, réglages et compatibilités à confirmer pour chaque application.',
    image: 'image/620R.png',
    url: 'https://www.reigersuspension.com/de-en/racing-damper/620R',
    pdf: 'reiger/620RREIGER.pdf'
  },
  {
    id: '680R',
    nom: 'Reiger 680R',
    disciplines: ['Rallye raid'],

    resume: 'Haut de gamme rallye-raid — piston 68 mm pour le raid extrême.',
    detail: 'Reiger référence la 680R dans sa gamme rallye-raid haute performance. Configuration exacte à valider selon le véhicule et le cahier des charges.',
    image: 'image/680R.png',
    url: 'https://www.reigersuspension.com/de-en/racing-suspension/rally-raid',
    pdf: 'reiger/680RREIGER.pdf'      /* corrigé : vérifie le nom réel du fichier */
  },
  {
    id: '5046',
    nom: 'Reiger 5046',
    disciplines: ['Rallye'],
    resume: 'Référence rallye pour applications asphalte et terre.',
    detail: 'La 5046 est référencée par Reiger dans sa gamme rallye. Le montage et la configuration varient selon le modèle de véhicule.',
    image: 'image/5046.png',
    url: 'https://www.reigersuspension.com/de-en/racing-suspension/rally',
    pdf: 'reiger/5046REIGER.pdf'      /* corrigé */
  },
  {
    id: '5746',
    nom: 'Reiger 5746',
    disciplines: ['Rallye'],
    resume: 'Référence rallye pour configurations spécifiques haute précision.',
    detail: 'La 5746 figure dans les solutions rallye de Reiger. Compatibilité et configuration à confirmer selon le véhicule.',
    image: 'image/5746.png',
    url: 'https://www.reigersuspension.com/de-en/racing-suspension/rally',
    pdf: 'reiger/5746REIGER.pdf'      /* corrigé */
  }
];

/* ================================================
   UTILITAIRES
================================================ */
/* Trouver un produit par son id */
function getProduit(id) {
  for (var i = 0; i < PRODUITS.length; i++) {
    if (PRODUITS[i].id === id) return PRODUITS[i];
  }
  return null;
}
/* Générer les étiquettes de toutes les disciplines */
function genTags(p) {
  var tags = '';
  for (var i = 0; i < p.disciplines.length; i++) {
    tags += '<span class="regie-product-tag">' + p.disciplines[i] + '</span>';
  }
  return '<div class="regie-product-tags">' + tags + '</div>';
}

function genImage(p) {
  if (p.image) {
    return '<div class="regie-product-image">' +
      '<img src="' + p.image + '" alt="' + p.nom + '" loading="lazy" ' +
      'onerror="this.parentElement.innerHTML=\'<div class=regie-image-fallback>' +
      '<span>REIGER</span><strong>' + p.id + '</strong>' +
      '<small>Racing Suspension</small></div>\'">' +
      '</div>';
  }
  return '<div class="regie-product-image">' +
    '<div class="regie-image-fallback">' +
      '<span>REIGER</span>' +
      '<strong>' + p.id + '</strong>' +
      '<small>Racing Suspension</small>' +
    '</div>' +
    '</div>';
}

/* ================================================
   AFFICHAGE DU CATALOGUE
================================================ */

function afficher() {
  var grille    = document.getElementById('productGrid');
  var compteur  = document.getElementById('productCount');
  var vide      = document.getElementById('emptyState');
  var filtreMod = document.getElementById('filterModel');
  var filtreUse = document.getElementById('filterUse');

  if (!grille) return;

  var modele = filtreMod ? filtreMod.value : '';
  var usage  = filtreUse ? filtreUse.value : '';

  var resultats = [];
  for (var i = 0; i < PRODUITS.length; i++) {
    var p = PRODUITS[i];
    var okMod = !modele || p.id === modele;
    var okUse = !usage;
    if (!okUse) {
      for (var j = 0; j < p.disciplines.length; j++) {
        if (p.disciplines[j] === usage) { okUse = true; break; }
      }
    }
    if (okMod && okUse) resultats.push(p);
  }

  if (compteur) compteur.textContent = resultats.length;
  if (vide) vide.hidden = resultats.length > 0;

  var html = '';
  for (var k = 0; k < resultats.length; k++) {
    var prod = resultats[k];
    html +=
      '<article class="regie-product-card" style="cursor:pointer" ' +
      'onclick="ouvrirModale(\'' + prod.id + '\')">' +
        genImage(prod) +
        '<div class="regie-product-content">' +
          genTags(prod) +
          '<h3>' + prod.nom + '</h3>' +
          '<p>' + prod.resume + '</p>' +
          '<div class="regie-product-actions">' +
            '<button type="button" class="regie-button-secondary">Voir la fiche</button>' +
            '<button type="button" class="regie-button" ' +
            'onclick="event.stopPropagation();allerDevis(\'' + prod.id + '\')">' +
            'Demander un devis</button>' +
          '</div>' +
        '</div>' +
      '</article>';
  }

  grille.innerHTML = html;
}

/* ================================================
   MODALE PLEIN ÉCRAN — FICHE PDF
================================================ */

function ouvrirModale(id) {
  var p       = getProduit(id);
  var modale  = document.getElementById('productModal');
  var contenu = document.getElementById('modalContent');

  if (!p)       { console.warn('Produit introuvable : ' + id); return; }
  if (!modale)  { console.warn('#productModal introuvable'); return; }
  if (!contenu) { console.warn('#modalContent introuvable'); return; }

  if (p.pdf) {
    contenu.innerHTML =
      '<div class="regie-pdf-bar">' +
        '<h2>' + p.nom + '</h2>' +
        '<div class="regie-pdf-actions">' +
          '<a class="regie-button" href="' + p.pdf + '" download="Reiger-' + p.id + '-fiche.pdf">↓ Télécharger la fiche</a>' +
          '<a class="regie-button-secondary" href="' + p.pdf + '" target="_blank" rel="noopener">Ouvrir dans un onglet ↗</a>' +
          '<button type="button" class="regie-button-secondary" onclick="allerDevis(\'' + p.id + '\')">Demander un devis</button>' +
        '</div>' +
      '</div>' +
      '<iframe class="regie-pdf-frame" src="' + p.pdf + '#navpanes=0&view=FitH" title="Fiche produit ' + p.nom + '"></iframe>';
  } else {
    contenu.innerHTML =
      '<div class="regie-pdf-bar"><h2>' + p.nom + '</h2></div>' +
      '<div class="regie-nopdf">' +
        '<p>' + p.detail + '</p>' +
        '<p>Fiche PDF bientôt disponible. Contactez-nous.</p>' +
        '<div class="regie-pdf-actions">' +
          '<a class="regie-button-secondary" href="' + p.url + '" target="_blank" rel="noopener">Fiche officielle Reiger ↗</a>' +
          '<button type="button" class="regie-button" onclick="allerDevis(\'' + p.id + '\')">Demander un devis</button>' +
        '</div>' +
      '</div>';
  }

  document.body.style.overflow = 'hidden';

  if (typeof modale.showModal === 'function') {
    if (!modale.open) modale.showModal();
  } else {
    modale.setAttribute('open', '');
    modale.style.display = 'flex';
  }
}

function fermerModale() {
  var modale  = document.getElementById('productModal');
  var contenu = document.getElementById('modalContent');
  if (!modale) return;

  if (modale.open) {
    modale.close();
  } else {
    modale.removeAttribute('open');
    modale.style.display = '';
  }
  if (contenu) contenu.innerHTML = '';   /* arrête le chargement du PDF */
  document.body.style.overflow = '';
}

/* ================================================
   FORMULAIRE DE DEVIS
================================================ */

function allerDevis(id) {
  var select = document.getElementById('quoteProduct');
  if (select) select.value = id;
  fermerModale();
  var section = document.getElementById('demande-devis');
  if (section) {
    setTimeout(function() {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }
}

/* ================================================
   ÉVÉNEMENTS
================================================ */

window.addEventListener('DOMContentLoaded', function() {

  /* Filtres */
  var fm = document.getElementById('filterModel');
  var fu = document.getElementById('filterUse');
  var rb = document.getElementById('resetFilters');

  if (fm) fm.addEventListener('change', afficher);
  if (fu) fu.addEventListener('change', afficher);
  if (rb) {
    rb.addEventListener('click', function() {
      if (fm) fm.value = '';
      if (fu) fu.value = '';
      afficher();
    });
  }

  /* Fermeture modale */
  var btnClose = document.getElementById('closeModal');
  if (btnClose) btnClose.addEventListener('click', fermerModale);

  var modale = document.getElementById('productModal');
  if (modale) {
    /* Échap natif du <dialog> : on nettoie aussi le contenu */
    modale.addEventListener('close', function() {
      var c = document.getElementById('modalContent');
      if (c) c.innerHTML = '';
      document.body.style.overflow = '';
    });
  }

  /* Formulaire devis */
  var form = document.getElementById('quoteForm');
  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();

      function val(id) {
        var el = document.getElementById(id);
        return el ? el.value.trim() : '';
      }

      var nom      = val('quoteName');
      var societe  = val('quoteCompany');
      var email    = val('quoteEmail');
      var tel      = val('quotePhone');
      var prodId   = val('quoteProduct');
      var disc     = val('quoteDiscipline');
      var vehicule = val('quoteVehicle');
      var msg      = val('quoteMessage');

      if (!nom)   { alert('Merci d\'indiquer votre nom.'); return; }
      if (!email || email.indexOf('@') === -1) { alert('Merci d\'indiquer une adresse e-mail valide.'); return; }
      if (!disc)  { alert('Merci de sélectionner une discipline.'); return; }
      if (!msg)   { alert('Merci de décrire votre projet.'); return; }

      var nomProduit = prodId || 'À définir';
      var prod = getProduit(prodId);
      if (prod) nomProduit = prod.nom;

      var sujet = 'Demande de devis ALP Racing — ' + nomProduit;

      var corps =
        'Bonjour ALP Racing Suspension,\n\n' +
        'Je souhaite obtenir un devis.\n\n' +
        'Nom          : ' + nom                 + '\n' +
        'Équipe       : ' + (societe  || '—')   + '\n' +
        'E-mail       : ' + email               + '\n' +
        'Téléphone    : ' + (tel      || '—')   + '\n' +
        'Référence    : ' + nomProduit          + '\n' +
        'Discipline   : ' + disc                + '\n' +
        'Véhicule     : ' + (vehicule || '—')   + '\n\n' +
        'Description :\n' + msg                 + '\n\n' +
        'Cordialement,\n' + nom;

      window.location.href =
        'mailto:' + EMAIL_DEVIS +
        '?subject=' + encodeURIComponent(sujet) +
        '&body='    + encodeURIComponent(corps);
    });
  }
  /* Boutons de la section « gamme par discipline » */
  var boutons = document.querySelectorAll('[data-filter]');
  for (var b = 0; b < boutons.length; b++) {
    boutons[b].addEventListener('click', function() {
      var fuse = document.getElementById('filterUse');
      var fmod = document.getElementById('filterModel');
      if (fuse) fuse.value = this.getAttribute('data-filter');
      if (fmod) fmod.value = '';
      afficher();
      var cible = document.querySelector('.regie-layout');
      if (cible) cible.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }
    /* Paramètres d'URL envoyés par le chatbot : ?produit=460  /  ?discipline=Rallye%20raid */
  var params = new URLSearchParams(window.location.search);
  var pDisc = params.get('discipline'), pProd = params.get('produit');
  if (pDisc && fu) fu.value = pDisc;
  if (pProd) {
    var qp = document.getElementById('quoteProduct');
    if (qp) qp.value = pProd;
  }
  if (pDisc) {
    var qd = document.getElementById('quoteDiscipline');
    if (qd) qd.value = pDisc;
    setTimeout(function () {
      var cible = document.querySelector('.regie-layout');
      if (cible) cible.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 300);
  }
  afficher();

});
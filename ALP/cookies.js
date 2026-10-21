/* ALP Racing Suspension — gestion du consentement cookies (recommandations CNIL)
   - Rien n'est chargé avant accord (HubSpot, Google Maps)
   - « Tout refuser » et « Tout accepter » ont le même format
   - Choix conservé 6 mois, modifiable via [data-cookie-settings]
*/
(function () {
  'use strict';

  var CONFIG = {
    hubspotId: '149530320',              // portail HubSpot (région EU1). Vide = suivi non chargé.
    hubspotFormsScript: 'https://js-eu1.hsforms.net/forms/embed/149530320.js',
    contactEmail: 'info@alp-racing.fr',
    storageKey: 'alp_cookie_consent',
    durationDays: 182,                   // ≈ 6 mois
    version: 1,                          // incrémenter pour redemander le consentement à tous
    privacyUrl: 'confidentialite.html'
  };

  var HS_COOKIES = /^(__hs|hubspotutk|hs_|messagesUtk)/;

  var state = null;          // choix enregistré {v, ts, analytics, maps}
  var hsLoaded = false;
  var hsFormsLoaded = false;
  var sessionForms = false;  // formulaire HubSpot affiché pour la session seulement
  var mapsLoaded = false;
  var sessionMaps = false;   // carte autorisée pour la session seulement (sans choix global)
  var lastFocus = null;
  var banner, modal, chkA, chkM;

  function qsa(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  /* ---------- Stockage du choix ---------- */
  function readChoice() {
    try {
      var raw = localStorage.getItem(CONFIG.storageKey);
      if (!raw) return null;
      var d = JSON.parse(raw);
      if (!d || d.v !== CONFIG.version || !d.ts) return null;
      if (Date.now() - d.ts > CONFIG.durationDays * 864e5) {
        localStorage.removeItem(CONFIG.storageKey);
        return null;
      }
      return d;
    } catch (e) { return null; }
  }

  function writeChoice(analytics, maps) {
    var d = { v: CONFIG.version, ts: Date.now(), analytics: !!analytics, maps: !!maps };
    try { localStorage.setItem(CONFIG.storageKey, JSON.stringify(d)); } catch (e) {}
    return d;
  }

  /* ---------- Suppression des cookies ---------- */
  function deleteCookies(re) {
    var parts = location.hostname.split('.');
    var domains = [''];
    for (var i = 0; i < parts.length - 1; i++) domains.push('; domain=.' + parts.slice(i).join('.'));
    document.cookie.split(';').forEach(function (c) {
      var name = c.split('=')[0].trim();
      if (!name || !re.test(name)) return;
      domains.forEach(function (d) {
        document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/' + d;
      });
    });
  }

  /* ---------- HubSpot (uniquement après accord) ---------- */
  function loadHubspot() {
    if (!CONFIG.hubspotId || document.getElementById('hs-script-loader')) return;
    var s = document.createElement('script');
    s.id = 'hs-script-loader';
    s.async = true;
    s.defer = true;
    s.src = 'https://js-eu1.hs-scripts.com/' + encodeURIComponent(CONFIG.hubspotId) + '.js';
    document.body.appendChild(s);
    hsLoaded = true;
  }

  /* ---------- Google Maps (iframe[data-consent-src]) ---------- */
  function prepareEmbeds() {
    qsa('iframe[data-consent-src]').forEach(function (f) {
      if (f._ckPh) return;
      var ph = document.createElement('div');
      ph.className = 'ck-embed';
      ph.innerHTML =
        '<p><strong>Carte Google Maps</strong></p>' +
        '<p>L\u2019affichage de la carte d\u00e9pose des cookies et transmet votre adresse IP \u00e0 Google.</p>' +
        '<button type="button" class="ck-btn">Afficher la carte</button>';
      f.parentNode.insertBefore(ph, f);
      f.style.display = 'none';
      f._ckPh = ph;
      ph.querySelector('button').addEventListener('click', function () {
        if (state) { commit(state.analytics, true); }
        else { sessionMaps = true; applyConsent(); }
      });
    });
  }

  function applyEmbeds() {
    var allowed = (state && state.maps) || sessionMaps;
    qsa('iframe[data-consent-src]').forEach(function (f) {
      if (allowed) {
        if (!f.getAttribute('src')) f.setAttribute('src', f.getAttribute('data-consent-src'));
        f.style.display = '';
        if (f._ckPh) f._ckPh.style.display = 'none';
        mapsLoaded = true;
      } else {
        f.style.display = 'none';
        if (f._ckPh) f._ckPh.style.display = '';
      }
    });
  }

  /* ---------- Formulaire HubSpot (div.hs-form-frame) ---------- */
  function prepareForms() {
    qsa('.hs-form-frame').forEach(function (f) {
      if (f._ckPh) return;
      var ph = document.createElement('div');
      ph.className = 'ck-embed ck-embed--form';
      ph.innerHTML =
        '<p><strong>' + (f.getAttribute('data-ck-label') || 'Formulaire') + '</strong></p>' +
        '<p>Ce formulaire est fourni par HubSpot : son affichage transmet votre adresse IP \u00e0 HubSpot et peut d\u00e9poser des cookies.</p>' +
        '<button type="button" class="ck-btn">Afficher le formulaire</button>' +
        '<p>Vous pouvez aussi nous \u00e9crire \u00e0 <a href="mailto:' + CONFIG.contactEmail + '">' + CONFIG.contactEmail + '</a></p>';
      f.parentNode.insertBefore(ph, f);
      f.style.display = 'none';
      f._ckPh = ph;
      ph.querySelector('button').addEventListener('click', function () {
        sessionForms = true;
        applyForms();
      });
    });
  }

  function applyForms() {
    var allowed = (state && state.analytics) || sessionForms;
    qsa('.hs-form-frame').forEach(function (f) {
      f.style.display = allowed ? '' : 'none';
      if (f._ckPh) f._ckPh.style.display = allowed ? 'none' : '';
    });
    if (allowed) loadHubspotForms();
  }

  function loadHubspotForms() {
    if (hsFormsLoaded || !CONFIG.hubspotFormsScript || !qsa('.hs-form-frame').length) return;
    var s = document.createElement('script');
    s.id = 'hs-forms-loader';
    s.async = true;
    s.defer = true;
    s.src = CONFIG.hubspotFormsScript;
    document.body.appendChild(s);
    hsFormsLoaded = true;
  }

  function applyConsent() {
    if (state && state.analytics) loadHubspot();
    applyEmbeds();
    applyForms();
  }

  /* ---------- Enregistrement d'un choix ---------- */
  function commit(analytics, maps) {
    state = writeChoice(analytics, maps);
    var withdrew = ((hsLoaded || hsFormsLoaded) && !state.analytics) || (mapsLoaded && !state.maps);
    if (withdrew) {
      deleteCookies(HS_COOKIES);
      location.reload();
      return;
    }
    hideBanner();
    closeModal(true);
    applyConsent();
  }

  /* ---------- Interface ---------- */
  function build() {
    var wrap = document.createElement('div');
    wrap.id = 'ck-root';
    wrap.innerHTML =
      '<div class="ck-banner" id="ck-banner" role="dialog" aria-labelledby="ck-title" aria-describedby="ck-desc" hidden>' +
        '<h2 id="ck-title" class="ck-title">Vos cookies, votre choix</h2>' +
        '<p id="ck-desc" class="ck-text">Nous utilisons des cookies de mesure d\u2019audience (HubSpot) et affichons une carte Google Maps uniquement avec votre accord. ' +
          'Vous pouvez tout refuser, tout accepter ou choisir. Le site reste utilisable dans tous les cas. ' +
          '<a href="' + CONFIG.privacyUrl + '">En savoir plus</a></p>' +
        '<div class="ck-actions">' +
          '<button type="button" class="ck-btn" data-ck="reject">Tout refuser</button>' +
          '<button type="button" class="ck-btn" data-ck="custom">Personnaliser</button>' +
          '<button type="button" class="ck-btn" data-ck="accept">Tout accepter</button>' +
        '</div>' +
      '</div>' +
      '<div class="ck-overlay" id="ck-modal" hidden>' +
        '<div class="ck-modal" role="dialog" aria-modal="true" aria-labelledby="ck-m-title">' +
          '<h2 id="ck-m-title" class="ck-title">Param\u00e8tres des cookies</h2>' +
          '<p class="ck-text">Choisissez les services que vous autorisez. Vous pourrez changer d\u2019avis \u00e0 tout moment via \u00ab\u00a0G\u00e9rer les cookies\u00a0\u00bb en bas de page.</p>' +
          '<div class="ck-cat">' +
            '<div class="ck-cat-head"><strong>Fonctionnement du site</strong>' +
              '<label class="ck-switch"><input type="checkbox" checked disabled aria-label="Fonctionnement du site, toujours actif"><span></span></label></div>' +
            '<p>Indispensable au site (m\u00e9morisation de votre choix, formulaires). Toujours actif, sans suivi.</p>' +
          '</div>' +
          '<div class="ck-cat">' +
            '<div class="ck-cat-head"><strong>Mesure d\u2019audience (HubSpot)</strong>' +
              '<label class="ck-switch"><input type="checkbox" id="ck-analytics" aria-label="Mesure d\u2019audience HubSpot"><span></span></label></div>' +
            '<p>Statistiques de fr\u00e9quentation pour am\u00e9liorer le site. D\u00e9pose des cookies HubSpot.</p>' +
          '</div>' +
          '<div class="ck-cat">' +
            '<div class="ck-cat-head"><strong>Contenus tiers (Google Maps)</strong>' +
              '<label class="ck-switch"><input type="checkbox" id="ck-maps" aria-label="Carte Google Maps"><span></span></label></div>' +
            '<p>Affichage de la carte de l\u2019atelier. Google re\u00e7oit votre adresse IP.</p>' +
          '</div>' +
          '<div class="ck-actions">' +
            '<button type="button" class="ck-btn" data-ck="reject">Tout refuser</button>' +
            '<button type="button" class="ck-btn" data-ck="save">Enregistrer mes choix</button>' +
            '<button type="button" class="ck-btn" data-ck="accept">Tout accepter</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    document.body.appendChild(wrap);

    banner = document.getElementById('ck-banner');
    modal = document.getElementById('ck-modal');
    chkA = document.getElementById('ck-analytics');
    chkM = document.getElementById('ck-maps');

    wrap.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('[data-ck]') : null;
      if (!b) { if (e.target === modal) closeModal(); return; }
      var a = b.getAttribute('data-ck');
      if (a === 'reject') commit(false, false);
      else if (a === 'accept') commit(true, true);
      else if (a === 'save') commit(chkA.checked, chkM.checked);
      else if (a === 'custom') openModal();
    });
  }

  function showBanner() { if (banner) banner.hidden = false; }
  function hideBanner() { if (banner) banner.hidden = true; }

  function openModal() {
    if (!modal) return;
    lastFocus = document.activeElement;
    chkA.checked = !!(state && state.analytics);
    chkM.checked = !!(state && state.maps);
    modal.hidden = false;
    document.documentElement.classList.add('ck-lock');
    var first = modal.querySelector('input:not([disabled]), button');
    if (first) first.focus();
  }

  function closeModal(silent) {
    if (!modal || modal.hidden) return;
    modal.hidden = true;
    document.documentElement.classList.remove('ck-lock');
    if (!silent && lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function onKey(e) {
    if (!modal || modal.hidden) return;
    if (e.key === 'Escape') { closeModal(); return; }
    if (e.key !== 'Tab') return;
    var f = qsa('input:not([disabled]), button', modal);
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  /* ---------- Initialisation ---------- */
  function init() {
    // Thème : violet sur la page Reiger, vert ailleurs
    if (document.getElementById('rg-header')) document.documentElement.setAttribute('data-ck-theme', 'reiger');

    state = readChoice();
    build();
    prepareEmbeds();
    prepareForms();

    document.addEventListener('click', function (e) {
      var t = e.target.closest ? e.target.closest('[data-cookie-settings]') : null;
      if (t) { e.preventDefault(); openModal(); }
    });
    document.addEventListener('keydown', onKey);

    if (state) applyConsent();
    else { applyEmbeds(); applyForms(); showBanner(); }
  }

  window.alpCookies = { open: openModal };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
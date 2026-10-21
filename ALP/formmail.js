'use strict';

/* ═══════════════════════════════════════════════════════════
   ENVOI DES FORMULAIRES PAR E-MAIL
   Tous les formulaires du site (révision, contact, Reiger,
   newsletter) arrivent directement dans la boîte ci-dessous.

   Service utilisé : FormSubmit (gratuit, sans compte).
   ➜ Au PREMIER envoi, FormSubmit envoie un e-mail d'activation
     à cette adresse : cliquez sur « Activate Form » (pensez à
     regarder les spams). Ensuite tout arrive normalement.
═══════════════════════════════════════════════════════════ */
const MAIL = {
  to: 'chatelainnils@gmail.com',
  fallback: 'Vous pouvez aussi nous écrire à info@alp-racing.fr.',
  timeout: 15000,
  subjects: {
    'service-form': 'Demande de révision — site ALP Racing',
    'contact-form': 'Message de contact — site ALP Racing',
    'rg-form':      'Demande Reiger — site ALP Racing',
    'nl-form':      'Inscription newsletter — site ALP Racing'
  }
};
MAIL.endpoint = `https://formsubmit.co/ajax/${MAIL.to}`;

/* Champ piège anti-spam : invisible pour les humains, rempli par les robots */
document.addEventListener('DOMContentLoaded', () => {
  Object.keys(MAIL.subjects).forEach(id => {
    const form = document.getElementById(id);
    if (!form || form.querySelector('[name="_honey"]')) return;
    const trap = document.createElement('input');
    trap.type = 'text';
    trap.name = '_honey';
    trap.tabIndex = -1;
    trap.autocomplete = 'off';
    trap.setAttribute('aria-hidden', 'true');
    trap.style.cssText = 'position:absolute;left:-9999px;width:1px;height:1px;opacity:0';
    form.appendChild(trap);
  });
});

/* Libellé lisible d'un champ (le texte de son <label>, sans l'astérisque) */
function mailLabel(form, el) {
  let lab = el.id ? form.querySelector(`label[for="${el.id}"]`) : null;
  if (!lab) lab = el.closest('label');
  const txt = lab ? lab.textContent.replace(/\*/g, '').replace(/\s+/g, ' ').trim() : '';
  return txt || el.name || el.id;
}

/* Envoie le formulaire. Retourne toujours { ok: true|false } */
async function submitForm(formId, form) {
  const trap = form.querySelector('[name="_honey"]');
  if (trap && trap.value) return { ok: true };   // robot : on fait semblant que c'est passé

  const data = {
    _subject: MAIL.subjects[formId] || 'Nouveau message — site ALP Racing',
    _template: 'table',
    _captcha: 'false'
  };

  [...form.elements].forEach(el => {
    if (!el.name || el.name.startsWith('_') || el.disabled) return;
    if (el.type === 'submit' || el.type === 'button') return;
    if (el.type === 'checkbox') { if (el.checked) data[mailLabel(form, el)] = 'Oui'; return; }
    const v = (el.value || '').trim();
    if (!v) return;
    data[el.type === 'email' ? 'email' : mailLabel(form, el)] = v;   // « email » = adresse de réponse
  });
  if (data.email) data._replyto = data.email;
  data['Page'] = location.href;

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), MAIL.timeout);
  try {
    const res = await fetch(MAIL.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(data),
      signal: ctrl.signal
    });
    const json = await res.json().catch(() => ({}));
    return { ok: res.ok && String(json.success) !== 'false' };
  } catch (e) {
    return { ok: false };
  } finally {
    clearTimeout(timer);
  }
}
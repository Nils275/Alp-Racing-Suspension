/* ===== Bouton « Notice » : télécharger la notice de sa suspension =====
   1) Par véhicule  : liste VEHICULES
   2) Par amortisseur (si le véhicule n'est pas listé) : liste AMORTISSEURS

   Pour ajouter une notice : déposez le PDF dans le dossier /notices
   puis ajoutez une ligne { label: "Nom affiché", file: "notices/fichier.pdf" }.
   Laissez file: "" si la notice n'est pas encore en ligne
   (un message invite alors à la demander à l'équipe). */

/* Pour l'instant, les « Test » pointent vers des PDF qui existent déjà
   pour que le téléchargement fonctionne. Remplacez-les par vos vrais fichiers. */
const VEHICULES = [
  { label: "Test 1", file: "reiger/460REIGER.pdf" },
  { label: "Test 2", file: "reiger/550REIGER.pdf" },
  { label: "Test 3", file: "reiger/620RREIGER.pdf" },
  { label: "Test 4", file: "" }   /* "" = notice pas encore disponible */
];

const AMORTISSEURS = [
  { label: "M-Road A110",  file: "notice/mroad-alpine.pdf" },
  { label: "Reiger 460",  file: "reiger/460REIGER.pdf" },
  { label: "Reiger 550",  file: "reiger/550REIGER.pdf" },
  { label: "Reiger 620R", file: "reiger/620RREIGER.pdf" },
  { label: "Reiger 680R", file: "reiger/680RREIGER.pdf" },
  { label: "Reiger 5046", file: "reiger/5046REIGER.pdf" },
  { label: "Reiger 5746", file: "reiger/5746REIGER.pdf" }
];

(function () {
  "use strict";

  var openBtn = document.getElementById("notice-btn");
  if (!openBtn) return;

  // Lien « Nous contacter » : fonctionne sur index.html comme sur reiger.html
  var contactHref = document.getElementById("contact") ? "#contact"
                  : document.getElementById("rg-contact") ? "#rg-contact"
                  : "index.html#contact";

  /* ---------- Construction de la fenêtre ---------- */
  var overlay = document.createElement("div");
  overlay.className = "ntc-overlay";
  overlay.id = "notice-modal";
  overlay.hidden = true;
  overlay.innerHTML =
    '<div class="ntc-dialog" role="dialog" aria-modal="true" aria-labelledby="ntc-title">' +
      '<div class="ntc-head">' +
        '<div><strong id="ntc-title">Notice suspension</strong>' +
        '<span>Sélectionnez votre véhicule et téléchargez la notice</span></div>' +
        '<button type="button" class="ntc-close" aria-label="Fermer">&times;</button>' +
      '</div>' +
      '<div class="ntc-body">' +
        '<label for="ntc-vehicle">Votre véhicule</label>' +
        '<select id="ntc-vehicle"><option value="">— Sélectionner —</option></select>' +

        '<div class="ntc-sep"><span>ou</span></div>' +

        '<label for="ntc-shock">Vous ne trouvez pas votre véhicule ? Choisissez votre amortisseur</label>' +
        '<select id="ntc-shock"><option value="">— Sélectionner —</option></select>' +

        '<div class="ntc-result" aria-live="polite"></div>' +
        '<p class="ntc-help">Toujours pas trouvé ? <a href="' + contactHref + '" class="ntc-contact">Contactez-nous</a>.</p>' +
      '</div>' +
    '</div>';
  document.body.appendChild(overlay);

  var dialog = overlay.querySelector(".ntc-dialog");
  var closeBtn = overlay.querySelector(".ntc-close");
  var vehicleSel = overlay.querySelector("#ntc-vehicle");
  var shockSel = overlay.querySelector("#ntc-shock");
  var result = overlay.querySelector(".ntc-result");
  var contactLink = overlay.querySelector(".ntc-contact");

  function fill(select, list) {
    list.forEach(function (item, i) {
      var o = document.createElement("option");
      o.value = String(i);
      o.textContent = item.label;
      select.appendChild(o);
    });
  }
  fill(vehicleSel, VEHICULES);
  fill(shockSel, AMORTISSEURS);

  /* ---------- Logique ---------- */
  function resetResult() { result.replaceChildren(); }

  function showResult(item) {
    resetResult();
    if (!item) return;

    var name = document.createElement("p");
    name.className = "ntc-name";
    name.textContent = item.label;
    result.appendChild(name);

    if (item.file) {
      var a = document.createElement("a");
      a.className = "ntc-dl";
      a.href = item.file;
      a.setAttribute("download", item.file.split("/").pop());
      a.target = "_blank";
      a.rel = "noopener";
      a.textContent = "↓ Télécharger la notice (PDF)";
      result.appendChild(a);
    } else {
      var p = document.createElement("p");
      p.className = "ntc-soon";
      p.textContent = "Cette notice n'est pas encore disponible en ligne. Demandez-la à l'équipe, nous vous l'enverrons.";
      result.appendChild(p);
    }
  }

  vehicleSel.addEventListener("change", function () {
    shockSel.value = "";                       // on remet l'autre liste à zéro
    showResult(vehicleSel.value !== "" ? VEHICULES[Number(vehicleSel.value)] : null);
  });

  shockSel.addEventListener("change", function () {
    vehicleSel.value = "";
    showResult(shockSel.value !== "" ? AMORTISSEURS[Number(shockSel.value)] : null);
  });

  /* ---------- Ouverture / fermeture ---------- */
  var lastFocus = null;

  function open() {
    lastFocus = document.activeElement;
    overlay.hidden = false;
    document.documentElement.classList.add("ntc-open");
    openBtn.setAttribute("aria-expanded", "true");
    vehicleSel.focus();
  }
  function close() {
    overlay.hidden = true;
    document.documentElement.classList.remove("ntc-open");
    openBtn.setAttribute("aria-expanded", "false");
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  openBtn.addEventListener("click", open);
  closeBtn.addEventListener("click", close);
  contactLink.addEventListener("click", close);
  overlay.addEventListener("mousedown", function (e) { if (e.target === overlay) close(); });

  document.addEventListener("keydown", function (e) {
    if (overlay.hidden) return;
    if (e.key === "Escape") { close(); return; }
    if (e.key === "Tab") {   // le focus reste dans la fenêtre
      var f = dialog.querySelectorAll("button, select:not([disabled]), a[href]");
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  // Utilisable depuis le chatbot (et depuis n'importe quel bouton [data-notice-open])
  window.ARCNotice = { open: open, close: close };
  document.querySelectorAll("[data-notice-open]").forEach(function (el) {
    el.addEventListener("click", function (e) { e.preventDefault(); open(); });
  });
})();
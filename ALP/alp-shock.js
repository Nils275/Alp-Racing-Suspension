/* ALP Racing Suspension : amortisseur interactif.
   Pour modifier un texte, éditez simplement l'objet ALP_SHOCK_PARTS ci-dessous.
   Pour ajouter une photo : renseignez "image" (ex. "images/ressort.jpg") et "alt". Sans image, le bloc reste masqué. */
(function () {
  "use strict";

  var ALP_SHOCK_PARTS = [
    { id: "spring", name: "Ressort",
      desc: "Le ressort supporte le poids du véhicule et absorbe les irrégularités de la route ou de la piste.",
      tech: "Il se comprime quand la roue monte, puis se détend pour la ramener au sol. Il stocke l'énergie du choc puis la restitue ; c'est l'amortisseur qui contrôle la vitesse de ce mouvement.",
      influence: "Sa raideur détermine la hauteur de caisse et la tenue en appui : plus ferme, moins de roulis et de tangage, mais moins de confort et de motricité sur sol dégradé.",
      key: "Le ressort porte la voiture, l'amortisseur contrôle ses mouvements.", image: null, alt: "" },
    { id: "body", name: "Corps de l'amortisseur",
      desc: "Le corps est le cylindre qui contient l'huile et abrite le piston.",
      tech: "Il guide le piston avec précision et supporte les pressions internes générées par le travail de l'huile. Il évacue aussi une partie de la chaleur produite.",
      influence: "Sa rigidité et sa dissipation thermique contribuent à la régularité du comportement, surtout lors d'un usage intensif.",
      key: "Le corps contient l'huile et garantit un travail du piston stable.", image: null, alt: "" },
    { id: "piston", name: "Piston",
      desc: "Le piston se déplace dans l'huile au bout de la tige et la force à passer par de petits orifices.",
      tech: "Les orifices et les lamelles (clapets) du piston freinent l'écoulement de l'huile. Cette résistance transforme l'énergie du mouvement en chaleur : c'est ce qui amortit.",
      influence: "Sa conception détermine la force d'amortissement selon la vitesse du mouvement, donc la manière dont la voiture réagit aux chocs et aux transferts de charge.",
      key: "Le piston crée la résistance qui amortit les mouvements.", image: null, alt: "" },
    { id: "compression", name: "Réglage de compression",
      desc: "Ce réglage modifie la résistance de l'amortisseur quand il se comprime.",
      tech: "Il ajuste le passage de l'huile lorsque la roue monte vers la caisse. Un passage plus restreint rend l'amortisseur plus ferme en compression.",
      influence: "Il agit sur la réaction aux bosses, au freinage (plongée) et aux appuis en virage. Trop ferme, la roue peut perdre le contact avec le sol.",
      key: "La compression règle la fermeté quand la roue monte.", image: null, alt: "" },
    { id: "rebound", name: "Réglage de détente",
      desc: "Ce réglage modifie la vitesse à laquelle l'amortisseur se détend après une compression.",
      tech: "Il limite le passage de l'huile quand la tige ressort. Il freine le retour du ressort, qui sinon rebondirait plusieurs fois.",
      influence: "Il influence la stabilité de la caisse et le contact de la roue avec le sol. Trop lent, la suspension « se tasse » ; trop rapide, elle rebondit.",
      key: "La détente contrôle le retour du ressort.", image: null, alt: "" },
    { id: "mounts", name: "Fixations",
      desc: "Les fixations relient l'amortisseur au châssis et au bras de suspension.",
      tech: "Elles sont souvent des yeux avec rotules ou silentblocs. Elles transmettent les efforts tout en autorisant les débattements angulaires de la suspension.",
      influence: "Leur jeu et leur rigidité influencent la précision du ressenti : une fixation trop souple ou usée dégrade la réponse de la suspension.",
      key: "Des fixations précises transmettent fidèlement le travail de la suspension.", image: null, alt: "" },
    { id: "reservoir", name: "Réservoir externe",
      desc: "Le réservoir est un volume supplémentaire relié au corps par une durite.",
      tech: "Il reçoit l'huile déplacée par la tige et contient une réserve de gaz sous pression. Il limite la formation de bulles (cavitation) et compense la dilatation de l'huile.",
      influence: "Il aide à garder un amortissement plus constant lors d'un usage soutenu, quand l'huile chauffe.",
      key: "Le réservoir stabilise le comportement de l'huile sous contrainte.", image: null, alt: "" }
  ];

  /* Positions des repères dans le SVG : point (x,y) et cible de la ligne (tx,ty) */
  var MARKERS = {
    spring: [60,160,152,160], body: [60,400,170,400], piston: [60,270,175,270],
    compression: [380,140,332,174], rebound: [380,480,256,452],
    mounts: [380,38,220,38], reservoir: [380,320,350,320]
  };

  var root = document.getElementById("alp-shock");
  if (!root) return;
  var $ = function (id) { return document.getElementById(id); };
  var NS = "http://www.w3.org/2000/svg";
  var current = 0, menuBtns = [], markerEls = {};
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Ressort dessiné en zigzag */
  var d = "", i, pts = 22;
  for (i = 0; i <= pts; i++) {
    d += (i ? "L" : "M") + (i % 2 ? 248 : 152) + " " + (100 + i * 260 / pts).toFixed(1);
  }
  $("alp-shock-spring-path").setAttribute("d", d);

  /* Menu + repères */
  var menu = $("alp-shock-menu"), markerLayer = $("alp-shock-markers");
  ALP_SHOCK_PARTS.forEach(function (p, idx) {
    var li = document.createElement("li"), b = document.createElement("button");
    b.type = "button"; b.className = "alp-shock-item"; b.dataset.index = idx;
    b.innerHTML = '<span class="n">' + String(idx + 1).padStart(2, "0") + "</span>" + p.name;
    b.addEventListener("click", function () { select(idx); });
    b.addEventListener("keydown", function (e) {
      var n = menuBtns.length, t = null;
      if (e.key === "ArrowDown" || e.key === "ArrowRight") t = (idx + 1) % n;
      if (e.key === "ArrowUp" || e.key === "ArrowLeft") t = (idx - 1 + n) % n;
      if (t !== null) { e.preventDefault(); select(t); menuBtns[t].focus(); }
    });
    li.appendChild(b); menu.appendChild(li); menuBtns.push(b);

    var m = MARKERS[p.id];
    var line = document.createElementNS(NS, "line");
    line.setAttribute("class", "alp-shock-leader");
    line.setAttribute("x1", m[0]); line.setAttribute("y1", m[1]);
    line.setAttribute("x2", m[2]); line.setAttribute("y2", m[3]);
    var g = document.createElementNS(NS, "g");
    g.setAttribute("class", "alp-shock-marker"); g.setAttribute("tabindex", "0");
    g.setAttribute("role", "button"); g.setAttribute("aria-label", "Repère " + (idx + 1) + " : " + p.name);
    g.innerHTML = '<circle cx="' + m[0] + '" cy="' + m[1] + '" r="15"/><text x="' + m[0] + '" y="' + m[1] + '">' + (idx + 1) + "</text>";
    g.addEventListener("click", function () { select(idx); });
    g.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); select(idx); }
    });
    markerLayer.appendChild(line); markerLayer.appendChild(g);
    markerEls[p.id] = { g: g, line: line };
  });

  /* Clic directement sur une pièce du schéma */
  root.querySelectorAll(".alp-shock-part").forEach(function (el) {
    el.addEventListener("click", function () {
      var idx = ALP_SHOCK_PARTS.findIndex(function (p) { return p.id === el.dataset.id; });
      if (idx > -1) select(idx);
    });
  });

  /* Image optionnelle avec repli si elle ne charge pas */
  var photo = $("alp-shock-photo"), img = $("alp-shock-img");
  img.addEventListener("error", function () { photo.hidden = true; });

  function render(p, idx) {
    $("alp-shock-counter").textContent = (idx + 1) + " / " + ALP_SHOCK_PARTS.length;
    $("alp-shock-name").textContent = p.name;
    $("alp-shock-desc").textContent = p.desc;
    $("alp-shock-tech").textContent = p.tech;
    $("alp-shock-influence").textContent = p.influence;
    $("alp-shock-key").textContent = p.key;
    if (p.image) { img.src = p.image; img.alt = p.alt || p.name; photo.hidden = false; }
    else { photo.hidden = true; img.removeAttribute("src"); }
  }

  function select(idx) {
    var n = ALP_SHOCK_PARTS.length;
    current = (idx + n) % n;
    var p = ALP_SHOCK_PARTS[current], panel = root.querySelector(".alp-shock-panel");
    menuBtns.forEach(function (b, k) {
      if (k === current) b.setAttribute("aria-current", "true"); else b.removeAttribute("aria-current");
    });
    root.querySelectorAll(".alp-shock-part").forEach(function (el) {
      el.classList.toggle("is-active", el.dataset.id === p.id);
    });
    Object.keys(markerEls).forEach(function (k) {
      markerEls[k].g.classList.toggle("is-active", k === p.id);
      markerEls[k].line.classList.toggle("is-active", k === p.id);
      markerEls[k].g.setAttribute("aria-pressed", k === p.id ? "true" : "false");
    });
    if (reduce) { render(p, current); return; }
    panel.classList.add("is-fading");
    setTimeout(function () { render(p, current); panel.classList.remove("is-fading"); }, 150);
  }

  $("alp-shock-prev").addEventListener("click", function () { select(current - 1); });
  $("alp-shock-next").addEventListener("click", function () { select(current + 1); });

  select(0);
})();
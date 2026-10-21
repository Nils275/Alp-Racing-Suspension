/* ===== Chatbot ALP Racing Suspension (sans IA) — version contextuelle =====
   1) extract()  : repère référence Reiger, marque, discipline, véhicule, symptôme, urgence
   2) detect()   : repère l'intention (devis, délai, notice, envoi...)
   3) H[...]     : construit une réponse adaptée aux infos trouvées
   4) ctx        : mémorise la conversation (« devis » puis « pour un 460 »)           */

const ARC_HOME = document.getElementById('revision') ? '' : 'index.html';
const TEL = "tel:+33450440985";
const MENU_BTN = { label: "Menu principal", next: "menu" };

/* ───────── Données produit (catalogue Reiger) ───────── */
const REF = {
  "360":  { nom: "Reiger 360",  desc: "compacte, pour quad",                                   pdf: "reiger/360REIGER.pdf" },
  "460":  { nom: "Reiger 460",  desc: "polyvalente : quad, autocross, rallye",                 pdf: "reiger/460REIGER.pdf" },
  "550":  { nom: "Reiger 550",  desc: "rallye-raid, fiabilité éprouvée sur Dakar et Baja",     pdf: "reiger/550REIGER.pdf" },
  "620R": { nom: "Reiger 620R", desc: "rallye-raid, architecture inversée, piston 62 mm, 3 réglages indépendants", pdf: "reiger/620RREIGER.pdf" },
  "680R": { nom: "Reiger 680R", desc: "haut de gamme rallye-raid, piston 68 mm",               pdf: "reiger/680RREIGER.pdf" },
  "5046": { nom: "Reiger 5046", desc: "rallye / WRC, asphalte et terre",                        pdf: "reiger/5046REIGER.pdf" },
  "5746": { nom: "Reiger 5746", desc: "rallye / WRC, configurations haute précision",           pdf: "reiger/5746REIGER.pdf" }
};
const BY_DISC = { quad: ["360", "460"], autocross: ["460"], rallye: ["460", "5046", "5746"], raid: ["550", "620R", "680R"] };
const DISC_LABEL = { quad: "le quad", autocross: "l'autocross / rallycross", rallye: "le rallye", raid: "le rallye-raid et le tout-terrain", circuit: "le circuit" };
const DISC_FILTER = { quad: "Quad", autocross: "Autocross", rallye: "Rallye", raid: "Rallye raid" };

/* ───────── Réponses fixes ───────── */
const NODES = {
  menu: { text: "Bonjour ! Je suis l'assistant d'ALP Racing Suspension. Écrivez votre question avec vos mots (par exemple « devis révision Öhlins » ou « quel Reiger pour le raid ? ») ou choisissez un sujet :",
    options: [
      { label: "Révision d'amortisseurs", next: "revision" },
      { label: "Demander un devis", say: "devis" },
      { label: "Quel Reiger choisir ?", say: "quel reiger choisir" },
      { label: "Notice PDF", next: "notice" },
      { label: "Adresse et horaires", next: "contact" }
    ] },
  services: { text: "Nous intervenons uniquement sur les amortisseurs de compétition :\n• Révision et entretien\n• Préparation compétition\n• Développement sur mesure\n\nCircuit, rallye, tout-terrain, toutes marques.",
    options: [{ label: "Révision", next: "revision" }, { label: "Préparation", next: "preparation" }, { label: "Sur mesure", next: "surmesure" }] },
  revision: { text: "Une révision comprend : démontage complet, joints et huile compétition remplacés, test sur banc avant/après, recalibrage des courbes selon votre discipline, rapport technique sur demande. Toutes marques.",
    options: [{ label: "Demander un devis", say: "devis revision" }, { label: "Délais", say: "delai revision" }, { label: "Comment ça marche ?", next: "process" }] },
  process: { text: "En 3 étapes :\n1. Vous remplissez le formulaire (amortisseurs, discipline, véhicule) : réponse sous 24h avec devis et créneau.\n2. Vous déposez ou envoyez vos amortisseurs.\n3. Nous intervenons : diagnostic banc, joints, huile, recalibrage.",
    options: [{ label: "Formulaire de révision", href: ARC_HOME + "#revision" }, { label: "Envoyer mes amortisseurs", say: "envoi" }] },
  banc: { text: "Notre banc haute précision sert au diagnostic avant intervention puis au contrôle après : chaque révision est documentée par des courbes objectives, avec rapport technique sur demande.",
    options: [{ label: "Demander un devis", say: "devis revision" }] },
  preparation: { text: "Préparation compétition : setup personnalisé, analyse des données et télémétrie, optimisation. Circuit (GT), rallye (asphalte, terre, WRC), tout-terrain et raid.",
    options: [{ label: "Discuter de mon projet", href: ARC_HOME + "#contact" }] },
  surmesure: { text: "Kits suspension sur mesure pour teams pro, amateurs et constructeurs : développement, tests, homologation, partenariats écuries et championnats. Tout projet hors catalogue passe par le formulaire de contact.",
    options: [{ label: "Soumettre un projet", href: ARC_HOME + "#contact" }] },
  particulier: { text: "Notre atelier est dédié à la compétition. Si votre véhicule n'est pas engagé en course ou si votre cas est particulier, écrivez-nous : nous vous dirons honnêtement si nous pouvons vous aider.",
    options: [{ label: "Nous écrire", href: ARC_HOME + "#contact" }, { label: "Appeler", href: TEL }] },
  disciplines: { text: "Nous intervenons sur tous les véhicules engagés en compétition, quel que soit le championnat ou le niveau. Quelle est votre discipline ?",
    options: [{ label: "Circuit", say: "circuit" }, { label: "Rallye", say: "rallye" }, { label: "Tout-terrain / raid", say: "raid" }, { label: "Quad", say: "quad" }, { label: "Autocross", say: "autocross" }] },
  circuit: { text: "Circuit : GT, prototypes, monoplaces, setup précis, reproductible et documenté sur banc (NASCAR, GT3 / GT4 / CUP...). ALP Racing équipe la NASCAR Euro Series. Pour le circuit, nous intervenons en révision, préparation et sur mesure.",
    options: [{ label: "Devis révision", say: "devis revision circuit" }, { label: "Préparation / sur mesure", href: ARC_HOME + "#contact" }] },
  rallye: { text: "Le rallye est notre discipline principale : WRC, national, régional, historique, slalom, course de côte. Au Rallye du Mont-Blanc 2020, six voitures de nos clients ont fini dans les huit premières du scratch. Deux besoins possibles :",
    options: [{ label: "Réviser mes amortisseurs", say: "devis revision rallye" }, { label: "Reiger pour le rallye", say: "quel reiger rallye" }] },
  marques: { text: "Nous traitons Reiger, Öhlins, Bilstein, Walker Evans, Proflex et plus largement toutes les marques de compétition (KW, Fox, Sachs, Koni, Eibach, MCA, GAZ...). Votre marque n'est pas listée ? Écrivez-nous.",
    options: [{ label: "Demander une révision", say: "devis revision" }, { label: "Nous écrire", href: ARC_HOME + "#contact" }] },
  reiger: { text: "ALP Racing est revendeur officiel Reiger en France. Reiger est la référence mondiale de l'amortisseur de raid (12 victoires au Dakar). Nous assurons vente, révision et réglage.",
    options: [{ label: "Quel Reiger choisir ?", say: "quel reiger choisir" }, { label: "Voir le catalogue", href: "reiger.html" }, { label: "Devis Reiger", say: "devis acheter reiger" }] },
  reiger_gamme: { text: "Gamme référencée :\n• 360 : quad\n• 460 : polyvalente (quad, autocross, rallye)\n• 550, 620R, 680R : rallye-raid\n• 5046, 5746 : rallye / WRC\n\nCompatibilité toujours à confirmer selon le véhicule.",
    options: [{ label: "Ouvrir le catalogue", href: "reiger.html" }, { label: "Quel Reiger pour moi ?", say: "quel reiger choisir" }] },
  contact: { text: "ALP Racing Suspension\n15 Route de la Salle, 74960 Cran-Gevrier (Annecy)\nTél. : 04 50 44 09 85\nE-mail : info@alp-racing.fr\nLundi–vendredi 8h–17h30",
    options: [{ label: "Appeler", href: TEL }, { label: "E-mail", href: "mailto:info@alp-racing.fr" }, { label: "Itinéraire", say: "itineraire" }, { label: "Formulaire de contact", href: ARC_HOME + "#contact" }] },
  horaires: { text: "Ouvert du lundi au vendredi, 8h–17h30. Pour déposer des amortisseurs, mieux vaut appeler avant : 04 50 44 09 85.",
    options: [{ label: "Appeler", href: TEL }, { label: "Itinéraire", say: "itineraire" }] },
  itineraire: { text: "15 Route de la Salle, Cran-Gevrier, agglomération d'Annecy (Haute-Savoie).",
    options: [{ label: "Ouvrir Google Maps", href: "https://www.google.com/maps/dir/?api=1&destination=ALP+RACING+SUSPENSION%2C+15+Route+de+la+Salle%2C+74960+Annecy" }] },
  humain: { text: "Bien sûr ! Appelez le 04 50 44 09 85 ou écrivez-nous : réponse sous 24h ouvrées.",
    options: [{ label: "Appeler", href: TEL }, { label: "E-mail", href: "mailto:info@alp-racing.fr" }, { label: "Formulaire de contact", href: ARC_HOME + "#contact" }] },
  apropos: { text: "Atelier à taille humaine créé en 2008, monté par des gens qui courent. Réputation construite par le bouche à oreille dans les paddocks.",
    options: [{ label: "Nos chiffres", say: "chiffres" }, { label: "Réalisations", href: ARC_HOME + "#realisations" }] },
  chiffres: { text: "Plus de 500 amortisseurs révisés par an, plus de 200 pilotes accompagnés, plus de 15 ans d'expérience, express 48h disponible.",
    options: [{ label: "Demander un devis", say: "devis" }] },
  avis: { text: "Pilotes de rallye, champions de France Terre, équipes de circuit nous font confiance. Votre avis Google nous aide beaucoup.",
    options: [{ label: "Laisser un avis Google", href: "https://share.google/Qzgl5tDtsfUlBmTWC" }, { label: "Témoignages", href: ARC_HOME + "#partenaires" }] },
  actus: { text: "Retrouvez les résultats de nos pilotes : Rallye du Mont-Blanc, Rallye du Touquet, Coupe de France...",
    options: [{ label: "Lire les actualités", href: ARC_HOME + "#actus" }] },
  newsletter: { text: "Conseils techniques, résultats et coulisses de l'atelier, par e-mail, pas souvent mais utile.",
    options: [{ label: "M'inscrire", href: ARC_HOME + "#newsletter" }] },
  reseaux: { text: "Instagram, Facebook et YouTube : liens dans la section Contact. Pour une réponse rapide, privilégiez le téléphone ou l'e-mail.",
    options: [{ label: "Section contact", href: ARC_HOME + "#contact" }] },
  merci: { text: "Avec plaisir ! Bonne route et bonne saison.", options: [{ label: "Autre question", next: "menu" }] },
  aurevoir: { text: "À bientôt chez ALP Racing Suspension !", options: [MENU_BTN] },
  aide: { text: "Je peux vous orienter pour un devis (révision, Reiger, sur mesure), vous conseiller une référence Reiger selon votre discipline, vous donner une notice PDF, les délais, l'envoi du matériel, l'adresse... Écrivez simplement votre besoin.",
    options: [{ label: "Devis", say: "devis" }, { label: "Quel Reiger ?", say: "quel reiger choisir" }, { label: "Notice", next: "notice" }] },
  notice: { text: "Choisissez votre véhicule, ou votre amortisseur s'il n'est pas listé : la notice se télécharge en PDF. Vous pouvez aussi me donner la référence (ex. « notice 550 »).",
    options: [{ label: "Choisir ma notice", action: "notice" }, { label: "Je ne la trouve pas", next: "contact" }] },
  fallback: { text: "Je n'ai pas bien compris. Dites-moi par exemple : « devis révision Öhlins », « quel Reiger pour le quad ? », « notice du 460 », « délai de révision ». Ou choisissez :",
    options: [{ label: "Demander un devis", say: "devis" }, { label: "Quel Reiger ?", say: "quel reiger choisir" }, { label: "Écrire à l'équipe", href: ARC_HOME + "#contact" }, { label: "Appeler", href: TEL }] }
};

/* ───────── Extraction d'informations ───────── */
function norm(s) { return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[’]/g, "'"); }

const BRANDS = [[/ohlins/, "Öhlins"], [/bilstein/, "Bilstein"], [/walker ?evans/, "Walker Evans"], [/proflex/, "Proflex"],
  [/\bkw\b/, "KW"], [/\bfox\b/, "Fox"], [/sachs/, "Sachs"], [/koni/, "Koni"], [/eibach/, "Eibach"], [/\bmca\b/, "MCA"], [/\bgaz\b/, "GAZ"], [/reig/, "Reiger"]];
const SYMPTOMS = [[/fuite|fuit\b|coule/, "fuite"], [/bruit|claque|cogne/, "bruit"], [/\bmou\b|molle|affaisse/, "mou"], [/trop dur|\bdur\b|rigide|bloque/, "dur"], [/casse|panne|hs\b|mort/, "casse"]];

function extract(t) {
  var c = norm(t), e = {};
  var m = c.match(/\b(360|460|550|620r?|680r?|5046|5746)\b/);
  if (m) e.ref = /^(620|680)$/.test(m[1]) ? m[1] + "R" : m[1].toUpperCase();
  BRANDS.some(function (b) { if (b[0].test(c)) { e.brand = b[1]; return true; } });
  if (/raid|dakar|baja|ssv|utv|desert|tout.?terrain|4x4|camion/.test(c)) e.discipline = "raid";
  else if (/quad|trx|atv/.test(c)) e.discipline = "quad";
  else if (/autocross|rallycross|rallye.cross|auto.cross/.test(c)) e.discipline = "autocross";
  else if (/circuit|piste|\bgt\d?\b|nascar|endurance|track ?day|monoplace/.test(c)) e.discipline = "circuit";
  else if (/rallye|wrc|asphalte|gravier|neige|\bterre\b|\br5\b|a110|slalom|course de cote/.test(c)) e.discipline = "rallye";
  var v = c.match(/c3 r5|yaris|a110|alpine|\b206\b|saxo|clio|\b208\b|polo|fiesta|porsche|bmw|mini|subaru|evo|buggy|ssv|nascar|gt3|gt4|trx ?\d*|ds3|focus|ford|peugeot|citroen|renault|toyota|hyundai|skoda/);
  if (v) e.vehicle = v[0].toUpperCase() === v[0] ? v[0] : v[0].replace(/\b\w/g, function (x) { return x.toUpperCase(); });
  if (/sur mesure|\bkit\b|developp|homolog|hors catalogue/.test(c)) e.service = "surmesure";
  else if (/constructeur/.test(c)) e.service = "constructeur";
  else if (/partenar|sponsor|ecurie/.test(c)) e.service = "partenariat";
  else if (/revis|entretien|rebuild|repar|joints|remise en etat/.test(c)) e.service = "revision";
  SYMPTOMS.some(function (s) { if (s[0].test(c)) { e.symptom = s[1]; return true; } });
  if (/urgent|urgence|express|48 ?h|au plus vite|tres vite|avant (la|le|ma|mon) (course|rallye|manche|epreuve)|samedi|dimanche|demain/.test(c)) e.urgent = true;
  if (/acheter|achat|commander|commande|neuf|neufs|stock/.test(c)) e.buy = true;
  return e;
}

/* ───────── Détection de l'intention (ordre = priorité) ───────── */
const ACTIONS = [
  ["devis", /devis|prix|tarif|cout|coute|budget|acheter|achat|commander|commande|stock|combien ca/],
  ["express", /express|urgent|urgence|48 ?h|au plus vite|tres vite/],
  ["delai", /delai|combien de temps|duree|quand|semaine|jours ouvres/],
  ["envoi", /envoy|colis|expedi|livr|deposer|depot|poster|transport/],
  ["notice", /notice|manuel|mode d'?emploi|fiche|documentation|telecharg|\bpdf\b/],
  ["choix", /quel(le)? (reference|reiger|modele|amortisseur)|compatib|conseil|lequel|adapte|choisir|recommand|convient/],
  ["symptomes", /fuite|fuit\b|bruit|claque|cogne|\bmou\b|molle|trop dur|casse|panne|probleme|defaut|usure|\buse\b|ne marche|dysfonction/],
  ["revision", /revis|entretien|rebuild|repar|remise en etat|joints|recalibr/],
  ["itineraire", /itineraire|comment venir|gps|google maps|acces|parking/],
  ["horaires", /horaire|ouvert|ouverture|ferme|a quelle heure/],
  ["contact", /adresse|telephone|\btel\b|mail|contact|joindre|appeler|numero|ou etes|localisation/]
];
const STATIC = [
  ["process", /comment ca marche|etapes?|procedure|demarche|marche a suivre|comment ca se passe/], ["banc", /\bbanc\b|courbe|diagnostic/],
  ["preparation", /preparation|setup|reglage|telemetrie|mise au point/], ["particulier", /particulier|voiture de route|pas de competition|loisir|de tous les jours/],
  ["marques", /\bmarques?\b|toutes marques/], ["services", /service|prestation|que faites|que proposez|vous faites quoi/],
  ["disciplines", /discipline|quels? vehicules|quelles courses/], ["reiger_gamme", /gamme|catalogue|references|modeles/],
  ["reiger", /reiger|revendeur|distributeur/], ["humain", /humain|quelqu'un|parler a|responsable|rappeler/],
  ["apropos", /histoire|qui etes|a propos|depuis quand|2008|atelier/], ["chiffres", /chiffres|statistique|combien de pilotes/],
  ["avis", /avis|temoignage|google|satisf/], ["actus", /actualite|actus|news|article|victoire|podium|mont.?blanc|touquet|coupe de france/],
  ["newsletter", /newsletter|abonn|inscri/], ["reseaux", /instagram|facebook|youtube|reseaux/],
  ["merci", /merci|parfait|genial|nickel|\bsuper\b/], ["aurevoir", /au revoir|bye|a bientot|a plus|ciao|bonne (journee|soiree)/],
  ["aide", /\baide\b|aider|help|que sais.?tu|sujets/], ["menu", /bonjour|salut|hello|coucou|bonsoir|\bhey\b|\bmenu\b/]
];

/* ───────── Constructeurs de réponses ───────── */
function urgLine(e) { return e.urgent ? "\n\nVotre demande est urgente : précisez la date de votre épreuve dans le message, et appelez-nous au 04 50 44 09 85 pour confirmer la faisabilité en express (48h sur demande)." : ""; }
function context(e) {
  var p = [];
  if (e.brand && e.brand !== "Reiger") p.push("vos amortisseurs " + e.brand);
  if (e.vehicle) p.push("votre " + e.vehicle);
  if (e.discipline && DISC_LABEL[e.discipline]) p.push("en " + (e.discipline === "rallye" ? "rallye" : e.discipline === "circuit" ? "circuit" : e.discipline === "raid" ? "raid / tout-terrain" : e.discipline));
  return p.length ? " (" + p.join(", ") + ")" : "";
}
function refButtons(ids, forQuote) {
  return ids.slice(0, 3).map(function (id) {
    return forQuote ? { label: "Devis " + REF[id].nom, href: "reiger.html?produit=" + id + "#demande-devis" }
                    : { label: "Fiche " + REF[id].nom, href: REF[id].pdf };
  });
}
function reco(e, forQuote) {
  var d = e.discipline, ids = BY_DISC[d];
  var list = ids.map(function (id) { return "• " + REF[id].nom + " : " + REF[id].desc; }).join("\n");
  var cat = "reiger.html?discipline=" + encodeURIComponent(DISC_FILTER[d]) + "#catalogue";
  return {
    text: "Pour " + DISC_LABEL[d] + ", voici les références Reiger adaptées :\n" + list + "\n\nLa compatibilité exacte dépend de votre véhicule : nous la validons avec vous avant toute commande." + urgLine(e),
    options: refButtons(ids, forQuote).concat([{ label: "Voir dans le catalogue", href: cat }])
  };
}
function askDiscipline(prefix) {
  return { text: "Pour vous conseiller la bonne référence, dans quelle discipline roulez-vous ?",
    options: [{ label: "Quad", say: prefix + " quad" }, { label: "Autocross", say: prefix + " autocross" }, { label: "Rallye", say: prefix + " rallye" }, { label: "Raid / tout-terrain", say: prefix + " raid" }] };
}

const H = {
  devis: function (e) {
    if (e.ref) {
      var r = REF[e.ref];
      return { text: "Pour la " + r.nom + " (" + r.desc + "), le plus direct est le formulaire de devis du catalogue : la référence sera déjà présélectionnée. Indiquez votre véhicule, la discipline et votre échéance : réponse sous 24h." + urgLine(e),
        options: [{ label: "Devis " + r.nom, href: "reiger.html?produit=" + e.ref + "#demande-devis" }, { label: "Fiche PDF " + r.nom, href: r.pdf }, { label: "Autre référence", say: "quel reiger choisir" }] };
    }
    if (e.service === "revision" || e.symptom || (e.brand && e.brand !== "Reiger" && !e.buy)) {
      var sym = e.symptom ? "\nVous évoquez un problème : décrivez-le dans le champ « Symptômes », cela prépare le diagnostic." : "";
      return { text: "Pour une révision" + context(e) + ", le devis se fait via le formulaire de révision. Indiquez : marque des amortisseurs, véhicule (modèle, année), discipline et kilométrage depuis la dernière révision. Nous revenons sous 24h avec un devis et un créneau." + sym + urgLine(e),
        options: [{ label: "Formulaire de révision", href: ARC_HOME + "#revision" }, { label: "Formulaire PDF", href: "formulaire-service.pdf" }, { label: "Appeler", href: TEL }] };
    }
    if (e.service === "surmesure" || e.service === "constructeur" || e.service === "partenariat") {
      return { text: "Les projets sur mesure, constructeurs et partenariats sont étudiés au cas par cas : pas de tarif standard. Décrivez votre projet (véhicule, discipline, objectifs, échéance) dans le formulaire de contact en choisissant le bon sujet : réponse sous 24h ouvrées.",
        options: [{ label: "Formulaire de contact", href: ARC_HOME + "#contact" }, { label: "Appeler", href: TEL }] };
    }
    if (e.discipline && BY_DISC[e.discipline] && (e.discipline !== "rallye" || e.brand === "Reiger" || e.buy)) return reco(e, true);
    if (e.buy || e.brand === "Reiger") return askDiscipline("devis acheter reiger");
    return { text: "Je peux vous orienter vers le bon devis. De quoi s'agit-il ?",
      options: [{ label: "Réviser mes amortisseurs", say: "devis revision" }, { label: "Acheter un Reiger neuf", say: "devis acheter reiger" }, { label: "Projet sur mesure", say: "devis sur mesure" }] };
  },

  express: function (e) {
    return { text: "Oui, une livraison express en 48h est possible sur demande" + context(e) + ", selon la charge de l'atelier. Mentionnez-le dans votre formulaire avec la date de votre épreuve, et appelez-nous pour qu'on confirme tout de suite." ,
      options: [{ label: "Formulaire de révision", href: ARC_HOME + "#revision" }, { label: "Appeler maintenant", href: TEL }] };
  },

  delai: function (e) {
    if (e.urgent) return H.express(e);
    if (e.ref) return { text: "La disponibilité d'une " + REF[e.ref].nom + " neuve est confirmée dans le devis (je n'ai pas de stock en ligne). Demandez votre devis en précisant votre échéance.",
      options: [{ label: "Devis " + REF[e.ref].nom, href: "reiger.html?produit=" + e.ref + "#demande-devis" }, { label: "Appeler", href: TEL }] };
    return { text: "Pour une révision" + context(e) + " : réponse à votre demande sous 24h, puis environ 1 semaine en moyenne pour l'intervention. Express 48h possible sur demande. Le délai exact dépend de l'état des amortisseurs et de la charge de l'atelier, et il est confirmé dans le devis." + (e.discipline === "rallye" ? "\n\nIndiquez la date de votre prochaine épreuve dans le formulaire pour qu'on planifie en conséquence." : ""),
      options: [{ label: "Demander un devis", say: "devis revision" }, { label: "Livraison express", say: "express" }] };
  },

  envoi: function (e) {
    return { text: "Vous pouvez déposer vos amortisseurs" + context(e) + " à l'atelier (Cran-Gevrier) ou nous les envoyer par colis depuis toute la France ou l'étranger. Faites d'abord la demande en ligne : nous vous répondons sous 24h avec devis et créneau, puis nous confirmons la réception du colis.",
      options: [{ label: "Faire ma demande", href: ARC_HOME + "#revision" }, { label: "Adresse de l'atelier", next: "contact" }] };
  },

  notice: function (e) {
    if (e.ref) {
      var r = REF[e.ref];
      return { text: "Voici la fiche de la " + r.nom + " (" + r.desc + "). Vous pouvez la télécharger directement.",
        options: [{ label: "↓ Télécharger " + r.nom, href: r.pdf }, { label: "Autres notices", action: "notice" }] };
    }
    return NODES.notice;
  },

  choix: function (e) {
    if (e.ref) return H.produit(e);
    if (e.discipline && BY_DISC[e.discipline]) return reco(e, false);
    if (e.discipline === "circuit") return NODES.circuit;
    return askDiscipline("quel reiger");
  },

  produit: function (e) {
    var r = REF[e.ref];
    return { text: r.nom + " : " + r.desc + ".\n\nLa compatibilité dépend de votre véhicule et de la configuration : nous la confirmons avant commande.",
      options: [{ label: "Fiche PDF", href: r.pdf }, { label: "Devis " + r.nom, href: "reiger.html?produit=" + e.ref + "#demande-devis" }, { label: "Autres références", say: "quel reiger choisir" }] };
  },

  discipline: function (e) {
    if (e.discipline === "circuit") return NODES.circuit;
    if (e.discipline === "rallye") return NODES.rallye;
    return reco(e, false);
  },

  marque: function (e) {
    return { text: "Oui, nous intervenons sur les " + e.brand + " (révision, recalibrage, réglage) comme sur toutes les marques de compétition. Le devis se fait via le formulaire de révision : indiquez le modèle d'amortisseur et votre véhicule.",
      options: [{ label: "Devis révision " + e.brand, say: "devis revision " + e.brand }, { label: "Formulaire de révision", href: ARC_HOME + "#revision" }] };
  },

  symptomes: function (e) {
    var T = {
      fuite: "Une fuite d'huile vient le plus souvent de joints usés : l'amortisseur perd alors en efficacité. C'est à confirmer au diagnostic sur banc, mais il vaut mieux ne pas rouler en compétition avec.",
      bruit: "Un bruit ou un claquement peut venir d'une usure interne, d'une fixation ou d'un manque d'huile : seul un diagnostic sur banc permet d'en être sûr.",
      mou: "Un amortisseur qui devient mou signale souvent une huile fatiguée ou des joints usés. Le recalibrage lors d'une révision rend les courbes d'origine.",
      dur: "Un amortisseur trop dur ou bloqué peut venir d'un réglage inadapté ou d'un défaut interne. Un diagnostic sur banc tranche.",
      casse: "Si l'amortisseur est cassé ou ne fonctionne plus, décrivez ce qui s'est passé : nous dirons si une révision suffit ou si une pièce est à remplacer."
    };
    return { text: (T[e.symptom] || "Décrivez le problème dans le formulaire, cela prépare le diagnostic.") + context(e) + "\n\nDécrivez les symptômes dans le formulaire de révision pour recevoir un devis sous 24h." + urgLine(e),
      options: [{ label: "Demander une révision", href: ARC_HOME + "#revision" }, { label: "Appeler l'atelier", href: TEL }] };
  },

  revision: function (e) {
    if (e.brand && e.brand !== "Reiger" || e.vehicle || e.discipline) return H.devis(Object.assign({ service: "revision" }, e));
    return NODES.revision;
  }
};

/* ───────── Moteur ───────── */
var ctx = null;                               // mémoire de conversation
var FLOW = { devis: 1, express: 1, delai: 1, notice: 1, choix: 1, envoi: 1 };

function route(text) {
  var e = extract(text), c = norm(text), act = null;
  ACTIONS.some(function (a) { if (a[1].test(c)) { act = a[0]; return true; } });

  var has = Object.keys(e).some(function (k) { return k !== "urgent" && k !== "buy"; }) || e.urgent || e.buy;
  if (ctx && has && (!act || act === ctx.action)) {          // suite d'une conversation
    var merged = Object.assign({}, ctx.e, e);
    e = merged; act = act || ctx.action;
  }
  if (!act) {                                                // intention déduite des infos
    if (e.ref) act = "produit";
    else if (e.brand && e.brand !== "Reiger") act = "marque";
    else if (e.discipline && !STATIC.some(function (s) { return s[0] === "reiger" && s[1].test(c); })) act = "discipline";
  }

  var node = null, nextCtx = null;
  if (act && H[act]) { node = H[act](e); if (FLOW[act]) nextCtx = { action: act, e: e }; }
  else if (act && NODES[act]) node = NODES[act];
  if (!node) {
    STATIC.some(function (s) { if (s[1].test(c)) { node = NODES[s[0]]; return true; } });
  }
  ctx = nextCtx;
  return node || NODES.fallback;
}

(function () {
  "use strict";

  var toggle = document.getElementById("arc-toggle"), panel = document.getElementById("arc-panel"),
      closeBtn = document.getElementById("arc-close"), log = document.getElementById("arc-log"),
      optionsEl = document.getElementById("arc-options"), form = document.getElementById("arc-form"),
      input = document.getElementById("arc-input");
  if (!toggle || !panel || !log || !optionsEl || !form || !input) return;

  var started = false;
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function delayFor(t) { return reduceMotion ? 0 : Math.min(900, 350 + t.length * 2); }

  function openChat() {
    panel.hidden = false; document.documentElement.classList.add("arc-open");
    toggle.setAttribute("aria-expanded", "true");
    if (!started) { started = true; show(NODES.menu, true); }
    input.focus();
  }
  function closeChat() {
    panel.hidden = true; document.documentElement.classList.remove("arc-open");
    toggle.setAttribute("aria-expanded", "false"); toggle.focus();
  }
  toggle.addEventListener("click", function () { panel.hidden ? openChat() : closeChat(); });
  closeBtn.addEventListener("click", closeChat);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !panel.hidden) closeChat(); });

  function addMessage(who, text) {
    var wrap = document.createElement("div"); wrap.className = "arc-msg arc-" + who;
    var p = document.createElement("p"); p.textContent = text;
    wrap.appendChild(p); log.appendChild(wrap); log.scrollTop = log.scrollHeight;
  }
  function showTyping() {
    var t = document.createElement("div"); t.className = "arc-typing"; t.setAttribute("aria-hidden", "true");
    t.innerHTML = "<i></i><i></i><i></i>"; log.appendChild(t); log.scrollTop = log.scrollHeight; return t;
  }

  function renderOptions(options) {
    optionsEl.replaceChildren();
    options.forEach(function (opt) {
      var el;
      if (opt.href) {
        el = document.createElement("a"); el.href = opt.href; el.className = "arc-opt arc-opt--link";
        if (/^https?:/.test(opt.href)) { el.target = "_blank"; el.rel = "noopener noreferrer"; }
        else if (/\.pdf$/.test(opt.href)) { el.target = "_blank"; el.rel = "noopener"; }
        if (opt.href.charAt(0) === "#") el.addEventListener("click", closeChat);
      } else if (opt.action === "notice") {
        el = document.createElement("button"); el.type = "button"; el.className = "arc-opt arc-opt--link";
        el.addEventListener("click", function () { closeChat(); if (window.ARCNotice) window.ARCNotice.open(); });
      } else {
        el = document.createElement("button"); el.type = "button"; el.className = "arc-opt";
        el.addEventListener("click", function () {
          addMessage("user", opt.label);
          if (opt.say) show(route(opt.say)); else { ctx = null; show(NODES[opt.next] || NODES.fallback, opt.next === "menu"); }
        });
      }
      el.textContent = opt.label;
      optionsEl.appendChild(el);
    });
  }

  function show(node, isMenu) {
    optionsEl.replaceChildren();
    var typing = showTyping();
    setTimeout(function () {
      typing.remove();
      addMessage("bot", node.text);
      var opts = (node.options || []).slice();
      if (!isMenu && !opts.some(function (o) { return o.next === "menu"; })) opts.push(MENU_BTN);
      renderOptions(opts);
    }, delayFor(node.text));
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var text = input.value.trim();
    if (!text) return;
    addMessage("user", text); input.value = "";
    show(route(text));
  });
})();
/* Gabon Talent OS · Page « Mon CV » (#/boost)
   Ajoute les offres CV Express (1 100 FCFA) et CV Premium (5 000 FCFA) sans modifier le code existant.
   L'ancien formulaire (demande manuelle) est conservé dans un bloc repliable. */
(function () {
  "use strict";

  function patchAd() {
    var track = document.querySelector(".ad.a1 .track");
    if (!track) return;
    var html = '<span class="item"><b>Votre CV professionnel</b><span>Dès 1 100 FCFA · reçu par e-mail et WhatsApp</span><span class="pill">Créer mon CV</span></span>';
    var apply = function () {
      if (track.dataset.cv) return true;
      if (!track.children.length) return false;
      track.dataset.cv = "1";
      track.innerHTML = html.repeat(6);
      return true;
    };
    if (!apply()) {
      var mo = new MutationObserver(function () { if (apply()) mo.disconnect(); });
      mo.observe(track, { childList: true });
    }
  }

  function init() {
    var page = document.getElementById("page-boost");
    if (!page || page.dataset.cvReady) return;
    var wrap = page.querySelector(".narrow");
    var form = document.getElementById("formBoost");
    var done = document.getElementById("doneBoosts");
    var head = wrap && wrap.querySelector(".box");
    if (!wrap || !form || !head) return;
    page.dataset.cvReady = "1";

    var st = document.createElement("style");
    st.textContent =
      ".packs.two{grid-template-columns:1fr}@media(min-width:700px){.packs.two{grid-template-columns:repeat(2,1fr)}}" +
      ".cvlist{padding-left:20px;font-size:14px;margin:8px 0 6px;flex:1}";
    document.head.appendChild(st);

    var sec = document.createElement("div");
    sec.innerHTML =
      '<h1 style="font-family:var(--fh);font-size:26px;line-height:1.15">Mon CV professionnel</h1>' +
      '<p class="note" style="margin-top:6px;font-size:14px">Remplissez vos informations en ligne, payez, puis recevez vos documents par e-mail et WhatsApp.</p>' +
      '<div class="packs two">' +
        '<div class="box pack">' +
          '<h2 style="font-size:20px">CV Express</h2>' +
          '<p class="note" style="margin:2px 0 8px">Le CV qu\'il vous faut, tout de suite</p>' +
          '<div class="price">1 100 <span style="font-size:14px;color:var(--mute);font-family:var(--fb);font-weight:500">FCFA</span></div>' +
          '<ul class="cvlist"><li>CV professionnel rédigé par IA</li><li>Votre photo incluse</li><li>Reçu par e-mail et WhatsApp en quelques minutes</li></ul>' +
          '<a class="btn dark" href="cv.html?offre=express">Créer mon CV Express</a>' +
        '</div>' +
        '<div class="box pack pop">' +
          '<span class="badge b-feat" style="margin:0 0 8px;align-self:flex-start">Le plus complet</span>' +
          '<h2 style="font-size:20px">CV Premium</h2>' +
          '<p class="note" style="margin:2px 0 8px">Tout pour candidater avec confiance</p>' +
          '<div class="price">5 000 <span style="font-size:14px;color:var(--mute);font-family:var(--fb);font-weight:500">FCFA</span></div>' +
          '<ul class="cvlist"><li>CV professionnel rédigé par IA</li><li>Lettre de motivation adaptée à votre poste</li><li>Optimisation de votre profil LinkedIn</li><li>Reçu par e-mail et WhatsApp</li></ul>' +
          '<a class="btn" href="cv.html?offre=premium">Créer mon CV Premium</a>' +
        '</div>' +
      '</div>' +
      '<p class="note">Paiement sécurisé via Chariow. Vos informations ne sont utilisées que pour créer vos documents.</p>';
    head.replaceWith(sec);

    var det = document.createElement("details");
    det.style.marginTop = "14px";
    det.innerHTML = "<summary>Préférez un accompagnement personnalisé ? Envoyez une demande à l'équipe</summary>";
    det.appendChild(form);
    if (done) det.appendChild(done);
    wrap.appendChild(det);

    patchAd();
  }


  /* ---- Page Tarifs : un clic sur un pack ouvre d'abord sa page de détail (pack.html) ---- */
  var FBCFG = { apiKey: "AIzaSyATIRQfPyhvPFp1dIvil3zk4axejA_1q70", authDomain: "gabon-talent-os.firebaseapp.com", projectId: "gabon-talent-os" };
  async function loadPackMap() {
    var A = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js");
    var F = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js");
    var app = A.getApps().length ? A.getApp() : A.initializeApp(FBCFG);
    var snap = await F.getDocs(F.collection(F.getFirestore(app), "config_packs"));
    var m = { byName: {}, byLink: {} };
    snap.forEach(function (d) {
      var p = d.data();
      if (p.nom) m.byName[String(p.nom).trim().toLowerCase()] = d.id;
      if (p.lienPaiement) m.byLink[p.lienPaiement] = d.id;
    });
    return m;
  }
  function patchPacks() {
    var box = document.getElementById("packs");
    if (!box) return;
    var map = null, busy = false;
    function external(a) {
      var h = a.getAttribute("href") || "";
      if (!/^https?:\/\//i.test(h)) return false;
      try { return new URL(h).host !== "wa.me"; } catch (e) { return false; }
    }
    async function run() {
      if (busy) return; busy = true;
      try {
        var cards = box.querySelectorAll(".pack");
        if (!cards.length) return;
        if (!map) map = await loadPackMap();
        cards.forEach(function (card) {
          var a = card.querySelector("a.btn");
          if (!a || a.dataset.detail || !external(a)) return;
          var h2 = card.querySelector("h2");
          var id = map.byLink[a.getAttribute("href")] || map.byName[h2 ? h2.textContent.trim().toLowerCase() : ""];
          if (!id) return;
          a.setAttribute("href", "pack.html?id=" + encodeURIComponent(id));
          a.removeAttribute("target"); a.removeAttribute("rel");
          a.textContent = "Voir le détail et s'abonner";
          a.dataset.detail = "1";
        });
      } catch (e) { console.warn("packs", e); } finally { busy = false; }
    }
    new MutationObserver(run).observe(box, { childList: true });
    box.addEventListener("click", async function (e) {
      var a = e.target.closest("a.btn");
      if (!a || a.dataset.detail || !external(a)) return;
      e.preventDefault();
      var orig = a.getAttribute("href");
      await run();
      location.href = a.dataset.detail ? a.getAttribute("href") : orig;
    }, true);
    run();
  }

  /* ---- Formation : inscription en ligne affichée seulement si le produit est actif dans la console ---- */
  function initFormation() {
    var page = document.getElementById("page-formation");
    if (!page || page.dataset.payReady) return;
    page.dataset.payReady = "1";
    var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
    fetch("https://firestore.googleapis.com/v1/projects/gabon-talent-os/databases/(default)/documents/config_produits/formation?key=AIzaSyATIRQfPyhvPFp1dIvil3zk4axejA_1q70")
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) {
        if (!d || !d.fields || !d.fields.actif || d.fields.actif.booleanValue !== true) return;
        var f = d.fields, prix = Number((f.prix && (f.prix.integerValue || f.prix.doubleValue)) || 0);
        var box = document.createElement("div");
        box.className = "box"; box.style.marginTop = "12px";
        box.innerHTML = '<h2 style="font-size:18px">' + esc((f.nom && f.nom.stringValue) || "Formation") + (prix > 0 ? " · " + prix.toLocaleString("fr-FR") + " FCFA" : "") + "</h2>" +
          '<p class="note">' + esc((f.description && f.description.stringValue) || "") + "</p>" +
          '<a class="btn" href="pack.html?produit=formation">Voir le détail et s\'inscrire en ligne</a>';
        var first = page.querySelector(".narrow .box");
        if (first) first.after(box);
      }).catch(function () {});
  }

  /* ---- Textes : FAQ et confidentialité alignées sur la nouvelle offre CV ---- */
  function patchTextes() {
    document.querySelectorAll("#page-home details").forEach(function (d) {
      var sm = d.querySelector("summary"), p = d.querySelector("p");
      if (sm && p && /gratuit pour les candidats/i.test(sm.textContent)) {
        p.textContent = "Oui. Créer un profil et postuler est gratuit. Seuls les services « Mon CV » (CV Express et CV Premium) sont payants : vous remplissez un formulaire, vous payez, puis vous recevez vos documents par e-mail.";
      }
    });
    var priv = document.querySelector("#page-confidentialite .box");
    if (priv && !priv.dataset.ia) {
      priv.dataset.ia = "1";
      priv.insertAdjacentHTML("beforeend",
        '<h3 style="margin-top:14px">Services « Mon CV » et intelligence artificielle</h3>' +
        '<p style="font-size:14px">Pour rédiger votre CV, le contenu professionnel (formations, expériences, compétences) est traité par un service d\'intelligence artificielle. Vos nom, téléphone, e-mail, photo et date de naissance ne lui sont jamais transmis : ils sont ajoutés à votre document sur nos propres traitements. Vos documents restent téléchargeables 7 jours et vos informations de commande sont supprimées 30 jours après la livraison.</p>');
    }
  }

  /* ---- CV : téléchargement d'un fichier à la place d'un lien Drive, Dropbox ou LinkedIn ---- */
  var BASE = "https://gabon-talent-js.github.io/gabon-talent-os/";
  var FS = "https://firestore.googleapis.com/v1/projects/gabon-talent-os/databases/(default)/documents/cv_fichiers";
  var KEY = "AIzaSyATIRQfPyhvPFp1dIvil3zk4axejA_1q70";
  var TYPES = { pdf: "application/pdf", doc: "application/msword", docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" };
  function nouvelId() { return (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : (Date.now().toString(36) + Math.random().toString(36).slice(2, 12)); }
  function enhanceCv(input) {
    if (!input || input.dataset.up) return;
    input.dataset.up = "1";
    var busy = false;
    var label = document.querySelector('label[for="' + input.id + '"]');
    if (label) label.innerHTML = 'Votre CV <small>(PDF ou Word, 600 Ko max – optionnel)</small>';
    input.type = "hidden";   // le lien est généré automatiquement, le reste du formulaire ne change pas
    var f = document.createElement("input");
    f.type = "file"; f.accept = ".pdf,.doc,.docx"; f.setAttribute("aria-label", "Téléverser mon CV");
    var st = document.createElement("p");
    st.className = "note"; st.setAttribute("aria-live", "polite");
    input.insertAdjacentElement("afterend", f); f.insertAdjacentElement("afterend", st);
    var refresh = function () { if (!busy) st.textContent = input.value ? "✓ CV enregistré sur le site. Choisissez un autre fichier pour le remplacer." : "Aucun fichier choisi."; };
    f.addEventListener("change", async function () {
      var file = f.files[0];
      if (!file) return;
      var ext = (file.name.split(".").pop() || "").toLowerCase();
      if (!TYPES[ext]) { st.textContent = "Format non accepté : PDF ou Word uniquement."; f.value = ""; return; }
      if (file.size > 600 * 1024) { st.textContent = "Fichier trop lourd (600 Ko maximum)."; f.value = ""; return; }
      busy = true; st.textContent = "Envoi du CV…";
      try {
        var data = await new Promise(function (ok, ko) { var r = new FileReader(); r.onload = function () { ok(String(r.result).split(",")[1] || ""); }; r.onerror = ko; r.readAsDataURL(file); });
        var id = nouvelId();
        var res = await fetch(FS + "?documentId=" + id + "&key=" + KEY, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fields: { nom: { stringValue: file.name.slice(0, 120) }, mime: { stringValue: TYPES[ext] }, data: { stringValue: data }, createdAt: { timestampValue: new Date().toISOString() } } })
        });
        if (!res.ok) throw new Error(String(res.status));
        input.value = BASE + "cv-view.html?id=" + id;
        input.dispatchEvent(new Event("input", { bubbles: true }));
        busy = false; refresh();
      } catch (e) { busy = false; st.textContent = "Envoi impossible. Réessayez avec un fichier plus léger, ou plus tard."; f.value = ""; }
    });
    var form = input.closest("form");
    if (form) form.addEventListener("reset", function () { setTimeout(refresh, 0); });
    setInterval(refresh, 1500); refresh();
  }
  function initCvUpload() { enhanceCv(document.getElementById("c_cv")); enhanceCv(document.getElementById("p_cv")); }

  function start() { init(); patchPacks(); initFormation(); patchTextes(); initCvUpload(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
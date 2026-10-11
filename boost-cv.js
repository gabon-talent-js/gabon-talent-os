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
    fetch("https://firestore.googleapis.com/v1/projects/gabon-talent-os/databases/(default)/documents/config_produits/formation")
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

  function start() { init(); patchPacks(); initFormation(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
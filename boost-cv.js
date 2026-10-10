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

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
/* Gabon Talent OS · Annonces sponsorisées : affichage sur l'accueil + mesure (impressions, clics)
   Chargé automatiquement par boost-cv.js. Les annonces se gèrent dans superadmin.html > Annonces. */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, query, where, getDocs, doc, setDoc, increment } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const db = getFirestore(initializeApp({ apiKey: "AIzaSyATIRQfPyhvPFp1dIvil3zk4axejA_1q70", authDomain: "gabon-talent-os.firebaseapp.com", projectId: "gabon-talent-os" }, "ads"));

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const lienOk = (u) => /^https:\/\/[^\s"'<>]+$/i.test(String(u || ""));
const imageOk = (u) => /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(String(u || ""));
const jour = () => new Date(Date.now() + 3600e3).toISOString().slice(0, 10).replace(/-/g, "");   // date à Libreville (UTC+1)
const ms = (t) => (t && t.toMillis ? t.toMillis() : 0);
const enCours = (a, now = Date.now()) => ms(a.debut) <= now && now <= ms(a.fin);

const store = {
  get(k) { try { return sessionStorage.getItem(k); } catch (_) { return null; } },
  set(k, v) { try { sessionStorage.setItem(k, v); } catch (_) {} }
};
function suivre(id, champ) {   // un seul document par annonce et par jour : 1 écriture par événement
  const j = jour();
  setDoc(doc(db, "annonces_stats", id + "_" + j), { annonce: id, jour: j, [champ]: increment(1) }, { merge: true }).catch(() => {});
}

const CSS = `#gt-annonces{margin:26px 0}#gt-annonces h2{font-family:var(--fh,inherit);font-size:20px;font-weight:800;margin-bottom:4px}
#gt-annonces .gta-sub{color:var(--mute,#5a6b63);font-size:13px;margin-bottom:12px}
.gta-row{display:flex;gap:12px;overflow-x:auto;scroll-snap-type:x mandatory;padding-bottom:10px;scrollbar-width:none}.gta-row::-webkit-scrollbar{display:none}
.gta{position:relative;flex:0 0 min(86%,330px);scroll-snap-align:start;background:var(--card,#fff);border:1px solid var(--line,#e0e7e3);border-radius:var(--r,14px);overflow:hidden;display:flex;flex-direction:column}
.gta img{width:100%;aspect-ratio:16/9;object-fit:cover;display:block;background:var(--soft,#eaf1ed)}
.gta-body{padding:14px;display:flex;flex-direction:column;gap:6px;flex:1}.gta h3{font-size:16px;line-height:1.3}.gta p{font-size:13px;color:var(--mute,#5a6b63);flex:1}
.gta-tag{position:absolute;top:10px;left:10px;background:rgba(18,32,26,.82);color:#fff;font-size:10px;font-weight:700;padding:3px 8px;border-radius:99px}
.gta-cta{display:block;text-align:center;background:var(--green,#0b6b4a);color:#fff;border-radius:11px;padding:11px;font-weight:700;font-size:14px;text-decoration:none;margin-top:6px}
.gta-cta:hover{background:var(--green-d,#084f37)}`;

function afficher(ads) {
  const ancre = document.getElementById("stats");
  if (!ancre || !ads.length || document.getElementById("gt-annonces")) return;
  if (!document.getElementById("gta-css")) { const st = document.createElement("style"); st.id = "gta-css"; st.textContent = CSS; document.head.appendChild(st); }
  const sec = document.createElement("section");
  sec.id = "gt-annonces"; sec.setAttribute("aria-label", "Annonces sponsorisées");
  sec.innerHTML = `<h2>À découvrir</h2><p class="gta-sub">Annonces de nos partenaires</p><div class="gta-row">` + ads.map((a) =>
    `<article class="gta" data-id="${esc(a.id)}"><span class="gta-tag">Annonce</span>${imageOk(a.image) ? `<img src="${esc(a.image)}" alt="" loading="lazy">` : ""}
     <div class="gta-body"><h3>${esc(a.titre)}</h3><p>${esc(a.texte)}</p><a class="gta-cta" href="${esc(a.lien)}" target="_blank" rel="noopener sponsored nofollow">${esc(a.cta || "En savoir plus")}</a></div></article>`).join("") + `</div>`;
  ancre.insertAdjacentElement("afterend", sec);

  const vu = ("IntersectionObserver" in window) ? new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      const id = e.target.dataset.id, k = "gta_i_" + id + "_" + jour();
      if (store.get(k)) continue;
      store.set(k, "1"); suivre(id, "impressions"); vu.unobserve(e.target);
    }
  }, { threshold: 0.5 }) : null;
  sec.querySelectorAll(".gta").forEach((el) => {
    if (vu) vu.observe(el);
    el.querySelector(".gta-cta").addEventListener("click", () => {
      const id = el.dataset.id, k = "gta_c_" + id, t = Number(store.get(k) || 0);
      if (Date.now() - t < 10000) return;      // anti-répétition : 1 clic compté toutes les 10 s
      store.set(k, String(Date.now())); suivre(id, "clics");
    });
  });
}

async function demarrer() {
  try {
    const snap = await getDocs(query(collection(db, "annonces"), where("statut", "==", "active")));
    const ads = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      .filter((a) => enCours(a) && lienOk(a.lien) && a.titre)
      .sort(() => Math.random() - 0.5).slice(0, 3);
    afficher(ads);
  } catch (e) { console.warn("annonces indisponibles", e && e.code); }
}
demarrer();
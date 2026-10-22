// gt-ads.js - Gabon Talent OS - Version Finale Gratuite - 2026 - STABLE
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, getDocs, query, where, doc, updateDoc, increment } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyATIRQfPyhvPFp1dIvil3zk4axejA_1q70",
  authDomain: "gabon-talent-os.firebaseapp.com",
  projectId: "gabon-talent-os"
};

const app = initializeApp(firebaseConfig, "gt-ads-final");
const db = getFirestore(app);

async function loadAds() {
  try {
    const q = query(collection(db, "gt_ads"), where("status", "==", "active"));
    const snap = await getDocs(q);
    const ads = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    if (!ads.length) return;

    // 1. BANNIERE TOP
    const topAd = ads[0];
    const banner = document.createElement("div");
    banner.innerHTML = `<a href="${topAd.link}" target="_blank" style="display:flex;align-items:center;gap:12px;background:#0f2a1d;color:#fff;padding:14px 16px;text-decoration:none;position:sticky;top:0;z-index:9999"><img src="${topAd.imageUrl}" style="width:48px;height:48px;border-radius:10px;object-fit:cover"><div style="flex:1"><div style="font-weight:800">${topAd.title} <span style="background:#f2b705;color:#000;padding:2px 8px;border-radius:20px;font-size:10px">SPONSORISÉ</span></div><div style="font-size:12px;opacity:.9">${topAd.description||""}</div></div><div style="background:#0b7a4b;padding:8px 14px;border-radius:8px;font-weight:700;font-size:12px">Voir</div></a>`;
    document.body.prepend(banner);
    try { await updateDoc(doc(db, "gt_ads", topAd.id), { views: increment(1) }); } catch{}

    // 2. INJECTION DANS LA LISTE TOUS LES 6
    const tryInject = () => {
      const list = document.getElementById("offres") || document.querySelector("main") || document.body;
      if (!list || list.children.length < 3) return;
      const cards = Array.from(list.children);
      let adIdx = 1;
      for (let i = 5; i < cards.length && adIdx < ads.length; i += 7) {
        const ad = ads[adIdx++];
        const el = document.createElement("div");
        el.innerHTML = `<a href="${ad.link}" target="_blank" style="display:flex;gap:12px;border:2px dashed #f2b705;background:#fffdf0;padding:12px;border-radius:12px;text-decoration:none;color:#111"><img src="${ad.imageUrl}" style="width:64px;height:64px;border-radius:12px;object-fit:cover"><div><div style="font-weight:800">${ad.title} <span style="font-size:10px;background:#0f2a1d;color:#fff;padding:2px 6px;border-radius:20px">${ad.plan}</span></div><div style="font-size:12px;color:#555">${ad.description||""}</div><div style="margin-top:4px;color:#0b7a4b;font-weight:700;font-size:12px">Voir l'offre →</div></div></a>`;
        cards[i]?.insertAdjacentElement("afterend", el);
        try { updateDoc(doc(db, "gt_ads", ad.id), { views: increment(1) }); } catch{}
      }
    };
    setTimeout(tryInject, 2000);
    setTimeout(tryInject, 5000);

    document.addEventListener("click", (e) => {
      const a = e.target.closest('a[href*="wa.me"], a[href*="facebook"]');
      if (!a) return;
      const adId = ads.find(x => a.href.includes(x.link))?.id || ads[0]?.id;
      if (adId) try { updateDoc(doc(db, "gt_ads", adId), { clicks: increment(1) }); } catch{}
    });

  } catch(e) { console.log("GT-ADS error", e); }
}
loadAds();
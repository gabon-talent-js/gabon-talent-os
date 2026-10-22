// gt-ads.js - Gabon Talent OS - Version Finale FORCÉE
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, getDocs, query, where, doc, updateDoc, increment } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyATIRQfPyhvPFp1dIvil3zk4axejA_1q70",
  authDomain: "gabon-talent-os.firebaseapp.com",
  projectId: "gabon-talent-os"
};

const app = initializeApp(firebaseConfig, "gt-ads-force");
const db = getFirestore(app);

async function loadAds() {
  console.log("GT-ADS: chargement...");
  try {
    const q = query(collection(db, "gt_ads"), where("status", "==", "active"));
    const snap = await getDocs(q);
    const ads = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    console.log("GT-ADS: trouvées", ads.length, ads);
    if (!ads.length) return;

    // FORCE AFFICHAGE BANNIÈRE EN HAUT, PEU IMPORTE LA PAGE
    const topAd = ads[0];
    const banner = document.createElement("div");
    banner.innerHTML = `<a href="${topAd.link}" target="_blank" style="display:flex;align-items:center;gap:12px;background:#0f2a1d;color:#fff;padding:14px 16px;text-decoration:none;margin:0;position:relative;z-index:9999"><img src="${topAd.imageUrl}" style="width:50px;height:50px;border-radius:10px;object-fit:cover;"><div style="flex:1"><div style="font-weight:800">${topAd.title} <span style="background:#f2b705;color:#000;padding:2px 8px;border-radius:20px;font-size:10px">SPONSORISÉ</span></div><div style="font-size:12px;opacity:.9">${topAd.description||""}</div></div><div style="background:#0b7a4b;padding:8px 14px;border-radius:8px;font-weight:700">Voir</div></a>`;
    document.body.prepend(banner);
    
    // Compte la vue
    try { await updateDoc(doc(db, "gt_ads", topAd.id), { views: increment(1) }); console.log("GT-ADS: vue comptée"); } catch(e){ console.log("GT-ADS vue erreur", e); }
  } catch(e) {
    console.error("GT-ADS ERREUR FATALE:", e);
  }
}
loadAds();
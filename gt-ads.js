// gt-ads.js - Gabon Talent OS - Version Finale Gratuite - 2026
// Lit la collection gt_ads (status=active) et affiche les pubs
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, getDocs, query, where, doc, updateDoc, increment } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyATIRQfPyhvPFp1dIvil3zk4axejA_1q70",
  authDomain: "gabon-talent-os.firebaseapp.com",
  projectId: "gabon-talent-os"
};

let db;
try {
  const app = initializeApp(firebaseConfig, "gt-ads-app");
  db = getFirestore(app);
} catch(e) {
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
}

async function loadAds() {
  try {
    const q = query(collection(db, "gt_ads"), where("status", "==", "active"));
    const snap = await getDocs(q);
    const ads = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    if (!ads.length) return;
    renderAds(ads);
  } catch(e) {
    console.log("GT-ADS error:", e);
  }
}

function renderAds(ads) {
  // 1. Bannière TOP en haut du site
  const topAd = ads.find(a => a.plan === "ELITE") || ads[0];
  if (topAd) {
    const banner = document.createElement("div");
    banner.id = "gt-ads-banner";
    banner.innerHTML = `
      <a href="${topAd.link}" target="_blank" rel="noopener" data-ad-id="${topAd.id}" class="gt-ad-click" style="display:flex;align-items:center;gap:12px;background:#0f2a1d;color:#fff;padding:12px 16px;text-decoration:none;border-radius:12px;margin:12px auto;max-width:1100px;">
        <img src="${topAd.imageUrl}" style="width:48px;height:48px;border-radius:10px;object-fit:cover;">
        <div style="flex:1;min-width:0">
          <div style="font-weight:800;font-size:14px;line-height:1.2">${escapeHtml(topAd.title)} <span style="background:#f2b705;color:#0f2a1d;padding:2px 6px;border-radius:20px;font-size:10px;margin-left:6px">SPONSORISÉ</span></div>
          <div style="font-size:12px;opacity:.8;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${escapeHtml(topAd.description||"")}</div>
        </div>
        <div style="background:#0b7a4b;color:#fff;padding:6px 12px;border-radius:8px;font-weight:700;font-size:12px">Voir</div>
      </a>
    `;
    const target = document.querySelector("header") || document.body;
    target.insertAdjacentElement("afterend", banner);
    trackView(topAd.id);
  }

  // 2. Injecte une pub tous les 6 offres dans la liste
  const inject = () => {
    const list = document.getElementById("offres") || document.querySelector(".jobs-list") || document.getElementById("jobs") || document.querySelector("main");
    if (!list) return;
    const jobCards = list.children;
    if (jobCards.length < 2) return;

    let adIndex = 0;
    for (let i = 5; i < jobCards.length; i += 6) {
      if (adIndex >= ads.length) adIndex = 0;
      const ad = ads[adIndex++];
      const card = document.createElement("div");
      card.className = "card";
      card.style.cssText = "border:2px dashed #f2b705;background:#fffdf0;";
      card.innerHTML = `
        <a href="${ad.link}" target="_blank" rel="noopener" data-ad-id="${ad.id}" class="gt-ad-click" style="text-decoration:none;color:inherit;display:flex;gap:12px">
          <img src="${ad.imageUrl}" style="width:64px;height:64px;border-radius:12px;object-fit:cover;">
          <div style="flex:1"><div style="font-weight:800">${escapeHtml(ad.title)} <span style="font-size:10px;background:#0f2a1d;color:#fff;padding:2px 6px;border-radius:20px">PUB ${escapeHtml(ad.plan)}</span></div><div style="font-size:12px;color:#555;margin-top:2px">${escapeHtml(ad.description||"")}</div><div style="margin-top:6px;font-size:12px;font-weight:700;color:#0b7a4b">Postuler via WhatsApp →</div></div>
        </a>
      `;
      if (jobCards[i]) jobCards[i].insertAdjacentElement("afterend", card);
      trackView(ad.id);
    }
  };

  // Essaie plusieurs
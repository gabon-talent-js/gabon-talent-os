import { getFirestore, collection, getDocs, query, where, orderBy } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

let db;
try {
  const app = getApp();
  db = getFirestore(app);
  console.log("[GT-ADS] Firestore connecté");
} catch(e){
  console.error("[GT-ADS] App Firebase non trouvée", e);
}

let ACTIVE_ADS = [];

async function loadAds() {
  if(!db) return;
  try {
    const q = query(collection(db, "gt_ads"), where("status", "==", "active"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    ACTIVE_ADS = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    console.log("[GT-ADS] Ads chargées:", ACTIVE_ADS.length);
  } catch (e) {
    console.error("[GT-ADS] Erreur load", e);
  }
}

function createAdCard(ad){
  const div = document.createElement('div');
  div.className = 'ad-card-premium';
  div.innerHTML = `
    <div style="border:2px solid #10b981; border-radius:16px; padding:16px; margin:16px 0; background:linear-gradient(135deg,#ecfdf5,#f0fdfa); position:relative;">
      <span style="position:absolute; top:-10px; left:16px; background:#10b981; color:white; font-size:10px; padding:2px 8px; border-radius:20px; font-weight:bold;">SPONSORISÉ • ${ad.plan || 'BASIC'}</span>
      <div style="display:flex; gap:12px; align-items:center; margin-top:8px;">
        <img src="${ad.imageUrl || 'https://via.placeholder.com/80'}" style="width:80px; height:80px; border-radius:12px; object-fit:cover;">
        <div style="flex:1;">
          <h3 style="margin:0; font-size:16px; font-weight:bold;">${ad.title}</h3>
          <p style="margin:4px 0; font-size:13px; color:#444;">${ad.description || ''}</p>
          <a href="${ad.link}" target="_blank" style="display:inline-block; margin-top:6px; background:#111; color:white; padding:6px 14px; border-radius:8px; font-size:12px; text-decoration:none;">Voir l'offre →</a>
        </div>
      </div>
    </div>
  `;
  // Incrément impression simple
  div.querySelector('a').addEventListener('click', ()=>{ /* TODO: update click count */ });
  return div;
}

function injectAdsIntoJobs(){
  const originalRender = window.renderJobs;
  if(!originalRender) {
    console.log("[GT-ADS] renderJobs pas trouvé, retry dans 1s");
    setTimeout(injectAdsIntoJobs, 1000);
    return;
  }
  window.renderJobs = function(jobs){
    originalRender(jobs);
    if(ACTIVE_ADS.length === 0) return;
    const container = document.getElementById('jobs-list') || document.querySelector('[id*="job"]') || document.body;
    const jobCards = container.querySelectorAll(':scope > div');
    // Fallback simple : on cherche les cards emploi
    const list = document.getElementById('jobs-list');
    if(!list) return;
    let adIndex = 0;
    const cards = list.children;
    for(let i=3; i < cards.length; i+=4){
      if(adIndex >= ACTIVE_ADS.length) break;
      const adCard = createAdCard(ACTIVE_ADS[adIndex % ACTIVE_ADS.length]);
      if(cards[i]) cards[i].after(adCard);
      adIndex++;
    }
    console.log("[GT-ADS] Pubs injectées");
  }
  // Force re-render si déjà des jobs affichés
  if(window.lastJobs) window.renderJobs(window.lastJobs);
}

await loadAds();
injectAdsIntoJobs();
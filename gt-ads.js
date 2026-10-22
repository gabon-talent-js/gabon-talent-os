// GT-ADS V2 - Injection simple et robuste
import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDf6CpRIt9x1x2a2k0y9bK5cJq1aK8vY9w",
  authDomain: "gabon-talent-os.firebaseapp.com",
  projectId: "gabon-talent-os",
  storageBucket: "gabon-talent-os.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

let app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
let db = getFirestore(app);

async function showAds(){
  try{
    const snap = await getDocs(query(collection(db,"gt_ads"), where("status","==","active")));
    const ads = snap.docs.map(d=>d.data());
    console.log("[GT-ADS V2] Trouvé", ads.length, "pubs");
    if(ads.length===0) return;
    
    setTimeout(()=>{
      const jobContainer = document.getElementById('jobs-list') || document.querySelector('main') || document.body;
      const jobs = jobContainer.children;
      if(jobs.length < 3) return;
      
      const ad = ads[0];
      const div = document.createElement('div');
      div.innerHTML = `
        <div style="border:2px solid #10b981;border-radius:16px;padding:16px;margin:20px 0;background:#ecfdf5;">
          <span style="background:#10b981;color:white;font-size:10px;padding:3px 10px;border-radius:20px;font-weight:bold;">SPONSORISÉ</span>
          <div style="display:flex;gap:12px;margin-top:10px;align-items:center">
            <img src="${ad.imageUrl}" style="width:90px;height:90px;border-radius:12px;object-fit:cover">
            <div>
              <h3 style="margin:0;font-weight:bold">${ad.title}</h3>
              <p style="margin:4px 0;font-size:13px">${ad.description||''}</p>
              <a href="${ad.link}" target="_blank" style="background:black;color:white;padding:6px 14px;border-radius:8px;text-decoration:none;font-size:13px;display:inline-block;margin-top:4px">Voir →</a>
            </div>
          </div>
        </div>`;
      if(jobs[2]) jobs[2].after(div);
    }, 2000);
  }catch(e){ console.error("[GT-ADS V2] erreur", e); }
}
showAds();
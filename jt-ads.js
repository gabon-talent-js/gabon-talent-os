// GT Ads Pro - Gabon Talent OS - v1.2
(function(){
  window.gtActiveAds = [];
  async function loadGtAds(){
    try{
      if(!window.fb || !window.fb.db){ setTimeout(loadGtAds,1500); return; }
      const {collection,query,where,getDocs} = window.fb.fs;
      const q = query(collection(window.fb.db, "gt_ads"), where("status","==","active"));
      const snap = await getDocs(q);
      window.gtActiveAds = snap.docs.map(d=>({id:d.id, ...d.data()}));
      if(window.gtActiveAds.length>0 && typeof renderJobsPatched==='function'){ try{ renderJobsPatched(); }catch(e){} }
    }catch(e){ setTimeout(loadGtAds,3000); }
  }
  window.incrementAdClick = async (adId) => { console.log("Clic:",adId); };
  function renderJobsPatched(){
    try{
      if(typeof filtered!=='function' || typeof vcard!=='function') return;
      const all=allJobs(), l=filtered();
      const feat=all.filter(j=>j.badge==="Featured"||j.badge==="New").slice(0,8);
      const urg=all.filter(j=>j.badge==="Urgent");
      document.getElementById("hs1").innerHTML=feat.map(card).join(""); document.getElementById("secFeat").hidden=!feat.length;
      document.getElementById("hs2").innerHTML=urg.map(card).join(""); document.getElementById("secUrg").hidden=!urg.length;
      let html=""; if(!l.length){ html='<div class="empty">Aucune offre</div>'; } else {
        l.forEach((job,i)=>{ html+=vcard(job);
          if((i+1)%3===0 && window.gtActiveAds && window.gtActiveAds.length>0){
            const ad=window.gtActiveAds[Math.floor(Math.random()*window.gtActiveAds.length)];
            html+=`<div class="job" style="border:2px solid #00ffa3;background:linear-gradient(135deg,#181a20 0%,#1e2a24 100%);border-radius:16px;padding:16px"><span style="font-size:10px;background:#00ffa3;color:#000;padding:4px 10px;border-radius:20px;font-weight:900">SPONSORISÉ • ${ad.province||'Gabon'}</span><h3 style="margin:12px 0 6px;color:#fff">${ad.title}</h3><a href="${ad.link}" target="_blank" style="display:block;background:#00ffa3;color:#000;text-align:center;padding:12px;border-radius:12px;font-weight:800;text-decoration:none;margin-top:10px">Voir l'offre →</a></div>`;
          }
        });
      }
      document.getElementById("grid").innerHTML=html;
      document.getElementById("count").textContent=`(${l.length})`;
    }catch(e){}
  }
  function initPatch(){ if(typeof window.renderJobs==='function'){ window.renderJobs=renderJobsPatched; window.renderJobsPatched=renderJobsPatched; } else { setTimeout(initPatch,1000); } }
  setTimeout(loadGtAds,2000); setTimeout(initPatch,3500);
})();
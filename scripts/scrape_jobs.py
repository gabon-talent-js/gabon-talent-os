import json
import re
import csv
import io
import requests
from datetime import datetime

# --- CONFIG TON SHEET ---
SHEET_ID = "1-4W1M0bCJLSQzLvzBtyJQhrprBPqWw9Aw0yS8UoNE6E"
CSV_URL = f"https://docs.google.com/spreadsheets/d/{SHEET_ID}/export?format=csv"

def get_from_sheet():
    jobs = []
    try:
        print(f"Lecture de {CSV_URL}")
        r = requests.get(CSV_URL, timeout=30)
        r.raise_for_status()
        
        # Lecture CSV robuste (gère les virgules dans les descriptions)
        reader = csv.DictReader(io.StringIO(r.text))
        print(f"Colonnes trouvées: {reader.fieldnames}")

        for i, row in enumerate(reader):
            # On nettoie et on accepte title/Title/poste etc.
            def get_val(*keys):
                for k in keys:
                    for real_key in row.keys():
                        if real_key.lower().strip() == k.lower():
                            return row[real_key].strip()
                return ""

            title = get_val('title', 'poste', 'titre')
            if not title:
                continue

            jobs.append({
                "id": i + 1,
                "title": title,
                "company": get_val('company', 'entreprise', 'société') or "Non précisé",
                "city": get_val('city', 'ville', 'localisation') or "Libreville",
                "salary": get_val('salary', 'salaire') or "À négocier",
                "source": get_val('source') or "Sheet",
                "tag": (get_val('tag') or "NOUVEAU").upper(),
                "link": get_val('link', 'lien', 'url') or "#",
                "desc": get_val('desc', 'description') or ""
            })
        print(f"✅ {len(jobs)} offres lues depuis Google Sheet")
    except Exception as e:
        print(f"❌ Erreur lecture Sheet: {e}")
    return jobs

def update_html(jobs):
    with open('index.html', 'r', encoding='utf-8') as f:
        html = f.read()

    jobs_js = json.dumps(jobs, ensure_ascii=False, indent=2)
    # Remplace const JOBS = [...];
    new_html = re.sub(r'const JOBS = \[.*?\];', f'const JOBS = {jobs_js};', html, flags=re.DOTALL)
    
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(new_html)
    print("✅ index.html mis à jour")

if __name__ == "__main__":
    jobs = get_from_sheet()

    # Si Sheet vide, on garde au moins une offre pour ne pas casser le site
    if not jobs:
        print("Sheet vide ou non public, fallback")
        jobs = [{
            "id": 1, "title": "Développeur Full-Stack JS", "company": "Gabon Talent JS",
            "city": "Libreville", "salary": "800k - 1.2M", "source": "LinkedIn",
            "tag": "NOUVEAU", "desc": "React / Supabase", "link": "https://gabon-talent-js.github.io/gabon-talent-os/"
        }]

    # Déduplication par lien
    seen = set()
    final_jobs = []
    for j in jobs:
        key = j['link'].lower().strip()
        if key not in seen:
            seen.add(key)
            j['updated'] = datetime.now().isoformat()
            final_jobs.append(j)

    # Sauvegarde jobs.json
    with open('jobs.json', 'w', encoding='utf-8') as f:
        json.dump(final_jobs, f, ensure_ascii=False, indent=2)

    update_html(final_jobs)
    print(f"🚀 TERMINÉ: {len(final_jobs)} offres publiées sur Gabon Talent OS")

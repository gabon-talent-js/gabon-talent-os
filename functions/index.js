const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const { PDFDocument, rgb, StandardFonts } = require("pdf-lib");
const nodemailer = require("nodemailer");

admin.initializeApp();
const db = admin.firestore();

function getTransport() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD
    }
  });
}

exports.creerPaiement = onRequest({ cors: true }, async (req, res) => {
  try {
    const { type, nom, email, poste } = req.body;
    if (!email ||!nom) return res.status(400).json({ error: "manquant" });
    const commandeId = "CMD_" + Date.now();
    await db.collection("commandes").doc(commandeId).set({
      id: commandeId, type: type || "EXPRESS", nom, email, poste: poste || "Poste",
      statut: "en_attente_paiement",
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    res.json({ commandeId });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

exports.chariowWebhook = onRequest({ cors: true }, async (req, res) => {
  try {
    const data = req.body;
    const ref = data.reference || data.ref || data.metadata?.ref || data.custom_data?.ref;
    const emailClient = data.email || data.customer_email || data.metadata?.email;
    let commandeId = ref; let commande = null;
    if (commandeId) {
      const snap = await db.collection("commandes").doc(commandeId).get();
      if (snap.exists) commande = snap.data();
    }
    if (!commande && emailClient) {
      const q = await db.collection("commandes").where("email","==",emailClient).where("statut","==","en_attente_paiement").orderBy("createdAt","desc").limit(1).get();
      if (!q.empty) { commande = q.docs[0].data(); commandeId = commande.id; }
    }
    if (!commande) return res.status(200).send("Commande non trouvée");
    if (commande.statut === "livre") return res.status(200).send("Déjà livré");

    const contenuCV = await genererCVavecGroq(commande);
    const pdfBytes = await genererPDF(contenuCV, commande);

    const bucket = admin.storage().bucket();
    const fileName = `livraisons/${commandeId}.pdf`;
    const file = bucket.file(fileName);
    await file.save(Buffer.from(pdfBytes), { contentType: "application/pdf" });
    await file.makePublic();
    const urlPDF = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

    const transporter = getTransport();
    await transporter.sendMail({
      from: `"Gabon Talent OS" <${process.env.GMAIL_USER}>`,
      to: commande.email,
      subject: `Votre CV ${commande.type} est prêt! 🇬🇦`,
      html: `<h2>Bonjour ${commande.nom},</h2><p>Votre CV pour <b>${commande.poste}</b> est prêt.</p><p><a href="${urlPDF}" style="background:#0b7a4b;color:#fff;padding:14px 22px;border-radius:8px;text-decoration:none">📄 Télécharger mon CV PDF</a></p>`,
      attachments: [{ filename: `CV-${commande.nom}.pdf`, content: Buffer.from(pdfBytes) }]
    });

    await db.collection("livraisons").doc(commandeId).set({
      commandeId, nom: commande.nom, email: commande.email, type: commande.type, poste: commande.poste,
      urlPDF, statut: "livre", dateLivraison: admin.firestore.FieldValue.serverTimestamp()
    });
    await db.collection("commandes").doc(commandeId).update({ statut: "livre", urlPDF });
    res.status(200).send("Livraison OK");
  } catch (e) { console.error(e); res.status(500).send(e.message); }
});

async function genererCVavecGroq(commande) {
  try {
    const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${process.env.GROQ_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: "Tu es expert RH Gabon. Génère un CV pro concis en français." },
          { role: "user", content: `CV pour ${commande.nom}, poste ${commande.poste}, type ${commande.type}. Structure: Profil, Expériences, Formations, Compétences.` }
        ]
      })
    });
    const d = await r.json();
    return d.choices?.[0]?.message?.content || `CV de ${commande.nom}`;
  } catch (e) { return `CV de ${commande.nom} - ${commande.poste}`; }
}

async function genererPDF(texte, commande) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  page.drawText(`CV - ${commande.nom}`, { x: 50, y: 800, size: 18, font: fontBold, color: rgb(0.04, 0.47, 0.29) });
  page.drawText(`Poste: ${commande.poste}`, { x: 50, y: 780, size: 10, font });
  const lignes = texte.match(/.{1,85}/g) || [texte];
  let y = 750; for (const l of lignes.slice(0,50)) { if (y<50) break; page.drawText(l, { x: 50, y, size: 10, font }); y-=14; }
  return await pdfDoc.save();
}

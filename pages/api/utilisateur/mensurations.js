import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Méthode non autorisée" });
  }

  const {
    utilisateurId,
    taille,
    hanches,
    cuisses,
    bras,
    poitrine,
    mollets,
    masseGrasse,
    tailleAbdo,
  } = req.body;

  if (!utilisateurId) {
    return res.status(400).json({ message: "ID utilisateur manquant" });
  }

  try {
    const nouvelleMensuration = await prisma.mensurations.create({
      data: {
        utilisateurId,
        taille: taille ? parseInt(taille) : null,
        hanches: hanches ? parseInt(hanches) : null,
        cuisses: cuisses ? parseInt(cuisses) : null,
        bras: bras ? parseInt(bras) : null,
        poitrine: poitrine ? parseInt(poitrine) : null,
        mollets: mollets ? parseInt(mollets) : null,
        tailleAbdo: tailleAbdo ? parseInt(tailleAbdo) : null,
        masseGrasse: masseGrasse ? parseFloat(masseGrasse) : null,
      },
    });

    res.status(200).json({ mensurations: nouvelleMensuration });
  } catch (error) {
    console.error("Erreur mensurations :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
}

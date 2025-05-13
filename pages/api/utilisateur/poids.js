import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Méthode non autorisée" });
  }

  const { utilisateurId, poids } = req.body;

  if (!utilisateurId || !poids) {
    return res.status(400).json({ message: "Paramètres manquants" });
  }

  try {
    // 1. Met à jour le poids actuel
    await prisma.user.update({
        where: { id: utilisateurId },
      data: { poids: parseFloat(poids) }
    });

    // 2. Ajoute dans l’historique
    await prisma.historiquePoids.create({
      data: {
        utilisateurId,
        poids: parseFloat(poids)
      }
    });

    res.status(200).json({ message: "Poids mis à jour avec historique enregistré" });
  } catch (error) {
    console.error("Erreur API poids :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
}

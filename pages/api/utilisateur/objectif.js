import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Méthode non autorisée" });
  }

  const { utilisateurId, objectifPoids } = req.body;

  if (!utilisateurId || !objectifPoids) {
    return res.status(400).json({ message: "Champs requis manquants" });
  }

  try {
    await prisma.user.update({
        where: { id: utilisateurId },
      data: { objectifPoids: parseFloat(objectifPoids) },
    });

    res.status(200).json({ message: "Objectif de poids mis à jour avec succès" });
  } catch (error) {
    console.error("Erreur mise à jour de l'objectif :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
}

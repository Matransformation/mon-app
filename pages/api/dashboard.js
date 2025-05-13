// pages/api/dashboard.js
import prisma from "../../lib/prisma";

export default async function handler(req, res) {
  const { utilisateurId } = req.query;

  if (!utilisateurId) {
    return res.status(400).json({ message: "ID utilisateur requis" });
  }

  try {
    const utilisateur = await prisma.user.findUnique({
      where: { id: utilisateurId },
      include: {
        historiquePoids: {
          orderBy: { date: "asc" }
        },
        mensurations: {
          orderBy: { date: "desc" }
        }
      }
    });

    if (!utilisateur) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    res.status(200).json({ utilisateur });
  } catch (error) {
    console.error("Erreur API /dashboard :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
}

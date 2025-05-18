// pages/api/utilisateur/mensurations/[id].js
import prisma from "../../../../lib/prisma";

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === "DELETE") {
    try {
      // Utiliser le bon modèle : mensurations (pluriel)
      await prisma.mensurations.delete({
        where: { id },
      });
      return res.status(204).end();
    } catch (error) {
      console.error("Erreur suppression mensuration :", error);
      return res.status(500).json({ message: "Erreur serveur" });
    }
  }

  return res.status(405).json({ message: "Méthode non autorisée" });
}

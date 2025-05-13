import prisma from "../../../../lib/prisma";

export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ message: "ID manquant." });
  }

  if (req.method === "DELETE") {
    try {
      await prisma.repasJournalier.delete({
        where: { id },
      });

      return res.status(200).json({ message: "Repas supprimé avec succès." });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erreur serveur lors de la suppression du repas." });
    }
  } else {
    return res.status(405).json({ message: "Méthode non autorisée." });
  }
}

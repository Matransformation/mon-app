import prisma from "../../../../lib/prisma";

export default async function handler(req, res) {
  const { poidsId } = req.query;

  if (req.method !== "DELETE") {
    return res.status(405).json({ message: "Méthode non autorisée" });
  }

  try {
    await prisma.historiquePoids.delete({
      where: { id: poidsId },
    });
    res.status(200).json({ message: "Entrée supprimée" });
  } catch (error) {
    console.error("Erreur suppression :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
}

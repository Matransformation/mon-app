// File: pages/api/menu/repas/[id]/accompagnements/[ingredientId].js
import prisma from "../../../../../../lib/prisma";

export default async function handler(req, res) {
  const { id: menuId, ingredientId } = req.query;

  if (req.method === "DELETE") {
    try {
      const result = await prisma.accompagnement.deleteMany({
        where: { menuId, ingredientId },
      });

      if (result.count === 0) {
        return res.status(404).json({ message: "Aucun accompagnement trouvé à supprimer" });
      }

      return res.status(200).json({ message: "Accompagnement supprimé" });
    } catch (err) {
      console.error(
        `DELETE /api/menu/repas/${menuId}/accompagnements/${ingredientId} :`,
        err
      );
      return res
        .status(500)
        .json({ message: "Erreur interne lors de la suppression" });
    }
  }

  res.setHeader("Allow", ["DELETE"]);
  return res.status(405).end(`Méthode ${req.method} non autorisée`);
}

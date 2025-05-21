// File: pages/api/menu/repas/[id].js
import prisma from "../../../../lib/prisma";

export default async function handler(req, res) {
  const { id } = req.query;
  const menuId = id;

  // GET : récupérer un seul repas
  if (req.method === "GET") {
    try {
      const repas = await prisma.menuJournalier.findUnique({
        where: { id: menuId },
        include: {
          recette: {
            select: {
              id: true,
              name: true,
              calories: true,
              protein: true,
              fat: true,
              carbs: true,
              photoUrl: true,
              ingredients: {
                include: { ingredient: { include: { sideTypes: true } } },
              },
            },
          },
          accompagnements: {
            include: { ingredient: { include: { sideTypes: true } } },
          },
        },
      });
      if (!repas) return res.status(404).json({ message: "Repas non trouvé" });
      return res.status(200).json(repas);
    } catch (err) {
      console.error("GET /api/menu/repas/[id] :", err);
      return res.status(500).json({ message: "Erreur serveur" });
    }
  }

  // PUT : mise à jour partielle : on ne touche à recetteId que si présent
  if (req.method === "PUT") {
    const { recetteId, accompagnements = [] } = req.body;

    try {
      // 0) si recetteId est défini, on l'update
      if (req.body.hasOwnProperty("recetteId")) {
        await prisma.menuJournalier.update({
          where: { id: menuId },
          data: { recetteId: recetteId || null },
        });
      }

      // 1) récupérer les anciens accompagnements
      const anciens = await prisma.accompagnement.findMany({
        where: { menuId },
      });

      // 2) supprimer ceux qui ne figurent plus
      const nouveauxIds = accompagnements.map((a) => a.id);
      const toDelete = anciens
        .filter((a) => !nouveauxIds.includes(a.ingredientId))
        .map((a) => a.ingredientId);
      if (toDelete.length) {
        await prisma.accompagnement.deleteMany({
          where: {
            menuId,
            ingredientId: { in: toDelete },
          },
        });
      }

      // 3) upsert pour les autres
      for (const a of accompagnements) {
        await prisma.accompagnement.upsert({
          where: { menuId_ingredientId: { menuId, ingredientId: a.id } },
          update: { quantity: a.quantity },
          create: {
            menuId,
            ingredientId: a.id,
            quantity: a.quantity,
          },
        });
      }

      // 4) renvoyer la version à jour
      const updated = await prisma.menuJournalier.findUnique({
        where: { id: menuId },
        include: {
          recette: {
            select: {
              id: true,
              name: true,
              calories: true,
              protein: true,
              fat: true,
              carbs: true,
              photoUrl: true,
              ingredients: {
                include: { ingredient: { include: { sideTypes: true } } },
              },
            },
          },
          accompagnements: {
            include: { ingredient: { include: { sideTypes: true } } },
          },
        },
      });

      return res.status(200).json(updated);
    } catch (err) {
      console.error("PUT /api/menu/repas/[id] :", err);
      return res.status(500).json({ message: "Erreur mise à jour" });
    }
  }

  // DELETE : supprimer le repas
  if (req.method === "DELETE") {
    try {
      await prisma.menuJournalier.delete({ where: { id: menuId } });
      return res.status(200).json({ message: "Repas supprimé" });
    } catch (err) {
      console.error("DELETE /api/menu/repas/[id] :", err);
      return res.status(500).json({ message: "Erreur suppression" });
    }
  }

  res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
  return res.status(405).end(`Méthode ${req.method} non autorisée`);
}

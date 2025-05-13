// pages/api/menu/repas/[id].js

import prisma from "../../../../lib/prisma";

export default async function handler(req, res) {
  const { id } = req.query;

  // GET : récupérer un seul repas avec ses accompagnements et sideTypes des ingrédients
  if (req.method === "GET") {
    try {
      const repas = await prisma.menuJournalier.findUnique({
        where: { id },
        include: {
          recette: {
            select: {
              id:       true,
              name:     true,
              calories: true,
              protein:  true,
              fat:      true,
              carbs:    true,
              photoUrl: true,
              ingredients: {
                include: {
                  ingredient: {
                    include: {
                      // <—— on inclut sideTypes ici
                      sideTypes: true
                    }
                  }
                }
              },
            },
          },
          accompagnements: {
            include: {
              ingredient: {
                include: {
                  // pour les accompagnements, on peut en faire de même
                  sideTypes: true
                }
              }
            }
          },
        },
      });
      if (!repas) {
        return res.status(404).json({ message: "Repas non trouvé" });
      }
      return res.status(200).json(repas);
    } catch (err) {
      console.error("GET /api/menu/repas/[id] :", err);
      return res.status(500).json({ message: "Erreur serveur" });
    }
  }

  // PUT : mettre à jour la recette et les accompagnements
  if (req.method === "PUT") {
    const { recetteId, accompagnements } = req.body;
    try {
      const updated = await prisma.menuJournalier.update({
        where: { id },
        data: {
          recetteId: recetteId || undefined,
          accompagnements: {
            // Supprime les anciens accompagnements
            deleteMany: {},
            // Crée les nouveaux accompagnements avec quantity
            create: accompagnements.map((a) => ({
              ingredient: { connect: { id: a.id } },
              quantity: a.quantity,
            })),
          },
        },
        include: {
          accompagnements: {
            include: {
              ingredient: {
                include: { sideTypes: true }
              }
            }
          },
        },
      });
      return res.status(200).json(updated);
    } catch (err) {
      console.error("PUT /api/menu/repas/[id] :", err);
      return res.status(500).json({ message: "Erreur mise à jour" });
    }
  }

  // DELETE : supprimer ce repas du menu
  if (req.method === "DELETE") {
    try {
      await prisma.menuJournalier.delete({ where: { id } });
      return res.status(200).json({ message: "Repas supprimé" });
    } catch (err) {
      console.error("DELETE /api/menu/repas/[id] :", err);
      return res.status(500).json({ message: "Erreur suppression" });
    }
  }

  // Méthode non autorisée
  res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
  return res.status(405).end(`Méthode ${req.method} non autorisée`);
}

import prisma from "../../../../lib/prisma";
import { startOfWeek } from 'date-fns';

export default async function handler(req, res) {
  const { userId } = req.query;
  // Parse weekStart from query or default to current week
  const weekStart = req.query.weekStart
    ? new Date(req.query.weekStart)
    : startOfWeek(new Date(), { weekStartsOn: 1 });
  // Calculate end of week (exclusive)
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  if (req.method === "GET") {
    try {
      // Retrieve menus for the specified week range
      let menu = await prisma.menuJournalier.findMany({
        where: {
          userId,
          date: {
            gte: weekStart,
            lt: weekEnd,
          },
        },
        include: {
          recette: {
            include: {
              ingredients: {
                include: {
                  ingredient: { include: { sideTypes: true } }
                }
              },
              allowedSides: { select: { sideType: true } },
            },
          },
          accompagnements: {
            include: {
              ingredient: { include: { sideTypes: true } }
            }
          },
        },
      });

      // If no menus exist for this week, generate default entries
      if (menu.length === 0) {
        const jours = Array.from({ length: 7 }).map((_, i) => ({
          userId,
          date: new Date(weekStart.getTime() + i * 24 * 60 * 60 * 1000),
          // You can set a default recetteId or leave null
        }));
        // Create entries
        await prisma.menuJournalier.createMany({
          data: jours,
          skipDuplicates: true,
        });
        // Re-fetch with includes
        menu = await prisma.menuJournalier.findMany({
          where: {
            userId,
            date: { gte: weekStart, lt: weekEnd },
          },
          include: {
            recette: {
              include: {
                ingredients: { include: { ingredient: { include: { sideTypes: true } } } },
                allowedSides: { select: { sideType: true } },
              },
            },
            accompagnements: { include: { ingredient: { include: { sideTypes: true } } } },
          },
        });
      }

      return res.status(200).json(menu);
    } catch (err) {
      console.error("GET /api/menu/[userId] :", err);
      return res.status(500).json({ message: "Erreur serveur" });
    }
  }

  res.setHeader("Allow", ["GET"]);
  return res.status(405).end(`Méthode ${req.method} non autorisée`);
}

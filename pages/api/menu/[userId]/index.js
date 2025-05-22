import prisma from "../../../../lib/prisma";
import { startOfWeek } from 'date-fns';

export default async function handler(req, res) {
  const { userId } = req.query;
  // userId is a string (e.g., UUID), use it directly
  const uid = userId;

  // Parse weekStart from query or default to current week
  const weekStart = req.query.weekStart
    ? new Date(req.query.weekStart)
    : startOfWeek(new Date(), { weekStartsOn: 1 });
  // Calculate end of week (exclusive)
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  if (req.method === "GET") {
    try {
      console.log('Fetching menu for user', uid, 'from', weekStart.toISOString(), 'to', weekEnd.toISOString());
      // Retrieve menus for the specified week range
      let menu = await prisma.menuJournalier.findMany({
        where: {
          userId: uid,
          date: { gte: weekStart, lt: weekEnd },
        },
        include: {
          recette: {
            include: {
              ingredients: {
                include: { ingredient: { include: { sideTypes: true } } }
              },
              allowedSides: { select: { sideType: true } },
            },
          },
          accompagnements: {
            include: { ingredient: { include: { sideTypes: true } } }
          },
        },
      });
      console.log('Menus found:', menu.length);

      // If no menus exist for this week, generate default entries
      if (menu.length === 0) {
        // Determine a default recetteId (first one)
        const defaultRecette = await prisma.recette.findFirst();
        if (!defaultRecette) {
          console.error('No default recette found. Cannot generate menu entries.');
          return res.status(500).json({ message: 'Aucune recette disponible pour génération automatique' });
        }
        const jours = Array.from({ length: 7 }).map((_, i) => ({
          userId: uid,
          date: new Date(weekStart.getTime() + i * 24 * 60 * 60 * 1000),
          recetteId: defaultRecette.id,
        }));
        console.log('Generating entries:', jours);
        try {
        await prisma.menuJournalier.createMany({ data: jours });
      } catch(createErr) {
        console.error('createMany error:', createErr);
      }
        // Re-fetch with includes
        menu = await prisma.menuJournalier.findMany({
          where: { userId: uid, date: { gte: weekStart, lt: weekEnd } },
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
        console.log('Menus after generation:', menu.length);
      }

      return res.status(200).json(menu);
    } catch (err) {
      console.error("GET /api/menu/[userId] error:", err);
      return res.status(500).json({ message: "Erreur serveur", error: err.message });
    }
  }

  res.setHeader("Allow", ["GET"]);
  return res.status(405).end(`Méthode ${req.method} non autorisée`);
}

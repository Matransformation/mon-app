// pages/api/menu/[userId]/index.js
import prisma from "../../../../lib/prisma";
import { startOfWeek } from "date-fns";
import { generateWeeklyMenu } from "../../../../lib/menuGenerator";

export default async function handler(req, res) {
  const { userId } = req.query;
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Méthode ${req.method} non autorisée`);
  }

  try {
    const weekStart = req.query.weekStart
      ? new Date(req.query.weekStart)
      : startOfWeek(new Date(), { weekStartsOn: 1 });
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    console.log(
      `Fetching menu for user ${userId} from ${weekStart.toISOString()} to ${weekEnd.toISOString()}`
    );

    let menu = await prisma.menuJournalier.findMany({
      where: { userId, date: { gte: weekStart, lt: weekEnd } },
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
    console.log(`Menus found: ${menu.length}`);

    if (menu.length < 7) {
      console.log(`Only ${menu.length} day(s) found, generating missing days…`);
      await generateWeeklyMenu(userId, weekStart.toISOString());
      console.log("✅ Génération OK, re-fetching menu…");

      menu = await prisma.menuJournalier.findMany({
        where: { userId, date: { gte: weekStart, lt: weekEnd } },
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
      console.log(`Menus after generation: ${menu.length}`);
    }

    return res.status(200).json(menu);
  } catch (err) {
    console.error("GET /api/menu/[userId] error:", err);
    return res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
}

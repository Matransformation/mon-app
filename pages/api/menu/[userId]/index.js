// pages/api/menu/[userId]/index.js

import prisma from "../../../../lib/prisma";
import { startOfWeek, addDays } from "date-fns";
import { generateWeeklyMenu } from "../../../../lib/menuGenerator";

export default async function handler(req, res) {
  const { userId } = req.query;
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Méthode ${req.method} non autorisée`);
  }

  // ① Toujours désactiver le cache
  res.setHeader("Cache-Control", "no-store");

  // ② Semaine ciblée
  const weekStart = req.query.weekStart
    ? new Date(req.query.weekStart)
    : startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekEnd = addDays(weekStart, 7); // exclusif

  console.log(
    `Fetching menu for user ${userId} from ${weekStart.toISOString()} to ${weekEnd.toISOString()}`
  );

  // ③ Lire les menus existants
  let menu = await prisma.menuJournalier.findMany({
    where: {
      userId,
      date: { gte: weekStart, lt: weekEnd },
    },
    include: {
      recette: {
        include: {
          ingredients: {
            include: { ingredient: { include: { sideTypes: true } } },
          },
          allowedSides: { select: { sideType: true } },
        },
      },
      accompagnements: {
        include: { ingredient: { include: { sideTypes: true } } },
      },
    },
  });

  console.log(`Menus found: ${menu.length}`);

  // ④ **Nouveau** : ne générer que si la semaine est *entièrement* vide
 if (menu.length === 0) {
    console.log(`Aucun menu trouvé pour ${userId}, génération auto…`);
    await generateWeeklyMenu(userId, weekStart.toISOString());

    // relire après génération
    menu = await prisma.menuJournalier.findMany({
      where: {
        userId,
        date: { gte: weekStart, lt: weekEnd },
      },
      include: {
        recette: {
          include: {
            ingredients: {
              include: { ingredient: { include: { sideTypes: true } } },
            },
            allowedSides: { select: { sideType: true } },
          },
        },
        accompagnements: {
          include: { ingredient: { include: { sideTypes: true } } },
        },
      },
    });
    console.log(`Menus after generation: ${menu.length}`);
  }

  // ⑤ Retourner le menu
  return res.status(200).json(menu);
}

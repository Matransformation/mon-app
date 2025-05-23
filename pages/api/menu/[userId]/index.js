// pages/api/menu/[userId]/index.js

import prisma from "../../../../lib/prisma";
import { startOfWeek, addDays } from "date-fns";
import { generateWeeklyMenu } from "../../../../lib/menuGenerator";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Méthode ${req.method} non autorisée`);
  }

  // Toujours désactiver le cache pour forcer l'exécution
  res.setHeader("Cache-Control", "no-store");

  const { userId } = req.query;
  // ① Déterminer weekStart & weekEnd
  const weekStart = req.query.weekStart
    ? new Date(req.query.weekStart)
    : startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekEnd = addDays(weekStart, 7); // exclusive

  console.log(
    `Fetching menu for user ${userId} from ${weekStart.toISOString()} to ${weekEnd.toISOString()}`
  );

  // ② Lire ce qui existe déjà
  let menu = await prisma.menuJournalier.findMany({
    where: { userId, date: { gte: weekStart, lt: weekEnd } },
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

  // ③ Si VRAIMENT aucun jour généré, on appelle directement le générateur
  if (menu.length === 0) {
    console.log(`Aucun menu trouvé pour ${userId}, génération auto via generateWeeklyMenu…`);
    try {
      await generateWeeklyMenu(userId, weekStart.toISOString());
    } catch (e) {
      console.error("Erreur interne lors de generateWeeklyMenu:", e);
      return res.status(500).json({ message: "Échec génération auto", detail: e.message });
    }

    // ④ On relit une dernière fois
    menu = await prisma.menuJournalier.findMany({
      where: { userId, date: { gte: weekStart, lt: weekEnd } },
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

  // ⑤ On renvoie la semaine complète
  return res.status(200).json(menu);
}

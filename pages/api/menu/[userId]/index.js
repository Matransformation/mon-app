// pages/api/menu/[userId]/index.js

import prisma from "../../../../lib/prisma";
import { startOfWeek } from "date-fns";
import { generateWeeklyMenu } from "../../../../lib/menuGenerator";

export default async function handler(req, res) {
  const { userId } = req.query;

  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res
      .status(405)
      .send(`Méthode ${req.method} non autorisée`);
  }

  // 1️⃣ Calcul de weekStart / weekEnd
  const weekStart = req.query.weekStart
    ? new Date(req.query.weekStart)
    : startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  // 2️⃣ Toujours désactiver le cache pour ce endpoint
  res.setHeader("Cache-Control", "no-store");

  try {
    // 3️⃣ Récupérer ce qui existe déjà
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

    // 4️⃣ Si **aucun** menu pour toute la semaine, on génère
    if (menu.length === 0) {
      console.log(`Aucun menu pour ${userId} du ${weekStart.toISOString()}, génération…`);
      await generateWeeklyMenu(userId, weekStart.toISOString());

      //  ➡️ Re-fetch après génération
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
      console.log(`Menus générés pour ${userId} : ${menu.length} entrées`);
    }

    // 5️⃣ Retourne la semaine (existante ou nouvellement créée)
    return res.status(200).json(menu);
  } catch (err) {
    console.error("GET /api/menu/[userId] error :", err);
    return res
      .status(500)
      .json({ message: "Erreur serveur", error: err.message });
  }
}

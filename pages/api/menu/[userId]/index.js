// pages/api/menu/[userId]/index.js

import prisma from "../../../../lib/prisma";
import { startOfWeek, addDays } from "date-fns";

export default async function handler(req, res) {
  const { userId } = req.query;

  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Méthode ${req.method} non autorisée`);
  }

  // Désactive le cache pour toujours générer si besoin
  res.setHeader("Cache-Control", "no-store");

  // ① Détermine weekStart (lundi) et weekEnd (dimanche inclus)
  const weekStart = req.query.weekStart
    ? new Date(req.query.weekStart)
    : startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekEnd = addDays(weekStart, 6);

  console.log(
    `Fetching menu for user ${userId} from ${weekStart.toISOString()} to ${weekEnd.toISOString()}`
  );

  // ② Récupère les jours déjà créés (Lundi→Dimanche inclus)
  let menu = await prisma.menuJournalier.findMany({
    where: {
      userId,
      date: {
        gte: weekStart,
        lte: weekEnd,
      },
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

  // ③ Si aucun jour n’existe, génère la semaine
  if (menu.length === 0) {
    console.log(`Aucun menu trouvé pour ${userId}, génération auto…`);

    const proto = (req.headers["x-forwarded-proto"] || "http").split(",")[0];
    const host = req.headers.host;
    const baseUrl = `${proto}://${host}`;

    const genRes = await fetch(`${baseUrl}/api/menu/generer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, weekStart: weekStart.toISOString() }),
    });
    if (!genRes.ok) {
      const err = await genRes.json().catch(() => ({}));
      console.error("❌ Échec génération auto:", err);
      return res.status(500).json({ message: "Erreur génération auto", detail: err });
    }

    // ④ Relit *après* génération
    menu = await prisma.menuJournalier.findMany({
      where: {
        userId,
        date: { gte: weekStart, lte: weekEnd },
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

  // ⑤ Retourne du Lundi au Dimanche
  return res.status(200).json(menu);
}

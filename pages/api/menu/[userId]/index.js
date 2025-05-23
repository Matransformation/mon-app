// pages/api/menu/[id].js

import prisma from "../../../../lib/prisma";
import { parseISO, addDays } from "date-fns";

export default async function handler(req, res) {
  const { userId } = req.query;
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Méthode ${req.method} non autorisée`);
  }

  res.setHeader("Cache-Control", "no-store");

  const weekStart = req.query.weekStart
    ? parseISO(req.query.weekStart)
    : new Date();

  const weekEnd = addDays(weekStart, 6);

  console.log(
    `Fetching menu for user ${userId} from ${weekStart.toISOString()} to ${weekEnd.toISOString()}`
  );

  let menu = await prisma.menuJournalier.findMany({
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
  console.log(`Menus found: ${menu.length}`);

  if (menu.length === 0) {
    console.log(`Aucun menu pour ${userId}, génération auto…`);
    const proto = (req.headers["x-forwarded-proto"] || "http").split(",")[0];
    const host = req.headers.host;
    const base = `${proto}://${host}`;

    const gen = await fetch(`${base}/api/menu/generer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        weekStart: req.query.weekStart, // ✅ envoie tel quel, déjà au bon format
      }),
    });

    if (!gen.ok) {
      const err = await gen.json().catch(() => ({}));
      console.error("❌ Génération auto échouée:", err);
      return res
        .status(500)
        .json({ message: "Erreur génération auto", detail: err });
    }

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

  return res.status(200).json(menu);
}

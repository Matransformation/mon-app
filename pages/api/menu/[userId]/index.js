// File: pages/api/menu/[userId]/index.js
import prisma from "../../../../lib/prisma";
import { parseISO, addDays, startOfWeek } from "date-fns";
import { generateWeeklyMenu } from "../../../../lib/menuGenerator";

function parseWeekStart(value) {
  if (!value) return startOfWeek(new Date(), { weekStartsOn: 1 });
  const d = parseISO(value);
  if (isNaN(d.getTime())) {
    return startOfWeek(new Date(), { weekStartsOn: 1 });
  }
  return startOfWeek(d, { weekStartsOn: 1 });
}

export default async function handler(req, res) {
  const { userId } = req.query;

  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Méthode ${req.method} non autorisée`);
  }

  res.setHeader("Cache-Control", "no-store");

  const weekStart = parseWeekStart(req.query.weekStart);
  const weekEnd = addDays(weekStart, 6);

  try {
    let menu = await prisma.menuJournalier.findMany({
      where: { userId, date: { gte: weekStart, lte: weekEnd } },
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

    // Rien pour la semaine ? → on génère directement (sans fetch)
    if (menu.length === 0) {
      try {
        await generateWeeklyMenu(userId, req.query.weekStart || undefined);
      } catch (e) {
        console.warn("Direct generateWeeklyMenu failed, try internal fetch fallback:", e?.message || e);

        // Fallback via endpoint interne si jamais l’appel direct échoue
        const proto = (req.headers["x-forwarded-proto"] || "http").split(",")[0];
        const host = req.headers.host;
        const base = `${proto}://${host}`;

        const gen = await fetch(`${base}/api/menu/generer`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            weekStart: req.query.weekStart || undefined,
          }),
        });

        if (!gen.ok) {
          const err = await gen.json().catch(() => ({}));
          console.error("❌ Génération via fetch échouée:", err);
          return res
            .status(500)
            .json({ message: "Erreur génération auto", detail: err });
        }
      }

      // Recharge après génération (quelle que soit la voie)
      menu = await prisma.menuJournalier.findMany({
        where: { userId, date: { gte: weekStart, lte: weekEnd } },
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
    }

    return res.status(200).json(menu);
  } catch (e) {
    console.error("❌ /api/menu/[userId] failed:", e);
    return res.status(500).json({
      message: "Erreur serveur lors de la récupération du menu",
      detail: e?.message || String(e),
    });
  }
}

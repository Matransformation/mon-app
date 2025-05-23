import prisma from "../../../../lib/prisma";
import { startOfWeek, addDays } from "date-fns";

export default async function handler(req, res) {
  const { userId } = req.query;
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Méthode ${req.method} non autorisée`);
  }

  // ① Jamais cacher : toujours exécuter la logique
  res.setHeader("Cache-Control", "no-store");

  // ② Calculer weekStart/ weekEnd
  let weekStart;
  if (req.query.weekStart) {
    const iso = req.query.weekStart.slice(0, 10);
    const [y, m, d] = iso.split("-").map(Number);
    weekStart = new Date(y, m - 1, d);
  } else {
    weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  }
  const weekEnd = addDays(weekStart, 7); // exclusif

  console.log(
    `Fetching menu for user ${userId} from ${weekStart.toISOString()} to ${weekEnd.toISOString()}`
  );

  // ③ Récupérer les menus existants pour cette plage
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

  // ④ Si **aucun** menu sur toute la semaine => on génère...
  if (menu.length === 0) {
    console.log(`Aucun menu pour ${userId}, génération automatique…`);
    const proto = (req.headers["x-forwarded-proto"] || "http").split(",")[0];
    const host  = req.headers.host;
    const base  = `${proto}://${host}`;

    const gen = await fetch(`${base}/api/menu/generer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        weekStart: weekStart.toISOString().slice(0, 10),
      }),
    });
    if (!gen.ok) {
      const err = await gen.json().catch(() => ({}));
      console.error("❌ Génération auto échouée:", err);
      return res
        .status(500)
        .json({ message: "Erreur génération auto", detail: err });
    }

    // ⑤ On relit **une seule fois** après génération
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

  // ⑥ On renvoie la semaine complète
  return res.status(200).json(menu);
}

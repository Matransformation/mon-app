// File: pages/api/menu/[userId]/index.js

import prisma from "../../../../lib/prisma";
import { startOfWeek, addDays } from "date-fns";

export default async function handler(req, res) {
  const { userId } = req.query;

  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res
      .status(405)
      .end(`Méthode ${req.method} non autorisée`);
  }

  // ① Désactiver le cache pour toujours exécuter la logique
  res.setHeader("Cache-Control", "no-store");

  // ② Calcul de la semaine ciblée
  const weekStart = req.query.weekStart
    ? new Date(req.query.weekStart)
    : startOfWeek(new Date(), { weekStartsOn: 1 });
  // Exclusif : on prend exactement 7 jours après
  const weekEnd = addDays(weekStart, 7);

  console.log(
    `Fetching menu for user ${userId} from ${weekStart.toISOString()} to ${weekEnd.toISOString()}`
  );

  // ③ Récupérer ce qui existe
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

  // ④ Si ***aucun*** jour n’existe, on génère puis on relit
  if (menu.length === 0) {
    console.log(`Aucun menu trouvé pour ${userId}, génération auto…`);

    // Appel à l’endpoint de génération
    const proto = (req.headers["x-forwarded-proto"] || "http").split(",")[0];
    const host = req.headers.host;
    const baseUrl = `${proto}://${host}`;

    const genRes = await fetch(`${baseUrl}/api/menu/generer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        weekStart: weekStart.toISOString(),
      }),
    });
    if (!genRes.ok) {
      const err = await genRes.json().catch(() => ({}));
      console.error("❌ Échec génération auto:", err);
      return res
        .status(500)
        .json({ message: "Erreur génération auto", detail: err });
    }

    // ⑤ Relire les menus fraîchement créés
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

  // ⑥ On renvoie les entrées en base pour cette semaine
  return res.status(200).json(menu);
}

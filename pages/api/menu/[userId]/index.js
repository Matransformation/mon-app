import prisma from "../../../../lib/prisma";
import { startOfWeek } from "date-fns";

export default async function handler(req, res) {
  const { userId } = req.query;
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Méthode ${req.method} non autorisée`);
  }

  try {
    // 1️⃣ Calcul du début et de la fin de la semaine
    const weekStart = req.query.weekStart
      ? new Date(req.query.weekStart)
      : startOfWeek(new Date(), { weekStartsOn: 1 });
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    console.log(
      "Fetching menu for user",
      userId,
      "from",
      weekStart.toISOString(),
      "to",
      weekEnd.toISOString()
    );

    // 2️⃣ Récupérer les menus déjà en base pour cette semaine
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
    console.log("Menus found:", menu.length);

    // 3️⃣ Si on a moins de 7 jours, appeler l’endpoint de génération
    if (menu.length < 7) {
      console.log(
        `Only ${menu.length} day(s) found, generating missing days…`
      );

      // Construire l’URL absolue vers /api/menu/generer
      const proto =
        (req.headers["x-forwarded-proto"] || "http").split(",")[0];
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
        console.error("Erreur génération auto:", err);
        return res
          .status(500)
          .json({ message: "Échec génération menus", detail: err });
      }

      console.log("Génération OK, re-fetching menu…");
      // 4️⃣ Re-fetch après génération
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
      console.log("Menus after generation:", menu.length);
    }

    // 5️⃣ Retourner la semaine complète
    return res.status(200).json(menu);
  } catch (err) {
    console.error("GET /api/menu/[userId] error:", err);
    return res
      .status(500)
      .json({ message: "Erreur serveur", error: err.message });
  }
}

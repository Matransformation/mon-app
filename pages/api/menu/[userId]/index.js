// pages/api/menu/[userId]/index.js
import prisma from "../../../../lib/prisma";

export default async function handler(req, res) {
  const { userId } = req.query;

  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Méthode ${req.method} non autorisée`);
  }

  try {
    // ────────────────────────────────────────────────
    // 1️⃣ Détermination stricte des bornes UTC
    // Si on reçoit weekStart, on s'en sert tel quel ;
    // sinon, on prend le lundi 00:00 UTC courant.
    let weekStart;
    if (req.query.weekStart) {
      // new Date("2025-05-25") ou "2025-05-25T00:00:00.000Z" → on veut 00:00 UTC
      weekStart = new Date(req.query.weekStart);
    } else {
      // par défaut, lundi 00:00 UTC de la semaine en cours
      const now = new Date();
      // on force en UTC
      const todayUTC = new Date(Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate()
      ));
      // calcul du lundi UTC
      const dayOfWeek = todayUTC.getUTCDay();         // 0 (dimanche) … 6 (samedi)
      const distanceToMonday = (dayOfWeek + 6) % 7;   // 0→6, 1→0, 2→1, …
      weekStart = new Date(todayUTC);
      weekStart.setUTCDate(weekStart.getUTCDate() - distanceToMonday);
    }

    // Borne haute = +7 jours (UTC)
    const weekEnd = new Date(weekStart);
    weekEnd.setUTCDate(weekEnd.getUTCDate() + 7);

    console.log(
      `Fetching menu for user ${userId} from ${weekStart.toISOString()} to ${weekEnd.toISOString()}`
    );

    // ────────────────────────────────────────────────
    // 2️⃣ Lecture des menus déjà en base
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

    // ────────────────────────────────────────────────
    // 3️⃣ Si moins de 7 jours → on génère en appelant /api/menu/generer
    if (menu.length < 7) {
      console.log(`Only ${menu.length} day(s) found, generating missing days…`);

      const proto  = (req.headers["x-forwarded-proto"] || "https").split(",")[0];
      const host   = req.headers.host;
      const baseUrl = `${proto}://${host}`;

      const genRes = await fetch(`${baseUrl}/api/menu/generer`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          userId,
          // on renvoie la date ISO truncated en date-only pour conserver 00:00 UTC
          weekStart: weekStart.toISOString().slice(0, 10),
        }),
      });

      if (!genRes.ok) {
        const detail = await genRes.json().catch(() => ({}));
        console.error("❌ Erreur génération auto:", detail);
        return res
          .status(500)
          .json({ message: "Échec génération menus", detail });
      }

      console.log("✅ Génération OK, re-fetching menu…");
      // on relit après génération
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

    // ────────────────────────────────────────────────
    // 4️⃣ On renvoie la semaine complète
    return res.status(200).json(menu);
  } catch (err) {
    console.error("GET /api/menu/[userId] error:", err);
    return res
      .status(500)
      .json({ message: "Erreur serveur", error: err.message });
  }
}

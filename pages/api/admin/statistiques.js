// pages/api/admin/statistiques.js
import prisma from "../../../lib/prisma";
import { format, subMonths } from "date-fns";

// Définir les prix connus par stripePriceId
const prixStripe = {
  price_monthly: 14.99,
  price_annual: 89.90,
  price_recipes: 3.99,
};

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Méthode non autorisée" });
  }

  try {
    const periodeParam = req.query.periode || "3mois";
    const months = periodeParam === "6mois" ? 6 : periodeParam === "1an" ? 12 : 3;
    const dateLimite = subMonths(new Date(), months);

    const users = await prisma.user.findMany({
      where: { createdAt: { gte: dateLimite } },
      select: {
        id: true,
        isSubscribed: true,
        createdAt: true,
        trialEndsAt: true,
        stripePriceId: true,
      },
    });

    const total = users.length;
    const abonnes = users.filter((u) => u.isSubscribed).length;
    const essais = users.filter((u) => u.trialEndsAt && new Date(u.trialEndsAt) > new Date()).length;

    const abonnementsParMois = {};
    let revenuTotal = 0;

    for (const user of users) {
      if (!user.isSubscribed) continue;

      const mois = format(new Date(user.createdAt), "yyyy-MM");
      abonnementsParMois[mois] = (abonnementsParMois[mois] || 0) + 1;

      const id = user.stripePriceId;
      if (prixStripe[id]) {
        revenuTotal += prixStripe[id];
      }
    }

    const abonnementsData = Object.entries(abonnementsParMois).map(([mois, count]) => ({ mois, count }));

    return res.status(200).json({
      total,
      abonnes,
      essais,
      revenuEstime: parseFloat(revenuTotal.toFixed(2)),
      abonnementsParMois: abonnementsData,
    });
  } catch (err) {
    console.error("Erreur API statistiques:", err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
}

// pages/api/admin/utilisateurs.js
import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Méthode non autorisée" });
  }

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        nom: true,
        isSubscribed: true,
        subscriptionType: true,
        stripePriceId: true,
        stripeStatus: true,
        stripeCurrentPeriodEnd: true,
        createdAt: true,
        role: true, // ✅ Ajouté ici
      },
      orderBy: { createdAt: "desc" },
    });

    const stats = {
      total: users.length,
      abonnes: users.filter(u => u.isSubscribed).length,
      essais: users.filter(u => !u.isSubscribed && u.trialEndsAt && new Date(u.trialEndsAt) > new Date()).length,
      parType: {},
    };

    for (const user of users) {
      const type = user.subscriptionType || user.stripePriceId || "Inconnu";
      stats.parType[type] = (stats.parType[type] || 0) + 1;
    }

    return res.status(200).json({ users, stats });
  } catch (err) {
    console.error("Erreur API admin utilisateurs:", err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
}

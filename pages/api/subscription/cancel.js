// pages/api/subscription/cancel.js
import { getServerSession } from "next-auth/next";
import authOptions from "../auth/[...nextauth]"; // Chemin vers ton [...nextauth].js
import { stripe } from "../../../lib/stripe";
import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Méthode non autorisée" });
  }

  // 1) Authentifier l’utilisateur
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) {
    return res.status(401).json({ message: "Non authentifié" });
  }

  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ message: "userId manquant" });
  }

  // 2) Vérifier que c’est bien l’utilisateur connecté
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.email !== session.user.email) {
    return res.status(403).json({ message: "Accès refusé" });
  }

  // 3) Si abonnement Stripe présent, demander son annulation à la fin de la période
  if (!user.stripeSubscriptionId) {
    return res
      .status(400)
      .json({ message: "Pas d’abonnement actif à annuler." });
  }

  try {
    // Demande d'annulation au terme de la période en cours
    const sub = await stripe.subscriptions.update(user.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    const nextPeriodEnd = sub.current_period_end * 1000; // timestamp en ms

    // 4) On enregistre en base la nouvelle date de fin
    await prisma.user.update({
      where: { id: userId },
      data: {
        stripeStatus: sub.status,
        subscriptionEnd: new Date(nextPeriodEnd),
        cancelAtPeriodEnd: sub.cancel_at_period_end,
        // isSubscribed reste true tant que period_end n'est pas atteint
      },
    });

    return res.status(200).json({
      message:
        "Renouvellement automatique annulé. Vous conservez l’accès jusqu’au " +
        new Date(nextPeriodEnd).toLocaleDateString("fr-FR"),
    });
  } catch (err) {
    console.error("Erreur annulation renouvellement :", err);
    return res
      .status(500)
      .json({ message: "Erreur interne lors de l’annulation" });
  }
}

import { getServerSession } from "next-auth/next";
import { authOptions } from "../../api/auth/[...nextauth]";
import stripe from "../../../lib/stripe";
import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ message: "Méthode non autorisée" });

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email)
    return res.status(401).json({ message: "Non authentifié" });

  const { userId } = req.body;
  if (!userId) return res.status(400).json({ message: "userId manquant" });

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.email !== session.user.email)
    return res.status(403).json({ message: "Accès refusé" });

  if (!user.stripeSubscriptionId)
    return res
      .status(400)
      .json({ message: "Pas d’abonnement actif à annuler." });

  try {
    const sub = await stripe.subscriptions.update(
      user.stripeSubscriptionId,
      { cancel_at_period_end: true }
    );
    await prisma.user.update({
      where: { id: userId },
      data: {
        cancelAtPeriodEnd: true,
        stripeStatus: sub.status,
      },
    });
    return res.status(200).json({
      message:
        "Renouvellement automatique annulé. Vous conservez l’accès jusqu’au " +
        new Date(sub.current_period_end * 1000).toLocaleDateString("fr-FR"),
    });
  } catch (err) {
    console.error("Erreur annulation renouvellement :", err);
    return res
      .status(500)
      .json({ message: "Erreur interne lors de l’annulation" });
  }
}

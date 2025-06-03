// pages/api/admin/sync-abonnements.js

import { getSession } from "next-auth/react";
import Stripe from "stripe";
import prisma from "../../../lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2022-08-01",
});

export default async function handler(req, res) {
  const session = await getSession({ req });

  if (!session || session.user.role !== "admin") {
    return res.status(401).json({ error: "Non autorisé" });
  }

  try {
    const users = await prisma.user.findMany({
      where: { stripeCustomerId: { not: null } },
    });

    const results = [];

    for (const user of users) {
      try {
        const subs = await stripe.subscriptions.list({
          customer: user.stripeCustomerId,
          status: "all",
          limit: 1,
          expand: ["data.items.data.price"],
        });

        const sub = subs.data[0];

        if (!sub) {
          results.push({ email: user.email, status: "Aucun abonnement" });
          continue;
        }

        const priceId = sub.items.data[0].price.id;
        const periodEnd = new Date(sub.current_period_end * 1000);

        await prisma.user.update({
          where: { id: user.id },
          data: {
            stripeSubscriptionId: sub.id,
            stripePriceId: priceId,
            stripeStatus: sub.status,
            stripeCurrentPeriodEnd: periodEnd,
            isSubscribed: sub.status === "active",
            cancelAtPeriodEnd: !!sub.cancel_at_period_end,
            trialEndsAt: null,
            subscriptionType:
              priceId === process.env.NEXT_PUBLIC_PRICE_MONTHLY
                ? "mensuel"
                : priceId === process.env.NEXT_PUBLIC_PRICE_ANNUAL
                ? "annuel"
                : "recette",
            subscriptionEnd: periodEnd,
            hasAccessToFullContent: [
              process.env.NEXT_PUBLIC_PRICE_MONTHLY,
              process.env.NEXT_PUBLIC_PRICE_ANNUAL,
            ].includes(priceId),
          },
        });

        results.push({ email: user.email, status: "Mise à jour OK" });
      } catch (error) {
        results.push({ email: user.email, error: error.message });
      }
    }

    return res.status(200).json({ results });
  } catch (error) {
    console.error("Erreur générale de synchronisation:", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
}

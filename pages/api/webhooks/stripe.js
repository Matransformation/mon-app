import { buffer } from "micro";
import Stripe from "stripe";
import prisma from "../../../lib/prisma";

export const config = {
  api: { bodyParser: false },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2022-08-01",
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).end("Méthode non autorisée");
    return;
  }

  // 1️⃣ Vérifier la signature
  let event;
  const sig = req.headers["stripe-signature"];
  try {
    const buf = await buffer(req);
    event = stripe.webhooks.constructEvent(
      buf,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("❌ Échec vérif. signature :", err.message);
    res.status(400).end(`Webhook Error: ${err.message}`);
    return;
  }

  // 2️⃣ Helper pour mettre à jour l'utilisateur
  async function majUtilisateur(sub, metadataUserId) {
    const custId = sub.customer.toString();
    const priceId = sub.items.data[0].price.id;
    const periodEnd = new Date(sub.current_period_end * 1000);

    // Critère : on privilégie metadata.userId (checkout.session), sinon stripeCustomerId
    const where = metadataUserId
      ? { id: metadataUserId }
      : { stripeCustomerId: custId };

    await prisma.user.update({
      where,
      data: {
        stripeCustomerId: custId,
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
    console.log(`✅ Utilisateur ${metadataUserId || custId} mis à jour pour sub ${sub.id}`);
  }

  // 3️⃣ Switch sur le type d’événement
  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        if (session.subscription) {
          const sub = await stripe.subscriptions.retrieve(
            session.subscription,
            { expand: ["items.data.price"] }
          );
          await majUtilisateur(sub, session.metadata?.userId);
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object;
        await majUtilisateur(sub, undefined);
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object;
        await prisma.user.update({
          where: { stripeCustomerId: sub.customer.toString() },
          data: {
            isSubscribed: false,
            cancelAtPeriodEnd: false,
            stripeStatus: sub.status,
          },
        });
        console.log(`ℹ️ Abonnement supprimé pour ${sub.id}`);
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object;
        if (invoice.subscription) {
          const sub = await stripe.subscriptions.retrieve(
            invoice.subscription,
            { expand: ["items.data.price"] }
          );
          await majUtilisateur(sub, invoice.metadata?.userId);
          console.log(
            `✅ Facture payée, souscription ${sub.id} activée pour user ${
              invoice.metadata?.userId || sub.customer
            }`
          );
        }
        break;
      }

      default:
        console.log(`ℹ️ Événement ignoré : ${event.type}`);
    }
  } catch (err) {
    console.error("❌ Erreur dans le handler webhook :", err);
  }

  // 4️⃣ Répondre 200 à Stripe
  res.json({ received: true });
}

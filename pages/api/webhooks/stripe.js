// pages/api/stripe/webhook.js
import { buffer } from "micro";
import Stripe from "stripe";
import prisma from "../../../lib/prisma";

export const config = { api: { bodyParser: false } };

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2022-08-01",
});

// ---- Helpers ----
function computeAccessFlags(sub) {
  // statuses: 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid' ...
  const status = sub.status;
  // On considère l'accès OK uniquement en 'active' ou 'trialing'
  const isSubscribed = status === "active" || status === "trialing";
  return { stripeStatus: status, isSubscribed };
}

function computeLabels(priceId) {
  let subscriptionType = "recette";
  if (priceId === process.env.NEXT_PUBLIC_PRICE_MONTHLY) subscriptionType = "mensuel";
  else if (priceId === process.env.NEXT_PUBLIC_PRICE_ANNUAL) subscriptionType = "annuel";

  const hasFull = [
    process.env.NEXT_PUBLIC_PRICE_MONTHLY,
    process.env.NEXT_PUBLIC_PRICE_ANNUAL,
  ].includes(priceId);

  return { subscriptionType, hasFull };
}

async function majUtilisateurDepuisSub(sub, metadataUserId) {
  const custId   = sub.customer?.toString();
  const priceId  = sub.items?.data?.[0]?.price?.id || null;
  const periodEnd = sub.current_period_end ? new Date(sub.current_period_end * 1000) : null;

  const where = metadataUserId ? { id: metadataUserId } : { stripeCustomerId: custId };
  const { stripeStatus, isSubscribed } = computeAccessFlags(sub);
  const { subscriptionType, hasFull } = computeLabels(priceId);

  await prisma.user.update({
    where,
    data: {
      stripeCustomerId: custId,
      stripeSubscriptionId: sub.id,
      stripePriceId: priceId,
      stripeStatus,
      stripeCurrentPeriodEnd: periodEnd,
      subscriptionEnd: periodEnd,
      cancelAtPeriodEnd: !!sub.cancel_at_period_end,
      trialEndsAt: sub.trial_end ? new Date(sub.trial_end * 1000) : null,
      subscriptionType,
      isSubscribed,
      hasAccessToFullContent: isSubscribed && hasFull, // utilisé par getAccessRights
    },
  });
  console.log(`✅ User ${metadataUserId || custId} maj depuis sub ${sub.id} (status=${stripeStatus})`);
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end("Méthode non autorisée");

  let event;
  const sig = req.headers["stripe-signature"];

  try {
    const buf = await buffer(req);
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("❌ Échec vérif. signature :", err.message);
    return res.status(400).end(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      // ✅ Paiement réussi (renouvellement OK ou première facture)
      case "invoice.payment_succeeded": {
        const invoice = event.data.object;
        if (invoice.subscription) {
          const sub = await stripe.subscriptions.retrieve(invoice.subscription, {
            expand: ["items.data.price"],
          });
          await majUtilisateurDepuisSub(sub, invoice.metadata?.userId);
          console.log(`✅ Paiement OK pour sub ${sub.id}`);
        }
        break;
      }

      // ❌ Paiement échoué → on ANNULE IMMÉDIATEMENT la souscription et on coupe l'accès
      case "invoice.payment_failed": {
        const invoice = event.data.object;
        if (invoice.subscription) {
          const currentSub = await stripe.subscriptions.retrieve(invoice.subscription, {
            expand: ["items.data.price"],
          });

          // Annulation immédiate côté Stripe
          // (tu peux passer { invoice_now: false, prorate: false } si tu veux)
          const canceled = await stripe.subscriptions.cancel(currentSub.id);

          const custId = canceled.customer?.toString();
          const endedAt = canceled.ended_at ? new Date(canceled.ended_at * 1000) : new Date();

          await prisma.user.update({
            where: { stripeCustomerId: custId },
            data: {
              stripeSubscriptionId: canceled.id,
              stripeStatus: "canceled",
              isSubscribed: false,
              hasAccessToFullContent: false,
              cancelAtPeriodEnd: false,
              // on met les dates à "finie" pour que getAccessRights coupe
              stripeCurrentPeriodEnd: endedAt,
              subscriptionEnd: endedAt,
              // trialEndsAt: on ne touche pas (souvent null à ce stade)
            },
          });

          console.log(`🛑 Échec paiement → sub ${currentSub.id} ANNULÉE, accès révoqué.`);
        }
        break;
      }

      // 🧾 Checkout terminé → première souscription
      case "checkout.session.completed": {
        const session = event.data.object;
        if (session.subscription) {
          const sub = await stripe.subscriptions.retrieve(session.subscription, {
            expand: ["items.data.price"],
          });
          await majUtilisateurDepuisSub(sub, session.metadata?.userId);
        }
        break;
      }

      // 🔄 Création / mise à jour (chgt plan, annulation côté dashboard, etc.)
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object;
        const custId = sub.customer?.toString();

        // Si l'admin a annulé immédiatement dans Stripe (status === 'canceled')
        if (sub.status === "canceled") {
          const endedAt = sub.ended_at ? new Date(sub.ended_at * 1000) : new Date();
          await prisma.user.update({
            where: { stripeCustomerId: custId },
            data: {
              stripeSubscriptionId: sub.id,
              stripeStatus: "canceled",
              isSubscribed: false,
              hasAccessToFullContent: false,
              cancelAtPeriodEnd: false,
              stripeCurrentPeriodEnd: endedAt,
              subscriptionEnd: endedAt,
            },
          });
          console.log("🔒 Accès révoqué (status=canceled).");
          break;
        }

        // Sinon, maj standard (garde accès si active/trialing, pas en past_due)
        await majUtilisateurDepuisSub(sub, undefined);
        break;
      }

      // 🗑️ Souscription supprimée / résiliée (annulation immédiate depuis dashboard)
      case "customer.subscription.deleted": {
        const sub = event.data.object;
        const custId = sub.customer?.toString();
        const endedAt = sub.ended_at ? new Date(sub.ended_at * 1000) : new Date();

        await prisma.user.update({
          where: { stripeCustomerId: custId },
          data: {
            stripeSubscriptionId: sub.id,
            stripeStatus: sub.status || "canceled",
            isSubscribed: false,
            hasAccessToFullContent: false,
            cancelAtPeriodEnd: false,
            stripeCurrentPeriodEnd: endedAt,
            subscriptionEnd: endedAt,
          },
        });
        console.log(`ℹ️ Abonnement supprimé pour ${sub.id} — accès révoqué.`);
        break;
      }

      default:
        console.log(`ℹ️ Événement ignoré : ${event.type}`);
    }
  } catch (err) {
    console.error("❌ Erreur dans le handler webhook :", err);
    return res.status(500).json({ error: "server_error" });
  }

  return res.json({ received: true });
}

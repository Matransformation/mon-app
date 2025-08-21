// pages/api/stripe/webhook.js
import { buffer } from "micro";
import Stripe from "stripe";
import prisma from "../../../lib/prisma";

export const config = { api: { bodyParser: false } };

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2022-08-01",
});

/* ---------------- Helpers ---------------- */

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

async function resolveUser({ metadataUserId, stripeCustomerId, customerEmail }) {
  if (metadataUserId) {
    const u = await prisma.user.findUnique({ where: { id: metadataUserId } });
    if (u) return u;
  }
  if (stripeCustomerId) {
    const u = await prisma.user.findUnique({ where: { stripeCustomerId } });
    if (u) return u;
  }
  if (customerEmail) {
    const u = await prisma.user.findUnique({ where: { email: customerEmail } });
    if (u) return u;
  }
  return null;
}

async function majUtilisateurDepuisSub(sub, hints = {}) {
  const custId    = sub.customer?.toString() || null;
  const priceId   = sub.items?.data?.[0]?.price?.id || null;
  const periodEnd = sub.current_period_end ? new Date(sub.current_period_end * 1000) : null;

  // récup email client pour fallback
  let customerEmail = null;
  try {
    if (custId) {
      const customer = await stripe.customers.retrieve(custId);
      // @ts-ignore
      customerEmail = customer?.email || null;
      // @ts-ignore
      if (!hints.metadataUserId && customer?.metadata?.userId) {
        hints.metadataUserId = customer.metadata.userId;
      }
    }
  } catch (e) {
    console.warn("⚠️ retrieve customer:", e?.message);
  }

  const user = await resolveUser({
    metadataUserId: hints.metadataUserId,
    stripeCustomerId: custId,
    customerEmail,
  });
  if (!user) {
    console.error("❌ Aucun utilisateur trouvé", { custId, customerEmail, hints });
    return;
  }

  const { subscriptionType, hasFull } = computeLabels(priceId);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      stripeCustomerId: custId,
      stripeSubscriptionId: sub.id,
      stripePriceId: priceId,
      stripeStatus: sub.status, // info brute
      stripeCurrentPeriodEnd: periodEnd,
      subscriptionEnd: periodEnd,
      cancelAtPeriodEnd: !!sub.cancel_at_period_end,
      trialEndsAt: sub.trial_end ? new Date(sub.trial_end * 1000) : null,
      subscriptionType,
      // on ne touche pas ici isSubscribed/hasAccess: on le fera selon le type d’event
    },
  });
}

/* ---------------- Webhook ---------------- */

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end("Méthode non autorisée");

  let event;
  const sig = req.headers["stripe-signature"];
  try {
    const buf = await buffer(req);
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("❌ Signature invalide:", err.message);
    return res.status(400).end(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      /* ✅ Paiement réussi → on ACTIVE coûte que coûte */
      case "invoice.payment_succeeded": {
        const invoice = event.data.object;
        if (!invoice.subscription) break;

        const sub = await stripe.subscriptions.retrieve(invoice.subscription, {
          expand: ["items.data.price"],
        });

        await majUtilisateurDepuisSub(sub, { metadataUserId: invoice?.metadata?.userId });

        // calcule flags et force ACTIVE
        const custId    = sub.customer?.toString() || null;
        const priceId   = sub.items?.data?.[0]?.price?.id || null;
        const periodEnd = sub.current_period_end ? new Date(sub.current_period_end * 1000) : null;
        const { hasFull } = computeLabels(priceId);

        // retrouve user pour update final
        let email = null;
        try {
          if (custId) {
            const c = await stripe.customers.retrieve(custId);
            // @ts-ignore
            email = c?.email || null;
          }
        } catch {}

        const user = await resolveUser({
          metadataUserId: invoice?.metadata?.userId,
          stripeCustomerId: custId,
          customerEmail: email,
        });
        if (user) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              stripeStatus: "active",          // ✅ on force
              isSubscribed: true,               // ✅ on force
              hasAccessToFullContent: hasFull,  // selon le plan
              stripeCurrentPeriodEnd: periodEnd,
              subscriptionEnd: periodEnd,
            },
          });
          console.log(`✅ Paiement OK: user ${user.id} -> ACTIVE`);
        }
        break;
      }

      /* ❌ Paiement échoué → on ANNULE et on coupe l’accès immédiatement */
      case "invoice.payment_failed": {
        const invoice = event.data.object;
        if (!invoice.subscription) break;

        const sub = await stripe.subscriptions.retrieve(invoice.subscription, {
          expand: ["items.data.price"],
        });
        const canceled = await stripe.subscriptions.cancel(sub.id);

        const custId  = canceled.customer?.toString();
        const endedAt = canceled.ended_at ? new Date(canceled.ended_at * 1000) : new Date();

        // retrouve user
        let email = null;
        try {
          if (custId) {
            const c = await stripe.customers.retrieve(custId);
            // @ts-ignore
            email = c?.email || null;
          }
        } catch {}

        const user = await resolveUser({
          metadataUserId: invoice?.metadata?.userId,
          stripeCustomerId: custId,
          customerEmail: email,
        });
        if (user) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              stripeSubscriptionId: canceled.id,
              stripeStatus: "canceled",
              isSubscribed: false,
              hasAccessToFullContent: false,
              cancelAtPeriodEnd: false,
              stripeCurrentPeriodEnd: endedAt,
              subscriptionEnd: endedAt,
            },
          });
          console.log(`🛑 Paiement ÉCHOUÉ: user ${user.id} -> CANCELED`);
        }
        break;
      }

      /* Checkout terminé (utile si tu veux déjà remplir stripeCustomerId) */
      case "checkout.session.completed": {
        const session = event.data.object;
        if (!session.subscription) break;

        const sub = await stripe.subscriptions.retrieve(session.subscription, {
          expand: ["items.data.price"],
        });
        await majUtilisateurDepuisSub(sub, { metadataUserId: session?.metadata?.userId });

        // Si Stripe a déjà marqué paid (cas “payment_status: paid”), on peut déjà activer
        if (session.payment_status === "paid") {
          const custId    = sub.customer?.toString() || null;
          const priceId   = sub.items?.data?.[0]?.price?.id || null;
          const periodEnd = sub.current_period_end ? new Date(sub.current_period_end * 1000) : null;
          const { hasFull } = computeLabels(priceId);

          // retrouve user
          let email = null;
          try {
            if (custId) {
              const c = await stripe.customers.retrieve(custId);
              // @ts-ignore
              email = c?.email || null;
            }
          } catch {}

          const user = await resolveUser({
            metadataUserId: session?.metadata?.userId,
            stripeCustomerId: custId,
            customerEmail: email,
          });
          if (user) {
            await prisma.user.update({
              where: { id: user.id },
              data: {
                stripeStatus: "active",
                isSubscribed: true,
                hasAccessToFullContent: hasFull,
                stripeCurrentPeriodEnd: periodEnd,
                subscriptionEnd: periodEnd,
              },
            });
            console.log(`⚡️ Checkout paid: user ${user.id} -> ACTIVE`);
          }
        }
        break;
      }

      /* Mises à jour/annulations depuis le Dashboard Stripe */
      case "customer.subscription.updated": {
        const sub = event.data.object;
        await majUtilisateurDepuisSub(sub);

        // si status=canceled on coupe immédiatement
        if (sub.status === "canceled") {
          const custId  = sub.customer?.toString();
          const endedAt = sub.ended_at ? new Date(sub.ended_at * 1000) : new Date();

          const user = await resolveUser({ stripeCustomerId: custId });
          if (user) {
            await prisma.user.update({
              where: { id: user.id },
              data: {
                stripeStatus: "canceled",
                isSubscribed: false,
                hasAccessToFullContent: false,
                cancelAtPeriodEnd: false,
                stripeCurrentPeriodEnd: endedAt,
                subscriptionEnd: endedAt,
              },
            });
            console.log(`🔒 Updated->canceled: user ${user.id} -> CANCELED`);
          }
        }
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object;
        const custId  = sub.customer?.toString();
        const endedAt = sub.ended_at ? new Date(sub.ended_at * 1000) : new Date();

        const user = await resolveUser({ stripeCustomerId: custId });
        if (user) {
          await prisma.user.update({
            where: { id: user.id },
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
          console.log(`ℹ️ Deleted: user ${user.id} -> CANCELED`);
        }
        break;
      }

      default:
        console.log(`ℹ️ Événement ignoré : ${event.type}`);
    }
  } catch (err) {
    console.error("❌ Erreur webhook:", err);
    return res.status(500).json({ error: "server_error" });
  }

  return res.json({ received: true });
}

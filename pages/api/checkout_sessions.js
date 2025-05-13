// pages/api/checkout_sessions.js
import Stripe from "stripe";
import { getSession } from "next-auth/react";
import prisma from "../../lib/prisma";  // ajustez le chemin si besoin

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end("Méthode non autorisée");
  }

  // 1️⃣ Récupère la session NextAuth
  const session = await getSession({ req });
  if (!session?.user?.email) {
    return res.status(401).json({ error: "Non authentifié" });
  }

  // 2️⃣ Charge l'utilisateur en base
  let user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  // 3️⃣ Si pas de stripeCustomerId, en crée un
  if (!user.stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: session.user.email,
    });
    user = await prisma.user.update({
      where: { email: session.user.email },
      data: { stripeCustomerId: customer.id },
    });
  }

  const { priceId, email } = req.body;

  try {
    // 4️⃣ Crée la session Checkout
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      customer: user.stripeCustomerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_SUCCESS_URL}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: process.env.NEXT_PUBLIC_CANCEL_URL,
      metadata: { userId: user.id },
    });

    return res.status(200).json({ sessionId: checkoutSession.id });
  } catch (err) {
    console.error(err);
    return res
      .status(err.statusCode || 500)
      .json({ error: err.message });
  }
}

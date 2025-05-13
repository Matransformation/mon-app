// pages/api/subscribe.js
import { getServerSession } from "next-auth/next";
import { authOptions }      from "./auth/[...nextauth]";  // Chemin corrigé
import { stripe }           from "../../lib/stripe";
import prisma               from "../../lib/prisma";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Méthode non autorisée" });
  }

  // 1) Authentifier l'utilisateur via NextAuth
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) {
    return res.status(401).json({ message: "Non authentifié" });
  }
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user) {
    return res.status(404).json({ message: "Utilisateur introuvable" });
  }

  // 2) Valider le priceId envoyé
  const { priceId } = req.body;
  const PRICE_MAP = {
    price_monthly: process.env.NEXT_PUBLIC_PRICE_MONTHLY,
    price_annual:  process.env.NEXT_PUBLIC_PRICE_ANNUAL,
    price_recipes: process.env.NEXT_PUBLIC_PRICE_RECIPES,
  };
  const price = PRICE_MAP[priceId];
  if (!price) {
    return res.status(400).json({ message: "Le priceId est invalide." });
  }

  // 3) Construire les URLs de redirection
  const origin = req.headers.origin || process.env.NEXT_PUBLIC_URL;
  if (!origin) {
    return res
      .status(500)
      .json({ message: "NEXT_PUBLIC_URL non défini et pas d'en-tête Origin." });
  }

  try {
    // 4) Créer la session Stripe Checkout
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{ price, quantity: 1 }],
      mode: "subscription",
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${origin}/cancel`,
      metadata: { userId: user.id },  // pour le webhook
    });

    // 5) Sauvegarder dès maintenant le customer ID en base
    await prisma.user.update({
      where: { id: user.id },
      data: { stripeCustomerId: checkoutSession.customer },
    });

    // 6) Retourner l'URL de redirection vers Stripe Checkout
    return res.status(200).json({ sessionUrl: checkoutSession.url });
  } catch (error) {
    console.error("Erreur lors de la création de la session Stripe:", error);
    return res.status(500).json({
      message: "Erreur lors de la création de la session Stripe",
      detail: error.message,
    });
  }
}

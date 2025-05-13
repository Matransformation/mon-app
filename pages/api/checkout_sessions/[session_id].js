// pages/api/checkout_sessions/[session_id].js
import { stripe } from "../../../lib/stripe";

export default async function handler(req, res) {
  const { session_id } = req.query;

  // 1) Méthode autorisée uniquement GET
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  // 2) session_id obligatoire
  if (!session_id) {
    return res.status(400).json({ message: "session_id manquant" });
  }

  try {
    // 3) On récupère la session Stripe et on étend les objets nécessaires
    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: [
        "subscription",
        "subscription.items.data.price.product",
        "customer_details",
      ],
    });

    const subscription = session.subscription;
    if (!subscription) {
      return res
        .status(400)
        .json({ message: "Pas d'abonnement trouvé pour cette session." });
    }

    // 4) Extraire le plan et le produit
    const priceObj = subscription.items.data[0].price;
    const product = priceObj.product; // grâce à expand
    const planName = product.name || priceObj.nickname || "–";
    const nextBilling = subscription.current_period_end; // timestamp UNIX en secs

    // 5) Email client (via customer_details)
    const email =
      session.customer_details?.email ||
      session.customer_email ||
      "inconnu";

    // 6) Réponse
    return res.status(200).json({ planName, nextBilling, email });
  } catch (error) {
    console.error("Erreur fetch checkout session:", error);
    return res
      .status(500)
      .json({ message: "Erreur interne", detail: error.message });
  }
}

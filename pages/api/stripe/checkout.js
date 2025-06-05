// /pages/api/stripe/checkout.js

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end('Méthode non autorisée');

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: 'price_1R9MPBqC2krn4xtv0t6GC14c', // Remplace avec ton vrai price ID
          quantity: 1,
        },
      ],
      allow_promotion_codes: true, // ✅ Permet à l'utilisateur d’entrer un code promo
      success_url: `${process.env.NEXT_PUBLIC_URL}/merci?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/annule`,
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('[Stripe Checkout Error]', err);
    res.status(500).json({ error: 'Erreur lors de la création de la session' });
  }
}

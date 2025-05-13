// lib/stripe.js
import Stripe from 'stripe';

// Initialisez Stripe avec votre clé secrète (assurez-vous de stocker cette clé en toute sécurité dans vos variables d'environnement)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2022-08-01',
});

export { stripe };

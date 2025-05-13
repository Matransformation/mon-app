import Stripe from 'stripe'
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export default async function handler(req, res) {
  const { sessionId } = req.query
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription.plan.product', 'customer'],
    })
    res.json({
      customerEmail: session.customer_details.email,
      planNickname: session.subscription.plan.nickname || session.subscription.plan.id,
      nextBilling: session.subscription.current_period_end * 1000,
    })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}

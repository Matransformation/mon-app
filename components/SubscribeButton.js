// components/SubscribeButton.js
import { loadStripe } from '@stripe/stripe-js'
import { useState } from 'react'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)

export default function SubscribeButton({ isAnnual }) {
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    setLoading(true)
    const stripe = await stripePromise
    const priceId = isAnnual
      ? process.env.NEXT_PUBLIC_PRICE_ANNUAL
      : process.env.NEXT_PUBLIC_PRICE_MONTHLY

    const res = await fetch('/api/checkout_sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceId })
    })
    const { sessionId, error } = await res.json()
    if (error) {
      alert(error)
      setLoading(false)
      return
    }
    await stripe.redirectToCheckout({ sessionId })
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="w-full bg-green-700 text-white py-2 rounded hover:bg-green-800 transition"
    >
      {loading
        ? 'Redirection…'
        : isAnnual
        ? 'S’abonner (annuel)'
        : 'S’abonner (mensuel)'}
    </button>
  )
}

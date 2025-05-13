import { useState } from 'react'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = async e => {
    e.preventDefault()
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    const data = await res.json()
    setMessage(data.message)
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-4 text-center">Mot de passe oublié</h2>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Votre email"
          required
          className="w-full border px-3 py-2 rounded mb-4"
        />
        <button type="submit" className="w-full bg-orange-500 text-white py-2 rounded hover:bg-orange-600 transition">
          Envoyer le lien
        </button>
        {message && <p className="mt-4 text-center">{message}</p>}
      </form>
    </div>
  )
}

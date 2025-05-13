// pages/reset-password/[token].js
import { useState } from 'react'
import { useRouter } from 'next/router'

export default function ResetPassword() {
  const router = useRouter()
  const { token } = router.query
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async e => {
    e.preventDefault()
    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas')
      return
    }
    setError('')
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.message)
      } else {
        setMessage(data.message)
      }
    } catch {
      setError('Erreur réseau, veuillez réessayer.')
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <form className="bg-white p-8 rounded shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-4 text-center">
          Réinitialiser le mot de passe
        </h2>

        {/* Affichage de l'erreur */}
        {error && <p className="text-red-600 mb-2">{error}</p>}

        {/* Après succès, on affiche le message + bouton retour */}
        {message ? (
          <>
            <p className="text-green-600 mb-4 text-center">{message}</p>
            <button
              type="button"
              onClick={() => router.push('/login')}
              className="w-full bg-orange-500 text-white py-2 rounded hover:bg-orange-600 transition"
            >
              Retour à la connexion
            </button>
          </>
        ) : (
          <>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Nouveau mot de passe"
              required
              className="w-full border px-3 py-2 rounded mb-2"
            />
            <input
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="Confirmer mot de passe"
              required
              className="w-full border px-3 py-2 rounded mb-4"
            />
            <button
              type="submit"
              onClick={handleSubmit}
              className="w-full bg-orange-500 text-white py-2 rounded hover:bg-orange-600 transition"
            >
              Valider
            </button>
          </>
        )}
      </form>
    </div>
  )
}

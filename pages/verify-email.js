// pages/verify-email.js
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'

export default function VerifyEmailPage() {
  const router = useRouter()
  const { email } = router.query
  const [code, setCode] = useState(Array(6).fill(''))
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const inputsRef = useRef([])

  // focus auto sur champ suivant
  const handleChange = (idx, val) => {
    if (/^[A-Za-z0-9]?$/.test(val)) {
      const newCode = [...code]
      newCode[idx] = val.toUpperCase()
      setCode(newCode)
      if (val && idx < 5) inputsRef.current[idx + 1]?.focus()
    }
  }

  const handleVerify = async () => {
    const token = code.join('')
    if (token.length < 6) {
      setError('Veuillez saisir les 6 caractères du code.')
      return
    }
    setError('')
    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
      const data = await res.json()
      if (!res.ok) setError(data.message)
      else {
        setMessage('Email vérifié ! Vous allez être redirigé…')
        setTimeout(() => router.push('/dashboard'), 1500)
      }
    } catch {
      setError('Erreur réseau, veuillez réessayer.')
    }
  }

  const handleResend = async () => {
    setError('')
    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
      })
      const data = await res.json()
      setMessage(data.message)
    } catch {
      setError('Impossible de renvoyer le code, réessayez plus tard.')
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex flex-1 flex-col md:flex-row">
        {/* === FORMULAIRE DE VÉRIFICATION === */}
        <div className="w-full md:w-1/2 p-8 lg:p-16">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">
            Saisis le code unique que nous avons envoyé à
          </h2>
          <p className="text-orange-500 font-semibold mb-8">
            {email || 'votre email'}
          </p>

          {error && <p className="text-red-600 mb-4">{error}</p>}
          {message && <p className="text-green-600 mb-4">{message}</p>}

          <div className="flex space-x-2 mb-6">
            {code.map((char, idx) => (
              <input
                key={idx}
                ref={el => (inputsRef.current[idx] = el)}
                type="text"
                inputMode="text"
                maxLength={1}
                value={char}
                onChange={e => handleChange(idx, e.target.value)}
                className="w-12 h-12 text-center border border-gray-300 rounded focus:outline-none focus:border-orange-500"
              />
            ))}
          </div>

          <button
            onClick={handleVerify}
            className="w-full bg-orange-500 text-white py-3 rounded hover:bg-orange-600 transition mb-4"
          >
            Vérifier le code
          </button>

          <button
            onClick={handleResend}
            className="w-full border border-gray-300 py-3 rounded hover:bg-gray-50 transition"
          >
            Renvoyer le code
          </button>
        </div>

        {/* === ASIDE PROMO === */}
        <div className="hidden md:flex w-full md:w-1/2 bg-[#FE8C15]/10 p-8 lg:p-16 items-center">
          <div>
            <h2 className="text-4xl font-bold text-[#FE8C15] mb-6">
              À partir d'aujourd'hui, tu offriras la meilleure expérience de
              coaching à tes clients.
            </h2>
            <ul className="space-y-3 mb-8 text-gray-800">
              {[
                '14 jours pour essayer MaTransformation gratuitement',
                "Le logiciel le plus facile à utiliser pour tes clients",
                "Aucune carte de crédit n'est nécessaire",
                "L'équipe d'assistance est à ta disposition tous les jours",
                "100+ vidéos tutoriels pour t'aider à utiliser MaTransformation",
                "Rejoins des milliers de coachs personnels sur MaTransformation",
              ].map((txt, i) => (
                <li key={i} className="flex items-start">
                  <svg
                    className="h-5 w-5 flex-shrink-0 text-[#FE8C15] mt-1 mr-2"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M16.707 5.293a1 1 0 00-1.414 0L9 11.586 6.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l7-7a1 1 0 000-1.414z" />
                  </svg>
                  <span>{txt}</span>
                </li>
              ))}
            </ul>
            <img
              src="/menu-matransformation.png"
              alt="Mascotte cœur"
              className="mx-auto mt-4 w-40 h-40 object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

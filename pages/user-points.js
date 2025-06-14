// pages/user-points.js
import { useState, useEffect } from 'react'
import { getServerSession }     from 'next-auth/next'
import { authOptions }          from './api/auth/[...nextauth]'
import Navbar                   from '../components/Navbar'
import Link from 'next/link'


// Liens de follow (confiance)
const SOCIAL_LINKS = {
  follow_instagram:               'https://www.instagram.com/matransformation.fr',
  follow_facebook:                'https://www.facebook.com/matransformation.frr',
  follow_clemalauxdiet_instagram: 'https://www.instagram.com/clemalauxdiet/',
  follow_clemalauxdiet_facebook:  'https://www.facebook.com/clemalauxdiet'
}

// Actions de follow (5 pts chacune)
const ACTIONS = [
  { key: 'follow_instagram',               label: 'Je suis MaTransformation sur Instagram',      pts: 5 },
  { key: 'follow_facebook',                label: 'Je suis MaTransformation sur Facebook',       pts: 5 },
  { key: 'follow_clemalauxdiet_instagram', label: 'Je suis Clémence & Romain sur Instagram',     pts: 5 },
  { key: 'follow_clemalauxdiet_facebook',  label: 'Je suis Clémence & Romain sur Facebook',      pts: 5 },
]

// Récompenses échangeables
const REWARDS = [
  { pts: 20, label: 'Bon de réduction - 5 % sur Santé Gourmet' },
  { pts: 40, label: 'Bon de réduction - 10 % sur Santé Gourmet' },
  { pts: 60, label: 'Bon de réduction - 15 % sur Santé Gourmet' },
  { pts: 80, label: 'Bon de réduction - 20 % sur Santé Gourmet' },
]

export async function getServerSideProps(ctx) {
  const session = await getServerSession(ctx.req, ctx.res, authOptions)
  if (!session) {
    return { redirect: { destination: '/api/auth/signin', permanent: false } }
  }

  const userId = session.user.id
  // on importe prisma uniquement ici, côté serveur
  const prisma = (await import('../lib/prisma')).default

  let record = await prisma.userPoint.findUnique({ where: { userId } })
  if (!record) {
    record = await prisma.userPoint.create({
      data: { userId, points: 0, actionsDone: [] }
    })
  }

  const initialActions = Array.isArray(record.actionsDone)
    ? record.actionsDone
    : []

  return {
    props: {
      initialPoints: record.points,
      initialActions
    }
  }
}

export default function UserPointsPage({ initialPoints, initialActions }) {
  const [points,      setPoints]      = useState(initialPoints)
  const [doneActions, setDoneActions] = useState(initialActions)
  const [loadingKey,  setLoadingKey]  = useState(null)
  const [exchanging,  setExchanging]   = useState(null)

  useEffect(() => {
    setPoints(initialPoints)
    setDoneActions(initialActions)
  }, [initialPoints, initialActions])

  const handleFollow = async key => {
    if (doneActions.includes(key) || loadingKey) return

    setDoneActions(prev => [...prev, key])
    setLoadingKey(key)

    window.open(SOCIAL_LINKS[key], '_blank')

    const res  = await fetch('/api/user-points', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actionKey: key })
    })
    const data = await res.json()

    setPoints(data.points)
    setLoadingKey(null)
  }

  const handleExchange = async reward => {
    if (points < reward.pts || exchanging) return
    setExchanging(reward.pts)

    const res  = await fetch('/api/exchange', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rewardLabel: reward.label,
        pts:         reward.pts
      })
    })
    const data = await res.json()

    if (data.ok) {
      setPoints(data.points)
      alert(`Votre demande de "${reward.label}" a été envoyée !`)
    } else {
      console.error('Exchange error:', data)
      alert('Une erreur est survenue, merci de réessayer.')
    }
    setExchanging(null)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-grow w-full">
        <div className="bg-[url('/hero-bg.jpg')] bg-cover bg-center py-20 text-center">
          <h1 className="text-5xl font-bold text-black">
            Mes Points Carotte 🥕
          </h1>
        </div>

        <div className="container mx-auto px-6 py-10 space-y-12">
          {/* Solde */}
          <div className="bg-white shadow-md rounded-lg p-6 text-center">
            <p className="text-lg">Solde de points :</p>
            <p className="text-4xl text-green-600 font-bold">
              {points} pts
            </p>
          </div>

          {/* Actions */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">
              Gagne des points
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ACTIONS.map(a => {
                const done = doneActions.includes(a.key)
                return done ? (
                  <div
                    key={a.key}
                    className="flex justify-between items-center p-4 rounded-lg bg-gray-200 cursor-not-allowed"
                  >
                    <span>{a.label}</span>
                    <span className="text-green-600 font-semibold">
                      +{a.pts} pts
                    </span>
                    <span className="ml-4 text-gray-500">Déjà validé</span>
                  </div>
                ) : (
                  <button
                    key={a.key}
                    onClick={() => handleFollow(a.key)}
                    disabled={loadingKey === a.key}
                    className={`flex justify-between items-center p-4 rounded-lg shadow-sm transition ${
                      loadingKey === a.key
                        ? 'bg-gray-200 cursor-not-allowed'
                        : 'bg-white hover:bg-green-50'
                    }`}
                  >
                    <span>{a.label}</span>
                    <span className="text-green-600 font-semibold">
                      {loadingKey === a.key ? '…' : `+${a.pts} pts`}
                    </span>
                  </button>
                )
              })}
            </div>
{/* Bloc “Gagner des points” */}
<div className="mt-6 bg-white p-6 rounded-lg shadow-sm space-y-4">
  <h3 className="text-xl font-semibold text-gray-900">Actions sur le réseau social</h3>
  <ul className="list-disc list-inside text-gray-700 space-y-1">
    <li>Publier un post : <strong className="text-green-600">+5 pts</strong></li>
    <li>Ajouter un commentaire : <strong className="text-green-600">+2 pts</strong></li>
  </ul>
  <div className="text-left">
    <Link
      href="/social"
      className="inline-block mt-2 text-white bg-orange-500 hover:bg-orange-600 font-medium py-2 px-4 rounded transition"
    >
      📱 Aller au réseau social
    </Link>
  </div>

</div>



          </section>

          {/* Récompenses */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">
              Échange tes points
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {REWARDS.map(r => {
                const disabled = points < r.pts
                return (
                  <button
                    key={r.pts}
                    onClick={() => handleExchange(r)}
                    disabled={disabled || exchanging === r.pts}
                    className={`flex justify-between items-center p-4 rounded-lg shadow-sm transition ${
                      disabled
                        ? 'bg-gray-200 cursor-not-allowed'
                        : 'bg-white hover:bg-blue-50'
                    }`}
                  >
                    <span>{r.label}</span>
                    <span className="text-blue-600 font-semibold">
                      {r.pts} pts
                    </span>
                    {exchanging === r.pts && (
                      <span className="ml-4 text-sm text-gray-500">
                        En cours…
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

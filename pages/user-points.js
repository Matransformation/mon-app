import { useState, useEffect } from 'react'
import { getServerSession } from 'next-auth/next'
import { authOptions }    from './api/auth/[...nextauth]'
import prisma              from '../lib/prisma'
import Navbar              from '../components/Navbar'

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
  { pts: 20, label: 'Bon de réduction - 5 %' },
  { pts: 40, label: 'Bon de réduction - 10 %' },
  { pts: 60, label: 'Bon de réduction - 15 %' },
  { pts: 80, label: 'Bon de réduction - 20 %' },
]

export async function getServerSideProps(ctx) {
  const session = await getServerSession(ctx.req, ctx.res, authOptions)
  if (!session) {
    return { redirect: { destination: '/api/auth/signin', permanent: false } }
  }

  const userId = session.user.id
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
      initialPoints:  record.points,
      initialActions
    }
  }
}

export default function UserPointsPage({ initialPoints, initialActions }) {
  const [points,       setPoints]       = useState(initialPoints)
  const [doneActions,  setDoneActions]  = useState(initialActions)
  const [loadingKey,   setLoadingKey]   = useState(null)
  const [exchanging,   setExchanging]   = useState(null)

  useEffect(() => {
    setPoints(initialPoints)
    setDoneActions(initialActions)
  }, [initialPoints, initialActions])

  const handleFollow = async (key) => {
    if (doneActions.includes(key) || loadingKey) return

    // Optimistic update + griser le bouton
    setDoneActions(prev => [...prev, key])
    setLoadingKey(key)

    // Ouvre dans un nouvel onglet sans recharger cette page
    window.open(SOCIAL_LINKS[key], '_blank')

    // Appel serveur en tâche de fond
    const res  = await fetch('/api/user-points', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actionKey: key })
    })
    const data = await res.json()

    // Met à jour le solde, sans toucher à doneActions local
    setPoints(data.points)
    setLoadingKey(null)
  }

  const handleExchange = async (reward) => {
    if (points < reward.pts || exchanging) return
    setExchanging(reward.pts)

    await fetch('/api/exchange', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rewardLabel: reward.label })
    })
    setPoints(p => p - reward.pts)
    setExchanging(null)
    alert(`Votre demande de "${reward.label}" a été envoyée !`)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-grow w-full">
        <div className="bg-[url('/hero-bg.jpg')] bg-cover bg-center py-20 text-center">
          <h1 className="text-5xl font-bold text-black text-center">
            Mes Points Carotte 🥕
          </h1>
        </div>

        <div className="container mx-auto px-6 py-10 space-y-12">
          {/* Solde */}
          <div className="bg-white shadow-md rounded-lg p-6 text-center">
            <p className="text-lg">Solde de points :</p>
            <p className="text-4xl text-green-600 font-bold">{points} pts</p>
          </div>

          {/* Actions */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Gagne des points</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ACTIONS.map(a => {
                const done = doneActions.includes(a.key)
                return (
                  <button
                    key={a.key}
                    onClick={() => handleFollow(a.key)}
                    disabled={done || loadingKey === a.key}
                    className={`flex justify-between items-center p-4 rounded-lg shadow-sm transition ${
                      done
                        ? 'bg-gray-200 cursor-not-allowed'
                        : 'bg-white hover:bg-green-50'
                    }`}
                  >
                    <span>{a.label}</span>
                    <span className="text-green-600 font-semibold">
                      {loadingKey === a.key ? '…' : `+${a.pts} pts`}
                    </span>
                    {done && (
                      <span className="ml-4 text-sm text-gray-500">Déjà validé</span>
                    )}
                  </button>
                )
              })}
            </div>
          </section>

          {/* Récompenses */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Échange tes points</h2>
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
                    <span className="text-blue-600 font-semibold">{r.pts} pts</span>
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

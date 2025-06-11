import { useState, useEffect, useRef } from 'react'
import { getServerSession } from 'next-auth/next'
import { authOptions } from './api/auth/[...nextauth]'
import prisma from '../lib/prisma'
import Navbar from '../components/Navbar'
import { motion, AnimatePresence } from 'framer-motion'

const SOCIAL_LINKS = {
  follow_matransformation_instagram:   'https://www.instagram.com/matransformation.fr',
  follow_matransformation_facebook:     'https://www.facebook.com/matransformation.frr',
  follow_clemalauxdiet_instagram:      'https://www.instagram.com/clemalauxdiet/',
  follow_clemalauxdiet_facebook:       'https://www.facebook.com/clemalauxdiet'
}

const ACTIONS = [
  { key: 'follow_matransformation_instagram', label: 'Je suis MaTransformation sur Instagram', pts: 5 },
  { key: 'follow_matransformation_facebook',  label: 'Je suis MaTransformation sur Facebook',  pts: 5 },
  { key: 'follow_clemalauxdiet_instagram',    label: 'Je suis Clémence & Romain sur Instagram', pts: 5 },
  { key: 'follow_clemalauxdiet_facebook',     label: 'Je suis Clémence & Romain sur Facebook',  pts: 5 },
]

const REWARDS = [
  { pts: 20, label: 'Bon de réduction -5%' },
  { pts: 40, label: 'Bon de réduction -10%' },
  { pts: 60, label: 'Bon de réduction -15%' },
  { pts: 80, label: 'Bon de réduction -20%' },
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

  return {
    props: {
      initialPoints: record.points,
      initialActions: Array.isArray(record.actionsDone) ? record.actionsDone : []
    }
  }
}

export default function UserPointsPage({ initialPoints, initialActions = [] }) {
  const [points, setPoints]             = useState(initialPoints)
  const [doneActions, setDoneActions]   = useState(initialActions)
  const [processingActions, setProcessingActions] = useState(new Set())
  const [exchanging, setExchanging]     = useState(null)
  const doneActionsRef                  = useRef(initialActions)

  useEffect(() => {
    setPoints(initialPoints)
    const init = Array.isArray(initialActions) ? initialActions : []
    setDoneActions(init)
    doneActionsRef.current = init
  }, [initialPoints, initialActions])

  const handleFollow = async (actionKey, e) => {
    // désactive immédiatement le bouton au niveau DOM
    e.currentTarget.disabled = true

    const alreadyDone  = doneActionsRef.current.includes(actionKey)
    const isProcessing = processingActions.has(actionKey)

    if (alreadyDone) {
      return alert("Tu as déjà suivi ce compte, merci !")
    }
    if (isProcessing) return

    // blocage optimiste
    doneActionsRef.current = [...doneActionsRef.current, actionKey]
    setDoneActions(doneActionsRef.current)
    setProcessingActions(prev => new Set(prev).add(actionKey))

    try {
      const res = await fetch('/api/user-points', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actionKey })
      })
      const data = await res.json()
      setPoints(data.points)

      // synchronisation back → front
      const serverDone = Array.isArray(data.actionsDone) ? data.actionsDone : []
      doneActionsRef.current = serverDone
      setDoneActions(serverDone)

      if (data.newlyAdded) {
        window.open(SOCIAL_LINKS[actionKey], '_blank')
      } else {
        alert("Tu as déjà suivi ce compte, merci !")
      }
    } catch (err) {
      console.error(err)
    } finally {
      setProcessingActions(prev => {
        const next = new Set(prev)
        next.delete(actionKey)
        return next
      })
    }
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
    alert(`Demande de "${reward.label}" envoyée !`)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-grow w-full">
        {/* Hero */}
        <div className="bg-[url('/hero-bg.jpg')] bg-cover bg-center py-20 text-center">
          <h1 className="text-5xl font-bold text-black bg-white/80 inline-block px-6 py-2 rounded-xl">
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
                const done        = doneActions.includes(a.key)
                const isProcessing= processingActions.has(a.key)
                const disabled    = done || isProcessing

                return (
                  <motion.button
                    key={a.key}
                    onClick={disabled ? undefined : (e) => handleFollow(a.key, e)}
                    disabled={disabled}
                    whileTap={{ scale: disabled ? 1 : 0.97 }}
                    className={`
                      relative flex justify-between items-center p-4 rounded-lg shadow-sm transition
                      ${disabled
                        ? 'bg-gray-200 cursor-not-allowed pointer-events-none'
                        : 'bg-white hover:bg-green-50'}
                    `}
                  >
                    <div className="flex flex-col text-left">
                      <span className="flex items-center gap-1">
                        {a.label}
                        {done && <span className="text-green-600 text-lg">✅</span>}
                      </span>
                      <span className="text-sm text-gray-500">
                        {done
                          ? '✔️ Validé'
                          : isProcessing
                            ? 'En cours…'
                            : 'Clique pour valider'}
                      </span>
                    </div>
                    <span className="text-green-600 font-semibold">+{a.pts} pts</span>

                    <AnimatePresence>
                      {done && (
                        <motion.div
                          key="check"
                          initial={{ opacity: 0, scale: 0.6 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute top-2 right-2 text-green-600 text-xl"
                        >
                          ✅
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>
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
                    disabled={disabled}
                    className={`
                      flex justify-between items-center p-4 rounded-lg shadow-sm transition
                      ${disabled ? 'bg-gray-200 cursor-not-allowed pointer-events-none' : 'bg-white hover:bg-blue-50'}
                    `}
                  >
                    <span>{r.label}</span>
                    <span className="text-blue-600 font-semibold">{r.pts} pts</span>
                    {exchanging === r.pts && (
                      <span className="ml-4 text-sm text-gray-500">En cours…</span>
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

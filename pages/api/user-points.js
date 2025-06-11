// pages/api/user-points.js
import { getServerSession } from 'next-auth/next'
import { authOptions } from './auth/[...nextauth]'
import prisma from '../../lib/prisma'

const ACTION_POINTS = {
  follow_matransformation_instagram:   5,
  follow_matransformation_facebook:     5,
  follow_clemalauxdiet_instagram:      5,
  follow_clemalauxdiet_facebook:       5,
}

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions)
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  const userId = session.user.id

  // --- GET : solde + actions déjà faites
  if (req.method === 'GET') {
    let record = await prisma.userPoint.findUnique({ where: { userId } })
    if (!record) {
      record = await prisma.userPoint.create({
        data: { userId, points: 0, actionsDone: [] }
      })
    }
    return res.status(200).json({
      points: record.points,
      actionsDone: Array.isArray(record.actionsDone) ? record.actionsDone : []
    })
  }

  // --- POST : tenter d’ajouter l’action
  if (req.method === 'POST') {
    const { actionKey } = req.body
    const pts = ACTION_POINTS[actionKey]
    if (!actionKey || pts === undefined) {
      return res.status(400).json({ error: 'Action invalide' })
    }

    let record = await prisma.userPoint.findUnique({ where: { userId } })
    if (!record) {
      record = await prisma.userPoint.create({
        data: { userId, points: 0, actionsDone: [] }
      })
    }

    const done = Array.isArray(record.actionsDone) ? record.actionsDone : []

    // Si déjà fait, on ne recomptabilise pas
    if (done.includes(actionKey)) {
      return res.status(200).json({
        points: record.points,
        actionsDone: done,
        newlyAdded: false
      })
    }

    // Sinon, on ajoute les points et on marque l'action
    const updated = await prisma.userPoint.update({
      where: { userId },
      data: {
        points: record.points + pts,
        actionsDone: { push: actionKey }
      }
    })

    return res.status(200).json({
      points: updated.points,
      actionsDone: Array.isArray(updated.actionsDone) ? updated.actionsDone : [],
      newlyAdded: true
    })
  }

  res.setHeader('Allow', ['GET', 'POST'])
  res.status(405).end(`Method ${req.method} Not Allowed`)
}

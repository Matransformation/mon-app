// pages/api/user-points.js
import { getServerSession } from 'next-auth/next'
import { authOptions }    from './auth/[...nextauth]'
import prisma              from '../../lib/prisma'

// Points attribués pour chaque action
const ACTION_POINTS = {
  follow_instagram:                   5,
  follow_facebook:                    5,
  follow_clemalauxdiet_instagram:     5,
  follow_clemalauxdiet_facebook:      5,
}

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions)
  if (!session) return res.status(401).json({ error: 'Unauthorized' })
  const userId = session.user.id

  if (req.method === 'GET') {
    let record = await prisma.userPoint.findUnique({ where: { userId } })
    if (!record) {
      record = await prisma.userPoint.create({
        data: { userId, points: 0, actionsDone: [] }
      })
    }
    const actionsDone = Array.isArray(record.actionsDone)
      ? record.actionsDone
      : []
    return res.status(200).json({
      points: record.points,
      actionsDone
    })
  }

  if (req.method === 'POST') {
    const { actionKey } = req.body
    const pts = ACTION_POINTS[actionKey]
    if (!actionKey || pts === undefined) {
      return res.status(400).json({ error: 'Invalid action' })
    }

    let record = await prisma.userPoint.findUnique({ where: { userId } })
    if (!record) {
      record = await prisma.userPoint.create({
        data: { userId, points: 0, actionsDone: [] }
      })
    }
    const actionsDone = Array.isArray(record.actionsDone)
      ? record.actionsDone
      : []

    if (actionsDone.includes(actionKey)) {
      return res.status(200).json({
        points: record.points,
        actionsDone
      })
    }

    const updated = await prisma.userPoint.update({
      where: { userId },
      data: {
        points: record.points + pts,
        actionsDone: [...actionsDone, actionKey]
      }
    })

    const updatedActions = Array.isArray(updated.actionsDone)
      ? updated.actionsDone
      : []
    return res.status(200).json({
      points: updated.points,
      actionsDone: updatedActions
    })
  }

  res.setHeader('Allow', ['GET', 'POST'])
  res.status(405).end(`Method ${req.method} Not Allowed`)
}

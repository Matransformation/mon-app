// pages/api/user-points.js
import { getServerSession } from 'next-auth/next'
import { authOptions }    from './auth/[...nextauth]'
import prisma             from '../../lib/prisma'

// Points attribués pour chaque action
const ACTION_POINTS = {
  follow_instagram:                   5,
  follow_facebook:                    5,
  follow_clemalauxdiet_instagram:     5,
  follow_clemalauxdiet_facebook:      5,

  // Tes nouvelles actions
  create_post:                        5,  // création d’un post
  add_comment:                        2,  // ajout d’un commentaire
}

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions)
  if (!session) return res.status(401).json({ error: 'Unauthorized' })
  const userId = session.user.id

  // Actions qui ne doivent rapporter qu'une seule fois
  const onceOnly = [
    'follow_instagram',
    'follow_facebook',
    'follow_clemalauxdiet_instagram',
    'follow_clemalauxdiet_facebook'
  ]

  if (req.method === 'GET') {
    let record = await prisma.userPoint.findUnique({ where: { userId } })
    if (!record) {
      record = await prisma.userPoint.create({
        data: { userId, points: 0, actionsDone: [] }
      })
    }
    return res.status(200).json({
      points: record.points,
      actionsDone: record.actionsDone || []
    })
  }

  if (req.method === 'POST') {
    const { actionKey } = req.body
    const pts = ACTION_POINTS[actionKey]

    if (!actionKey || pts === undefined) {
      return res.status(400).json({ error: `Invalid action: ${actionKey}` })
    }

    let record = await prisma.userPoint.findUnique({ where: { userId } })
    if (!record) {
      record = await prisma.userPoint.create({
        data: { userId, points: 0, actionsDone: [] }
      })
    }

    const actionsDone = Array.isArray(record.actionsDone) ? record.actionsDone : []

    // Si c'est une action à faire une seule fois et déjà réalisée, on ne la recompte pas
    if (onceOnly.includes(actionKey) && actionsDone.includes(actionKey)) {
      return res.status(200).json({
        points: record.points,
        actionsDone
      })
    }

    // Mise à jour des points et, le cas échéant, du suivi des actions
    const updated = await prisma.userPoint.update({
      where: { userId },
      data: {
        points: record.points + pts,
        actionsDone: onceOnly.includes(actionKey)
          ? [...actionsDone, actionKey]
          : actionsDone
      }
    })

    return res.status(200).json({
      points: updated.points,
      actionsDone: updated.actionsDone || []
    })
  }

  res.setHeader('Allow', ['GET','POST'])
  res.status(405).end(`Method ${req.method} Not Allowed`)
}

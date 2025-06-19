// File: pages/api/roulette/draws.js

import { prisma } from '../../../lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions)
  if (!session || session.user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized' })
  }

  if (req.method === 'GET') {
    const draws = await prisma.rouletteDraw.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            nom: true,
            phone: true,
            email: true,
          }
        }
      }
    })
    return res.status(200).json(draws)
  }

  return res.status(405).end()
}

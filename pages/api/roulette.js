// File: pages/api/roulette.js

import { prisma } from '../../../lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]'

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions)
  const user = session?.user

  if (!user) return res.status(401).json({ error: 'Non autorisé' })

  if (req.method === 'POST') {
    try {
      const existingPlay = await prisma.rouletteDraw.findFirst({
        where: {
          userId: user.id,
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      })

      if (existingPlay) {
        return res.status(403).json({ error: 'Vous avez déjà joué aujourd’hui.' })
      }

      // Récupérer les lots disponibles
      const lots = await prisma.rouletteItem.findMany()
      if (!lots.length) return res.status(500).json({ error: 'Aucun lot configuré' })

      // Calcul du tirage pondéré par probabilité
      const totalWeight = lots.reduce((sum, item) => sum + item.probability, 0)
      const rand = Math.random() * totalWeight

      let current = 0
      let selectedItem = lots[0]
      for (const item of lots) {
        current += item.probability
        if (rand <= current) {
          selectedItem = item
          break
        }
      }

      // Enregistrer le tirage
      const draw = await prisma.rouletteDraw.create({
        data: {
          userId: user.id,
          itemId: selectedItem.id,
        },
        include: {
          item: true,
        },
      })

      res.status(200).json({ result: draw.item.name })
    } catch (err) {
      console.error('Erreur tirage roulette:', err)
      res.status(500).json({ error: 'Erreur serveur' })
    }
  } else {
    res.status(405).json({ error: 'Méthode non autorisée' })
  }
}

// File: pages/api/roulette/lots.js

import prisma from '../../../lib/prisma'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Méthode non autorisée' })
  }

  try {
    // On récupère tous les items de la roue (avec couponCode, probability, isSuperDraw, etc.)
    const lots = await prisma.rouletteItem.findMany({
      orderBy: { label: 'asc' },
    })

    return res.status(200).json(lots)
  } catch (error) {
    console.error('Erreur récupération des lots :', error)
    return res.status(500).json({ error: 'Erreur serveur' })
  }
}

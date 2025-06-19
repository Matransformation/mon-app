// File: pages/api/roulette/tirer.js

import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]"
import prisma from "../../../lib/prisma"

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Méthode non autorisée" })
  }

  const session = await getServerSession(req, res, authOptions)
  if (!session?.user?.email) {
    return res.status(401).json({ message: "Non autorisé" })
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })

  if (!user) {
    return res.status(404).json({ message: "Utilisateur non trouvé" })
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const alreadyDrawn = await prisma.draw.findFirst({
    where: {
      userId: user.id,
      createdAt: {
        gte: today,
      },
    },
  })

  if (alreadyDrawn) {
    return res.status(400).json({ message: "Vous avez déjà participé aujourd'hui." })
  }

  const lots = await prisma.lot.findMany()
  if (!lots.length) {
    return res.status(500).json({ message: "Aucun lot disponible." })
  }

  // Tirage pondéré
  const totalWeight = lots.reduce((sum, lot) => sum + lot.probability, 0)
  const rand = Math.random() * totalWeight
  let cumulative = 0
  let selectedLot = null
  for (const lot of lots) {
    cumulative += lot.probability
    if (rand <= cumulative) {
      selectedLot = lot
      break
    }
  }

  if (!selectedLot) {
    return res.status(500).json({ message: "Erreur lors du tirage." })
  }

  const draw = await prisma.draw.create({
    data: {
      userId: user.id,
      lotId: selectedLot.id,
    },
    include: {
      lot: true,
    },
  })

  return res.status(200).json({
    message: "Tirage effectué",
    lot: draw.lot,
  })
}

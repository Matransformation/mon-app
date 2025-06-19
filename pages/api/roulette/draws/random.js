// File: pages/api/roulette/draws/random.js

import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]"
import prisma from "../../../../lib/prisma"

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" })
  }

  const session = await getServerSession(req, res, authOptions)

  if (!session || session.user.role !== "admin") {
    return res.status(403).json({ error: "Accès refusé" })
  }

  // Trouver les utilisateurs ayant joué aujourd'hui mais non encore tirés au sort
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const participants = await prisma.user.findMany({
    where: {
      roulettes: {
        some: {
          createdAt: {
            gte: today,
          },
        },
      },
      tirageGagnant: {
        none: {
          createdAt: {
            gte: today,
          },
        },
      },
    },
  })

  if (participants.length === 0) {
    return res.status(404).json({ error: "Aucun participant à tirer au sort aujourd'hui" })
  }

  const randomIndex = Math.floor(Math.random() * participants.length)
  const selectedUser = participants[randomIndex]

  const draw = await prisma.tirageGagnant.create({
    data: {
      userId: selectedUser.id,
    },
    include: {
      user: true,
    },
  })

  return res.status(200).json(draw)
}

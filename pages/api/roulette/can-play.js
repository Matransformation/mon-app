// File: pages/api/roulette/can-play.js

import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]"
import prisma from "../../../lib/prisma"
import { startOfDay, endOfDay } from "date-fns"

export default async function handler(req, res) {
  // Vérifier la session
  const session = await getServerSession(req, res, authOptions)
  const user = session?.user

  if (!user || !user.id) {
    return res.status(401).json({ message: "Non autorisé" })
  }

  try {
    const todayStart = startOfDay(new Date())
    const todayEnd = endOfDay(new Date())

    const drawToday = await prisma.rouletteDraw.findFirst({
      where: {
        userId: user.id,
        createdAt: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
    })

    res.status(200).json({ canPlay: !drawToday })
  } catch (error) {
    console.error("Erreur vérification can-play:", error)
    res.status(500).json({ message: "Erreur serveur" })
  }
}

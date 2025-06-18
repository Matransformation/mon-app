// File: pages/api/exercices.js

import prisma from "../../lib/prisma"

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const exercices = await prisma.exercise.findMany({
        orderBy: { name: "asc" },
      })
      return res.status(200).json(exercices)
    } catch (error) {
      console.error("Erreur GET /api/exercices:", error)
      return res.status(500).json({ message: "Erreur serveur", details: error.message })
    }
  }

  if (req.method === "POST") {
    const { name, videoUrl, description, instructions } = req.body

    if (!name) {
      return res.status(400).json({ message: "Le nom de l'exercice est requis" })
    }

    try {
      const newExercice = await prisma.exercise.create({
        data: {
          name,
          videoUrl: videoUrl || null,
          description: description || null,
          instructions: instructions || null,
        },
      })
      return res.status(201).json(newExercice)
    } catch (error) {
      console.error("Erreur POST /api/exercices:", error)
      return res.status(500).json({ message: "Erreur serveur", details: error.message })
    }
  }

  res.setHeader("Allow", ["GET", "POST"])
  res.status(405).end(`Méthode ${req.method} non autorisée`)
}

// File: pages/api/exercices/[id].js

import prisma from "../../../lib/prisma"

export default async function handler(req, res) {
  const { id } = req.query

  if (!id || typeof id !== "string") {
    return res.status(400).json({ message: "ID invalide" })
  }

  if (req.method === "GET") {
    try {
      const exercice = await prisma.exercise.findUnique({ where: { id } })
      if (!exercice) {
        return res.status(404).json({ error: "Exercice non trouvé" })
      }
      return res.status(200).json(exercice)
    } catch (error) {
      console.error(`GET /api/exercices/${id} error:`, error)
      return res.status(500).json({ error: "Erreur serveur", details: error.message })
    }
  }

  if (req.method === "PUT") {
    const { name, videoUrl, description, instructions } = req.body
    if (!name) {
      return res.status(400).json({ message: "Le nom de l'exercice est requis" })
    }
    try {
      const updated = await prisma.exercise.update({
        where: { id },
        data: {
          name,
          videoUrl: videoUrl || null,
          description: description || null,
          instructions: instructions || null,
        },
      })
      return res.status(200).json(updated)
    } catch (error) {
      console.error(`PUT /api/exercices/${id} error:`, error)
      return res.status(500).json({ error: "Erreur serveur", details: error.message })
    }
  }

  if (req.method === "DELETE") {
    try {
      await prisma.exercise.delete({ where: { id } })
      return res.status(204).end()
    } catch (error) {
      console.error(`DELETE /api/exercices/${id} error:`, error)
      return res.status(500).json({ error: "Erreur serveur", details: error.message })
    }
  }

  res.setHeader("Allow", ["GET", "PUT", "DELETE"])
  res.status(405).end(`Méthode ${req.method} non autorisée`)
}

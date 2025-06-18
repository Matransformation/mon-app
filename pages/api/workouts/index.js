// File: pages/api/workouts/index.js

import prisma from "../../../lib/prisma"

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const workouts = await prisma.workout.findMany({
        orderBy: { title: "asc" },
        include: {
          exercises: {
            orderBy: { orderIndex: "asc" },
            include: { exercise: true },
          },
        },
      })

      const formatted = workouts.map((w) => ({
        ...w,
        exercises: w.exercises.map((we) => ({
          id: we.exercise.id,
          name: we.exercise.name,
          videoUrl: we.exercise.videoUrl,
          description: we.exercise.description,
          instructions: we.exercise.instructions,
          orderIndex: we.orderIndex,
          duration: we.duration,
          repCount: we.repCount,
          restDuration: we.restDuration, // nouveau champ repos
          circuitId: we.circuitId,
          circuitRounds: we.circuitRounds,
        })),
      }))

      return res.status(200).json(formatted)
    } catch (error) {
      console.error("Erreur GET /api/workouts:", error)
      return res.status(500).json({ message: "Erreur serveur", details: error.message })
    }
  }

  if (req.method === "POST") {
    const { title, imageUrl, category, exercises } = req.body
    if (!title || !Array.isArray(exercises) || exercises.length === 0) {
      return res.status(400).json({ message: "Titre et exercices requis" })
    }
    try {
      const workout = await prisma.workout.create({
        data: {
          title,
          imageUrl: imageUrl || null,
          category: category || null,
          exercises: {
            create: exercises.map((ex) => ({
              exercise: { connect: { id: ex.exerciseId } },
              orderIndex: ex.orderIndex,
              duration: ex.duration ?? null,
              repCount: ex.repCount ?? null,
              restDuration: ex.restDuration ?? null, // persister repos
              circuitId: ex.circuitId || null,
              circuitRounds: ex.circuitRounds || null,
            })),
          },
        },
      })
      return res.status(201).json(workout)
    } catch (error) {
      console.error("Erreur POST /api/workouts:", error)
      return res.status(500).json({ message: "Erreur serveur", details: error.message })
    }
  }

  res.setHeader("Allow", ["GET", "POST"])
  res.status(405).end(`Méthode ${req.method} non autorisée`)
}

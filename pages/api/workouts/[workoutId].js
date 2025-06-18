// File: pages/api/workouts/[workoutId].js

import prisma from "../../../lib/prisma"

export default async function handler(req, res) {
  const { workoutId } = req.query
  if (!workoutId || typeof workoutId !== "string") {
    return res.status(400).json({ message: "workoutId invalide" })
  }

  if (req.method === "GET") {
    try {
      const workout = await prisma.workout.findUnique({
        where: { id: workoutId },
        include: {
          exercises: {
            orderBy: { orderIndex: "asc" },
            include: { exercise: true },
          },
        },
      })

      if (!workout) return res.status(404).json({ error: "Workout non trouvé" })

      const formatted = {
        ...workout,
        exercises: workout.exercises.map((we) => ({
          id: we.exercise.id,
          name: we.exercise.name,
          videoUrl: we.exercise.videoUrl,
          description: we.exercise.description,
          instructions: we.exercise.instructions,
          orderIndex: we.orderIndex,
          duration: we.duration,
          repCount: we.repCount,
          restDuration: we.restDuration,
          circuitId: we.circuitId,
          circuitRounds: we.circuitRounds,
        })),
      }

      return res.status(200).json(formatted)
    } catch (error) {
      console.error("GET /api/workouts/[workoutId] error:", error)
      return res.status(500).json({ error: "Erreur serveur", details: error.message })
    }
  }

  if (req.method === "PUT") {
    const { title, imageUrl, category, difficulty_level, exercises } = req.body

    if (!title || !Array.isArray(exercises)) {
      return res.status(400).json({ message: "Champs requis manquants" })
    }

    try {
      await prisma.workout.update({
        where: { id: workoutId },
        data: {
          title,
          imageUrl: imageUrl || null,
          category: category || null,
          difficulty_level: difficulty_level ?? null, // 👈 on met à jour le niveau
        },
      })

      await prisma.workoutExercise.deleteMany({ where: { workoutId } })

      await prisma.workoutExercise.createMany({
        data: exercises.map((ex) => ({
          workoutId,
          exerciseId: ex.exerciseId,
          orderIndex: ex.orderIndex,
          duration: ex.duration ?? null,
          repCount: ex.repCount ?? null,
          restDuration: ex.restDuration ?? null,
          circuitId: ex.circuitId || null,
          circuitRounds: ex.circuitRounds || null,
        })),
      })

      return res.status(200).json({ message: "Workout mis à jour" })
    } catch (error) {
      console.error("PUT /api/workouts/[workoutId] error:", error)
      return res.status(500).json({ error: "Erreur serveur", details: error.message })
    }
  }

  if (req.method === "DELETE") {
    try {
      await prisma.workoutExercise.deleteMany({ where: { workoutId } })
      await prisma.workout.delete({ where: { id: workoutId } })
      return res.status(204).end()
    } catch (error) {
      console.error("DELETE /api/workouts/[workoutId] error:", error)
      return res.status(500).json({ error: "Erreur serveur", details: error.message })
    }
  }

  res.setHeader("Allow", ["GET", "PUT", "DELETE"])
  res.status(405).end(`Méthode ${req.method} non autorisée`)
}

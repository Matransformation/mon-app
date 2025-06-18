// File: pages/training/session/[id].js

import prisma from "../../../lib/prisma"
import SessionInterface from "./session-interface"

export async function getServerSideProps({ params }) {
  const { id } = params

  // Charger le workout (image, catégorie)
  const workout = await prisma.workout.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      imageUrl: true,
      category: true,
    },
  })

  if (!workout) {
    return { notFound: true }
  }

  // Récupérer les liaisons WorkoutExercise avec l'exercice lié
  const workoutExercises = await prisma.workoutExercise.findMany({
    where: { workoutId: id },
    orderBy: { orderIndex: "asc" },
    include: { exercise: true },
  })

  // Construire la liste brute
  const raw = workoutExercises.map(item => ({
    id: item.exercise.id,
    name: item.exercise.name,
    videoUrl: item.exercise.videoUrl,
    description: item.exercise.description,
    instructions: item.exercise.instructions,
    orderIndex: item.orderIndex,
    duration: item.duration,
    repCount: item.repCount,
    restDuration: item.restDuration,
    circuitId: item.circuitId,
    circuitRounds: item.circuitRounds,
  }))

  // Étendre les circuits et insérer les phases de repos
  function expandWithRests(list) {
    const result = []
    let i = 0
    while (i < list.length) {
      const ex = list[i]
      // Si début de circuit
      if (ex.circuitId) {
        const block = list.filter(e => e.circuitId === ex.circuitId)
        const rounds = ex.circuitRounds || 1
        for (let r = 0; r < rounds; r++) {
          block.forEach(e => {
            result.push({ ...e, isRest: false })
            if (e.restDuration) {
              result.push({
                id: null,
                name: 'Repos',
                videoUrl: null,
                description: null,
                instructions: null,
                orderIndex: e.orderIndex,
                duration: e.restDuration,
                repCount: null,
                isRest: true,
              })
            }
          })
        }
        i += block.length
      } else {
        // Exercice isolé
        result.push({ ...ex, isRest: false })
        if (ex.restDuration) {
          result.push({
            id: null,
            name: 'Repos',
            videoUrl: null,
            description: null,
            instructions: null,
            orderIndex: ex.orderIndex,
            duration: ex.restDuration,
            repCount: null,
            isRest: true,
          })
        }
        i++
      }
    }
    return result
  }

  const exercises = expandWithRests(raw)

  return {
    props: {
      workout,
      exercises,
    },
  }
}

export default function SessionPageWrapper(props) {
  return <SessionInterface {...props} />
}

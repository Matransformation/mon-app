import prisma from "../../../../../lib/prisma"

export default async function handler(req, res) {
  const { sessionId } = req.query

  if (req.method === "PUT") {
    const { calories, completedAt } = req.body
    const data = {}
    if (calories !== undefined) data.calories = parseInt(calories, 10)
    if (completedAt) data.completedAt = new Date(completedAt)

    try {
      const updated = await prisma.trainingSession.update({
        where: { id: sessionId },
        data,
      })
      return res.status(200).json(updated)
    } catch (error) {
      console.error(`PUT /api/workouts/.../sessions/${sessionId} error:`, error)
      return res.status(500).json({ error: "Server error", details: error.message })
    }
  }

  res.setHeader("Allow", ["PUT"])
  res.status(405).end(`Method ${req.method} Not Allowed`)
}

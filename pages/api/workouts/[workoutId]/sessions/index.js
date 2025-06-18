import prisma from "../../../../../lib/prisma"

export default async function handler(req, res) {
  const { workoutId } = req.query

  if (req.method === "POST") {
    const { userId } = req.body
    if (!userId) {
      return res.status(400).json({ error: "userId is required" })
    }

    try {
      const session = await prisma.trainingSession.create({
        data: { userId, workoutId },
      })
      return res.status(201).json(session)
    } catch (error) {
      console.error("POST /api/workouts/[workoutId]/sessions error:", error)
      return res.status(500).json({ error: "Server error", details: error.message })
    }
  }

  res.setHeader("Allow", ["POST"])
  res.status(405).end(`Method ${req.method} Not Allowed`)
}
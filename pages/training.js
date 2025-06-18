// File: pages/training.js

import { useEffect, useState, useMemo } from "react"
import axios from "axios"
import Link from "next/link"
import Image from "next/image"
import { Clock } from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Button } from "../components/ui/button"
import Navbar from "../components/Navbar"

function getDifficultyText(level) {
  switch (level) {
    case 1:
      return "Débutant"
    case 2:
      return "Facile"
    case 3:
      return "Intermédiaire"
    case 4:
      return "Difficile"
    case 5:
      return "Expert"
    default:
      return "Non défini"
  }
}

function getDifficultyColor(level) {
  switch (level) {
    case 1:
      return "bg-green-100 text-green-800"
    case 2:
      return "bg-blue-100 text-blue-800"
    case 3:
      return "bg-yellow-100 text-yellow-800"
    case 4:
      return "bg-orange-100 text-orange-800"
    case 5:
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export default function ListeTrainings() {
  const [workouts, setWorkouts] = useState([])
  const [selectedLevel, setSelectedLevel] = useState("Tous")

  useEffect(() => {
    axios
      .get("/api/workouts")
      .then((res) => setWorkouts(res.data))
      .catch((err) => console.error("Erreur chargement workouts:", err))
  }, [])

  const levels = ["Tous", 1, 2, 3, 4, 5]

  const filteredWorkouts = useMemo(() => {
    let filtered = [...workouts]
    if (selectedLevel !== "Tous") {
      filtered = filtered.filter((w) => w.difficulty_level === selectedLevel)
    }
    return filtered
  }, [workouts, selectedLevel])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 pt-20 pb-12">
      <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-[#fe8802] to-[#e37300] text-transparent bg-clip-text">
  🏋️ Programmes d'entraînement
</h1>


        {/* Filtres par niveau */}
        <div className="flex flex-wrap gap-3 justify-center mb-10">
        {levels.map((lvl) => (
  <button
    key={lvl}
    onClick={() => setSelectedLevel(lvl)}
    className={`rounded-full border font-medium px-4 py-1 transition-colors ${
      selectedLevel === lvl
        ? "bg-[#fe8802] text-white"
        : "bg-white border-[#fe8802] text-[#fe8802] hover:bg-[#fe8802]/10"
    }`}
  >
    {lvl === "Tous" ? "Tous niveaux" : getDifficultyText(lvl)}
  </button>
))}

        </div>

        {filteredWorkouts.length === 0 ? (
          <p className="text-center text-gray-500 mt-8">
            Aucun programme ne correspond au niveau sélectionné.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredWorkouts.map((w) => {
              const estimatedDurationMin = Math.ceil(
                (w.exercises?.reduce((sum, ex) => sum + (ex.duration || 0) + (ex.restDuration || 0), 0) || 0) / 60
              )
              return (
                <Card
                  key={w.id}
                  className="overflow-hidden shadow-md hover:shadow-xl rounded-2xl transition-transform hover:-translate-y-1 border border-gray-200 bg-white"
                >
                  <div className="w-full relative">
                    <Image
                      src={w.imageUrl || "/placeholder.svg"}
                      alt={w.title}
                      width={800}
                      height={450}
                      className="w-full h-auto object-contain"
                    />

                    {w.category && (
                      <span className="absolute top-2 left-2 z-10">
                        <span className="px-2 py-1 rounded bg-white/80 text-sm text-indigo-800 font-semibold">
                          {w.category}
                        </span>
                      </span>
                    )}

                    {w.difficulty_level && (
                      <span className="absolute top-2 right-2 z-10">
                        <span className={`px-2 py-1 rounded text-sm font-semibold bg-white/80 ${getDifficultyColor(w.difficulty_level)}`}>
                          {getDifficultyText(w.difficulty_level)}
                        </span>
                      </span>
                    )}
                  </div>

                  <CardHeader className="pt-4 pb-2 px-4">
                    <CardTitle className="text-lg font-semibold">
                      {w.title}
                    </CardTitle>
                    {w.description && (
                      <CardDescription className="text-sm text-gray-500">
                        {w.description}
                      </CardDescription>
                    )}
                  </CardHeader>

                  <CardContent className="px-4 pb-4">
                    <div className="flex justify-between items-center text-sm text-gray-500 mb-3">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {estimatedDurationMin || 30} min
                      </div>
                    </div>

                    <Link href={`/training/session/${w.id}`}>
                    <Button
  className="w-full text-base font-semibold text-white py-2"
  style={{ backgroundColor: "#fe8802" }}
>
  🚀 Commencer
</Button>

                    </Link>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
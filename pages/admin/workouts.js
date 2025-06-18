// File: pages/admin/gestion-workouts.js

import { useState, useEffect } from "react"
import axios from "axios"
import withAuthProtection from "../../lib/withAuthProtection"

function GestionWorkouts() {
  const [workouts, setWorkouts] = useState([])
  const [exercises, setExercises] = useState([])
  const [newWorkoutTitle, setNewWorkoutTitle] = useState("")
  const [newWorkoutImage, setNewWorkoutImage] = useState("")
  const [newWorkoutCategory, setNewWorkoutCategory] = useState("")
  const [newWorkoutDifficulty, setNewWorkoutDifficulty] = useState("")
  const [selectedExercises, setSelectedExercises] = useState([
    {
      exerciseId: "",
      orderIndex: 0,
      mode: "duration",
      duration: 30,
      repCount: 10,
      restDuration: 30,
      circuitId: null,
      circuitRounds: null,
    },
  ])
  const [editingWorkoutId, setEditingWorkoutId] = useState(null)

  useEffect(() => {
    fetchWorkouts()
    fetchExercises()
  }, [])

  async function fetchWorkouts() {
    try {
      const res = await axios.get("/api/workouts")
      setWorkouts(res.data)
    } catch (err) {
      console.error("Erreur récupération workouts:", err)
    }
  }

  async function fetchExercises() {
    try {
      const res = await axios.get("/api/exercices")
      setExercises(res.data)
    } catch (err) {
      console.error("Erreur récupération exercices:", err)
    }
  }

  async function handleCreateOrUpdateWorkout() {
    const payload = {
      title: newWorkoutTitle,
      imageUrl: newWorkoutImage,
      category: newWorkoutCategory,
      difficulty_level: newWorkoutDifficulty ? parseInt(newWorkoutDifficulty) : null,
      exercises: selectedExercises.map((ex) => ({
        exerciseId: ex.exerciseId,
        orderIndex: ex.orderIndex,
        duration: ex.mode === "duration" ? ex.duration : null,
        repCount: ex.mode === "reps" ? ex.repCount : null,
        restDuration: ex.restDuration,
        circuitId: ex.circuitId,
        circuitRounds: ex.circuitRounds,
      })),
    }

    try {
      if (editingWorkoutId) {
        await axios.put(`/api/workouts/${editingWorkoutId}`, payload)
      } else {
        await axios.post("/api/workouts", payload)
      }

      setNewWorkoutTitle("")
      setNewWorkoutImage("")
      setNewWorkoutCategory("")
      setNewWorkoutDifficulty("")
      setSelectedExercises([
        {
          exerciseId: "",
          orderIndex: 0,
          mode: "duration",
          duration: 30,
          repCount: 10,
          restDuration: 30,
          circuitId: null,
          circuitRounds: null,
        },
      ])
      setEditingWorkoutId(null)
      fetchWorkouts()
    } catch (err) {
      console.error("Erreur enregistrement workout:", err)
    }
  }

  function handleEditWorkout(workout) {
    setEditingWorkoutId(workout.id)
    setNewWorkoutTitle(workout.title)
    setNewWorkoutImage(workout.imageUrl || "")
    setNewWorkoutCategory(workout.category || "")
    setNewWorkoutDifficulty(workout.difficulty_level?.toString() || "")
    setSelectedExercises(
      workout.exercises.map((ex, index) => ({
        exerciseId: ex.id,
        orderIndex: ex.orderIndex ?? index,
        mode: ex.duration != null ? "duration" : "reps",
        duration: ex.duration ?? 30,
        repCount: ex.repCount ?? 10,
        restDuration: ex.restDuration ?? 30,
        circuitId: ex.circuitId ?? null,
        circuitRounds: ex.circuitRounds ?? null,
      }))
    )
  }

  const updateField = (index, updates) => {
    const updated = [...selectedExercises]
    updated[index] = { ...updated[index], ...updates }
    setSelectedExercises(updated)
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Gestion des Workouts</h1>

      <div className="bg-white p-4 rounded shadow space-y-4">
        <h2 className="text-lg font-semibold">
          {editingWorkoutId ? "Modifier un Workout" : "Créer un Workout"}
        </h2>
        <input
          placeholder="Titre du workout"
          className="border p-2 rounded w-full"
          value={newWorkoutTitle}
          onChange={(e) => setNewWorkoutTitle(e.target.value)}
        />
        <input
          placeholder="Image URL (optionnelle)"
          className="border p-2 rounded w-full"
          value={newWorkoutImage}
          onChange={(e) => setNewWorkoutImage(e.target.value)}
        />
        <input
          placeholder="Catégorie (ex: débutant, pilates...)"
          className="border p-2 rounded w-full"
          value={newWorkoutCategory}
          onChange={(e) => setNewWorkoutCategory(e.target.value)}
        />
        <select
          className="border p-2 rounded w-full"
          value={newWorkoutDifficulty}
          onChange={(e) => setNewWorkoutDifficulty(e.target.value)}
        >
          <option value="">Niveau de difficulté</option>
          <option value="1">Débutant</option>
          <option value="2">Facile</option>
          <option value="3">Intermédiaire</option>
          <option value="4">Difficile</option>
          <option value="5">Expert</option>
        </select>

        {/* Liste dynamique des exercices */}
        <div className="space-y-4">
          {selectedExercises.map((ex, index) => (
            <div key={index} className="border p-4 rounded space-y-2 bg-gray-50">
              <div className="flex justify-between items-center">
                <strong>Exercice #{index + 1}</strong>
                <button
                  onClick={() => {
                    const upd = [...selectedExercises]
                    upd.splice(index, 1)
                    setSelectedExercises(upd)
                  }}
                  className="text-red-600 text-sm"
                >
                  Supprimer
                </button>
              </div>

              <select
                className="border p-2 rounded w-full"
                value={ex.exerciseId}
                onChange={(e) => updateField(index, { exerciseId: e.target.value })}
              >
                <option value="">-- Choisir un exercice --</option>
                {exercises.map((opt) => (
                  <option key={opt.id} value={opt.id}>{opt.name}</option>
                ))}
              </select>

              <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                <input
                  type="number"
                  className="border p-2 rounded"
                  placeholder="Ordre"
                  value={ex.orderIndex}
                  onChange={(e) => updateField(index, { orderIndex: parseInt(e.target.value) })}
                />

                <div>
                  <div className="flex items-center space-x-4 mb-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name={`mode-${index}`}
                        checked={ex.mode === "duration"}
                        onChange={() => updateField(index, { mode: "duration" })}
                        className="mr-1"
                      />
                      Temps
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name={`mode-${index}`}
                        checked={ex.mode === "reps"}
                        onChange={() => updateField(index, { mode: "reps" })}
                        className="mr-1"
                      />
                      Répétitions
                    </label>
                  </div>
                  {ex.mode === "duration" ? (
                    <input
                      type="number"
                      className="border p-2 rounded w-full"
                      placeholder="Durée (s)"
                      value={ex.duration}
                      onChange={(e) => updateField(index, { duration: parseInt(e.target.value) })}
                    />
                  ) : (
                    <input
                      type="number"
                      className="border p-2 rounded w-full"
                      placeholder="Nombre de reps"
                      value={ex.repCount}
                      onChange={(e) => updateField(index, { repCount: parseInt(e.target.value) })}
                    />
                  )}
                </div>

                <input
                  type="number"
                  className="border p-2 rounded"
                  placeholder="Repos (s)"
                  value={ex.restDuration}
                  onChange={(e) => updateField(index, { restDuration: parseInt(e.target.value) })}
                />

                <input
                  type="text"
                  className="border p-2 rounded"
                  placeholder="Circuit ID (ex: A)"
                  value={ex.circuitId || ""}
                  onChange={(e) => updateField(index, { circuitId: e.target.value || null })}
                />
                <input
                  type="number"
                  className="border p-2 rounded"
                  placeholder="Tours du circuit (si 1er)"
                  value={ex.circuitRounds || ""}
                  onChange={(e) => updateField(index, { circuitRounds: e.target.value ? parseInt(e.target.value) : null })}
                />
              </div>
            </div>
          ))}

          <button
            onClick={() =>
              setSelectedExercises((prev) => [
                ...prev,
                {
                  exerciseId: "",
                  orderIndex: prev.length,
                  mode: "duration",
                  duration: 30,
                  repCount: 10,
                  restDuration: 30,
                  circuitId: null,
                  circuitRounds: null,
                },
              ])
            }
            className="mt-2 bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded"
          >
            Ajouter un exercice
          </button>
        </div>

        <button
          onClick={handleCreateOrUpdateWorkout}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
        >
          {editingWorkoutId ? "Mettre à jour le workout" : "Créer le workout"}
        </button>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-4">Workouts existants</h2>
        <ul className="space-y-2">
          {workouts.map((w) => (
            <li key={w.id} className="border p-2 rounded flex justify-between items-center">
              <div>
                <strong>{w.title}</strong> — {w.exercises?.length || 0} exercice(s)
              </div>
              <button
                onClick={() => handleEditWorkout(w)}
                className="text-blue-600 text-sm"
              >
                Modifier
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default withAuthProtection(GestionWorkouts)

// File: pages/admin/gestion-exercices.js

import { useState, useEffect } from "react"
import axios from "axios"
import withAuthProtection from "../../lib/withAuthProtection"

function GestionExercices() {
  const [exercices, setExercices] = useState([])
  const [newExercice, setNewExercice] = useState({
    name: "",
    videoUrl: "",
    description: "",
    instructions: ""
  })
  const [editingId, setEditingId] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchExercices()
  }, [])

  async function fetchExercices() {
    try {
      const res = await axios.get("/api/exercices")
      setExercices(res.data)
    } catch (err) {
      console.error("Erreur récupération exercices:", err)
    }
  }

  async function handleCreate() {
    try {
      await axios.post("/api/exercices", newExercice)
      setNewExercice({
        name: "",
        videoUrl: "",
        description: "",
        instructions: ""
      })
      await fetchExercices()
    } catch (err) {
      console.error("Erreur création exercice:", err)
    }
  }

  function handleNewChange(field, value) {
    setNewExercice((prev) => ({ ...prev, [field]: value }))
  }

  function handleEditChange(id, field, value) {
    setExercices((prev) =>
      prev.map((e) => (e.id === id ? { ...e, [field]: value } : e))
    )
  }

  async function handleUpdate(id) {
    const exercice = exercices.find((e) => e.id === id)
    try {
      await axios.put(`/api/exercices/${id}`, exercice)
      setEditingId(null)
      await fetchExercices()
    } catch (err) {
      console.error("Erreur mise à jour exercice:", err)
    }
  }

  async function handleDelete(id) {
    try {
      await axios.delete(`/api/exercices/${id}`)
      await fetchExercices()
    } catch (err) {
      console.error("Erreur suppression exercice:", err)
    }
  }

  const displayed = exercices.filter((e) =>
    e.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-bold">Gestion des Exercices</h1>

      {/* Ajout */}
      <section className="bg-white p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-4">Ajouter un exercice</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <input
            placeholder="Nom"
            className="border p-2 rounded"
            value={newExercice.name}
            onChange={(e) => handleNewChange("name", e.target.value)}
          />
          <input
            placeholder="URL vidéo"
            className="border p-2 rounded"
            value={newExercice.videoUrl}
            onChange={(e) => handleNewChange("videoUrl", e.target.value)}
          />
          <input
            placeholder="Description"
            className="border p-2 rounded"
            value={newExercice.description}
            onChange={(e) => handleNewChange("description", e.target.value)}
          />
          <textarea
            placeholder="Instructions"
            className="border p-2 rounded col-span-2"
            value={newExercice.instructions}
            onChange={(e) => handleNewChange("instructions", e.target.value)}
          />
        </div>
        <button
          onClick={handleCreate}
          className="mt-4 bg-green-600 text-white px-4 py-2 rounded"
        >
          Ajouter
        </button>
      </section>

      {/* Recherche */}
      <div>
        <input
          placeholder="Recherche…"
          className="border p-2 rounded w-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Liste */}
      <div className="overflow-x-auto bg-white shadow rounded">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">Nom</th>
              <th className="p-2 border">Vidéo</th>
              <th className="p-2 border">Description</th>
              <th className="p-2 border">Instructions</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayed.map((e) => (
              <tr key={e.id} className="even:bg-gray-50">
                {editingId === e.id ? (
                  <>
                    <td className="p-2 border">
                      <input
                        className="w-full border p-1 rounded"
                        value={e.name}
                        onChange={(ev) => handleEditChange(e.id, "name", ev.target.value)}
                      />
                    </td>
                    <td className="p-2 border">
                      <input
                        className="w-full border p-1 rounded"
                        value={e.videoUrl}
                        onChange={(ev) => handleEditChange(e.id, "videoUrl", ev.target.value)}
                      />
                    </td>
                    <td className="p-2 border">
                      <input
                        className="w-full border p-1 rounded"
                        value={e.description}
                        onChange={(ev) => handleEditChange(e.id, "description", ev.target.value)}
                      />
                    </td>
                    <td className="p-2 border">
                      <textarea
                        className="w-full border p-1 rounded"
                        value={e.instructions}
                        onChange={(ev) => handleEditChange(e.id, "instructions", ev.target.value)}
                      />
                    </td>
                    <td className="p-2 border space-x-2">
                      <button onClick={() => handleUpdate(e.id)} className="text-green-600">
                        Sauver
                      </button>
                      <button onClick={() => setEditingId(null)} className="text-gray-600">
                        Annuler
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="p-2 border">{e.name}</td>
                    <td className="p-2 border truncate max-w-[160px]">{e.videoUrl}</td>
                    <td className="p-2 border">{e.description}</td>
                    <td className="p-2 border">{e.instructions}</td>
                    <td className="p-2 border space-x-2">
                      <button onClick={() => setEditingId(e.id)} className="text-blue-600">
                        Modifier
                      </button>
                      <button onClick={() => handleDelete(e.id)} className="text-red-600">
                        Supprimer
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default withAuthProtection(GestionExercices)

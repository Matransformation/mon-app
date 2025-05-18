// components/dashboard/MetabolismForm.js
import React, { useState, useEffect, useRef } from "react"

export default function MetabolismForm({
  utilisateur,
  poidsActuel,
  metabolismeInit,
  onSave,
}) {
  const [form, setForm] = useState({
    sexe: utilisateur.sexe || "",
    age: utilisateur.age?.toString() || "",
    taille: utilisateur.taille?.toString() || "",
    activite: utilisateur.activite || "",
  })
  const [metabolisme, setMetabolisme] = useState(metabolismeInit ?? "")
  const [saving, setSaving] = useState(false)
  const initialMount = useRef(true)

  // Sync si SSR change
  useEffect(() => {
    setMetabolisme(metabolismeInit ?? "")
  }, [metabolismeInit])

  // Recalcule automatique sur changement de poids
  useEffect(() => {
    if (initialMount.current) {
      initialMount.current = false
      return
    }
    // on recalcule seulement si les champs sont remplis
    if (form.sexe && form.age && form.taille && form.activite) {
      recalc()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [poidsActuel])

  async function recalc() {
    setSaving(true)
    try {
      const { metabolismeCible: newMeta } = await onSave({
        sexe: form.sexe,
        age: parseInt(form.age, 10),
        taille: parseInt(form.taille, 10),
        activite: form.activite,
      })
      setMetabolisme(newMeta.toString())
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    recalc()
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-lg font-semibold mb-4">Calcul de ton métabolisme</h2>
      <form onSubmit={handleSubmit} className="grid gap-2">
        <select
          value={form.sexe}
          onChange={(e) => setForm({ ...form, sexe: e.target.value })}
          className="border p-2 rounded"
        >
          <option value="">Sexe</option>
          <option value="homme">Homme</option>
          <option value="femme">Femme</option>
        </select>

        <input
          type="number"
          placeholder="Âge"
          value={form.age}
          onChange={(e) => setForm({ ...form, age: e.target.value })}
          className="border p-2 rounded"
        />

        <input
          type="number"
          placeholder="Taille (cm)"
          value={form.taille}
          onChange={(e) => setForm({ ...form, taille: e.target.value })}
          className="border p-2 rounded"
        />

        <select
          value={form.activite}
          onChange={(e) => setForm({ ...form, activite: e.target.value })}
          className="border p-2 rounded"
        >
          <option value="">Activité</option>
          <option value="sédentaire">0h</option>
          <option value="légèrement actif">1–2h/sem</option>
          <option value="modérément actif">3–4h/sem</option>
          <option value="très actif">5–6h/sem</option>
          <option value="extrêmement actif">7h+</option>
        </select>

        <button
          type="submit"
          disabled={saving}
          className="bg-brand hover:bg-opacity-90 text-white rounded py-2 mt-2 disabled:opacity-50"
        >
          {saving ? "Calcul en cours…" : "Calculer"}
        </button>
      </form>

      {metabolisme && (
        <p className="mt-4 text-gray-700">
          Ton métabolisme cible : <strong>{metabolisme} kcal</strong>
        </p>
      )}
    </div>
  )
}

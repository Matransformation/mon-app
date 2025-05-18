// components/dashboard/GoalSettings.js
import React, { useState, useEffect, useMemo } from "react"

export default function GoalSettings({
  objectifInit,
  historiquePoids,
  onSave,
}) {
  const [objectif, setObjectif] = useState(objectifInit ?? "")
  const [saving, setSaving] = useState(false)

  // Resync après refresh ou changement d’objectif en base
  useEffect(() => {
    setObjectif(objectifInit ?? "")
  }, [objectifInit])

  // Trie par date et extrait poids initial + actuel
  const { poidsInitial, poidsActuel } = useMemo(() => {
    const sorted = [...historiquePoids].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    )
    return {
      poidsInitial: sorted[0]?.poids ?? 0,
      poidsActuel: sorted.at(-1)?.poids ?? 0,
    }
  }, [historiquePoids])

  // Calculs
  const perdu = (poidsInitial - poidsActuel).toFixed(1)
  const objNum = parseFloat(objectif) || 0
  const diff = (poidsActuel - objNum).toFixed(1)

  const handleSave = async () => {
    if (objectif === "") return
    setSaving(true)
    try {
      const { objectifPoids: newObj } = await onSave(objNum)
      setObjectif(String(newObj))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-lg font-semibold mb-4">🎯 Objectif de poids</h2>

      <div className="flex gap-3 mb-3">
        <input
          type="number"
          value={objectif}
          onChange={(e) => setObjectif(e.target.value)}
          disabled={saving}
          placeholder="kg"
          className="border rounded px-3 py-2 w-24"
        />
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-brand text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {saving ? "Enregistrement…" : "Enregistrer"}
        </button>
      </div>

      <p className="text-sm text-gray-600 mb-1">
        ✅ Déjà perdu : <strong>{perdu} kg</strong>.
      </p>

      {objectif !== "" && (
        diff > 0 ? (
          <p className="text-sm text-gray-600">
            Il reste : <strong>{diff} kg</strong> à perdre.
          </p>
        ) : diff === "0.0" ? (
          <p className="text-sm font-semibold text-green-600">
            🎉 Objectif atteint !
          </p>
        ) : (
          <p className="text-sm font-semibold text-green-600">
            👍 Tu as dépassé ton objectif de{" "}
            <strong>{Math.abs(diff)} kg</strong>.
          </p>
        )
      )}
    </div>
  )
}

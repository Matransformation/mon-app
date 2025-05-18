// components/dashboard/MeasurementsHistory.js
import React, { useMemo } from "react";

export default function MeasurementsHistory({ mensurations, onDelete }) {
  if (!mensurations.length) return <p>Aucune mensuration.</p>;

  // Trie par date décroissante
  const sorted = useMemo(
    () =>
      [...mensurations].sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      ),
    [mensurations]
  );

  // Pour chaque métrique, on calcule la variation par rapport à l'entrée suivante
  function getVariation(key, idx) {
    const next = sorted[idx + 1];
    if (!next || next[key] == null) return null;
    const diff = sorted[idx][key] - next[key];
    if (diff === 0) return " (–)";
    return ` (${diff > 0 ? "+" : ""}${diff.toFixed(1)})`;
  }

  return (
    <div className="bg-white shadow p-6 rounded mb-6">
      <h2 className="text-lg font-semibold mb-4">Historique mensurations</h2>
      <ul className="space-y-4 text-sm">
        {sorted.map((m, idx) => (
          <li
            key={m.id}
            className="flex justify-between items-start border-b pb-2"
          >
            <div>
              <p className="font-semibold">
                {new Date(m.date).toLocaleDateString("fr-FR")}
              </p>
              {[
                "taille",
                "hanches",
                "cuisses",
                "bras",
                "poitrine",
                "mollets",
                "masseGrasse",
              ].map(
                (key) =>
                  m[key] != null && (
                    <p key={key}>
                      {key} : <strong>{m[key]}</strong>
                      <span className="text-gray-500">
                        {getVariation(key, idx)}
                      </span>
                    </p>
                  )
              )}
            </div>
            <button
              onClick={() => onDelete(m.id)}
              className="text-red-600 hover:underline"
            >
              Supprimer
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

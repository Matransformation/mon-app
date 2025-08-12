// components/dashboard/MeasurementsHistory.js
import React, { useMemo } from "react";
import Card from "./Card";
import { Trash2 } from "lucide-react";

export default function MeasurementsHistory({ mensurations, onDelete }) {
  if (!mensurations.length) {
    return (
      <Card className="text-center py-8 text-gray-500">
        📏 Aucune mensuration pour le moment
      </Card>
    );
  }

  const sorted = useMemo(
    () => [...mensurations].sort((a, b) => new Date(b.date) - new Date(a.date)),
    [mensurations]
  );

  const getVariation = (key, idx) => {
    const next = sorted[idx + 1];
    if (!next || next[key] == null) return null;
    const diff = sorted[idx][key] - next[key];
    if (diff === 0) return { value: "–", color: "text-gray-400" };
    return {
      value: `${diff > 0 ? "+" : ""}${diff.toFixed(1)}`,
      color: diff < 0 ? "text-green-500" : "text-red-500",
    };
  };

  const metrics = [
    { key: "taille", label: "Taille (cm)" },
    { key: "hanches", label: "Hanches (cm)" },
    { key: "cuisses", label: "Cuisses (cm)" },
    { key: "bras", label: "Bras (cm)" },
    { key: "poitrine", label: "Poitrine (cm)" },
    { key: "mollets", label: "Mollets (cm)" },
    { key: "masseGrasse", label: "Masse grasse (%)" },
  ];

  return (
    <Card
      title="📊 Historique des mensurations"
      bodyClassName="p-0"
      className="overflow-hidden border-l-4 border-orange-400"
    >
      <ul className="divide-y divide-gray-200">
        {sorted.map((m, idx) => {
          const date = new Date(m.date).toLocaleDateString("fr-FR");
          return (
            <li
              key={m.id}
              className="px-6 py-4 flex justify-between items-start hover:bg-orange-50 transition"
            >
              <div className="flex-1">
                {/* Date en badge */}
                <span className="inline-block text-xs font-medium bg-orange-100 text-orange-700 px-2 py-1 rounded-full mb-2">
                  {date}
                </span>

                {/* Tableau des mesures */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  {metrics.map(({ key, label }) =>
                    m[key] != null ? (
                      <div key={key} className="flex flex-col">
                        <span className="text-gray-500">{label}</span>
                        <span className="font-semibold text-gray-900 flex items-center gap-2">
                          {m[key]}
                          {getVariation(key, idx) && (
                            <span
                              className={`text-xs font-medium ${
                                getVariation(key, idx).color
                              }`}
                            >
                              {getVariation(key, idx).value}
                            </span>
                          )}
                        </span>
                      </div>
                    ) : null
                  )}
                </div>
              </div>

              {/* Bouton suppression */}
              <button
                onClick={() => onDelete(m.id)}
                className="ml-4 text-red-500 hover:text-red-600 transition flex-shrink-0"
                aria-label={`Supprimer mensuration du ${date}`}
              >
                <Trash2 size={18} />
              </button>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

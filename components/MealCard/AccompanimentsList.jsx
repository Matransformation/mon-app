// components/Menu/MealCard/AccompanimentsList.jsx
import { Trash2 } from "lucide-react";

export default function AccompanimentsList({ items, optionsForType, onReplace, onDelete }) {
  if (!items?.length) return null;
  return (
    <div className="mb-3 rounded-xl bg-white p-3 text-sm ring-1 ring-orange-100">
      <h4 className="mb-2 font-medium">Accompagnements :</h4>
      <div className="space-y-2">
        {items.map((a) => {
          const oldId = a.ingredient.id;
          const type = (a.ingredient.sideTypes || [])[0] || null;
          const opts = type ? optionsForType(type) : [];
          return (
            <div key={oldId} className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-gray-900">
                {a.ingredient.name} — {a.quantity} g
              </div>
              <div className="flex items-center gap-2">
                <select
                  className="w-56 rounded-lg border border-orange-100 bg-white px-3 py-1.5 text-sm text-gray-900 focus:border-[#fb8905] focus:outline-none focus:ring-2 focus:ring-[#fb8905]/30"
                  value={oldId}
                  onChange={(e) => {
                    const newId = e.target.value;
                    if (newId && newId !== oldId) onReplace(oldId, newId);
                  }}
                >
                  {opts.map((ing) => (
                    <option key={ing.id} value={ing.id}>
                      {ing.name}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => onDelete(oldId)}
                  className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50"
                  title="Supprimer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Supprimer
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// components/MealCard/AddedSidesList.js
import React from "react";
import { Trash2, ArrowUpRight } from "lucide-react";

// utilitaire pour afficher les macros à la quantité courante
const macrosAtQty = (ing, qty) => {
  const f = (Number(qty) || 0) / 100;
  return {
    p: Math.round((ing?.protein || 0) * f),
    c: Math.round((ing?.carbs || 0) * f),
    f: Math.round((ing?.fat || 0) * f),
  };
};

export default function AddedSidesList({
  localAcc = [],
  optionsForType,
  onReplace,
  onDelete,
  onAdjust,          // seulement “Ajuster ↑”
  adjustHints = {}, // { [idIng]: { key, pct, addGrams, reason } }
}) {
  return (
    <div className="space-y-3">
      {localAcc.map((a) => {
        const ing = a?.ingredient;
        const qty = Math.max(0, Number(a?.quantity || 0));
        if (!ing) return null;

        // Options de remplacement : même “famille perçue” que l’ing actuel
        const firstType = ing?.sideTypes?.[0];
        const currentType = typeof firstType === "string" ? firstType : firstType?.sideType;
        const opts = optionsForType(currentType, ing);

        const hintUp = adjustHints[ing.id]; // null => on cache le bouton
        const m = macrosAtQty(ing, qty);

        return (
          <div
            key={ing.id}
            className="rounded-2xl border border-orange-100 bg-white p-4 md:p-5 shadow-[0_1px_0_rgba(0,0,0,0.03)] overflow-hidden"
          >
            {/* ✅ Grille stable: 1 col mobile / 3 cols desktop */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:items-start">
              {/* Col 1 — Nom + quantité + chips */}
              <div className="min-w-0 md:pr-2">
                <div className="flex items-center justify-between md:block">
                  <div className="text-sm font-semibold text-gray-900 truncate">
                    {ing.name}
                  </div>
                  <div className="mt-0.5 text-xs text-gray-600 md:mt-1">{qty} g</div>
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <span className="rounded-full bg-gray-100 px-2 py-[2px] text-[11px] text-gray-700">
                    {m.p} g prot
                  </span>
                  <span className="rounded-full bg-gray-100 px-2 py-[2px] text-[11px] text-gray-700">
                    {m.c} g gluc
                  </span>
                  <span className="rounded-full bg-gray-100 px-2 py-[2px] text-[11px] text-gray-700">
                    {m.f} g lip
                  </span>
                </div>
              </div>

              {/* Col 2 — Select Remplacer */}
              <div className="min-w-0 md:px-2">
                <label className="mb-1 block text-xs font-medium text-gray-600">
                  Remplacer par
                </label>
                <select
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:ring-2 focus:ring-orange-200 truncate"
                  defaultValue=""
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val) {
                      onReplace?.(a, val);
                      e.target.value = ""; // reset après action
                    }
                  }}
                >
                  <option value="" disabled>
                    Sélectionner un ingrédient…
                  </option>
                  {/* garder l’actuel en évidence */}
                  <option value={ing.id}>{ing.name} (actuel)</option>
                  {(opts || [])
                    .filter((o) => o.id !== ing.id)
                    .map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.name}
                      </option>
                    ))}
                </select>
              </div>

              {/* Col 3 — Actions */}
              <div className="min-w-0 md:pl-2">
                <div className="flex flex-wrap items-center justify-start gap-2 md:justify-end">
                  {/* Ajuster ↑ — seulement si possible */}
                  {hintUp && (
                    <button
                      type="button"
                      onClick={() => onAdjust?.(a)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-white px-3 py-1.5 text-xs font-semibold text-orange-700 transition hover:bg-orange-50"
                      title={`Ajuster +${hintUp.addGrams} g (${hintUp.reason})`}
                    >
                      <ArrowUpRight className="h-3.5 w-3.5" />
                      Ajuster
                    </button>
                  )}

                  {/* Supprimer */}
                  <button
                    type="button"
                    onClick={() => onDelete?.(ing.id)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-50"
                    title="Supprimer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Supprimer
                  </button>
                </div>

                {/* Petit hint (seulement si Ajuster est dispo) */}
                {hintUp && (
                  <div className="mt-2 inline-flex max-w-full flex-wrap items-center gap-1 rounded-full bg-orange-50 px-2.5 py-1 text-[11px] font-medium text-orange-800 ring-1 ring-orange-200">
                    +{hintUp.addGrams} g {hintUp.reason} (~{hintUp.pct}%)
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

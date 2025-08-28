import React from "react";
import { Plus, Info, AlertTriangle } from "lucide-react";

const typeLabels = {
  VEGETABLE_SIDE:    "Légume",
  PROTEIN:           "Source de protéine",
  BREAKFAST_PROTEIN: "Source de protéine (petit-déjeuner)",
  DAIRY:             "Produit laitier (100 g)",
  CARB:              "Source de glucides (100 g)",
  CEREAL:            "Céréales",
  FRUIT_SIDE:        "Fruit (100 g)",
  FAT:               "Source de lipides",
};

const typeHints = {
  VEGETABLE_SIDE: "Ajout par défaut : 150 g",
  DAIRY: "Ajout par défaut : 100 g",
  FRUIT_SIDE: "Ajout par défaut : 100 g",
};

export default function AccompanimentSelector({
  suggestions = {},
  selection = {},
  setSelection,
  onAdd,
  totalDairy = 0,
}) {
  const types = Object.keys(suggestions || {});
  if (types.length === 0) return null;

  // Petite info lorsque protéines ET produits laitiers coexistent
  const hasProtein = types.includes("PROTEIN") || types.includes("BREAKFAST_PROTEIN");
  const hasDairy   = types.includes("DAIRY");

  const selectedCount = Object.values(selection).filter(Boolean).length;

  const handleChange = (type, id) => setSelection({ [type]: id });

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-orange-100">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gray-900">Ajouter un accompagnement</h4>
        <span
          aria-hidden
          className="h-1 w-16 -skew-x-6 rounded bg-[#fb8905]/40"
        />
      </div>

      {hasProtein && hasDairy && (
        <p className="mb-3 inline-flex items-start gap-2 rounded-lg bg-orange-50 px-3 py-2 text-xs text-orange-800 ring-1 ring-orange-100">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            Si tu veux un <strong>produit laitier</strong>, ajoute-le <em>avant</em> la source de
            protéine.
          </span>
        </p>
      )}

      <div className="space-y-3">
        {types.map((type) => {
          const options = suggestions[type] || [];
          if (options.length === 0) return null;

          return (
            <div key={type}>
              <label className="mb-1 block text-sm font-medium text-gray-900">
                {typeLabels[type] || type}
                {typeHints[type] && (
                  <span className="ml-2 align-middle text-xs font-normal text-gray-500">
                    ({typeHints[type]})
                  </span>
                )}
              </label>

              <div className="relative">
                <select
                  className="w-full appearance-none rounded-lg border border-orange-100 bg-white px-3 py-2 text-sm text-gray-900 shadow-inner focus:border-[#fb8905] focus:outline-none focus:ring-2 focus:ring-[#fb8905]/30"
                  value={selection[type] || ""}
                  onChange={(e) => handleChange(type, e.target.value)}
                >
                  <option value="">-- Choisir --</option>
                  {options.map((ing) => (
                    <option key={ing.id} value={ing.id}>
                      {ing.name}
                      {type === "DAIRY" || type === "FRUIT_SIDE" ? " — 100 g" : ""}
                      {type === "VEGETABLE_SIDE" ? " — ~150 g" : ""}
                    </option>
                  ))}
                </select>

                {/* chevron décoratif */}
                <svg
                  className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
            </div>
          );
        })}
      </div>

      <button
        className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#fb8905] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#e07c04] disabled:opacity-50"
        onClick={onAdd}
        disabled={selectedCount !== 1}
      >
        <Plus className="h-4 w-4" />
        Ajouter
      </button>

      {selection.DAIRY && totalDairy + 100 > 150 && (
        <p className="mt-3 inline-flex w-full items-center gap-2 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700 ring-1 ring-rose-200">
          <AlertTriangle className="h-4 w-4" />
          <span>
            Vous dépasserez <strong>150 g</strong> de produits laitiers sur ce repas.
          </span>
        </p>
      )}
    </div>
  );
}

// File: components/Menu/AccompanimentSelector.js
import React from "react";

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

export default function AccompanimentSelector({
  suggestions = {},
  selection = {},
  setSelection,
  onAdd,
  totalDairy = 0,
}) {
  const types = Object.keys(suggestions);
  if (types.length === 0) return null;

  // Petite info lorsque protéines ET produits laitiers coexistent
  const hasProtein = types.includes("PROTEIN") || types.includes("BREAKFAST_PROTEIN");
  const hasDairy   = types.includes("DAIRY");
  const tipDairy = hasDairy && hasProtein && (
    <p className="text-xs text-gray-500 mb-2 italic">
      ℹ️ Si vous souhaitez un produit laitier, ajoutez-le avant la source de protéine.
    </p>
  );

  const selectedCount = Object.values(selection).filter(Boolean).length;
  const handleChange = (type, id) => setSelection({ [type]: id });

  return (
    <div className="bg-white p-4 rounded-lg shadow-md text-sm">
      <h4 className="font-semibold mb-2">Ajouter un accompagnement</h4>
      {tipDairy}

      {types.map(type => {
        const options = suggestions[type];
        if (!options || options.length === 0) return null;
        return (
          <div key={type} className="mb-3">
            <label className="block font-medium mb-1">
              {typeLabels[type] || type}
            </label>
            <select
              className="w-full border border-gray-300 rounded px-2 py-1"
              value={selection[type] || ""}
              onChange={e => handleChange(type, e.target.value)}
            >
              <option value="">-- Choisir --</option>
              {options.map(ing => (
                <option key={ing.id} value={ing.id}>
                  {ing.name}
                  {(type === "DAIRY" || type === "FRUIT_SIDE" )
                    ? " — 100 g"
                    : ""}
                </option>
              ))}
            </select>
          </div>
        );
      })}

      <button
        className="mt-2 w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        onClick={onAdd}
        disabled={selectedCount !== 1}
      >
        ➕ Ajouter
      </button>

      {selection.DAIRY && totalDairy + 100 > 150 && (
        <p className="mt-2 text-red-500 text-xs">
          ⚠️ Vous dépassez 150 g de produits laitiers sur ce repas.
        </p>
      )}
    </div>
  );
}

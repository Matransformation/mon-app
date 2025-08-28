// components/Menu/MealCard/SuggestOneIngredient.jsx
export default function SuggestOneIngredient({ bestList, value, onChange, onAdd }) {
    if (!bestList?.length) return null;
    return (
      <div className="mb-3 rounded-xl bg-white p-3 ring-1 ring-orange-100">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <span className="text-sm font-medium text-gray-900">Compléter le reste (1 ingrédient) :</span>
          <div className="flex-1 flex gap-2">
            <select
              className="flex-1 rounded-lg border border-orange-100 bg-white px-3 py-1.5 text-sm text-gray-900 focus:border-[#fb8905] focus:outline-none focus:ring-2 focus:ring-[#fb8905]/30"
              value={value}
              onChange={(e) => onChange(e.target.value)}
            >
              {bestList.map((c) => (
                <option key={c.ing.id} value={`${c.type}:${c.ing.id}`}>
                  {c.ing.name} — ~{c.qty} g
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={onAdd}
              className="inline-flex items-center justify-center rounded-full bg-[#fb8905] px-4 py-2 text-sm font-semibold text-white hover:bg-[#e07c04]"
            >
              Ajouter
            </button>
          </div>
        </div>
      </div>
    );
  }
  
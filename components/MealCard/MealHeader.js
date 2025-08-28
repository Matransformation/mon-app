import { Pencil } from "lucide-react";

const TYPE_BADGE = {
  "petit-dejeuner": "bg-orange-100 text-orange-900",
  dejeuner: "bg-emerald-100 text-emerald-900",
  collation: "bg-sky-100 text-sky-900",
  diner: "bg-amber-100 text-amber-900",
};

export default function MealHeader({ repas, onChangeClick }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <span
        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-black/5 ${
          TYPE_BADGE[repas.repasType] || "bg-gray-100 text-gray-900"
        }`}
      >
        {repas.repasType.toUpperCase()}
      </span>
      {onChangeClick && (
        <button
          onClick={onChangeClick}
          className="inline-flex items-center gap-1 rounded-full border border-orange-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-900 transition hover:bg-orange-50"
          title="Changer la recette"
        >
          <Pencil className="h-3.5 w-3.5" />
          Changer
        </button>
      )}
    </div>
  );
}

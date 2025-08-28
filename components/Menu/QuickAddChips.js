// components/Menu/QuickAddChips.js
import React, { useMemo } from "react";

/**
 * Petites "pills" pour ajouter en 1 clic un accompagnement suggéré.
 * - type: "VEGETABLE_SIDE" | "DAIRY" | "FRUIT_SIDE" | "PROTEIN" | "CARB" | ...
 * - options: [{ id, name, protein, carbs, fat }]
 * - rest: { p, c, f } manques de macros (en g)
 * - onQuickAdd(type, id): callback (le parent calcule la quantité réelle comme d'habitude)
 */
export default function QuickAddChips({ type, options = [], rest = { p:0, c:0, f:0 }, onQuickAdd }) {
  const shown = useMemo(() => options.slice(0, 4), [options]);

  const qtyHint = (ing) => {
    if (type === "VEGETABLE_SIDE") return "150 g";
    if (type === "DAIRY" || type === "FRUIT_SIDE") return "100 g";
    const per = {
      p: (ing?.protein || 0) / 100,
      c: (ing?.carbs || 0) / 100,
      f: (ing?.fat || 0) / 100,
    };
    const cands = [
      per.p > 0 ? rest.p / per.p : Infinity,
      per.c > 0 ? rest.c / per.c : Infinity,
      per.f > 0 ? rest.f / per.f : Infinity,
    ].filter((x) => Number.isFinite(x) && x > 0);
    let q = cands.length ? Math.min(...cands) : 100;
    // borne 50–250 g et arrondi par 10 g
    q = Math.max(50, Math.min(250, Math.round(q / 10) * 10));
    return `${q} g`;
  };

  if (!shown.length) return null;

  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {shown.map((ing) => (
        <button
          key={ing.id}
          type="button"
          onClick={() => onQuickAdd?.(type, ing.id)}
          className="inline-flex items-center gap-2 rounded-full border border-orange-100 bg-white px-3 py-1.5 text-xs font-medium text-gray-900 hover:bg-orange-50"
          title={`Ajouter ${ing.name}`}
        >
          <span className="truncate max-w-[10rem]">{ing.name}</span>
          <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] text-gray-700">
            {qtyHint(ing)}
          </span>
        </button>
      ))}
    </div>
  );
}

// components/Menu/MealCard/IngredientsPanel.jsx
import { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function IngredientsPanel({ items, title = "Ingrédients", defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  if (!items?.length) return null;

  return (
    <div className="mb-3 rounded-xl bg-white ring-1 ring-orange-100">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-3 py-2 text-left text-sm font-medium text-gray-900"
        aria-expanded={open}
      >
        <span>{title}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <ul className="px-3 pb-3 text-sm text-gray-800 space-y-1 list-disc list-inside">
          {items.map((it) => (
            <li key={it.id}>
              {it.name} — {it.qty}
              {it.unit}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

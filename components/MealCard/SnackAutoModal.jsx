// components/MealCard/SnackChoiceModal.jsx
import React, { useEffect, useState } from "react";
import { X, Apple, Milk, Dumbbell, Nut } from "lucide-react";

export default function SnackChoiceModal({
  open,
  onClose,
  onSubmit,
  canFruit = true,
  canDairy = true,
}) {
  const [choice, setChoice] = useState("dairy"); // défaut: yaourt

  useEffect(() => {
    if (!open) return;
    // Si laitier impossible, on bascule sur fruit si possible
    if (!canDairy && canFruit) setChoice("fruit");
    else if (!canDairy && !canFruit) setChoice("protein");
  }, [open, canDairy, canFruit]);

  if (!open) return null;

  const Item = ({ id, icon: Icon, label, disabled }) => (
    <label
      className={[
        "flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2",
        choice === id ? "border-orange-300 bg-orange-50/60" : "border-gray-200 bg-white",
        disabled ? "opacity-50 cursor-not-allowed" : "",
      ].join(" ")}
    >
      <input
        type="radio"
        name="snack-choice"
        className="h-4 w-4 accent-[#fb8905]"
        disabled={disabled}
        checked={choice === id}
        onChange={() => !disabled && setChoice(id)}
      />
      <div className="flex items-center gap-2 text-gray-900">
        <Icon className="h-4 w-4" />
        <span>{label}</span>
      </div>
    </label>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />
      <div className="relative z-[101] w-[92vw] max-w-md rounded-2xl bg-white p-5 shadow-xl ring-1 ring-black/5">
        <div className="mb-2 flex items-start justify-between gap-3">
          <h3 className="text-base font-semibold text-gray-900">Ajouter une collation</h3>
          <button type="button" onClick={onClose} className="rounded-full p-1 text-gray-500 hover:bg-gray-100" aria-label="Fermer">
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mb-4 text-sm text-gray-600">Choisis une seule source principale.</p>

        <div className="space-y-3">
          <Item id="dairy"  icon={Milk}     label="Yaourt / produit laitier" disabled={!canDairy} />
          <Item id="fruit"  icon={Apple}    label="Fruit"                    disabled={!canFruit} />
          <Item id="protein" icon={Dumbbell} label="Source protéique"        disabled={false} />
          <Item id="nuts"   icon={Nut}      label="Fruits secs & oléagineux" disabled={false} />
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            Annuler
          </button>
          <button
            type="button"
            onClick={() => {
              onSubmit?.({
                preferDairy:  choice === "dairy",
                preferFruit:  choice === "fruit",
                preferProtein: choice === "protein",
                preferNuts:    choice === "nuts",
              });
              onClose?.();
            }}
            className="rounded-lg bg-[#fb8905] px-3 py-2 text-sm font-semibold text-white hover:bg-[#e07c04]"
          >
            Ajouter
          </button>
        </div>
      </div>
    </div>
  );
}

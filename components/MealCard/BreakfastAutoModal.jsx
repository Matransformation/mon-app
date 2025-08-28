// components/MealCard/BreakfastAutoModal.jsx
import React, { useEffect, useState } from "react";
import * as Icons from "lucide-react";

const DEBUG = true;

// On récupère les icônes de façon "défensive"
const XIcon = Icons.X;
const AppleIcon = Icons.Apple ?? (() => null);
// Si Milk n'existe pas dans ta version, on prend CupSoda, puis Utensils, sinon rien
const DairyIcon = Icons.Milk ?? Icons.CupSoda ?? Icons.Utensils ?? (() => null);

export default function BreakfastAutoModal({
  open,
  onClose,
  onSubmit,
  canFruit,
  canDairy,
  dairyBlockedReason = "",
  repasType = "petit-dejeuner",
}) {
  const [wantFruit, setWantFruit] = useState(false);
  const [wantDairy, setWantDairy] = useState(false);

  useEffect(() => {
    if (!open) return;
    setWantFruit(!!canFruit);
    setWantDairy(!!canDairy);
    if (DEBUG) {
      console.log("[BreakfastAutoModal] open:", {
        open,
        canFruit,
        canDairy,
        repasType,
        presetFruit: !!canFruit,
        presetDairy: !!canDairy,
      });
    }
  }, [open, canFruit, canDairy, repasType]);

  useEffect(() => {
    if (!canDairy) setWantDairy(false);
  }, [canDairy]);

  const handleClose = () => {
    if (DEBUG) console.log("[BreakfastAutoModal] onClose()");
    onClose?.();
  };

  const handleSubmit = () => {
    const payload = {
      preferFruit: wantFruit && canFruit,
      preferDairy: wantDairy && canDairy,
    };
    if (DEBUG) console.log("[BreakfastAutoModal] onSubmit()", payload);
    onSubmit?.(payload);
    onClose?.();
  };

  if (!open) return null;

  const mealLabel =
    repasType === "petit-dejeuner"
      ? "petit-déjeuner"
      : repasType === "dejeuner"
      ? "déjeuner"
      : repasType === "diner"
      ? "dîner"
      : "repas";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={handleClose} aria-hidden="true" />
      <div className="relative z-[101] w-[92vw] max-w-md rounded-2xl bg-white p-5 shadow-xl ring-1 ring-black/5">
        <div className="mb-2 flex items-start justify-between gap-3">
          <h3 className="text-base font-semibold text-gray-900">Ajouter des accompagnements</h3>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-full p-1 text-gray-500 hover:bg-gray-100"
            aria-label="Fermer"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        <p className="mb-4 text-sm text-gray-600">
          Sélectionne ce que tu souhaites ajouter pour compléter ton {mealLabel}.
        </p>

        <div className="space-y-3">
          {canFruit ? (
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-orange-200 bg-orange-50/30 px-3 py-2">
              <input
                type="checkbox"
                className="h-4 w-4 accent-[#fb8905]"
                checked={wantFruit}
                onChange={(e) => setWantFruit(e.target.checked)}
              />
              <div className="flex items-center gap-2 text-gray-900">
                <AppleIcon className="h-4 w-4" />
                <span>Ajouter un fruit</span>
              </div>
            </label>
          ) : (
            <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-600">
              Fruit déjà présent dans le repas — option désactivée.
            </div>
          )}

          {canDairy ? (
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-orange-200 bg-orange-50/30 px-3 py-2">
              <input
                type="checkbox"
                className="h-4 w-4 accent-[#fb8905]"
                checked={wantDairy}
                onChange={(e) => setWantDairy(e.target.checked)}
              />
              <div className="flex items-center gap-2 text-gray-900">
                <DairyIcon className="h-4 w-4" />
                <span>Ajouter un produit laitier</span>
              </div>
            </label>
          ) : (
            <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-600">
              {dairyBlockedReason || `Produit laitier déjà présent pour ce ${mealLabel} — option désactivée.`}
            </div>
          )}

          {!canFruit && !canDairy && (
            <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600">
              Fruit et produit laitier déjà présents dans le repas.
            </div>
          )}
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="rounded-lg bg-[#fb8905] px-3 py-2 text-sm font-semibold text-white hover:bg-[#e07c04]"
          >
            Ajouter
          </button>
        </div>
      </div>
    </div>
  );
}

import { CheckCircle2, AlertTriangle } from "lucide-react";

export default function InfoMessages({ calCon, calObj, requireVegetable }) {
  return (
    <>
      {calCon >= calObj * 0.7 && (
        <div className="mb-3 inline-flex w-full items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700 ring-1 ring-emerald-200">
          <CheckCircle2 className="h-4 w-4" />
          <span>Parfait, ton repas est validé — tu n’es pas obligé d’ajouter d’autres accompagnements !</span>
        </div>
      )}
      {requireVegetable && (
        <div className="mb-3 inline-flex w-full items-center gap-2 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-rose-200">
          <AlertTriangle className="h-4 w-4" />
          <span>Choix obligatoire d’un légume (150&nbsp;g), si pas de légumes dans la recette.</span>
        </div>
      )}
    </>
  );
}

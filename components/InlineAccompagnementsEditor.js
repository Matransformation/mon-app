import { useState, useEffect } from "react";
import axios from "axios";

export default function InlineAccompagnementsEditor({
  repas,
  onSave,
  recetteMacros,
  deficits,
}) {
  // Tous les ingrédients disponibles
  const [allIngredients, setAllIngredients] = useState([]);
  // Slots actuels : { id, quantity }
  const [slots, setSlots] = useState(
    repas.accompagnements?.map(a => ({ id: a.id, quantity: a.quantity })) || []
  );
  // Sélection d'une source protéinée
  const [proteinSideId, setProteinSideId] = useState("");

  // Récupération de la liste d'ingrédients
  useEffect(() => {
    axios.get("/api/ingredients").then(r => setAllIngredients(r.data));
  }, []);

  // Enregistre en base et met à jour l'état local
  const save = async newSlots => {
    setSlots(newSlots);
    try {
      await axios.put(`/api/menu/repas/${repas.id}`, {
        recetteId: repas.recetteId,
        accompagnements: newSlots.map(s => ({ id: s.id, quantity: s.quantity })),
      });
      onSave();
    } catch (err) {
      console.error("Erreur lors de la sauvegarde des accompagnements", err);
    }
  };

  // Ajoute une source protéinée avec quantité calculée
  const handleAddProteinSide = () => {
    if (!proteinSideId) return;
    const ing = allIngredients.find(i => i.id === proteinSideId);
    if (!ing) return;
    const remainingProtein = deficits.protein;
    const qty = Math.ceil(remainingProtein / (ing.protein / 100));
    save([...slots, { id: proteinSideId, quantity: qty }]);
    setProteinSideId("");
  };

  // Change manuellement l'ingrédient d'un slot existant
  const handleIngredientChange = (idx, newId) => {
    const newSlots = [...slots];
    newSlots[idx] = { id: newId, quantity: newSlots[idx]?.quantity || 0 };
    save(newSlots);
  };

  // Change manuellement la quantité d'un slot existant
  const handleQuantityChange = (idx, qty) => {
    const newSlots = [...slots];
    newSlots[idx] = { ...newSlots[idx], quantity: qty };
    save(newSlots);
  };

  // Supprime un slot
  const removeSlot = idx => save(slots.filter((_, i) => i !== idx));

  // Ajoute un slot vide (ingrédient + quantité à remplir)
  const addSlot = () => {
    if (slots.length >= 3) return;
    save([...slots, { id: "", quantity: 0 }]);
  };

  // Ajustement automatique optionnel via IA
  const handleAutoAdjust = async () => {
    try {
      const valid = slots.filter(s => s.id);
      const payload = valid.map(s => {
        const ing = allIngredients.find(i => i.id === s.id) || {};
        return {
          id: s.id,
          name: ing.name,
          unit: ing.unit,
          calories: ing.calories,
          protein: ing.protein,
          fat: ing.fat,
          carbs: ing.carbs,
        };
      });
      const { data } = await axios.post("/api/ai/calculate-portions", {
        recette: recetteMacros,
        accompagnements: payload,
        objectifs: deficits,
      });
      const adjusted = valid.map(s => {
        const p = data.portions.find(x => x.id === s.id);
        return { id: s.id, quantity: p?.quantity ?? s.quantity };
      });
      save(adjusted);
    } catch {
      alert("Erreur auto-ajust");
    }
  };

  return (
    <div className="mt-2 border-t pt-2 w-full">
      {/* En-tête */}
      <div className="flex justify-between items-center mb-2">
        <span className="font-semibold">Accompagnements :</span>
        <button
          type="button"
          onClick={handleAutoAdjust}
          className="text-sm bg-blue-100 px-2 py-1 rounded"
        >
          🪄 Ajuster quantités
        </button>
      </div>

      {/* Sélecteur de protéine */}
      <div className="mb-4">
        <label className="font-medium block mb-1">
          Ajouter un accompagnement protéiné
        </label>
        <div className="flex items-center space-x-2">
          <select
            value={proteinSideId}
            onChange={e => setProteinSideId(e.target.value)}
            className="border rounded p-1 flex-1"
          >
            <option value="">— Choisir une source de protéine —</option>
            {allIngredients
              .filter(i => i.sideTypes.includes("PROTEIN"))
              .map(i => {
                const qtyFor = Math.ceil(deficits.protein / (i.protein / 100));
                return (
                  <option key={i.id} value={i.id}>
                    {i.name} ({i.protein}g P/100g) — {qtyFor}g
                  </option>
                );
              })}
          </select>
          <button
            type="button"
            onClick={handleAddProteinSide}
            className="bg-green-100 px-3 py-1 rounded text-green-700"
          >
            +
          </button>
        </div>
      </div>

      {/* Liste des slots */}
      {slots.map((s, idx) => {
        const ing = allIngredients.find(i => i.id === s.id) || {};
        const options = ing.ingredientType
          ? allIngredients.filter(i => i.ingredientType === ing.ingredientType)
          : allIngredients;
        return (
          <div key={idx} className="flex flex-col mb-4">
            <div className="flex items-center space-x-2">
              <select
                value={s.id}
                onChange={e => handleIngredientChange(idx, e.target.value)}
                className="border rounded p-1 flex-1"
              >
                <option value="">— Choisir un ingrédient —</option>
                {options.map(i => (
                  <option key={i.id} value={i.id}>
                    {i.name} ({i.ingredientType})
                  </option>
                ))}
              </select>
              <input
                type="number"
                min="0"
                value={s.quantity}
                onChange={e =>
                  handleQuantityChange(idx, parseInt(e.target.value, 10) || 0)
                }
                className="w-20 border rounded p-1 text-right"
                placeholder="g"
              />
              <button
                type="button"
                onClick={() => removeSlot(idx)}
                className="text-red-500"
              >
                ✕
              </button>
            </div>
            {s.quantity > 0 && (
              <p className="mt-1 text-sm text-green-600">
                {s.quantity} g →{" "}
                {Math.round((ing.calories || 0) * s.quantity / 100)} kcal
              </p>
            )}
          </div>
        );
      })}

      {slots.length < 3 && (
        <button
          type="button"
          onClick={addSlot}
          className="text-blue-500 text-sm hover:underline"
        >
          + Ajouter un accompagnement
        </button>
      )}
    </div>
  );
}

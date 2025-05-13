// components/ChangeAccompagnementsModal.js

import { useState, useEffect } from "react";
import axios from "axios";

export default function ChangeAccompagnementsModal({ repas, onClose, onUpdate }) {
  const [ingredients, setIngredients] = useState([]);
  const [selectedIds, setSelectedIds] = useState(repas.accompagnements?.map(a => a.id) || []);
  const [quantities, setQuantities] = useState(
    repas.accompagnements?.reduce((o, a) => ({ ...o, [a.id]: a.quantity }), {}) 
  );
  const [error, setError] = useState("");

  useEffect(() => {
    axios.get("/api/ingredients").then(r => setIngredients(r.data));
  }, []);

  const toggleIngredient = (id) => { /* … inchangé … */ };

  // Clic sur “Calcul automatique” → on appelle NOTRE API, pas OpenAI direct
  const handleAutoPortions = async () => {
    try {
      const recette = {
        name: repas.recette.name,
        calories: repas.recette.calories,
        protein: repas.recette.protein,
        fat: repas.recette.fat,
        carbs: repas.recette.carbs,
      };
      const accs = ingredients
        .filter(i => selectedIds.includes(i.id))
        .map(i => ({
          id: i.id, name: i.name, unit: i.unit,
          calories: i.calories, protein: i.protein,
          fat: i.fat, carbs: i.carbs
        }));
      const objectifs = {
        calories: repas.objectifCalories,
        protein: repas.objectifProteines,
        fat: repas.objectifLipides,
        carbs: repas.objectifGlucides,
      };

      const { data } = await axios.post("/api/ai/calculate-portions", {
        recette,
        accompagnements: accs,
        objectifs,
      });

      // Remplissage des quantités depuis la réponse du serveur
      const newQuant = {};
      data.portions.forEach(p => newQuant[p.id] = p.quantity);
      setQuantities(newQuant);
    } catch (err) {
      console.error(err);
      setError("Échec du calcul automatique");
      setTimeout(() => setError(""), 2000);
    }
  };

  const handleSubmit = async () => { /* … inchangé … */ };

  return (
    <div> 
      {/* … */}
      <button onClick={handleAutoPortions}>🪄 Calcul automatique</button>
      {/* … */}
    </div>
  );
}

import { useEffect, useState } from "react";
import axios from "axios";

export default function ChangeRepasModal({ repas, onClose, onUpdate }) {
  const [recipes, setRecipes] = useState([]);
  const [selectedId, setSelectedId] = useState(repas.recetteId);

  useEffect(() => {
    axios
      .get("/api/recettes")
      .then(res => setRecipes(res.data))
      .catch(console.error);
  }, []);

  const handleSave = async () => {
    try {
      await axios.put(`/api/menu/repas/${repas.id}`, {
        recetteId: selectedId,
        accompagnements: [], // Réinitialise les accompagnements lors du changement de recette
      });
      onUpdate();
      onClose();
    } catch (err) {
      console.error("Erreur lors de la sauvegarde:", err);
      alert("Une erreur est survenue lors de la mise à jour du repas.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <h2 className="text-lg font-bold mb-4 text-center">
          Changer la recette
        </h2>

        <select
          value={selectedId}
          onChange={e => setSelectedId(e.target.value)}
          className="w-full border p-2 rounded mb-4"
        >
          <option value="">— Sélectionnez une recette —</option>
          {recipes.map(r => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>

        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Sauvegarder
          </button>
        </div>
      </div>
    </div>
  );
}

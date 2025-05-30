import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import Image from "next/image";
import { X } from "lucide-react";

export default function ChangeRepasModal({ repas, onClose, onUpdate }) {
  const [recipes, setRecipes] = useState([]);
  const [selectedId, setSelectedId] = useState(repas.recetteId);
  const [search, setSearch] = useState("");

  const PRIORITY_IDS = [
    "cmaxx4n2r004aca1jbgb157y1",
    "cmaxxut84004vca1joti1vd8p",
    "cmbat2w9h0000l7042qbhp2ow",
  ];

  useEffect(() => {
    axios
      .get("/api/recettes")
      .then(res => setRecipes(res.data))
      .catch(console.error);
  }, []);

  const favoris = recipes.filter(r => r.isFavorite);
  const priority = recipes.filter(r => PRIORITY_IDS.includes(r.id));
  const rest = recipes.filter(r => !PRIORITY_IDS.includes(r.id));

  const filtered = useMemo(() => {
    return rest.filter(r =>
      r.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [rest, search]);

  const handleSelect = async (id) => {
    try {
      await axios.put(`/api/menu/repas/${repas.id}`, {
        recetteId: id,
        accompagnements: [],
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
      <div className="bg-white p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
        {/* ❌ Bouton de fermeture */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-black"
          aria-label="Fermer"
        >
          <X size={20} />
        </button>

        <h2 className="text-lg font-bold mb-4 text-center">Changer la recette</h2>

        {/* 🔍 Barre de recherche */}
        <input
          type="text"
          placeholder="Rechercher une recette..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full border p-2 rounded mb-4"
        />

        {/* 📌 Suggestions prioritaires */}
        {priority.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-600 mb-2">
              Suggestions en priorité :
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {priority.map(r => (
                <button
                  key={r.id}
                  onClick={() => handleSelect(r.id)}
                  className="text-left border p-2 rounded hover:border-green-500"
                >
                  <div className="w-full aspect-video relative mb-1 rounded overflow-hidden">
                    <Image
                      src={r.photoUrl}
                      alt={r.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <p className="text-sm truncate">{r.name}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ⭐ Favoris */}
        {favoris.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-600 mb-1">Vos favoris :</h3>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {favoris.map(r => (
                <button
                  key={r.id}
                  onClick={() => handleSelect(r.id)}
                  className="min-w-[120px] p-1 border rounded"
                >
                  <Image
                    src={r.photoUrl}
                    alt={r.name}
                    width={120}
                    height={80}
                    className="rounded object-cover mb-1"
                  />
                  <p className="text-xs text-center truncate">{r.name}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 📋 Liste des recettes filtrées */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
          {filtered.map(r => (
            <button
              key={r.id}
              onClick={() => handleSelect(r.id)}
              className="text-left border p-2 rounded hover:border-green-500"
            >
              <div className="w-full aspect-video relative mb-1 rounded overflow-hidden">
                <Image
                  src={r.photoUrl}
                  alt={r.name}
                  fill
                  className="object-cover"
                />
              </div>
              <p className="text-sm truncate">{r.name}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

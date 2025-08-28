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
      .then((res) => setRecipes(res.data))
      .catch(console.error);
  }, []);

  const favoris = recipes.filter((r) => r.isFavorite);
  const priority = recipes.filter((r) => PRIORITY_IDS.includes(r.id));
  const rest = recipes.filter((r) => !PRIORITY_IDS.includes(r.id));

  const filtered = useMemo(() => {
    const q = (search || "").toLowerCase();
    return rest.filter((r) => r.name.toLowerCase().includes(q));
  }, [rest, search]);

  const handleSelect = async (id) => {
    try {
      // ✅ CORRECTION: backticks autour de l’URL
      await axios.put(`/api/menu/repas/${repas.id}`, {
        recetteId: id,
        accompagnements: [],
      });
      onUpdate?.(); // (dans WeekMenu: onUpdate={() => preserveScroll(reload)})
      onClose?.();
    } catch (err) {
      console.error("Erreur lors de la sauvegarde:", err);
      alert("Une erreur est survenue lors de la mise à jour du repas.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6">
        {/* Fermer */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 text-gray-500 hover:text-black"
          aria-label="Fermer"
        >
          <X size={20} />
        </button>

        <h2 className="mb-4 text-center text-lg font-bold">Changer la recette</h2>

        {/* Recherche */}
        <input
          type="text"
          placeholder="Rechercher une recette..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-4 w-full rounded border p-2"
        />

        {/* Suggestions prioritaires */}
        {priority.length > 0 && (
          <div className="mb-4">
            <h3 className="mb-2 text-sm font-semibold text-gray-600">
              Suggestions en priorité :
            </h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {priority.map((r) => (
                <button
                  type="button"
                  key={r.id}
                  onClick={() => handleSelect(r.id)}
                  className="rounded border p-2 text-left hover:border-green-500"
                >
                  <div className="relative mb-1 aspect-video w-full overflow-hidden rounded">
                    <Image src={r.photoUrl} alt={r.name} fill className="object-cover" />
                  </div>
                  <p className="truncate text-sm">{r.name}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Favoris */}
        {favoris.length > 0 && (
          <div className="mb-4">
            <h3 className="mb-1 text-sm font-semibold text-gray-600">Vos favoris :</h3>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {favoris.map((r) => (
                <button
                  type="button"
                  key={r.id}
                  onClick={() => handleSelect(r.id)}
                  className="min-w-[120px] rounded border p-1"
                >
                  <Image
                    src={r.photoUrl}
                    alt={r.name}
                    width={120}
                    height={80}
                    className="mb-1 rounded object-cover"
                  />
                  <p className="truncate text-center text-xs">{r.name}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Liste filtrée */}
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {filtered.map((r) => (
            <button
              type="button"
              key={r.id}
              onClick={() => handleSelect(r.id)}
              className="rounded border p-2 text-left hover:border-green-500"
            >
              <div className="relative mb-1 aspect-video w-full overflow-hidden rounded">
                <Image src={r.photoUrl} alt={r.name} fill className="object-cover" />
              </div>
              <p className="truncate text-sm">{r.name}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

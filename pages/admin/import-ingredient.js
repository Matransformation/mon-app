import { useState } from "react";
import axios from "axios";
import { Search } from "lucide-react";

export default function ImportIngredient() {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [importingId, setImportingId] = useState(null);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/api/search-ingredients-openfoodfacts", {
        params: { name: searchQuery },
      });
      setResults(data.results);
    } catch (error) {
      console.error("Erreur de recherche:", error);
      alert("❌ Erreur lors de la recherche");
    }
    setLoading(false);
  };

  const handleImport = async (ingredient) => {
    setImportingId(ingredient.name);
    try {
      await axios.post("/api/import-ingredient-openfoodfacts", {
        name: ingredient.name,
        calories: ingredient.calories,
        protein: ingredient.protein,
        fat: ingredient.fat,
        carbs: ingredient.carbs,
      });
      alert(`✅ ${ingredient.name} importé avec succès !`);
    } catch (error) {
      console.error("Erreur importation:", error);
      alert("❌ Erreur lors de l'import");
    }
    setImportingId(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Importer un ingrédient 🍴</h1>

      {/* Barre de recherche */}
      <div className="flex items-center max-w-xl mx-auto mb-6">
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Nom de l'ingrédient..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="w-full border rounded-full py-2 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Search size={20} />
          </div>
        </div>
        <button
          onClick={handleSearch}
          disabled={loading}
          className="ml-2 px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700"
        >
          {loading ? "Recherche..." : "Rechercher"}
        </button>
      </div>

      {/* Résultats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {results.length === 0 && !loading && (
          <p className="text-center text-gray-500 col-span-2">Aucun résultat pour cette recherche.</p>
        )}
        {results.map((ingredient) => (
          <div key={ingredient.name} className="border rounded-lg p-4 bg-white shadow">
            <h3 className="font-bold text-lg mb-2">{ingredient.name}</h3>
            <div className="text-sm text-gray-700 mb-2 space-y-1">
              <p>🔥 {ingredient.calories} kcal</p>
              <p>🍗 {ingredient.protein}g protéines</p>
              <p>🧈 {ingredient.fat}g lipides</p>
              <p>🍞 {ingredient.carbs}g glucides</p>
            </div>
            <button
              onClick={() => handleImport(ingredient)}
              disabled={importingId === ingredient.name}
              className="w-full mt-2 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {importingId === ingredient.name ? "Importation..." : "Importer cet ingrédient"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

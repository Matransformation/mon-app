// File: pages/recettes.js (ou pages/liste-recettes.js)
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { Search } from "lucide-react";
import Navbar from "../components/Navbar";
import Image from "next/image";
import { useSession } from "next-auth/react";

export default function ListeRecettes() {
  const [recettes, setRecettes]             = useState([]);
  const [categories, setCategories]         = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [sortOption, setSortOption]         = useState(null);
  const [searchQuery, setSearchQuery]       = useState("");
  const [showOnlyPublic, setShowOnlyPublic] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();

  const isSubscribed = session?.user?.isSubscribed;
  const isOnTrial    = session?.user?.isOnTrial;

  useEffect(() => {
    fetchRecettes();
    fetchCategories();
  }, []);

  // 1) Fetch & trier par date décroissante
  const fetchRecettes = async () => {
    try {
      const res = await axios.get("/api/recettes");
      const sorted = res.data
        .slice()
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setRecettes(sorted);
    } catch (err) {
      console.error("Erreur chargement recettes :", err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get("/api/categories");
      setCategories(res.data);
    } catch (err) {
      console.error("Erreur chargement catégories :", err);
    }
  };

  const calculerNutritionEtPrix = (ingredients) => {
    let totalCalories = 0,
        totalProtein  = 0,
        totalFat      = 0,
        totalCarbs    = 0,
        totalPrice    = 0;

    ingredients.forEach((ri) => {
      if (ri.ingredient) {
        const ratio = ri.quantity / 100;
        totalCalories += ri.ingredient.calories * ratio;
        totalProtein  += ri.ingredient.protein  * ratio;
        totalFat      += ri.ingredient.fat      * ratio;
        totalCarbs    += ri.ingredient.carbs    * ratio;
        totalPrice    += (ri.ingredient.price * ri.quantity) / 1000;
      }
    });

    return {
      calories: Math.round(totalCalories),
      protein:  Math.round(totalProtein),
      fat:      Math.round(totalFat),
      carbs:    Math.round(totalCarbs),
      price:    parseFloat(totalPrice.toFixed(2)),
    };
  };

  const getFilteredAndSortedRecettes = () => {
    let filtered = [...recettes];

    if (showOnlyPublic) {
      filtered = filtered.filter(r => r.isPublic);
    }

    if (selectedCategory) {
      filtered = filtered.filter(r =>
        r.categories.some(c => c.categoryId === selectedCategory)
      );
    }

    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(r => {
        return (
          r.name.toLowerCase().includes(q) ||
          r.ingredients.some(ri =>
            ri.ingredient?.name.toLowerCase().includes(q)
          )
        );
      });
    }

    // Non connectés : recettes publiques d’abord
    if (!session) {
      filtered.sort((a, b) => {
        if (a.isPublic && !b.isPublic) return -1;
        if (!a.isPublic && b.isPublic) return 1;
        return 0;
      });
    }

    // Puis tri nutrition / prix si demandé
    if (sortOption) {
      filtered.sort((a, b) => {
        const an = calculerNutritionEtPrix(a.ingredients);
        const bn = calculerNutritionEtPrix(b.ingredients);
        switch (sortOption) {
          case "calories-asc":  return an.calories - bn.calories;
          case "calories-desc": return bn.calories - an.calories;
          case "price-asc":     return an.price - bn.price;
          case "price-desc":    return bn.price - an.price;
          default: return 0;
        }
      });
    }

    return filtered;
  };

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 py-6">
        <h1 className="text-3xl font-bold mb-6 text-center">
          🍴 Toutes nos Recettes
        </h1>

        {!session ? (
          <div className="text-center mb-8">
            <p className="text-gray-700 font-medium mb-2">
              Accédez à toutes les recettes personnalisées 🔒
            </p>
            <button
              onClick={() => router.push("/register")}
              className="bg-green-600 text-white px-6 py-2 rounded-full hover:bg-green-700 transition"
            >
              Profitez de 7 jours gratuits sans CB
            </button>
          </div>
        ) : (!isSubscribed && !isOnTrial) && (
          <div className="text-center mb-8">
            <p className="text-gray-700 font-medium mb-2">
              Accédez à toutes les recettes personnalisées 🔒
            </p>
            <button
              onClick={() => router.push("/abonnement")}
              className="bg-green-600 text-white px-6 py-2 rounded-full hover:bg-green-700 transition"
            >
              Je m’abonne
            </button>
          </div>
        )}

        <div className="flex items-center max-w-lg mx-auto mb-6">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Rechercher une recette ou un ingrédient..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full border rounded-full py-2 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-green-400"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
              <Search size={20} />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6 justify-center">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1 rounded-full text-sm ${
              selectedCategory === null
                ? "bg-green-600 text-white"
                : "bg-gray-200 text-gray-800"
            }`}
          >
            Toutes
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1 rounded-full text-sm ${
                selectedCategory === cat.id
                  ? "bg-green-600 text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-4 justify-center mb-6 max-w-2xl mx-auto">
          <button
            onClick={() => setSortOption("calories-asc")}
            className="bg-blue-100 text-blue-800 px-3 py-1 rounded hover:bg-blue-200"
          >
            🔥 Calories ↑
          </button>
          <button
            onClick={() => setSortOption("calories-desc")}
            className="bg-blue-100 text-blue-800 px-3 py-1 rounded hover:bg-blue-200"
          >
            🔥 Calories ↓
          </button>
          <button
            onClick={() => setSortOption("price-asc")}
            className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded hover:bg-yellow-200"
          >
            💶 Prix ↑
          </button>
          <button
            onClick={() => setSortOption("price-desc")}
            className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded hover:bg-yellow-200"
          >
            💶 Prix ↓
          </button>
          <button
            onClick={() => setShowOnlyPublic(!showOnlyPublic)}
            className="bg-gray-100 text-gray-800 px-3 py-1 rounded hover:bg-gray-200"
          >
            {showOnlyPublic
              ? "👁️ Voir tout"
              : "🔓 Uniquement publics"}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {getFilteredAndSortedRecettes().map(recette => {
            const nutrition    = calculerNutritionEtPrix(recette.ingredients || []);
            const isAccessible = recette.isPublic || isSubscribed || isOnTrial;

            return (
              <div
                key={recette.id}
                className="border rounded-lg shadow hover:shadow-lg transition overflow-hidden bg-white cursor-pointer"
                onClick={() => {
                  if (isAccessible) router.push(`/recettes/${recette.id}`);
                }}
              >
                <div className="relative w-full h-48">
                  <Image
                    src={isAccessible ? recette.photoUrl : "/verrou.jpg"}
                    alt={recette.name}
                    layout="fill"
                    objectFit="cover"
                    className="rounded-t"
                  />
                  {!isAccessible && (
                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white text-sm font-semibold px-2 text-center">
                      🔒 Réservé aux abonnés
                      <br />
                      {!session
                        ? "Créez un compte pour 7 jours gratuits"
                        : "Abonnez-vous pour y accéder"}
                    </div>
                  )}
                </div>

                <div className="p-4 space-y-2">
                  {/* Titre + nb de personnes */}
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">{recette.name}</h2>
                    <span className="text-sm text-gray-500 flex items-center gap-1"></span>
                  </div>

                  {/* DESCRIPTION SUPPRIMÉE */}

                  <div className={`text-sm mt-2 space-y-1 ${
                    isAccessible ? "text-gray-700" : "text-gray-400"
                  }`}>
                    {/* Nombre de personnes au-dessus des calories */}
                    <p className="flex items-center gap-1">👥 {recette.servings} pers.</p>
                    <p>🔥 {isAccessible ? `${nutrition.calories} kcal` : "– kcal"}</p>
                    <p>🍗 {isAccessible ? `${nutrition.protein}g protéines` : "– g protéines"}</p>
                    <p>🧈 {isAccessible ? `${nutrition.fat}g lipides` : "– g lipides"}</p>
                    <p>🍞 {isAccessible ? `${nutrition.carbs}g glucides` : "– g glucides"}</p>
                    <p>💶 {isAccessible ? `${nutrition.price} €` : "– €"}</p>
                  </div>

                  {recette.categories.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {recette.categories.map(cat => (
                        <span
                          key={cat.id}
                          className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs"
                        >
                          {cat.category?.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

import { useSession } from "next-auth/react"; // Ajoute cette ligne
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { Search } from "lucide-react";
import Navbar from "../components/Navbar";

export default function ListeRecettes() {
  const [recettes, setRecettes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [sortOption, setSortOption] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetchRecettes();
    fetchCategories();
  }, []);

  const fetchRecettes = async () => {
    try {
      const res = await axios.get("/api/recettes");
      setRecettes(res.data);
    } catch (error) {
      console.error("Erreur chargement recettes :", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get("/api/categories");
      setCategories(res.data);
    } catch (error) {
      console.error("Erreur chargement catégories :", error);
    }
  };

  const calculerNutritionEtPrix = (ingredients) => {
    let totalCalories = 0;
    let totalProtein = 0;
    let totalFat = 0;
    let totalCarbs = 0;
    let totalPrice = 0;

    ingredients.forEach((ri) => {
      if (ri.ingredient) {
        const ratio = ri.quantity / 100;
        totalCalories += ri.ingredient.calories * ratio;
        totalProtein += ri.ingredient.protein * ratio;
        totalFat += ri.ingredient.fat * ratio;
        totalCarbs += ri.ingredient.carbs * ratio;
        totalPrice += (ri.ingredient.price * ri.quantity) / 1000;
      }
    });

    return {
      calories: Math.round(totalCalories),
      protein: Math.round(totalProtein),
      fat: Math.round(totalFat),
      carbs: Math.round(totalCarbs),
      price: totalPrice.toFixed(2),
    };
  };

  const getFilteredAndSortedRecettes = () => {
    let filtered = [...recettes];

    if (selectedCategory) {
      filtered = filtered.filter((recette) =>
        recette.categories.some((cat) => cat.categoryId === selectedCategory)
      );
    }

    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((recette) => {
        const matchRecette = recette.name.toLowerCase().includes(query);
        const matchIngredient = recette.ingredients.some((ri) =>
          ri.ingredient?.name.toLowerCase().includes(query)
        );
        return matchRecette || matchIngredient;
      });
    }

    if (sortOption) {
      filtered.sort((a, b) => {
        const aNutri = calculerNutritionEtPrix(a.ingredients);
        const bNutri = calculerNutritionEtPrix(b.ingredients);

        switch (sortOption) {
          case "calories-asc":
            return aNutri.calories - bNutri.calories;
          case "calories-desc":
            return bNutri.calories - aNutri.calories;
          case "price-asc":
            return aNutri.price - bNutri.price;
          case "price-desc":
            return bNutri.price - aNutri.price;
          default:
            return 0;
        }
      });
    }

    return filtered;
  };

  return (
    <>
      <Navbar />
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
        <h1 className="text-3xl font-bold mb-6 text-center">🍴 Toutes nos Recettes</h1>

        {/* Barre recherche */}
        <div className="flex items-center max-w-lg mx-auto mb-6">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Rechercher une recette ou un ingrédient..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border rounded-full py-2 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-green-400"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Search size={20} />
            </div>
          </div>
        </div>

        {/* Catégories */}
        <div className="flex flex-wrap gap-2 mb-6 justify-center">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1 rounded-full text-sm ${
              selectedCategory === null ? "bg-green-600 text-white" : "bg-gray-200 text-gray-800"
            }`}
          >
            Toutes
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1 rounded-full text-sm ${
                selectedCategory === cat.id ? "bg-green-600 text-white" : "bg-gray-200 text-gray-800"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Filtres tri */}
        <div className="flex gap-4 justify-center mb-6">
          <button
            onClick={() => setSortOption("calories-asc")}
            className="bg-blue-100 text-blue-800 px-3 py-1 rounded hover:bg-blue-200"
          >
            🔥 Calories croissant
          </button>
          <button
            onClick={() => setSortOption("calories-desc")}
            className="bg-blue-100 text-blue-800 px-3 py-1 rounded hover:bg-blue-200"
          >
            🔥 Calories décroissant
          </button>
          <button
            onClick={() => setSortOption("price-asc")}
            className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded hover:bg-yellow-200"
          >
            💶 Prix croissant
          </button>
          <button
            onClick={() => setSortOption("price-desc")}
            className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded hover:bg-yellow-200"
          >
            💶 Prix décroissant
          </button>
        </div>

        {/* Affichage recettes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {getFilteredAndSortedRecettes().map((recette) => {
            const imageUrl = recette.photoUrl?.startsWith("/")
              ? recette.photoUrl
              : `/uploads/${recette.photoUrl}`;
            const nutrition = calculerNutritionEtPrix(recette.ingredients || []);

            return (
              <div
                key={recette.id}
                className="border rounded-lg shadow hover:shadow-lg transition overflow-hidden bg-white cursor-pointer"
                onClick={() => router.push(`/recettes/${recette.id}`)}
              >
                {imageUrl && (
                  <img
                    src={imageUrl}
                    alt={recette.name}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-4 space-y-2">
                  <h2 className="text-xl font-semibold">{recette.name}</h2>
                  <p className="text-gray-600 text-sm">{recette.description}</p>
                  <div className="text-sm text-gray-700 mt-2 space-y-1">
                    <p>🔥 {nutrition.calories} kcal</p>
                    <p>🍗 {nutrition.protein}g protéines</p>
                    <p>🧈 {nutrition.fat}g lipides</p>
                    <p>🍞 {nutrition.carbs}g glucides</p>
                    <p>💶 {nutrition.price} €</p>
                  </div>
                  {recette.categories && recette.categories.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {recette.categories.map((cat) => (
                        <span key={cat.id} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs">
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
import { getServerSession } from "next-auth/next";
import prisma from "../lib/prisma"; // Assure-toi que le chemin est correct
import authOptions from "../pages/api/auth/[...nextauth]"; // Chemin vers ton fichier de config NextAuth

export async function getServerSideProps(context) {
  // 1) Vérifier la session NextAuth
  const session = await getServerSession(context.req, context.res, authOptions);
  console.log("Session:", session); // Ajoute un log pour vérifier la session

  // Si l'utilisateur n'est pas authentifié
  if (!session?.user?.email) {
    return {
      redirect: {
        destination: "/auth/signin", // Redirige vers la page de connexion
        permanent: false,
      },
    };
  }

  // 2) Récupérer l'utilisateur et vérifier sa période d'essai ou son abonnement
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      trialEndsAt: true,
      isSubscribed: true,
    },
  });

  // Vérifier la période d'essai
  const now = new Date();
  const trialActive = user?.trialEndsAt && now <= new Date(user.trialEndsAt);
  const hasAccess = user?.isSubscribed || trialActive;

  // Si l'utilisateur n'a pas accès, le rediriger vers la page "mon-compte"
  if (!hasAccess) {
    return {
      redirect: {
        destination: "/mon-compte", // Page où l'utilisateur peut gérer son abonnement
        permanent: false,
      },
    };
  }

  // 3) Si tout va bien, continuer à charger la page
  return {
    props: {},
  };
}

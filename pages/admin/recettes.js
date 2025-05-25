// pages/admin/recettes.js

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import withAuthProtection from "../../lib/withAuthProtection";
import Image from "next/image";


function ListeRecettes() {
  const [recettes, setRecettes] = useState([]);
  const [sideOptions, setSideOptions] = useState([]);
  const router = useRouter();

  useEffect(() => {
    fetchRecettes();
    // Charger les libellés des accompagnements
    axios
      .get("/api/side-types")
      .then((res) => setSideOptions(res.data))
      .catch((err) => console.error("Erreur chargement side-types :", err));
  }, []);

  const fetchRecettes = async () => {
    try {
      const res = await axios.get("/api/recettes");
      setRecettes(res.data);
    } catch (error) {
      console.error("Erreur lors du chargement des recettes :", error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Supprimer cette recette ?")) return;
    try {
      await axios.delete(`/api/recettes/${id}`);
      fetchRecettes();
    } catch (error) {
      console.error("Erreur lors de la suppression :", error);
    }
  };

  const calculerNutritionEtPrix = (ingredients) => {
    let totalCalories = 0;
    let totalProtein  = 0;
    let totalFat      = 0;
    let totalCarbs    = 0;
    let totalPrice    = 0;

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
      price:    totalPrice.toFixed(2),
    };
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">📋 Toutes les Recettes</h1>

      {recettes.length === 0 ? (
        <p>Aucune recette pour le moment.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recettes.map((recette) => {
            
            const nutrition = calculerNutritionEtPrix(recette.ingredients || []);

            return (
              <div key={recette.id} className="border rounded shadow p-4 bg-white">
                {/* Image */}
                {recette.photoUrl && (
  <div className="relative w-full h-48 mb-4 border border-gray-200 rounded overflow-hidden">
    <Image
      src={recette.photoUrl}
      alt={recette.name}
      layout="fill"
      objectFit="cover"
      className="rounded"
      onError={(e) => {
        // next/image ne gère pas onError comme img HTML
        console.warn("Erreur chargement image recette :", recette.photoUrl);
      }}
    />
  </div>
)}


                {/* Titre + Badge scalable */}
                <div className="flex items-center mb-2">
                  <h2 className="text-xl font-semibold">{recette.name}</h2>
                  {recette.scalable ? (
                    <span className="ml-2 bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                      Scalable
                    </span>
                  ) : (
                    <span className="ml-2 bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                      Non scalable
                    </span>
                  )}
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 mb-2">{recette.description}</p>

                {/* Temps */}
                <p className="text-sm text-gray-700 mb-2">
                  ⏱️ {recette.preparationTime} min préparation, {recette.cookingTime} min cuisson
                </p>

                {/* Catégories */}
                {recette.categories?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {recette.categories.map((rc) =>
                      rc.category ? (
                        <span
                          key={rc.category.id}
                          className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                        >
                          {rc.category.name}
                        </span>
                      ) : null
                    )}
                  </div>
                )}

                {/* Accompagnements autorisés */}
                {recette.allowedSides?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {recette.allowedSides.map((st) => {
                      const opt = sideOptions.find((o) => o.value === st);
                      return (
                        <span
                          key={st}
                          className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full"
                        >
                          {opt?.label || st}
                        </span>
                      );
                    })}
                  </div>
                )}

                {/* Nutrition */}
                <div className="text-sm text-gray-800 mb-4 space-y-1">
                  <p>🔥 {nutrition.calories} kcal</p>
                  <p>🍗 {nutrition.protein} g protéines</p>
                  <p>🧈 {nutrition.fat} g lipides</p>
                  <p>🍞 {nutrition.carbs} g glucides</p>
                  <p>💶 {nutrition.price} €</p>
                </div>

                {/* Boutons */}
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => router.push(`/admin/recettes/${recette.id}`)}
                    className="text-blue-600 hover:underline"
                  >
                    ✏️ Modifier
                  </button>
                  <button
                    onClick={() => handleDelete(recette.id)}
                    className="text-red-600 hover:underline"
                  >
                    🗑️ Supprimer
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
export default withAuthProtection(ListeRecettes);

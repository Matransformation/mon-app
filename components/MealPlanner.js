import { useState, useEffect } from "react";
import axios from "axios";

export default function MealPlanner() {
  const [metabolism, setMetabolism] = useState(null); // Stocke les données de métabolisme
  const [mealPlan, setMealPlan] = useState([]); // Plan de repas
  const [suggestions, setSuggestions] = useState([]); // Suggestions de modification des repas

  useEffect(() => {
    const fetchMetabolism = async () => {
      try {
        const res = await axios.get("/api/metabolism"); // Requête API pour récupérer le métabolisme
        setMetabolism(res.data);
      } catch (error) {
        console.error("Erreur lors du chargement du métabolisme:", error);
      }
    };

    fetchMetabolism();
  }, []);

  useEffect(() => {
    if (metabolism) {
      generateMealPlan();
    }
  }, [metabolism]);

  const generateMealPlan = () => {
    const meals = [];
    const totalCalories = metabolism.calories;

    // Exemple de génération de repas pour la semaine (à ajuster)
    for (let i = 0; i < 7; i++) {
      const meal = {
        day: `Jour ${i + 1}`,
        recipe: "Exemple de recette", // Exemple d'une recette à ajouter
        calories: totalCalories / 7, // Répartition équitable des calories par jour
        protein: (totalCalories * 0.35) / 4, // 35% des calories en protéines
        carbs: (totalCalories * 0.35) / 4, // 35% des calories en glucides
        fat: (totalCalories * 0.30) / 9, // 30% des calories en lipides
      };
      meals.push(meal);
    }

    setMealPlan(meals);
  };

  const handleChangeRecipe = (index) => {
    // Logic to change the recipe for the day (based on preference or nutrients)
    alert(`Recette changée pour le jour ${index + 1}`);
  };

  const handleAddSideDish = (index) => {
    // Logic to suggest a side dish based on missing nutrients
    alert(`Accompagnement suggéré pour le jour ${index + 1}`);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-4">Plan de Repas Automatique</h2>
      
      {mealPlan.length > 0 ? (
        mealPlan.map((meal, index) => (
          <div key={index} className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-xl font-semibold">{meal.day}</h3>
            <p>Recette: {meal.recipe}</p>
            <p>Calories: {meal.calories} kcal</p>
            <p>Protéines: {meal.protein} g</p>
            <p>Glucides: {meal.carbs} g</p>
            <p>Lipides: {meal.fat} g</p>
            
            <div className="flex gap-4 mt-4">
              <button
                onClick={() => handleChangeRecipe(index)}
                className="bg-blue-500 text-white p-2 rounded"
              >
                Changer la recette
              </button>
              <button
                onClick={() => handleAddSideDish(index)}
                className="bg-green-500 text-white p-2 rounded"
              >
                Ajouter un accompagnement
              </button>
            </div>
          </div>
        ))
      ) : (
        <p>Chargement des repas...</p>
      )}
    </div>
  );
}

import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import withAuthProtection from "../../lib/withAuthProtection";


function AjouterRecette() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [preparationTime, setPreparationTime] = useState("");
  const [cookingTime, setCookingTime] = useState("");
  const [steps, setSteps] = useState([{ step: "" }]);
  const [ingredientSearch, setIngredientSearch] = useState("");
  const [availableIngredients, setAvailableIngredients] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [photo, setPhoto] = useState(null);
  const [categories, setCategories] = useState([]);  // Ajout pour gérer les catégories
  const [selectedCategories, setSelectedCategories] = useState([]); // Valeur sélectionnée pour les catégories
  const router = useRouter();

  useEffect(() => {
    // Charger les ingrédients
    const fetchIngredients = async () => {
      try {
        const res = await axios.get("/api/ingredients");
        setAvailableIngredients(res.data);
      } catch (error) {
        console.error("Erreur chargement ingrédients :", error);
      }
    };

    // Charger les catégories
    const fetchCategories = async () => {
      try {
        const res = await axios.get("/api/categories");
        setCategories(res.data);
      } catch (error) {
        console.error("Erreur chargement catégories :", error);
      }
    };

    fetchIngredients();
    fetchCategories();
  }, []);

  const handleStepChange = (index, event) => {
    const newSteps = [...steps];
    newSteps[index].step = event.target.value;
    setSteps(newSteps);
  };

  const handleAddStep = () => {
    setSteps([...steps, { step: "" }]);
  };

  const handleIngredientSearch = (e) => {
    setIngredientSearch(e.target.value);
  };

  const handleAddIngredient = (ingredient) => {
    if (!ingredients.find((i) => i.id === ingredient.id)) {
      setIngredients([...ingredients, { ...ingredient, quantity: 100, unit: ingredient.unit || "g" }]);
    }
  };

  const handleIngredientQuantityChange = (index, value) => {
    const updated = [...ingredients];
    updated[index].quantity = parseFloat(value);
    setIngredients(updated);
  };

  const handleRemoveIngredient = (index) => {
    const updated = [...ingredients];
    updated.splice(index, 1);
    setIngredients(updated);
  };

  const handleCategoryChange = (e) => {
    const value = Array.from(e.target.selectedOptions, option => option.value);
    setSelectedCategories(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Vérification et ajout de l'unité par défaut si nécessaire
    const ingredientsWithDefaultUnit = ingredients.map((ing) => ({
      ...ing,
      unit: ing.unit || "g", // Ajout de "g" par défaut si l'unité est vide
    }));

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("preparationTime", preparationTime);
    formData.append("cookingTime", cookingTime);
    formData.append("ingredients", JSON.stringify(ingredientsWithDefaultUnit)); // Envoi des ingrédients avec unité par défaut
    formData.append("steps", JSON.stringify(steps));
    formData.append("categories", JSON.stringify(selectedCategories)); // Envoi des catégories sélectionnées
    if (photo) formData.append("photo", photo);

    try {
      const res = await axios.post("/api/recettes", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.status === 200) router.push("/admin/recettes");
    } catch (error) {
      console.error("Erreur lors de l'ajout de la recette :", error);
      alert("Une erreur s'est produite lors de l'ajout de la recette.");
    }
  };

  const filteredIngredients = availableIngredients.filter((ingredient) =>
    ingredient.name.toLowerCase().includes(ingredientSearch.toLowerCase())
  );

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4 text-center">Ajouter une recette</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label>Nom</label>
          <input className="border p-2 w-full rounded" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>

        <div>
          <label>Description</label>
          <textarea className="border p-2 w-full rounded" value={description} onChange={(e) => setDescription(e.target.value)} required />
        </div>

        <div className="flex space-x-4">
          <div className="flex-1">
            <label>Temps préparation (min)</label>
            <input type="number" className="border p-2 w-full rounded" value={preparationTime} onChange={(e) => setPreparationTime(e.target.value)} />
          </div>
          <div className="flex-1">
            <label>Temps cuisson (min)</label>
            <input type="number" className="border p-2 w-full rounded" value={cookingTime} onChange={(e) => setCookingTime(e.target.value)} />
          </div>
        </div>

        <div>
          <label>Photo</label>
          <input type="file" className="border p-2 w-full rounded" onChange={(e) => setPhoto(e.target.files[0])} />
        </div>

        <div>
          <label>Étapes de préparation</label>
          {steps.map((step, index) => (
            <input key={index} type="text" name="step" placeholder={`Étape ${index + 1}`} value={step.step} onChange={(e) => handleStepChange(index, e)} className="border p-2 w-full rounded mb-2" />
          ))}
          <button type="button" onClick={handleAddStep} className="bg-blue-600 text-white px-3 py-1 rounded">Ajouter une étape</button>
        </div>

        <div>
          <label>Rechercher un ingrédient</label>
          <input className="border p-2 w-full rounded" value={ingredientSearch} onChange={handleIngredientSearch} />
          <div className="mt-2">
            {filteredIngredients.map((ingredient) => (
              <div key={ingredient.id} className="flex justify-between items-center border p-2 rounded mb-1">
                <span>{ingredient.name}</span>
                <button type="button" onClick={() => handleAddIngredient(ingredient)} className="text-sm bg-green-600 text-white px-2 py-1 rounded">Ajouter</button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label>Ingrédients sélectionnés</label>
          <ul className="space-y-2 mt-2">
            {ingredients.map((ingredient, index) => (
              <li key={ingredient.id} className="flex items-center space-x-2">
                <span className="flex-1">{ingredient.name}</span>
                <input
                  type="number"
                  className="w-24 border p-1 rounded"
                  value={ingredient.quantity}
                  onChange={(e) => handleIngredientQuantityChange(index, e.target.value)}
                />
                <span>{ingredient.unit}</span>
                <button type="button" onClick={() => handleRemoveIngredient(index)} className="text-red-600 ml-2">Supprimer</button>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <label>Catégories</label>
          <select multiple value={selectedCategories} onChange={handleCategoryChange} className="border p-2 w-full rounded">
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" className="w-full bg-green-600 text-white p-3 rounded">Ajouter la recette</button>
      </form>
    </div>
  );
}
export default withAuthProtection(AjouterRecette);

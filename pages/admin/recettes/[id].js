// pages/admin/recettes/[id].js

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import withAuthProtection from "../../../lib/withAuthProtection";

function EditRecette() {
  const router = useRouter();
  const { id } = router.query;

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    preparationTime: "",
    cookingTime: "",
    steps: [],
    ingredients: [],
    photoUrl: "",
    categories: [],
    allowedSides: [],
    scalable: true,
  });
  const [photo, setPhoto] = useState(null);
  const [availableIngredients, setAvailableIngredients] = useState([]);
  const [ingredientSearch, setIngredientSearch] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [nutrition, setNutrition] = useState({
    calories: 0,
    protein: 0,
    fat: 0,
    carbs: 0,
    price: 0,
  });
  const [sideOptions, setSideOptions] = useState([]);

  // Chargement initial
  useEffect(() => {
    if (!id) return;

    // Récupérer la recette
    axios.get(`/api/recettes/${id}`).then((res) => {
      const recette = res.data;
      const ingredientsData = (recette.ingredients || []).map((ri) => ({
        id: ri.ingredient.id,
        name: ri.ingredient.name,
        quantity: ri.quantity,
        unit: ri.unit,
        price: ri.ingredient.price,
        calories: ri.ingredient.calories,
        protein: ri.ingredient.protein,
        fat: ri.ingredient.fat,
        carbs: ri.ingredient.carbs,
      }));

      setFormData({
        ...recette,
        preparationTime: recette.preparationTime.toString(),
        cookingTime: recette.cookingTime.toString(),
        steps: recette.steps || [],
        ingredients: ingredientsData,
        photoUrl: recette.photoUrl || "",
        allowedSides: recette.allowedSides || [],
        scalable: recette.scalable ?? true,
      });

      setSelectedCategories(recette.categories.map((cat) => cat.categoryId));
    });

    // Références
    axios.get("/api/ingredients").then((res) => setAvailableIngredients(res.data));
    axios.get("/api/categories").then((res) => setCategories(res.data));
    axios.get("/api/side-types").then((res) => setSideOptions(res.data));
  }, [id]);

  // Recalcul nutrition & prix
  useEffect(() => {
    let totalCalories = 0,
      totalProtein = 0,
      totalFat = 0,
      totalCarbs = 0,
      totalPrice = 0;

    formData.ingredients.forEach((ing) => {
      const ratio = ing.quantity / 100;
      totalCalories += ing.calories * ratio;
      totalProtein += ing.protein * ratio;
      totalFat += ing.fat * ratio;
      totalCarbs += ing.carbs * ratio;
      totalPrice += (ing.price * ing.quantity) / 1000;
    });

    setNutrition({
      calories: Math.round(totalCalories),
      protein: Math.round(totalProtein),
      fat: Math.round(totalFat),
      carbs: Math.round(totalCarbs),
      price: totalPrice.toFixed(2),
    });
  }, [formData.ingredients]);

  // Handlers
  const handleChange = (field, value) => {
    setFormData((p) => ({ ...p, [field]: value }));
  };

  const handleStepChange = (index, value) => {
    const updated = [...formData.steps];
    updated[index].step = value;
    setFormData((p) => ({ ...p, steps: updated }));
  };

  const addStep = () => {
    setFormData((p) => ({ ...p, steps: [...p.steps, { step: "" }] }));
  };

  const removeStep = (index) => {
    const updated = [...formData.steps];
    updated.splice(index, 1);
    setFormData((p) => ({ ...p, steps: updated }));
  };

  const handleIngredientChange = (index, field, value) => {
    const updated = [...formData.ingredients];
    updated[index][field] = field === "quantity" ? parseFloat(value) : value;
    setFormData((p) => ({ ...p, ingredients: updated }));
  };

  const handleAddIngredient = (ingredient) => {
    if (!formData.ingredients.find((i) => i.id === ingredient.id)) {
      setFormData((p) => ({
        ...p,
        ingredients: [
          ...p.ingredients,
          {
            id: ingredient.id,
            name: ingredient.name,
            unit: ingredient.unit || "g",
            quantity: 100,
            price: ingredient.price,
            calories: ingredient.calories,
            protein: ingredient.protein,
            fat: ingredient.fat,
            carbs: ingredient.carbs,
          },
        ],
      }));
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      alert("Le nom de la catégorie est requis.");
      return;
    }
    try {
      const res = await axios.post("/api/categories", { name: newCategoryName });
      setCategories((c) => [...c, res.data]);
      setSelectedCategories((c) => [...c, res.data.id]);
      setNewCategoryName("");
    } catch {
      alert("Erreur lors de l'ajout de la catégorie.");
    }
  };

  const toggleSide = (value) => {
    setFormData((prev) => {
      const allowed = prev.allowedSides || [];
      const next = allowed.includes(value)
        ? allowed.filter((v) => v !== value)
        : [...allowed, value];
      return { ...prev, allowedSides: next };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append("name", formData.name);
    form.append("description", formData.description);
    form.append("preparationTime", formData.preparationTime);
    form.append("cookingTime", formData.cookingTime);
    form.append("steps", JSON.stringify(formData.steps));
    form.append("ingredients", JSON.stringify(formData.ingredients));
    form.append("categories", JSON.stringify(selectedCategories));
    form.append("allowedSides", JSON.stringify(formData.allowedSides));
    form.append("scalable", JSON.stringify(formData.scalable));
    if (photo) form.append("photo", photo);

    try {
      await axios.put(`/api/recettes/${id}`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      router.push("/admin/recettes");
    } catch {
      alert("Une erreur est survenue lors de la mise à jour de la recette.");
    }
  };

  const filteredIngredients = availableIngredients.filter((i) =>
    i.name.toLowerCase().includes(ingredientSearch.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Modifier la recette</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Nom */}
        <input
          type="text"
          placeholder="Nom"
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
          className="w-full border p-2 rounded"
        />

        {/* Description */}
        <textarea
          placeholder="Description"
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
          className="w-full border p-2 rounded"
        />

        {/* Temps */}
        <div className="flex gap-4">
          <div className="flex-1">
            <label>Temps préparation</label>
            <input
              type="number"
              value={formData.preparationTime}
              onChange={(e) => handleChange("preparationTime", e.target.value)}
              className="w-full border p-2 rounded"
            />
          </div>
          <div className="flex-1">
            <label>Temps cuisson</label>
            <input
              type="number"
              value={formData.cookingTime}
              onChange={(e) => handleChange("cookingTime", e.target.value)}
              className="w-full border p-2 rounded"
            />
          </div>
        </div>

        {/* Catégories */}
        <div className="space-y-4">
          <div>
            <label className="font-bold text-gray-700">Catégories</label>
            <div className="grid grid-cols-2 gap-3 mt-2">
              {categories.map((category) => (
                <label
                  key={category.id}
                  className="flex items-center p-2 rounded-lg border border-gray-300 hover:border-gray-500 cursor-pointer transition"
                >
                  <input
                    type="checkbox"
                    value={category.id}
                    checked={selectedCategories.includes(category.id)}
                    onChange={(e) => {
                      const v = e.target.checked;
                      setSelectedCategories((prev) =>
                        v
                          ? [...prev, category.id]
                          : prev.filter((id) => id !== category.id)
                      );
                    }}
                    className="mr-2 accent-green-600"
                  />
                  <span className="text-gray-800">{category.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Ajouter catégorie */}
          <div className="mt-4">
            <h3 className="text-md font-semibold text-gray-700 mb-2">
              ➕ Ajouter une nouvelle catégorie
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Nom de la catégorie"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="flex-1 border p-2 rounded"
              />
              <button
                type="button"
                onClick={handleAddCategory}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
              >
                Ajouter
              </button>
            </div>
          </div>
        </div>

        {/* Accompagnements autorisés */}
        <div>
          <label className="block mb-1 font-medium">Accompagnements autorisés</label>
          <div className="grid grid-cols-2 gap-2">
            {sideOptions.map(({ value, label }) => (
              <label key={value} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.allowedSides.includes(value)}
                  onChange={() => toggleSide(value)}
                  className="accent-green-600"
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Étapes */}
        <div>
          <label className="block mb-1">Étapes</label>
          {formData.steps.map((step, idx) => (
            <div key={idx} className="flex items-center gap-2 mb-2">
              <input
                type="text"
                value={step.step}
                onChange={(e) => handleStepChange(idx, e.target.value)}
                className="flex-1 border p-2 rounded"
              />
              <button
                type="button"
                onClick={() => removeStep(idx)}
                className="bg-red-500 text-white px-2 py-1 rounded"
              >
                Supprimer
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addStep}
            className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
          >
            Ajouter une étape
          </button>
        </div>

        {/* Ingrédients */}
        <div>
          <label className="block mb-1">Ingrédients</label>
          <input
            type="text"
            placeholder="Rechercher un ingrédient"
            value={ingredientSearch}
            onChange={(e) => setIngredientSearch(e.target.value)}
            className="w-full border p-2 rounded mb-2"
          />
          <div className="max-h-48 overflow-y-auto mb-4">
            {filteredIngredients.map((ing) => (
              <div
                key={ing.id}
                className="flex justify-between items-center p-2 border-b"
              >
                <span>{ing.name}</span>
                <button
                  type="button"
                  onClick={() => handleAddIngredient(ing)}
                  className="text-blue-500"
                >
                  Ajouter
                </button>
              </div>
            ))}
          </div>
          {formData.ingredients.map((ing, idx) => (
            <div key={idx} className="flex items-center gap-2 mb-2">
              <span>{ing.name}</span>
              <input
                type="number"
                value={ing.quantity}
                onChange={(e) =>
                  handleIngredientChange(idx, "quantity", e.target.value)
                }
                className="w-20 border p-2 rounded"
                placeholder="Quantité"
              />
              <span>{ing.unit}</span>
            </div>
          ))}
        </div>

        {/* Photo */}
        {formData.photoUrl && (
          <div className="mb-4">
            <label>Photo actuelle :</label>
            <img
              src={formData.photoUrl}
              alt="Recette"
              className="w-40 h-40 object-cover rounded"
            />
          </div>
        )}
        <div>
          <label className="block mb-1">Changer la photo</label>
          <input
            type="file"
            onChange={(e) => setPhoto(e.target.files[0])}
            className="w-full border p-2 rounded"
          />
        </div>

        {/* Case à cocher scalable */}
        <div>
          <label className="block mb-1 font-medium">Recette scalable ?</label>
          <input
            type="checkbox"
            checked={formData.scalable}
            onChange={(e) => handleChange("scalable", e.target.checked)}
          />
        </div>

        {/* Bouton Enregistrer */}
        <button
          type="submit"
          className="bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700 transition w-full"
        >
          Enregistrer les modifications
        </button>
      </form>
    </div>
  );
}
export default withAuthProtection(EditRecette);

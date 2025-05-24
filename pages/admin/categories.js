import { useState, useEffect } from "react";
import axios from "axios";
import withAuthProtection from "../../lib/withAuthProtection";


function CategoriesAdmin() {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get("/api/categories");
        setCategories(res.data);
      } catch (error) {
        console.error("Erreur chargement catégories :", error);
      }
    };

    fetchCategories();
  }, []);

  const handleAddCategory = async () => {
    if (!newCategory) return;

    try {
      const res = await axios.post("/api/categories", { name: newCategory });
      setCategories((prev) => [...prev, res.data]);
      setNewCategory(""); // Reset input
    } catch (error) {
      console.error("Erreur ajout catégorie :", error);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette catégorie ?")) {
      try {
        await axios.delete(`/api/categories/${id}`);
        setCategories((prev) => prev.filter((category) => category.id !== id));
      } catch (error) {
        console.error("Erreur suppression catégorie :", error);
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Gestion des catégories</h1>

      <div className="mb-4">
        <input
          type="text"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          placeholder="Nom de la catégorie"
          className="border p-2 w-full rounded"
        />
        <button
          onClick={handleAddCategory}
          className="mt-2 bg-blue-600 text-white px-4 py-2 rounded"
        >
          Ajouter une catégorie
        </button>
      </div>

      <ul className="space-y-2">
        {categories.map((category) => (
          <li key={category.id} className="flex justify-between items-center">
            <span>{category.name}</span>
            <button
              onClick={() => handleDeleteCategory(category.id)}
              className="text-red-600"
            >
              Supprimer
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
export default withAuthProtection(CategoriesAdmin);

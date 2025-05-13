// pages/admin/ingredients.js

import { useState, useEffect } from "react";
import axios from "axios";

// ─── OPTIONS STATIQUES ────────────────────────────────────────────────
// Accompagnements possibles
const SIDE_OPTIONS = [
    { value: "PROTEIN",           label: "Accompagnement protéiné" },
    { value: "BREAKFAST_PROTEIN", label: "Accompagnement protéiné petit-déj" },
    { value: "CARB",              label: "Accompagnement glucidique" },
    { value: "FAT",               label: "Accompagnement lipidique" },
    { value: "DAIRY",             label: "Accompagnement produit laitier" },
    { value: "CEREAL",            label: "Accompagnement céréales" },
    { value: "FRUIT_SIDE",        label: "Accompagnement fruit" },
    { value: "VEGETABLE_SIDE",    label: "Accompagnement légume" },
  ];
  

// Types d’ingrédient possibles
const INGREDIENT_TYPES = [
  "Légume",
  "Féculent",
  "Viande",
  "Poisson",
  "Produit laitier",
  "Fromage",
  "Fruit",
  "Graines / Oléagineux",
  "Épice",
  "Sauce",
  "Autre",
];

export default function GestionIngredients() {
  // états principaux
  const [ingredients, setIngredients] = useState([]);
  const [newIng, setNewIng] = useState({
    name: "",
    unit: "g",
    price: "",
    calories: "",
    protein: "",
    fat: "",
    carbs: "",
    ingredientType: "",
    sideTypes: [],
  });
  const [editingId, setEditingId] = useState(null);

  // états de recherche / filtres
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterSideTypes, setFilterSideTypes] = useState([]);

  useEffect(() => {
    fetchIngredients();
  }, []);

  async function fetchIngredients() {
    try {
      const res = await axios.get("/api/ingredients", {
        params: { _t: Date.now() },
      });
      setIngredients(res.data);
    } catch (err) {
      console.error("Erreur récupération ingrédients :", err);
    }
  }

  function renderSideLabels(vals = []) {
    return vals
      .map((v) => SIDE_OPTIONS.find((o) => o.value === v)?.label || v)
      .join(", ");
  }

  function handleNewChange(field, value) {
    setNewIng((prev) => ({ ...prev, [field]: value }));
  }

  async function handleCreate() {
    try {
      await axios.post("/api/ingredients", {
        ...newIng,
        price:     parseFloat(newIng.price),
        calories:  parseInt(newIng.calories, 10),
        protein:   parseInt(newIng.protein,  10),
        fat:       parseInt(newIng.fat,      10),
        carbs:     parseInt(newIng.carbs,    10),
        sideTypes: newIng.sideTypes,
      });
      setNewIng({
        name: "",
        unit: "g",
        price: "",
        calories: "",
        protein: "",
        fat: "",
        carbs: "",
        ingredientType: "",
        sideTypes: [],
      });
      await fetchIngredients();
    } catch (err) {
      console.error("Erreur création ingrédient :", err);
    }
  }

  function handleEditChange(id, field, value) {
    setIngredients((prev) =>
      prev.map((i) => (i.id === id ? { ...i, [field]: value } : i))
    );
  }

  async function handleUpdate(id) {
    const ing = ingredients.find((i) => i.id === id);
    try {
      await axios.put(`/api/ingredient/${id}`, {
        ...ing,
        price:          parseFloat(ing.price),
        calories:       parseInt(ing.calories, 10),
        protein:        parseInt(ing.protein,  10),
        fat:            parseInt(ing.fat,      10),
        carbs:          parseInt(ing.carbs,    10),
        ingredientType: ing.ingredientType,
        sideTypes:      ing.sideTypes || [],
      });
      setEditingId(null);
      await fetchIngredients();
    } catch (err) {
      console.error("Erreur modification ingrédient :", err);
    }
  }

  async function handleDelete(id) {
    try {
      await axios.delete(`/api/ingredient/${id}`);
      await fetchIngredients();
    } catch (err) {
      console.error("Erreur suppression ingrédient :", err);
    }
  }

  // ─── FILTRAGE + RECHERCHE ─────────────────────────────────────────────
  const displayed = ingredients
    .filter((ing) =>
      ing.name.toLowerCase().includes(searchTerm.trim().toLowerCase())
    )
    .filter((ing) => !filterType || ing.ingredientType === filterType)
    .filter((ing) =>
      !filterSideTypes.length ||
      filterSideTypes.every((ft) => ing.sideTypes.includes(ft))
    );

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold">Gestion des Ingrédients</h1>

      {/* ─── FORMULAIRE D’AJOUT ───────────────────────────────────────────── */}
      <section className="bg-white p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-4">Ajouter un ingrédient</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <input
            placeholder="Nom"
            className="border p-2 rounded"
            value={newIng.name}
            onChange={(e) => handleNewChange("name", e.target.value)}
          />
          <select
            className="border p-2 rounded"
            value={newIng.unit}
            onChange={(e) => handleNewChange("unit", e.target.value)}
          >
            <option value="g">g</option>
            <option value="ml">ml</option>
            <option value="piece">pièce</option>
            <option value="tranche">tranche</option>
            <option value="cuillère">cuillère</option>
            <option value="tasse">tasse</option>
          </select>
          <input
            placeholder="Prix €/kg"
            className="border p-2 rounded"
            value={newIng.price}
            onChange={(e) => handleNewChange("price", e.target.value)}
          />
          <input
            placeholder="Calories"
            className="border p-2 rounded"
            value={newIng.calories}
            onChange={(e) => handleNewChange("calories", e.target.value)}
          />
          <input
            placeholder="Protéines"
            className="border p-2 rounded"
            value={newIng.protein}
            onChange={(e) => handleNewChange("protein", e.target.value)}
          />
          <input
            placeholder="Lipides"
            className="border p-2 rounded"
            value={newIng.fat}
            onChange={(e) => handleNewChange("fat", e.target.value)}
          />
          <input
            placeholder="Glucides"
            className="border p-2 rounded"
            value={newIng.carbs}
            onChange={(e) => handleNewChange("carbs", e.target.value)}
          />
          <select
            className="border p-2 rounded"
            value={newIng.ingredientType}
            onChange={(e) =>
              handleNewChange("ingredientType", e.target.value)
            }
          >
            <option value="">Type d'ingrédient</option>
            {INGREDIENT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <div className="col-span-2 flex flex-col space-y-2">
            {SIDE_OPTIONS.map(({ value, label }) => (
              <label key={value} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={newIng.sideTypes.includes(value)}
                  onChange={() => {
                    const next = newIng.sideTypes.includes(value)
                      ? newIng.sideTypes.filter((v) => v !== value)
                      : [...newIng.sideTypes, value];
                    handleNewChange("sideTypes", next);
                  }}
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </div>
        <button
          onClick={handleCreate}
          className="mt-4 bg-green-600 text-white px-4 py-2 rounded"
        >
          Ajouter
        </button>
      </section>

      {/* ─── RECHERCHE & FILTRES ───────────────────────────────────────────── */}
      <section className="bg-white p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-4">Recherche & Filtres</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Recherche par nom */}
          <div>
            <label className="block mb-1">Recherche</label>
            <input
              type="text"
              placeholder="Nom de l’ingrédient…"
              className="border p-2 rounded w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {/* Filtre par type */}
          <div>
            <label className="block mb-1">Type</label>
            <select
              className="border p-2 rounded w-full"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="">-- Tous types --</option>
              {INGREDIENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          {/* Filtre par accompagnements */}
          <div className="md:col-span-2 flex flex-col space-y-2">
            <label className="block mb-1">Accompagnements</label>
            {SIDE_OPTIONS.map(({ value, label }) => (
              <label key={value} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filterSideTypes.includes(value)}
                  onChange={() =>
                    setFilterSideTypes((prev) =>
                      prev.includes(value)
                        ? prev.filter((v) => v !== value)
                        : [...prev, value]
                    )
                  }
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </div>
        <button
          className="mt-4 text-sm text-gray-700 underline"
          onClick={() => {
            setSearchTerm("");
            setFilterType("");
            setFilterSideTypes([]);
          }}
        >
          Réinitialiser
        </button>
      </section>

      {/* ─── TABLEAU DES INGRÉDIENTS ───────────────────────────────────────── */}
      <div className="overflow-x-auto bg-white shadow rounded">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              {[
                "Nom",
                "Unité",
                "Prix €/kg",
                "Calories",
                "Protéines",
                "Lipides",
                "Glucides",
                "Type",
                "Accompagnements",
                "Actions",
              ].map((h) => (
                <th key={h} className="p-2 border text-left">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayed.map((ing) => (
              <tr key={ing.id} className="even:bg-gray-50">
                {editingId === ing.id ? (
                  <>
                    {/* édition inline */}
                    {[
                      "name",
                      "unit",
                      "price",
                      "calories",
                      "protein",
                      "fat",
                      "carbs",
                    ].map((f) => (
                      <td key={f} className="p-2 border">
                        <input
                          className="w-full border p-1 rounded"
                          value={ing[f] ?? ""}
                          onChange={(e) =>
                            handleEditChange(ing.id, f, e.target.value)
                          }
                        />
                      </td>
                    ))}
                    <td className="p-2 border">
                      <select
                        className="w-full border p-1 rounded"
                        value={ing.ingredientType ?? ""}
                        onChange={(e) =>
                          handleEditChange(
                            ing.id,
                            "ingredientType",
                            e.target.value
                          )
                        }
                      >
                        <option value="">Type d'ingrédient</option>
                        {INGREDIENT_TYPES.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-2 border">
                      <div className="flex flex-col space-y-2">
                        {SIDE_OPTIONS.map(({ value, label }) => {
                          const isChecked = ing.sideTypes.includes(value);
                          return (
                            <label
                              key={value}
                              className="flex items-center space-x-2"
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {
                                  const next = isChecked
                                    ? ing.sideTypes.filter((v) => v !== value)
                                    : [...ing.sideTypes, value];
                                  handleEditChange(
                                    ing.id,
                                    "sideTypes",
                                    next
                                  );
                                }}
                              />
                              <span>{label}</span>
                            </label>
                          );
                        })}
                      </div>
                    </td>
                    <td className="p-2 border space-x-2">
                      <button
                        onClick={() => handleUpdate(ing.id)}
                        className="text-green-600"
                      >
                        Sauver
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="text-gray-600"
                      >
                        Annuler
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    {/* affichage normal */}
                    <td className="p-2 border">{ing.name}</td>
                    <td className="p-2 border">{ing.unit}</td>
                    <td className="p-2 border">{ing.price}</td>
                    <td className="p-2 border">{ing.calories}</td>
                    <td className="p-2 border">{ing.protein}</td>
                    <td className="p-2 border">{ing.fat}</td>
                    <td className="p-2 border">{ing.carbs}</td>
                    <td className="p-2 border">{ing.ingredientType}</td>
                    <td className="p-2 border">
                      {renderSideLabels(ing.sideTypes)}
                    </td>
                    <td className="p-2 border space-x-2">
                      <button
                        onClick={() => setEditingId(ing.id)}
                        className="text-blue-600"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDelete(ing.id)}
                        className="text-red-600"
                      >
                        Supprimer
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

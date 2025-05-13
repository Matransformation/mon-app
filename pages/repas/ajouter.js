import { useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";

export default function AjouterRepas() {
  const { data: session, status } = useSession(); // Récupération de la session
  const [repasType, setRepasType] = useState("dejeuner");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [recetteId, setRecetteId] = useState("");
  const [customName, setCustomName] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [fat, setFat] = useState("");
  const [carbs, setCarbs] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!session || !session.user?.id) {
      alert("Vous devez être connecté pour ajouter un repas.");
      return;
    }

    try {
      await axios.post("/api/repas/add", {
        userId: session.user.id, // On utilise l'ID de l'utilisateur connecté ici
        date,
        repasType,
        recetteId: recetteId || null,
        customName: customName || null,
        calories: calories ? Number(calories) : null,
        protein: protein ? Number(protein) : null,
        fat: fat ? Number(fat) : null,
        carbs: carbs ? Number(carbs) : null,
      });

      alert("Repas ajouté !");
      setRecetteId("");
      setCustomName("");
      setCalories("");
      setProtein("");
      setFat("");
      setCarbs("");
    } catch (error) {
      console.error(error);
      alert("Erreur lors de l'ajout du repas.");
    }
  };

  if (status === "loading") {
    return <p>Chargement...</p>;
  }

  if (!session) {
    return <p>Veuillez vous connecter pour ajouter un repas.</p>;
  }

  return (
    <div style={{ maxWidth: "600px", margin: "auto", padding: "20px" }}>
      <h1>Ajouter un repas</h1>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <label>
          Date :
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        </label>

        <label>
          Type de repas :
          <select value={repasType} onChange={(e) => setRepasType(e.target.value)} required>
            <option value="petit-dejeuner">Petit-déjeuner</option>
            <option value="dejeuner">Déjeuner</option>
            <option value="collation">Collation</option>
            <option value="diner">Dîner</option>
          </select>
        </label>

        <label>
          ID de la recette (optionnel) :
          <input
            type="text"
            value={recetteId}
            onChange={(e) => setRecetteId(e.target.value)}
            placeholder="ID recette existante"
          />
        </label>

        <p>OU ajouter un repas personnalisé :</p>

        <label>
          Nom du repas personnalisé :
          <input
            type="text"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            placeholder="Ex: Poulet riz"
          />
        </label>

        <label>
          Calories :
          <input
            type="number"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
            placeholder="Ex: 500"
          />
        </label>

        <label>
          Protéines (g) :
          <input
            type="number"
            value={protein}
            onChange={(e) => setProtein(e.target.value)}
            placeholder="Ex: 40"
          />
        </label>

        <label>
          Lipides (g) :
          <input
            type="number"
            value={fat}
            onChange={(e) => setFat(e.target.value)}
            placeholder="Ex: 20"
          />
        </label>

        <label>
          Glucides (g) :
          <input
            type="number"
            value={carbs}
            onChange={(e) => setCarbs(e.target.value)}
            placeholder="Ex: 50"
          />
        </label>

        <button type="submit" style={{ marginTop: "20px" }}>Ajouter le repas</button>
      </form>
    </div>
  );
}

import { useState } from "react";

export default function FormMensurations() {
  const [formData, setFormData] = useState({
    utilisateurId: "", // à remplir dynamiquement si besoin
    taille: "",
    poids: "",
    hanches: "",
    cuisses: "",
    bras: "",
    tailleAbdo: "",
    poitrine: "",
    mollets: "",
    imc: "",
    masseGrasse: ""
  });

  const [message, setMessage] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/mensurations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...formData,
          taille: parseInt(formData.taille),
          poids: parseFloat(formData.poids),
          hanches: parseInt(formData.hanches),
          cuisses: parseInt(formData.cuisses),
          bras: parseInt(formData.bras),
          tailleAbdo: parseInt(formData.tailleAbdo),
          poitrine: parseInt(formData.poitrine),
          mollets: parseInt(formData.mollets),
          imc: parseFloat(formData.imc),
          masseGrasse: parseFloat(formData.masseGrasse)
        })
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("Mensuration enregistrée avec succès !");
        setFormData({ ...formData, poids: "", imc: "", masseGrasse: "" });
      } else {
        setMessage(data.message || "Erreur !");
      }
    } catch (err) {
      setMessage("Erreur serveur !");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg mx-auto">
      <h2 className="text-xl font-bold">Ajouter des mensurations</h2>

      <input type="text" name="utilisateurId" placeholder="ID utilisateur" value={formData.utilisateurId} onChange={handleChange} className="border p-2 w-full rounded" required />

      {["taille", "poids", "hanches", "cuisses", "bras", "tailleAbdo", "poitrine", "mollets", "imc", "masseGrasse"].map((field) => (
        <input
          key={field}
          type="number"
          name={field}
          placeholder={field}
          value={formData[field]}
          onChange={handleChange}
          className="border p-2 w-full rounded"
        />
      ))}

      <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
        Enregistrer
      </button>

      {message && <p className="text-sm text-center mt-2">{message}</p>}
    </form>
  );
}

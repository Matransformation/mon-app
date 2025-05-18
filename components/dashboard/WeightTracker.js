// components/dashboard/WeightTracker.js
import React, { useState } from "react";

export default function WeightTracker({ historiquePoids, onAdd, onDelete }) {
  // 1) State local pour la liste des poids
  const [poidsList, setPoidsList] = useState(historiquePoids);
  const [nouveauPoids, setNouveauPoids] = useState("");

  // 2) Gestion de l'ajout
  const handleAdd = async () => {
    if (!nouveauPoids) return;
    const poids = parseFloat(nouveauPoids);
    // Création d'une entrée temporaire
    const tempEntry = {
      id: `tmp-${Date.now()}`,
      poids,
      date: new Date().toISOString(),
    };
    // Optimistic UI : on affiche tout de suite
    setPoidsList((prev) => [...prev, tempEntry]);
    setNouveauPoids("");
    try {
      // onAdd doit appeler l'API et renvoyer l'objet créé {id, poids, date}
      const createdEntry = await onAdd(poids);
      // On remplace la tempEntry par la vraie entrée renvoyée
      if (createdEntry?.id) {
        setPoidsList((prev) =>
          prev.map((e) => (e.id === tempEntry.id ? createdEntry : e))
        );
      }
    } catch (err) {
      console.error(err);
      // API KO → rollback
      setPoidsList((prev) => prev.filter((e) => e.id !== tempEntry.id));
    }
  };

  // 3) Gestion de la suppression
  const handleRemove = async (id) => {
    // On masque tout de suite
    setPoidsList((prev) => prev.filter((e) => e.id !== id));
    try {
      await onDelete(id);
    } catch (err) {
      console.error(err);
      // En cas d'erreur, tu peux recharger la liste complète ou ignorer
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="font-semibold text-lg mb-4">Mise à jour du poids</h2>
      <div className="flex items-center gap-3 mb-4">
        <input
          type="number"
          placeholder="Poids (kg)"
          value={nouveauPoids}
          onChange={(e) => setNouveauPoids(e.target.value)}
          className="border rounded px-3 py-2 w-24"
        />
        <button
          onClick={handleAdd}
          className="bg-brand hover:bg-opacity-90 text-white px-4 py-2 rounded"
        >
          Enregistrer
        </button>
      </div>
      <ul className="space-y-2 text-sm">
        {poidsList.map((entry) => (
          <li
            key={entry.id}
            className="flex justify-between items-center border-b pb-2"
          >
            <span>
              {new Date(entry.date).toLocaleDateString("fr-FR")} —{" "}
              <strong className="text-brand">{entry.poids} kg</strong>
            </span>
            <button
              onClick={() => handleRemove(entry.id)}
              className="text-red-600 hover:underline"
            >
              Supprimer
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

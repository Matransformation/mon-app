import React, { useState } from "react";

export default function MeasurementsForm({ onSave }) {
  const [form, setForm] = useState({
    taille: "",
    hanches: "",
    cuisses: "",
    bras: "",
    poitrine: "",
    mollets: "",
    masseGrasse: "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSave(form);
    setForm({
      taille: "",
      hanches: "",
      cuisses: "",
      bras: "",
      poitrine: "",
      mollets: "",
      masseGrasse: "",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow p-6 rounded">
      <h2 className="text-lg font-semibold mb-4">Ajouter une mensuration (vous n'êtes pas obligé, si vous n'avez pas de quoi le faire) pour suivre votre évolution</h2>
      <div className="grid grid-cols-2 gap-3">
        {Object.entries(form).map(([key, val]) => (
          <div key={key} className="flex flex-col col-span-1">
            <input
              name={key}
              type="number"
              placeholder={key}
              value={val}
              onChange={handleChange}
              className="border p-2 rounded"
              required
            />
            {key === "masseGrasse" && (
              <p className="text-xs text-gray-500 mt-1">
                Si vous ne connaissez pas votre masse grasse, indiquez un chiffre approximatif.
                Elle peut être mesurée avec une balance impédancemètre.
              </p>
            )}
          </div>
        ))}
      </div>
      <button
        type="submit"
        className="mt-4 bg-orange-500 text-white px-4 py-2 rounded"
      >
        Enregistrer
      </button>
    </form>
  );
}

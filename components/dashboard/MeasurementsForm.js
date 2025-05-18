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
    // onSave renvoie l'objet créé { id, date, ... }
    await onSave(form);
    // reset
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
      <h2 className="text-lg font-semibold mb-4">Ajouter une mensuration</h2>
      <div className="grid grid-cols-2 gap-3">
        {Object.entries(form).map(([key, val]) => (
          <input
            key={key}
            name={key}
            type="number"
            placeholder={key}
            value={val}
            onChange={handleChange}
            className="border p-2 rounded"
            required
          />
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

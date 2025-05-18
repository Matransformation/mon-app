// components/dashboard/MeasurementsForm.js
import React, { useState } from "react";

export default function MeasurementsForm({ onSave }) {
  const initialForm = {
    taille: "",
    hanches: "",
    cuisses: "",
    bras: "",
    poitrine: "",
    mollets: "",
    masseGrasse: "",
  };
  const [form, setForm] = useState(initialForm);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (Object.values(form).every((v) => v === "")) return;
    onSave(form);
    setForm(initialForm);
  };

  return (
    <div className="bg-white shadow p-4 rounded mb-6">
      <h2 className="text-lg font-semibold mb-4">Ajouter une mensuration</h2>

      {/* Mobile: champs empilés */}
      <form onSubmit={handleSubmit} className="md:hidden space-y-3">
        {Object.keys(initialForm).map((key) => (
          <div key={key} className="flex flex-col">
            <label htmlFor={key} className="mb-1 capitalize text-sm text-gray-700">
              {key}
            </label>
            <input
              type="number"
              step="0.1"
              id={key}
              name={key}
              value={form[key]}
              onChange={handleChange}
              placeholder={key}
              className="border p-2 rounded text-sm"
            />
          </div>
        ))}
        <button
          type="submit"
          className="w-full bg-brand hover:bg-opacity-90 text-white rounded py-2 transition"
        >
          Enregistrer
        </button>
      </form>

      {/* Desktop: tableau */}
      <form onSubmit={handleSubmit} className="hidden md:block">
        <div className="overflow-x-auto mb-4">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-100">
                {Object.keys(initialForm).map((key) => (
                  <th key={key} className="border px-3 py-2 capitalize">
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {Object.keys(initialForm).map((key) => (
                  <td key={key} className="border p-2">
                    <input
                      type="number"
                      step="0.1"
                      name={key}
                      value={form[key]}
                      onChange={handleChange}
                      placeholder={key}
                      className="w-full border rounded px-2 py-1 text-sm"
                    />
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        <button
          type="submit"
          className="bg-brand hover:bg-opacity-90 text-white rounded py-2 px-4 transition"
        >
          Enregistrer
        </button>
      </form>
    </div>
  );
}

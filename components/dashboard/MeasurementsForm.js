// components/dashboard/MeasurementsForm.js
import React, { useMemo, useState } from "react";

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
  const [loading, setLoading] = useState(false);
  const [okMsg, setOkMsg] = useState("");
  const [error, setError] = useState("");

  const fields = [
    { name: "taille", label: "Taille", unit: "cm" },
    { name: "hanches", label: "Hanches", unit: "cm" },
    { name: "cuisses", label: "Cuisses", unit: "cm" },
    { name: "bras", label: "Bras", unit: "cm" },
    { name: "poitrine", label: "Poitrine", unit: "cm" },
    { name: "mollets", label: "Mollets", unit: "cm" },
    { name: "masseGrasse", label: "Masse grasse", unit: "%" },
  ];

  // au moins un champ rempli ?
  const isDirty = useMemo(
    () => Object.values(form).some((v) => String(v).trim() !== ""),
    [form]
  );

  // autoriser virgule/décimales, normaliser en point
  const normalize = (val) =>
    val.replace(",", ".").replace(/[^\d.]/g, "");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: normalize(value) }));
  };

  const reset = () =>
    setForm({
      taille: "",
      hanches: "",
      cuisses: "",
      bras: "",
      poitrine: "",
      mollets: "",
      masseGrasse: "",
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setOkMsg("");
    if (!isDirty) return;

    // petite validation : valeurs >= 0
    const invalidKey = Object.entries(form).find(
      ([, v]) => v !== "" && Number(v) < 0
    );
    if (invalidKey) {
      setError("Les valeurs doivent être positives.");
      return;
    }

    try {
      setLoading(true);
      await onSave(
        Object.fromEntries(
          Object.entries(form).map(([k, v]) => [k, v === "" ? null : Number(v)])
        )
      );
      reset();
      setOkMsg("Mensuration enregistrée ✅");
      setTimeout(() => setOkMsg(""), 2500);
    } catch (err) {
      console.error(err);
      setError("Échec de l’enregistrement. Réessaie dans un instant.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-slate-600">
        Optionnel — ajoute des valeurs lorsque tu peux pour suivre l’évolution plus précisément.
      </p>

      {/* grid des champs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {fields.map(({ name, label, unit }) => (
          <div key={name} className="flex flex-col">
            <label
              htmlFor={name}
              className="mb-1 text-sm font-medium text-slate-800"
            >
              {label} <span className="text-slate-400 font-normal">({unit})</span>
            </label>

            <div className="relative">
              <input
                id={name}
                name={name}
                type="text"
                inputMode="decimal"
                placeholder={`Ex : ${
                  unit === "%" ? "22" : "95"
                }`}
                value={form[name]}
                onChange={handleChange}
                className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 pr-12 shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-300"
                aria-invalid={!!error}
              />
              <span className="pointer-events-none absolute inset-y-0 right-3 inline-flex items-center text-slate-400 text-sm">
                {unit}
              </span>
            </div>

            {name === "masseGrasse" && (
              <p className="mt-1 text-xs text-slate-500">
                Si tu ne connais pas ta masse grasse, indique une estimation. Idéalement mesurée avec une balance impédancemètre.
              </p>
            )}
          </div>
        ))}
      </div>

      {/* feedback */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}
      {okMsg && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
          {okMsg}
        </div>
      )}

      {/* actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          type="submit"
          disabled={!isDirty || loading}
          className={`inline-flex items-center justify-center rounded-xl px-5 py-2 font-semibold text-white transition
            ${!isDirty || loading ? "bg-orange-300 cursor-not-allowed" : "bg-orange-500 hover:brightness-110"}
          `}
        >
          {loading ? "Enregistrement…" : "Enregistrer"}
        </button>
        <button
          type="button"
          onClick={reset}
          disabled={!isDirty || loading}
          className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-2 font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-50"
        >
          Réinitialiser
        </button>
      </div>
    </form>
  );
}

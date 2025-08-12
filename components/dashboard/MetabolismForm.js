// components/dashboard/MetabolismForm.js
import React, { useState, useEffect, useRef, useMemo } from "react";
import { Cpu, Info } from "lucide-react";

export default function MetabolismForm({
  utilisateur,
  poidsActuel,
  metabolismeInit,
  onSave,
}) {
  const [form, setForm] = useState({
    sexe: utilisateur.sexe || "",
    age: utilisateur.age?.toString() || "",
    taille: utilisateur.taille?.toString() || "",
    activite: utilisateur.activite || "",
    objectif: utilisateur.objectif || "perte",
  });
  const [metabolisme, setMetabolisme] = useState(
    metabolismeInit?.toString() || ""
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const initialMount = useRef(true);

  // MàJ si valeur initiale change côté serveur
  useEffect(() => {
    setMetabolisme(metabolismeInit?.toString() || "");
  }, [metabolismeInit]);

  // Recalc auto après 1er rendu quand le poids change
  useEffect(() => {
    if (initialMount.current) {
      initialMount.current = false;
      return;
    }
    if (isComplete) {
      recalc();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [poidsActuel]);

  // Form complet ?
  const isComplete = useMemo(() => {
    return !!(
      form.sexe &&
      form.age &&
      form.taille &&
      form.activite &&
      form.objectif
    );
  }, [form]);

  // Normaliser décimales (virgule → point)
  const normalize = (v) => v.replace(",", ".").replace(/[^\d.]/g, "");

  const onChange = (patch) => setForm((f) => ({ ...f, ...patch }));

  async function recalc() {
    try {
      setError("");
      setSaving(true);
      const payload = {
        sexe: form.sexe,
        age: parseInt(form.age, 10),
        taille: parseInt(form.taille, 10),
        activite: form.activite,
        objectif: form.objectif,
        poids: poidsActuel,
      };
      const { metabolismeCible: newMeta } = await onSave(payload);
      setMetabolisme(newMeta?.toString() || "");
    } catch (err) {
      console.error("Erreur calcul métabolisme :", err);
      setError("Impossible de recalculer pour le moment. Réessaie dans un instant.");
    } finally {
      setSaving(false);
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isComplete || saving) return;
    recalc();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Bandeau titre/infos */}
      <div className="flex items-start gap-3 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3">
        <Cpu className="h-5 w-5 text-orange-600 mt-0.5" />
        <div className="text-sm text-slate-800">
          <div className="font-semibold">Calcul de votre métabolisme</div>
          <div className="mt-1 flex items-center gap-2 text-slate-600">
            <Info className="h-4 w-4 text-slate-500" />
            <span>
              Mettez à jour votre poids (<strong>{poidsActuel} kg</strong>) pour un calcul précis.
            </span>
          </div>
        </div>
      </div>

      {/* Champs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Sexe (radios) */}
        <div className="flex flex-col">
          <span className="mb-2 text-sm font-medium text-slate-800">Sexe</span>
          <div className="flex gap-3">
            <label className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 cursor-pointer hover:bg-slate-50">
              <input
                type="radio"
                name="sexe"
                value="homme"
                checked={form.sexe === "homme"}
                onChange={(e) => onChange({ sexe: e.target.value })}
                className="accent-orange-500"
              />
              <span className="text-sm">Homme</span>
            </label>
            <label className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 cursor-pointer hover:bg-slate-50">
              <input
                type="radio"
                name="sexe"
                value="femme"
                checked={form.sexe === "femme"}
                onChange={(e) => onChange({ sexe: e.target.value })}
                className="accent-orange-500"
              />
              <span className="text-sm">Femme</span>
            </label>
          </div>
        </div>

        {/* Âge */}
        <div className="flex flex-col">
          <label className="mb-1 text-sm font-medium text-slate-800" htmlFor="age">
            Âge
          </label>
          <div className="relative">
            <input
              id="age"
              type="text"
              inputMode="numeric"
              placeholder="30"
              value={form.age}
              onChange={(e) => onChange({ age: normalize(e.target.value) })}
              className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 pr-12 shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-300"
              required
            />
            <span className="pointer-events-none absolute inset-y-0 right-3 inline-flex items-center text-slate-400 text-sm">
              ans
            </span>
          </div>
        </div>

        {/* Taille */}
        <div className="flex flex-col">
          <label className="mb-1 text-sm font-medium text-slate-800" htmlFor="taille">
            Taille
          </label>
          <div className="relative">
            <input
              id="taille"
              type="text"
              inputMode="decimal"
              placeholder="170"
              value={form.taille}
              onChange={(e) => onChange({ taille: normalize(e.target.value) })}
              className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 pr-12 shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-300"
              required
            />
            <span className="pointer-events-none absolute inset-y-0 right-3 inline-flex items-center text-slate-400 text-sm">
              cm
            </span>
          </div>
        </div>

        {/* Activité */}
        <div className="flex flex-col">
          <label className="mb-1 text-sm font-medium text-slate-800" htmlFor="activite">
            Activité hebdo
          </label>
          <select
            id="activite"
            value={form.activite}
            onChange={(e) => onChange({ activite: e.target.value })}
            className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
            required
          >
            <option value="">Choisir niveau</option>
            <option value="sédentaire">0h / sem</option>
            <option value="légèrement actif">1–2h / sem</option>
            <option value="modérément actif">3–4h / sem</option>
            <option value="très actif">5–6h / sem</option>
            <option value="extrêmement actif">7h+ / sem</option>
          </select>
        </div>

        {/* Objectif */}
        <div className="flex flex-col">
          <label className="mb-1 text-sm font-medium text-slate-800" htmlFor="objectif">
            Objectif
          </label>
          <select
            id="objectif"
            value={form.objectif}
            onChange={(e) => onChange({ objectif: e.target.value })}
            className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
          >
            <option value="perte">Perte de poids</option>
            <option value="maintien">Maintien de poids</option>
          </select>
        </div>
      </div>

      {/* Erreur si besoin */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="submit"
          disabled={!isComplete || saving}
          className={`inline-flex w-full sm:w-auto items-center justify-center rounded-xl px-5 py-2 font-semibold text-white transition
            ${!isComplete || saving ? "bg-orange-300 cursor-not-allowed" : "bg-orange-500 hover:brightness-110"}
          `}
        >
          {saving ? "Calcul en cours…" : "Calculer mes besoins"}
        </button>
        {/* Affichage résultat sur desktop aligné à droite */}
        {metabolisme && (
          <div className="flex-1 flex items-center justify-center sm:justify-start rounded-xl border border-orange-200 bg-orange-50 px-4 py-2">
            <span className="text-sm text-slate-700">🎯 Vos besoins&nbsp;:</span>
            <strong className="ml-2 text-xl text-orange-600">{metabolisme} kcal</strong>
          </div>
        )}
      </div>

      {/* Résultat sur mobile si le bloc d’au-dessus passe en dessous */}
      {!metabolisme ? null : (
        <div className="sm:hidden rounded-xl border border-orange-200 bg-orange-50 px-4 py-2">
          <span className="text-sm text-slate-700">🎯 Vos besoins&nbsp;:</span>
          <strong className="ml-2 text-xl text-orange-600">{metabolisme} kcal</strong>
        </div>
      )}
    </form>
  );
}

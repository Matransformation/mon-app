// components/dashboard/WeightTracker.js
import React, { useMemo, useState } from "react";

export default function WeightTracker({ historiquePoids = [], onAdd, onDelete }) {
  const [nouveauPoids, setNouveauPoids] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  // Normalise "70,5" -> "70.5"
  const normalize = (v) => v.replace(",", ".").replace(/[^\d.]/g, "");
  const onChange = (e) => setNouveauPoids(normalize(e.target.value));

  const isValid = useMemo(() => {
    if (nouveauPoids.trim() === "") return false;
    const n = Number(nouveauPoids);
    return Number.isFinite(n) && n > 0 && n < 500;
  }, [nouveauPoids]);

  // Nettoyage des entrées invalides (date/poids)
  const cleaned = useMemo(
    () =>
      (historiquePoids || []).filter(
        (e) => e?.date && !isNaN(new Date(e.date)) && Number.isFinite(Number(e?.poids))
      ),
    [historiquePoids]
  );

  // Tri pour variations (asc) puis affichage (desc)
  const sortedAsc = useMemo(
    () => [...cleaned].sort((a, b) => new Date(a.date) - new Date(b.date)),
    [cleaned]
  );
  const displayDesc = [...sortedAsc].reverse();

  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });

  const getVariation = (entry) => {
    const idx = sortedAsc.findIndex((e) => e.id === entry.id);
    if (idx <= 0) return null;
    const prev = sortedAsc[idx - 1];
    const diff = Number(entry.poids) - Number(prev.poids);
    return Number.isFinite(diff) ? diff.toFixed(1) : null;
  };

  const handleAdd = async () => {
    if (!isValid || loading) return;
    setErr("");
    setMsg("");
    setLoading(true);
    try {
      const created = await onAdd(Number(nouveauPoids)); // parent met à jour la liste
      setNouveauPoids("");
      setMsg("Poids ajouté ✅");
      setTimeout(() => setMsg(""), 2000);
      return created;
    } catch (e) {
      console.error(e);
      setErr("Impossible d’enregistrer pour le moment. Réessaie.");
      setTimeout(() => setErr(""), 2500);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  const handleRemove = async (id) => {
    setErr("");
    try {
      await onDelete(id); // parent met à jour la liste → rerender
    } catch (e) {
      console.error(e);
      setErr("La suppression a échoué. Réessaie.");
      setTimeout(() => setErr(""), 2500);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Ajoute ton poids du jour pour suivre ta progression.
      </p>

      {/* Formulaire inline */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            inputMode="decimal"
            placeholder="Ex : 72.4"
            value={nouveauPoids}
            onChange={onChange}
            onKeyDown={handleKeyDown}
            className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 pr-12 shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-300"
            aria-label="Poids (kg)"
          />
          <span className="pointer-events-none absolute inset-y-0 right-3 inline-flex items-center text-slate-400 text-sm">
            kg
          </span>
        </div>
        <button
          onClick={handleAdd}
          disabled={!isValid || loading}
          className={`inline-flex items-center justify-center rounded-xl px-5 py-2 font-semibold text-white transition
            ${!isValid || loading ? "bg-orange-300 cursor-not-allowed" : "bg-orange-500 hover:brightness-110"}`}
        >
          {loading ? "Enregistrement…" : "Enregistrer"}
        </button>
      </div>

      {err && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {err}
        </div>
      )}
      {msg && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
          {msg}
        </div>
      )}

      {/* Liste (plus récent → plus ancien) */}
      <ul className="divide-y divide-gray-200 rounded-xl border border-gray-100 overflow-hidden">
        {displayDesc.length === 0 ? (
          <li className="px-4 py-6 text-center text-slate-500">
            Aucune mesure pour le moment.
          </li>
        ) : (
          displayDesc.map((entry) => {
            const v = getVariation(entry);
            const date = formatDate(entry.date);
            const variationColor =
              v == null ? "text-gray-400" : Number(v) < 0 ? "text-green-600" : "text-red-600";

            return (
              <li
                key={entry.id}
                className="px-4 sm:px-6 py-3 flex items-center justify-between hover:bg-orange-50/40 transition"
              >
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700">
                    {date}
                  </span>
                  <div className="text-sm">
                    <strong className="text-slate-900">{Number(entry.poids)} kg</strong>
                    {v !== null && (
                      <span className={`ml-2 text-xs font-medium ${variationColor}`}>
                        ({Number(v) > 0 ? "+" : ""}{v} kg)
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleRemove(entry.id)}
                  className="text-red-500 text-xs sm:text-sm hover:underline"
                  aria-label={`Supprimer le poids du ${date}`}
                >
                  Supprimer
                </button>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}

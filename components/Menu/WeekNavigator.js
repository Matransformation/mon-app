// components/Menu/WeekNavigator.js
import React from "react";

export default function WeekNavigator({
  weekStart,
  prevWeek,
  nextWeek,
  reload,
  userId,
}) {
  const label = new Date(weekStart).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
  });
  return (
    <div className="flex flex-col md:flex-row items-center justify-between bg-white p-4 rounded-xl shadow-md">
      <span className="text-xl font-bold text-gray-700">
        Semaine du {label}
      </span>
      <div className="flex flex-wrap gap-2 mt-2 md:mt-0 justify-center md:justify-start w-full">        <button
          onClick={prevWeek}
          className="px-3 py-1 bg-orange-400 text-white rounded hover:bg-orange-500 transition"
        >
          ← Précédente
        </button>
        <button
          onClick={reload}
          className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
        >
          🔄 Recharger
        </button>
        <button
          onClick={nextWeek}
          className="px-3 py-1 bg-orange-400 text-white rounded hover:bg-orange-500 transition"
        >
          Suivante →
        </button>
        <button
          onClick={() => window.print()}
          className="px-3 py-1 bg-blue-400 text-white rounded hover:bg-blue-500 transition"
        >
          🖨️ Imprimer
        </button>
        <a
          href="/liste-courses"
          className="px-3 py-1 bg-green-400 text-white rounded hover:bg-green-500 transition"
        >
          🛒 Liste de courses
        </a>
        <button
  onClick={() => {
    if (
      confirm(
        "Générer le menu pour cette semaine ? Cela écrasera l’existant."
      )
    ) {
      fetch("/api/menu/generer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, weekStart }), // 👈 correction ici
      }).then(reload);
    }
  }}
  className="px-3 py-1 bg-green-400 text-white rounded hover:bg-green-500 transition"
>
  + Générer mon menu
</button>
      </div>
    </div>
  );
}

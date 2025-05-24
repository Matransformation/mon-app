// File: components/Menu/WeekMenu.js
import React, { useState } from "react";
import WeekNavigator from "./WeekNavigator";
import DayCard from "./DayCard";
import ChangeRepasModal from "../ChangeRepasModal";
import useMenu from "../../hooks/useMenu";
import useAccompagnements from "../../hooks/useAccompagnements";

export default function WeekMenu({ user }) {
  const { menu, weekStart, prevWeek, nextWeek, reload, loading } = useMenu();
  const [selectedRepas, setSelectedRepas] = useState(null);

  const {
    applyAccompagnements,
    removeAccompagnements,
    allIngredients,
    proteinRichOptions,
  } = useAccompagnements({ user, reload });

  const updateLocalMeal = (updatedRepas) => {
    const idx = menu.findIndex((m) => m.id === updatedRepas.id);
    if (idx !== -1) {
      menu[idx] = { ...menu[idx], ...updatedRepas };
    }
  };

  if (loading) {
    return <p className="text-center py-6">Chargement…</p>;
  }

  // Génère les 7 dates de la semaine
  const start = new Date(weekStart);
  const days = Array.from({ length: 7 }).map((_, idx) => {
    const d = new Date(start);
    d.setDate(start.getDate() + idx);
    return d;
  });

  return (
    <div className="max-w-7xl mx-auto px-4">
      <WeekNavigator
        weekStart={weekStart}
        prevWeek={prevWeek}
        nextWeek={nextWeek}
        reload={reload}
        userId={user.id}
      />

      {/* 
        Mobile: 1 colonne
        Desktop (md+): 2 colonnes => 2 jours par ligne
      */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {days.map((day) => (
          <DayCard
            key={day.toISOString()}
            date={day}
            entries={menu.filter(
              (e) => new Date(e.date).toDateString() === day.toDateString()
            )}
            user={user}
            openModal={setSelectedRepas}
            applyAccompagnements={applyAccompagnements}
            removeAccompagnements={removeAccompagnements}
            allIngredients={allIngredients}
            proteinRichOptions={proteinRichOptions}
            onUpdateMeal={updateLocalMeal} // 💡 pour mise à jour locale du repas
          />
        ))}
      </div>

      {selectedRepas && (
        <ChangeRepasModal
          repas={selectedRepas}
          onClose={() => setSelectedRepas(null)}
          onUpdate={() => {
            reload();
            setSelectedRepas(null);
          }}
        />
      )}
    </div>
  );
}

import React, { useState, useEffect, useRef } from "react";
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

  const sectionsRef = useRef({});
  const lastActiveDay = useRef(null);

  // ✅ Scroll vers le jour actif avec fallback mobile
  const scrollToDay = (key) => {
    requestAnimationFrame(() => {
      const section = sectionsRef.current[key];
      if (section) {
        section.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        // Fallback : si la section n’est pas encore montée, on retente après un délai
        setTimeout(() => {
          const retrySection = sectionsRef.current[key];
          if (retrySection) {
            retrySection.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }, 100);
      }
    });
  };

  // ✅ Ajout d’accompagnement + refetch ciblé + scroll de retour
  const safeApplyAccompagnements = async (repasId, accompagnements) => {
    lastActiveDay.current = active;

    await applyAccompagnements(repasId, accompagnements);

    const res = await fetch(`/api/menu/repas/${repasId}`);
    const updatedRepas = await res.json();

    const updatedMenu = menu.map((m) =>
      m.id === repasId ? { ...m, ...updatedRepas } : m
    );

    await reload(updatedMenu);

    scrollToDay(lastActiveDay.current);
  };

  // Génère les 7 jours de la semaine
  const start = new Date(weekStart);
  const days = Array.from({ length: 7 }).map((_, idx) => {
    const d = new Date(start);
    d.setDate(start.getDate() + idx);
    return d;
  });

  const [active, setActive] = useState(days[0].toDateString());

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            setActive(e.target.id);
          }
        });
      },
      { rootMargin: "-50% 0px -50% 0px" }
    );

    const els = Object.values(sectionsRef.current).filter(
      el => el && el instanceof Element
    );
    els.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, [days]);

  if (loading) {
    return <p className="text-center py-6">Chargement…</p>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4">
      <WeekNavigator
        weekStart={weekStart}
        prevWeek={prevWeek}
        nextWeek={nextWeek}
        reload={reload}
        userId={user.id}
      />

      {/* Navigation par jour */}
      <nav className="mt-6 md:mt-0 sticky top-20 z-30 bg-cream-50 py-2 border-b border-gray-200">
        <ul className="flex justify-between px-2">
          {days.map(day => {
            const dow = day
              .toLocaleDateString("fr-FR", { weekday: "short" })
              .toUpperCase();
            const dd = day.getDate().toString().padStart(2, "0");
            const key = day.toDateString();
            const isActive = active === key;

            return (
              <li key={key}>
                <a
                  href={`#${encodeURIComponent(key)}`}
                  className={`flex flex-col items-center gap-1 px-2 py-1 rounded-full transition ${
                    isActive
                      ? "bg-orange-500 text-white"
                      : "text-gray-700 hover:text-orange-500"
                  }`}
                >
                  <span className="text-xs font-medium">{dow}</span>
                  <span
                    className={`w-6 h-6 flex items-center justify-center rounded-full font-semibold ${
                      isActive
                        ? "bg-white text-orange-500"
                        : "bg-transparent"
                    }`}
                  >
                    {dd}
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Grille des jours */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {days.map(day => {
          const key = day.toDateString();
          return (
            <section
              key={key}
              id={key}
              ref={el => { sectionsRef.current[key] = el }}
              className="pt-16 scroll-mt-20"
            >
              <DayCard
                date={day}
                entries={menu.filter(
                  e => new Date(e.date).toDateString() === key
                )}
                user={user}
                openModal={setSelectedRepas}
                applyAccompagnements={safeApplyAccompagnements}
                removeAccompagnements={removeAccompagnements}
                allIngredients={allIngredients}
                proteinRichOptions={proteinRichOptions}
                onUpdateMeal={updatedRepas => {
                  const idx = menu.findIndex(m => m.id === updatedRepas.id);
                  if (idx !== -1)
                    menu[idx] = { ...menu[idx], ...updatedRepas };
                }}
              />
            </section>
          );
        })}
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

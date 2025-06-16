import React, { useState, useEffect, useRef } from "react";
import WeekNavigator from "./WeekNavigator";
import DayCard from "./DayCard";
import ChangeRepasModal from "../ChangeRepasModal";
import useMenu from "../../hooks/useMenu";
import useAccompagnements from "../../hooks/useAccompagnements";

export default function WeekMenu({ user }) {
  const { menu, weekStart, prevWeek, nextWeek, reload, loading } = useMenu();
  const [selectedRepas, setSelectedRepas] = useState(null);
  const [scrollTarget, setScrollTarget] = useState(null);

  const {
    applyAccompagnements,
    removeAccompagnements,
    allIngredients,
    proteinRichOptions,
  } = useAccompagnements({ user, reload });

  const updateMenuForDay = async (dayKey) => {
    const res = await fetch(`/api/menu/day?date=${encodeURIComponent(dayKey)}&userId=${user.id}`);
    const updatedEntries = await res.json();

    const updatedMenu = menu.filter(m => new Date(m.date).toDateString() !== dayKey);
    updatedEntries.forEach(entry => updatedMenu.push(entry));
    updatedMenu.sort((a, b) => new Date(a.date) - new Date(b.date));

    reload(updatedMenu);
  };

  const safeApplyAccompagnements = async (repasId, accompagnements) => {
    await applyAccompagnements(repasId, accompagnements);

    const repas = menu.find(r => r.id === repasId);
    if (!repas) return;

    const dayKey = new Date(repas.date).toDateString();
    setScrollTarget(dayKey); // Retenir le jour pour scroll après update
    await updateMenuForDay(dayKey);
  };

  const start = new Date(weekStart);
  const days = Array.from({ length: 7 }).map((_, idx) => {
    const d = new Date(start);
    d.setDate(start.getDate() + idx);
    return d;
  });

  const [active, setActive] = useState(days[0].toDateString());
  const sectionsRef = useRef({});

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

  useEffect(() => {
    if (scrollTarget && sectionsRef.current[scrollTarget]) {
      setTimeout(() => {
        const section = sectionsRef.current[scrollTarget];
        const rect = section.getBoundingClientRect();
        const absoluteTop = rect.top + window.scrollY - 80;
        window.scrollTo({ top: absoluteTop, behavior: "smooth" });
        setScrollTarget(null);
      }, 300);
    }
  }, [menu]);

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

      <nav className="mt-6 md:mt-0 sticky top-20 z-30 bg-cream-50 py-2 border-b border-gray-200">
        <ul className="flex justify-between px-2">
          {days.map(day => {
            const dow = day.toLocaleDateString("fr-FR", { weekday: "short" }).toUpperCase();
            const dd = String(day.getDate()).padStart(2, "0");
            const key = day.toDateString();
            const isActive = active === key;

            return (
              <li key={key}>
                <a
                  href={`#${encodeURIComponent(key)}`}
                  className={`flex flex-col items-center gap-1 px-2 py-1 rounded-full transition ${
                    isActive ? "bg-orange-500 text-white" : "text-gray-700 hover:text-orange-500"
                  }`}
                >
                  <span className="text-xs font-medium">{dow}</span>
                  <span
                    className={`w-6 h-6 flex items-center justify-center rounded-full font-semibold ${
                      isActive ? "bg-white text-orange-500" : "bg-transparent"
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
                entries={menu.filter(e => new Date(e.date).toDateString() === key)}
                user={user}
                openModal={setSelectedRepas}
                applyAccompagnements={safeApplyAccompagnements}
                removeAccompagnements={removeAccompagnements}
                allIngredients={allIngredients}
                proteinRichOptions={proteinRichOptions}
                onUpdateMeal={updatedRepas => {
                  const idx = menu.findIndex(m => m.id === updatedRepas.id);
                  if (idx !== -1) menu[idx] = { ...menu[idx], ...updatedRepas };
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

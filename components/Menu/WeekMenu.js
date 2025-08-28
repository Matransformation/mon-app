// components/WeekMenu/index.js
import React, { useState, useEffect, useRef, useMemo } from "react";
import WeekNavigator from "./WeekNavigator";
import DayCard from "./DayCard";
import ChangeRepasModal from "../ChangeRepasModal";
import useMenu from "../../hooks/useMenu";
import useAccompagnements from "../../hooks/useAccompagnements";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { preserveScroll } from "../../lib/preserveScroll";

export default function WeekMenu({ user }) {
  const { menu, weekStart, prevWeek, nextWeek, reload, loading } = useMenu();
  const [selectedRepas, setSelectedRepas] = useState(null);

  const {
    applyAccompagnements,
    removeAccompagnements,
    allIngredients,
    proteinRichOptions,
  } = useAccompagnements({ user, reload });

  // ====== Stale-while-revalidate pour éviter le "scroll to top" lors des reloads
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [menuSnapshot, setMenuSnapshot] = useState([]);

  useEffect(() => {
    if (!loading && Array.isArray(menu)) {
      setHasLoadedOnce(true);
      setMenuSnapshot(menu);
    }
  }, [loading, menu]);

  // Pendant un reload ultérieur, on continue d'afficher le dernier menu connu
  const menuToRender = hasLoadedOnce && loading ? menuSnapshot : menu;

  // ===== UI jour actif / nav
  const start = useMemo(() => new Date(weekStart), [weekStart]);
  const days = useMemo(() => {
    return Array.from({ length: 7 }).map((_, idx) => {
      const d = new Date(start);
      d.setDate(start.getDate() + idx);
      return d;
    });
  }, [start]);

  const dayKey = (d) => d.toDateString();
  const dayId = (d) => `day-${d.toISOString().slice(0, 10)}`;
  const todayKey = dayKey(new Date());
  const initialActive = useMemo(
    () => (days.some((d) => dayKey(d) === todayKey) ? todayKey : dayKey(days[0])),
    [days, todayKey]
  );
  const [active, setActive] = useState(initialActive);
  useEffect(() => setActive(initialActive), [initialActive]);

  const sectionsRef = useRef({});
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.getAttribute("data-key"))),
      { rootMargin: "-40% 0px -55% 0px", threshold: 0.5 }
    );
    Object.values(sectionsRef.current)
      .filter((el) => el instanceof Element)
      .forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [days]);

  const scrollToDomId = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const stripRef = useRef(null);
  const [canScroll, setCanScroll] = useState({ left: false, right: false });
  const updateCanScroll = () => {
    const el = stripRef.current;
    if (!el) return;
    setCanScroll({
      left: el.scrollLeft > 4,
      right: el.scrollLeft + el.clientWidth < el.scrollWidth - 4,
    });
  };
  useEffect(() => {
    updateCanScroll();
    const el = stripRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateCanScroll, { passive: true });
    window.addEventListener("resize", updateCanScroll);
    return () => {
      el.removeEventListener("scroll", updateCanScroll);
      window.removeEventListener("resize", updateCanScroll);
    };
  }, [days]);
  const scrollBy = (delta) => stripRef.current?.scrollBy({ left: delta, behavior: "smooth" });

  // ---------- Skeleton UNIQUEMENT au premier chargement ----------
  if (loading && !hasLoadedOnce) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <WeekNavigator
          weekStart={weekStart}
          prevWeek={prevWeek}
          nextWeek={nextWeek}
          reload={reload}
          userId={user?.id}
        />
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-2xl bg-gray-100" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4">
      <WeekNavigator
        weekStart={weekStart}
        prevWeek={prevWeek}
        nextWeek={nextWeek}
        reload={reload}
        userId={user.id}
      />

      {/* Nav des jours */}
      <div className="sticky top-20 z-30 mt-3">
        <nav className="relative rounded-2xl border border-orange-100 bg-[#FFFBF7] px-2 py-2 shadow-sm">
          <div className="pointer-events-none absolute inset-y-0 left-0 w-6 rounded-l-2xl bg-gradient-to-r from-[#FFFBF7] to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-6 rounded-r-2xl bg-gradient-to-l from-[#FFFBF7] to-transparent" />

          {canScroll.left && (
            <button
              type="button"
              onClick={() => scrollBy(-160)}
              className="absolute left-1 top-1/2 -translate-y-1/2 grid h-8 w-8 place-items-center rounded-full border border-orange-200 bg-white text-gray-800 shadow-sm md:hidden"
              aria-label="Faire défiler vers la gauche"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
          {canScroll.right && (
            <button
              type="button"
              onClick={() => scrollBy(160)}
              className="absolute right-1 top-1/2 -translate-y-1/2 grid h-8 w-8 place-items-center rounded-full border border-orange-200 bg-white text-gray-800 shadow-sm md:hidden"
              aria-label="Faire défiler vers la droite"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          )}

          <ul
            ref={stripRef}
            className="flex snap-x snap-mandatory items-center gap-1 overflow-x-auto px-3 pb-1 pt-1 sm:gap-2 sm:px-4 scrollbar-none"
          >
            {days.map((day) => {
              const k = dayKey(day);
              const id = dayId(day);
              const dow = day
                .toLocaleDateString("fr-FR", { weekday: "short" })
                .replace(".", "")
                .slice(0, 3)
                .toUpperCase();
              const dd = String(day.getDate()).padStart(2, "0");
              const isActive = active === k;

              return (
                <li key={id} className="snap-start">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setActive(k);
                      scrollToDomId(id);
                    }}
                    aria-current={isActive ? "date" : undefined}
                    className={[
                      "group flex items-center gap-2 rounded-full border px-2.5 py-2 text-sm transition sm:px-3",
                      isActive
                        ? "border-transparent bg-[#fb8905] text-white"
                        : "border-orange-100 bg-white text-gray-800 hover:bg-orange-50",
                    ].join(" ")}
                    title={`${dow} ${dd}`}
                  >
                    <span className="text-[11px] font-semibold opacity-90">{dow}</span>
                    <span
                      className={[
                        "grid h-6 w-6 place-items-center rounded-full text-xs font-bold",
                        isActive ? "bg-white text-[#fb8905]" : "bg-orange-100 text-gray-900",
                      ].join(" ")}
                    >
                      {dd}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* Grille des jours */}
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        {days.map((day) => {
          const k = dayKey(day);
          const id = dayId(day);
          return (
            <section
              key={id}
              id={id}
              data-key={k}
              ref={(el) => {
                sectionsRef.current[id] = el;
              }}
              className="scroll-mt-24 pt-16"
            >
              <DayCard
                date={day}
                entries={menuToRender.filter((e) => new Date(e.date).toDateString() === k)}
                user={user}
                openModal={setSelectedRepas}
                applyAccompagnements={applyAccompagnements}
                removeAccompagnements={removeAccompagnements}
                allIngredients={allIngredients}
                proteinRichOptions={proteinRichOptions}
                onUpdateMeal={(updatedRepas) => {
                  // on met aussi à jour le snapshot pour éviter un "flash" pendant un reload
                  const idx = menuSnapshot.findIndex((m) => m.id === updatedRepas.id);
                  if (idx !== -1) {
                    const next = [...menuSnapshot];
                    next[idx] = { ...next[idx], ...updatedRepas };
                    setMenuSnapshot(next);
                  }
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
          onUpdate={() => preserveScroll(reload)}
        />
      )}
    </div>
  );
}

import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function DayNav() {
  const jours = useMemo(
    () => ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"],
    []
  );
  const ids = useMemo(() => jours.map((d) => d.toLowerCase()), [jours]);

  // Actif par défaut : ancre hash si présente, sinon aujourd’hui (si dans la liste)
  const todayIdx = (new Date().getDay() + 6) % 7; // 0 = Lundi, ..., 6 = Dimanche
  const initial = typeof window !== "undefined" && window.location.hash
    ? window.location.hash.replace("#", "")
    : ids[todayIdx];

  const [active, setActive] = useState(initial);
  useEffect(() => {
    // Si le hash change (navigateur), sync
    const onHash = () => setActive(window.location.hash.replace("#", "") || ids[0]);
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Observer : met à jour le jour actif quand une section passe au centre de l’écran
  useEffect(() => {
    const targets = ids
      .map((id) => document.getElementById(id))
      .filter((el) => el instanceof Element);

    if (!targets.length) return; // si les sections n'existent pas, on garde l'état au clic

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0.6 }
    );

    targets.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [ids]);

  // Défilement horizontal de la barre
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
  }, []);
  const scrollBy = (delta) => stripRef.current?.scrollBy({ left: delta, behavior: "smooth" });

  // Scroll doux vers la section + MAJ immédiate du jour actif
  const goTo = (id) => {
    setActive(id);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    // met aussi à jour le hash (utile pour le partage)
    history.replaceState(null, "", `#${id}`);
  };

  return (
    <nav className="sticky top-20 z-40">
      <div className="relative rounded-2xl border border-orange-100 bg-[#FFFBF7] px-2 py-2 shadow-sm">
        {/* Edges en dégradé */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-6 rounded-l-2xl bg-gradient-to-r from-[#FFFBF7] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-6 rounded-r-2xl bg-gradient-to-l from-[#FFFBF7] to-transparent" />

        {/* Flèches (mobile) */}
        {canScroll.left && (
          <button
            type="button"
            onClick={() => scrollBy(-160)}
            className="absolute left-1 top-1/2 -translate-y-1/2 grid h-8 w-8 place-items-center rounded-full border border-orange-200 bg-white text-gray-800 shadow-sm md:hidden"
            aria-label="Défiler vers la gauche"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
        {canScroll.right && (
          <button
            type="button"
            onClick={() => scrollBy(160)}
            className="absolute right-1 top-1/2 -translate-y-1/2 grid h-8 w-8 place-items-center rounded-full border border-orange-200 bg-white text-gray-800 shadow-sm md:hidden"
            aria-label="Défiler vers la droite"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}

        {/* Bande des jours */}
        <ul
          ref={stripRef}
          className="flex snap-x snap-mandatory items-center gap-1 overflow-x-auto px-3 pb-1 pt-1 sm:gap-2 sm:px-4 scrollbar-none"
        >
          {jours.map((day) => {
            const id = day.toLowerCase();
            const isActive = active === id;
            return (
              <li key={id} className="snap-start">
                <a
                  href={`#${id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    goTo(id);
                  }}
                  aria-current={isActive ? "date" : undefined}
                  className={[
                    "inline-flex items-center rounded-full border px-3 py-2 text-sm transition",
                    isActive
                      ? "border-transparent bg-[#fb8905] font-semibold text-white"
                      : "border-orange-100 bg-white text-gray-800 hover:bg-orange-50",
                  ].join(" ")}
                >
                  {day}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}

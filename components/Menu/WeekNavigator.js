import React, { useEffect } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Printer,
  ShoppingCart,
} from "lucide-react";

export default function WeekNavigator({
  weekStart,
  prevWeek,
  nextWeek,
  reload,
  userId,
}) {
  const { label, startDate, endDate } = formatWeekLabel(weekStart);

  // Raccourcis clavier ← →
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowLeft") prevWeek?.();
      if (e.key === "ArrowRight") nextWeek?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prevWeek, nextWeek]);

  return (
    <section className="rounded-2xl border border-orange-100 bg-[#FFFBF7] p-3 shadow-sm">
      {/* Bandeau haut : navigation semaine */}
      <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
        {/* Flèches + label centré */}
        <div className="flex w-full items-center justify-between sm:justify-start sm:gap-3">
          <button
            onClick={prevWeek}
            className="inline-flex items-center justify-center rounded-full border border-orange-200 bg-white p-2 text-gray-800 transition hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-[#fb8905] focus:ring-offset-2"
            aria-label="Semaine précédente"
            title="Semaine précédente (←)"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div className="mx-2 flex min-w-0 flex-col items-center sm:items-start">
            <span className="text-sm font-medium text-gray-500">
              {formatDateRange(startDate, endDate)}
            </span>
            <h2 className="relative text-xl font-extrabold text-gray-900 sm:text-2xl">
              <span
                aria-hidden
                className="absolute -left-1 -right-1 bottom-0 -z-10 h-2 -skew-x-6 rounded bg-[#fb8905]/30"
              />
              Semaine du {label}
            </h2>
          </div>

          <button
            onClick={nextWeek}
            className="inline-flex items-center justify-center rounded-full border border-orange-200 bg-white p-2 text-gray-800 transition hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-[#fb8905] focus:ring-offset-2"
            aria-label="Semaine suivante"
            title="Semaine suivante (→)"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Actions */}
        <div className="flex w-full flex-wrap items-center justify-center gap-2 sm:w-auto sm:justify-end">
          <button
            onClick={reload}
            className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white px-3.5 py-2 text-sm font-semibold text-gray-900 transition hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-[#fb8905] focus:ring-offset-2"
            title="Recharger"
          >
            <RefreshCw className="h-4 w-4" />
            Recharger
          </button>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3.5 py-2 text-sm font-semibold text-gray-900 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#fb8905] focus:ring-offset-2"
            title="Imprimer"
          >
            <Printer className="h-4 w-4" />
            Imprimer
          </button>

          <Link
            href={`/liste-courses${userId ? `?u=${encodeURIComponent(userId)}` : ""}`}
            className="inline-flex items-center gap-2 rounded-full bg-[#fb8905] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#e07c04] focus:outline-none focus:ring-2 focus:ring-[#fb8905] focus:ring-offset-2"
            title="Voir la liste de courses"
          >
            <ShoppingCart className="h-4 w-4" />
            Liste de courses
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ---------- utils ---------- */

function formatWeekLabel(weekStart) {
  const start = new Date(weekStart);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  const monthLong = (d) =>
    d.toLocaleDateString("fr-FR", { month: "long" });
  const dayNum = (d) => d.toLocaleDateString("fr-FR", { day: "numeric" });

  const sameMonth =
    start.getMonth() === end.getMonth() &&
    start.getFullYear() === end.getFullYear();

  const label = sameMonth
    ? `${dayNum(start)} ${monthLong(start)}`
    : `${dayNum(start)} ${monthLong(start)} – ${dayNum(end)} ${monthLong(end)}`;

  return { label, startDate: start, endDate: end };
}

function formatDateRange(start, end) {
  const optsDay = { day: "2-digit" };
  const optsDM = { day: "2-digit", month: "2-digit" };
  const sameMonth =
    start.getMonth() === end.getMonth() &&
    start.getFullYear() === end.getFullYear();

  const s = start.toLocaleDateString("fr-FR", sameMonth ? optsDay : optsDM);
  const e = end.toLocaleDateString("fr-FR", optsDM);
  return sameMonth ? `${s}–${e}` : `${s} – ${e}`;
}

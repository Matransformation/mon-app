// components/WeekMenu/DayCard.js
import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import DailyTotals from "./DailyTotals";
import MealCard from "../MealCard";
import { preserveScroll } from "../../lib/preserveScroll";

const REPARTITION = {
  "petit-dejeuner": 0.3,
  dejeuner: 0.4,
  collation: 0.05,
  diner: 0.25,
};

export default function DayCard({
  date,
  entries = [],
  user,
  openModal,
  applyAccompagnements,
  removeAccompagnements,
  allIngredients = [],
  proteinRichOptions = [],
  onUpdateMeal,
}) {
  // --- ancre pour preserveScroll au niveau JOUR ---
  const containerRef = useRef(null);

  // Wrap des actions qui peuvent déclencher un reload() au niveau du hook
  const applyAccWrapped = useCallback(
    (...args) =>
      preserveScroll(() => applyAccompagnements(...args), { anchor: containerRef.current }),
    [applyAccompagnements]
  );

  const removeAccWrapped = useCallback(
    (...args) =>
      preserveScroll(() => removeAccompagnements(...args), { anchor: containerRef.current }),
    [removeAccompagnements]
  );

  // Facteur par recette (pour approcher les cibles macro du repas)
  const [recipeRfMap, setRecipeRfMap] = useState({});

  useEffect(() => {
    const newMap = {};
    entries.forEach((repas) => {
      if (!repas?.recette) return;

      const ingredients = repas.recette.ingredients || [];
      const hasEgg = ingredients.some((ri) =>
        /œuf|oeuf/i.test(ri.ingredient.name?.toLowerCase() || "")
      );

      const raw = ingredients.reduce(
        (s, ri) => {
          const f = (ri.quantity || 0) / 100;
          return {
            p: s.p + (ri.ingredient.protein || 0) * f,
            f: s.f + (ri.ingredient.fat || 0) * f,
            g: s.g + (ri.ingredient.carbs || 0) * f,
            cal: s.cal + (ri.ingredient.calories || 0) * f,
          };
        },
        { p: 0, f: 0, g: 0, cal: 0 }
      );

      const ratio = REPARTITION[repas.repasType] || 0;
      const obj = {
        p: user.poids * 1.8 * ratio,
        f: ((user.metabolismeCible * 0.3) / 9) * ratio,
        g:
          ((user.metabolismeCible - user.poids * 1.8 * 4 - user.metabolismeCible * 0.3) / 4) *
          ratio,
        cal: user.metabolismeCible * ratio,
      };

      const pF = raw.p > 0 ? obj.p / raw.p : Infinity;
      const fF = raw.f > 0 ? obj.f / raw.f : Infinity;
      const gF = raw.g > 0 ? obj.g / raw.g : Infinity;
      const calF = raw.cal > 0 ? obj.cal / raw.cal : Infinity;

      let factor = Math.min(pF, fF, gF, calF);
      factor = Math.max(0, factor);
      factor = Math.min(factor, 3); // cap doux
      if (hasEgg) factor = Math.floor(factor); // oeufs → quantités entières

      newMap[repas.id] = parseFloat((Number.isFinite(factor) ? factor : 1).toFixed(2));
    });

    setRecipeRfMap(newMap);
  }, [entries, user.poids, user.metabolismeCible]);

  // Totaux jour (recettes * factor + accompagnements)
  const dailyTotals = useMemo(() => {
    return entries.reduce(
      (sum, repas) => {
        const factor = recipeRfMap[repas.id] ?? 1;
        if (!repas?.recette) return sum;

        const rec = (repas.recette.ingredients || []).reduce(
          (s, ri) => {
            // Ajuste oeufs/blancs sur unités entières
            const name = (ri.ingredient.name || "").toLowerCase();
            let qty = (ri.quantity || 0) * factor;
            const isWhite = /blanc d['’]?oeuf/i.test(name);
            const isEgg = /(?:oeuf|œuf)/i.test(name) && !isWhite;
            const unit = isWhite ? 33 : isEgg ? 50 : 0;
            if (unit) {
              const count = Math.max(1, Math[isWhite ? "floor" : "round"](qty / unit));
              qty = count * unit;
            }

            const f = qty / 100;
            return {
              cal: s.cal + (ri.ingredient.calories || 0) * f,
              p: s.p + (ri.ingredient.protein || 0) * f,
              f: s.f + (ri.ingredient.fat || 0) * f,
              c: s.c + (ri.ingredient.carbs || 0) * f,
            };
          },
          { cal: 0, p: 0, f: 0, c: 0 }
        );

        const side = (repas.accompagnements || []).reduce(
          (s, a) => {
            const ing = allIngredients.find((i) => i.id === a.ingredient.id) || {};
            const f = (a.quantity || 0) / 100;
            return {
              cal: s.cal + (ing.calories || 0) * f,
              p: s.p + (ing.protein || 0) * f,
              f: s.f + (ing.fat || 0) * f,
              c: s.c + (ing.carbs || 0) * f,
            };
          },
          { cal: 0, p: 0, f: 0, c: 0 }
        );

        return {
          cal: sum.cal + rec.cal + side.cal,
          p: sum.p + rec.p + side.p,
          f: sum.f + rec.f + side.f,
          c: sum.c + rec.c + side.c,
        };
      },
      { cal: 0, p: 0, f: 0, c: 0 }
    );
  }, [entries, recipeRfMap, allIngredients]);

  // Total fromage jour (limite 30 g)
  const totalFromage = useMemo(() => {
    return entries.reduce((sum, repas) => {
      const acc = repas.accompagnements || [];
      const fromageInAcc = acc.filter((a) =>
        (a.ingredient.sideTypes || []).some((st) =>
          typeof st === "string" ? st === "CHEESE" : st?.sideType === "CHEESE"
        )
      );
      const total = fromageInAcc.reduce((s, a) => s + (a.quantity || 0), 0);
      return sum + total;
    }, 0);
  }, [entries]);

  // Rendu
  const dayLabel = format(date, "EEEE d MMMM", { locale: fr }).toUpperCase();
  const ORDER = ["petit-dejeuner", "dejeuner", "collation", "diner"];

  return (
    <div ref={containerRef} className="rounded-2xl border border-orange-100 bg-[#FFFBF7] p-6 shadow-sm">
      {/* Titre date avec soulignement orange incliné */}
      <h3 className="mb-4 text-center text-xl font-extrabold tracking-tight text-gray-900 sm:text-2xl">
        <span className="relative inline-block">
          <span
            aria-hidden
            className="absolute -left-1 -right-1 bottom-0 -z-10 h-2 -skew-x-6 rounded bg-[#fb8905]/30"
          />
          <span className="relative">{dayLabel}</span>
        </span>
      </h3>

      {/* Totaux journaliers */}
      <DailyTotals dailyTotals={dailyTotals} user={user} />

      {/* Alerte fromage si besoin */}
      {totalFromage > 30 && (
        <div
          role="alert"
          className="mt-2 rounded-xl bg-rose-50 px-3 py-2 text-center text-sm font-medium text-rose-700 ring-1 ring-rose-200"
        >
          ⚠️ Limite journalière de 30&nbsp;g de fromage dépassée ({totalFromage} g).
        </div>
      )}

      {/* Repas */}
      <div className="mt-4 flex-1 space-y-6">
        {ORDER.map((type) => {
          const repasItem =
            entries.find((e) => e.repasType === type) || {
              repasType: type,
              accompagnements: [],
            };
          const recipeFactor = recipeRfMap[repasItem.id] ?? 1;

          return (
            <MealCard
              key={`${format(date, "yyyy-MM-dd")}-${type}`} // clé stable
              repas={repasItem}
              user={user}
              allIngredients={allIngredients}
              proteinRichOptions={proteinRichOptions}
              recipeFactor={recipeFactor}
              openModal={openModal}
              // ✅ passe les versions WRAP avec preserveScroll ANCRÉ sur le jour
              applyAccompagnements={applyAccWrapped}
              removeAccompagnements={removeAccWrapped}
              onUpdateMeal={onUpdateMeal}
            />
          );
        })}
      </div>
    </div>
  );
}

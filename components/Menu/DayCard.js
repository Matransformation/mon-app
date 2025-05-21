import React, { useState, useEffect } from "react";
import DailyTotals from "./DailyTotals";
import MealCard from "./MealCard";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

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
  const [recipeRfMap, setRecipeRfMap] = useState({});

  useEffect(() => {
    const newMap = {};
    entries.forEach((repas) => {
      if (!repas.recette) return;
      const ingredients = repas.recette.ingredients || [];
      const hasEgg = ingredients.some((ri) => /œuf|oeuf/.test(ri.ingredient.name.toLowerCase()));
      const raw = ingredients.reduce(
        (s, ri) => ({
          p: s.p + ri.ingredient.protein * (ri.quantity / 100),
          f: s.f + ri.ingredient.fat * (ri.quantity / 100),
          g: s.g + ri.ingredient.carbs * (ri.quantity / 100),
          cal: s.cal + ri.ingredient.calories * (ri.quantity / 100),
        }),
        { p: 0, f: 0, g: 0, cal: 0 }
      );
      const ratio = REPARTITION[repas.repasType] || 0;
      const obj = {
        p: user.poids * 1.8 * ratio,
        f: (user.metabolismeCible * 0.3) / 9 * ratio,
        g: ((user.metabolismeCible - user.poids * 1.8 * 4 - user.metabolismeCible * 0.3) / 4) * ratio,
        cal: user.metabolismeCible * ratio,
      };
      const pF = raw.p > 0 ? obj.p / raw.p : Infinity;
      const fF = raw.f > 0 ? obj.f / raw.f : Infinity;
      const gF = raw.g > 0 ? obj.g / raw.g : Infinity;
      const calF = raw.cal > 0 ? obj.cal / raw.cal : Infinity;
      let factor = Math.min(pF, fF, gF, calF);
      factor = Math.max(0, factor);
      factor = Math.min(factor, 3);
      if (hasEgg) factor = Math.floor(factor);
      newMap[repas.id] = parseFloat(factor.toFixed(2));
    });
    setRecipeRfMap(newMap);
  }, [entries, allIngredients, user]);

  const dailyTotals = entries.reduce(
    (sum, repas) => {
      const factor = recipeRfMap[repas.id] ?? 1;
      if (!repas.recette) return sum;
      const rec = repas.recette.ingredients.reduce(
        (s, ri) => {
          let qty = (ri.quantity || 0) * factor;
          const name = ri.ingredient.name.toLowerCase();
          if (name.includes("oeuf")) {
            const unit = name.includes("blanc") ? 33 : 50;
            const count = Math.max(1, Math.floor(qty / unit));
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

  const totalFromage = entries.reduce((sum, repas) => {
    const acc = repas.accompagnements || [];
    const fromageInAcc = acc.filter((a) =>
      (a.ingredient.sideTypes || []).some((st) =>
        typeof st === "string" ? st === "CHEESE" : st.sideType === "CHEESE"
      )
    );
    const total = fromageInAcc.reduce((s, a) => s + (a.quantity || 0), 0);
    return sum + total;
  }, 0);

  return (
    <div className="bg-cream-50 rounded-2xl shadow-lg p-6 flex flex-col">
      <h3 className="text-center font-bold text-green-400 mb-4">
        {format(date, "EEEE d MMMM", { locale: fr }).toUpperCase()}
      </h3>

      <DailyTotals dailyTotals={dailyTotals} user={user} />

      {totalFromage > 30 && (
        <div className="mt-2 text-center text-red-600 text-sm font-medium">
          ⚠️ Limite journalière de 30g de fromage dépassée ({totalFromage} g).
        </div>
      )}

      <div className="mt-4 space-y-6 flex-1">
        {["petit-dejeuner", "dejeuner", "collation", "diner"].map((type) => {
          const repasItem =
            entries.find((e) => e.repasType === type) || {
              repasType: type,
              accompagnements: [],
            };
          const recipeFactor = recipeRfMap[repasItem.id] ?? 1;
          console.log("DÉTAIL JOURNALIER");
          entries.forEach((repas) => {
            const factor = recipeRfMap[repas.id] ?? 1;
            if (!repas.recette) return;
            const cal = repas.recette.ingredients.reduce((total, ri) => {
              let qty = ri.quantity * factor;
              const f = qty / 100;
              return total + ri.ingredient.calories * f;
            }, 0);
            const sideCal = (repas.accompagnements || []).reduce((total, a) => {
              const f = a.quantity / 100;
              return total + (a.ingredient.calories || 0) * f;
            }, 0);
            console.log(`${repas.repasType.toUpperCase()}: ${Math.round(cal + sideCal)} kcal`);
          });
          console.log("TOTAL:", Math.round(dailyTotals.cal), "kcal");
          
          return (
            <MealCard
              key={type}
              repas={repasItem}
              user={user}
              allIngredients={allIngredients}
              proteinRichOptions={proteinRichOptions}
              recipeFactor={recipeFactor}
              openModal={openModal}
              applyAccompagnements={applyAccompagnements}
              removeAccompagnements={removeAccompagnements}
              onUpdateMeal={onUpdateMeal}
            />
          );
        })}
      </div>
    </div>
  );
}

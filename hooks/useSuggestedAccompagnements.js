// File: hooks/useSuggestedAccompagnements.js
import { useMemo } from "react";

const repartitionRepas = {
  "petit-dejeuner": 0.3,
  dejeuner:         0.4,
  collation:        0.05,
  diner:            0.25,
};

const isSignificantGap = (val, target) => val < target * 0.95;

const getSuggestedTypes = (repasType, macros, objectifs) => {
  const manque = {
    protein: isSignificantGap(macros.protein, objectifs.protein),
    carbs:   isSignificantGap(macros.carbs,   objectifs.carbs),
    fat:     isSignificantGap(macros.fat,     objectifs.fat),
  };
  const types = new Set();

  if (["petit-dejeuner", "dejeuner", "diner"].includes(repasType)) {
    types.add("DAIRY");
  }
  if (repasType === "petit-dejeuner") {
    manque.protein && types.add("BREAKFAST_PROTEIN");
    manque.carbs   && (types.add("CEREAL"), types.add("FRUIT_SIDE"));
    manque.fat     && types.add("FAT");
  }
  if (["dejeuner", "diner"].includes(repasType)) {
    manque.protein && types.add("PROTEIN");
    manque.carbs   && types.add("CARB");
    manque.fat     && types.add("FAT");
  }
  if (repasType === "collation") {
    if (manque.protein || manque.carbs || manque.fat) {
      manque.protein && (types.add("BREAKFAST_PROTEIN"), types.add("DAIRY"));
      manque.carbs   && (types.add("CEREAL"), types.add("FRUIT_SIDE"));
      manque.fat     && types.add("FAT");
    } else {
      // Pas de déficit, mais pas de recette => on propose quand même des choix
      types.add("BREAKFAST_PROTEIN");
      types.add("DAIRY");
      types.add("CEREAL");
      types.add("FRUIT_SIDE");
      types.add("FAT");
    }
  }

  return Array.from(types);
};

const getMacros = (ingredient, qty) => ({
  protein: (ingredient.protein || 0) * qty / 100,
  fat:     (ingredient.fat     || 0) * qty / 100,
  carbs:   (ingredient.carbs   || 0) * qty / 100,
});

export default function useSuggestedAccompagnements({ repas, user, allIngredients }) {
  return useMemo(() => {
    if (!user || !Array.isArray(allIngredients)) return {};

    const ratio = repartitionRepas[repas.repasType] || 0;
    const objectifs = {
      protein: user.poids * 1.8 * ratio,
      fat:     (user.metabolismeCible * 0.3 / 9) * ratio,
      carbs:   ((user.metabolismeCible - user.poids * 1.8 * 4 - user.metabolismeCible * 0.3) / 4) * ratio,
    };

    const factorInit = repas.recipeFactor || 1;

    const baseRecipeMacros = { protein: 0, fat: 0, carbs: 0 };
    let macrosRecetteInit = { protein: 0, fat: 0, carbs: 0 };

    if (repas.recette) {
      repas.recette.ingredients.forEach(ri => {
        const q0 = ri.quantity || 0;
        const f0 = q0 / 100;
        baseRecipeMacros.protein += (ri.ingredient.protein || 0) * f0;
        baseRecipeMacros.fat     += (ri.ingredient.fat     || 0) * f0;
        baseRecipeMacros.carbs   += (ri.ingredient.carbs   || 0) * f0;
        const m = getMacros(ri.ingredient, q0 * factorInit);
        macrosRecetteInit.protein += m.protein;
        macrosRecetteInit.fat     += m.fat;
        macrosRecetteInit.carbs   += m.carbs;
      });
    }

    const macrosSide = (repas.accompagnements || []).reduce((sum, a) => {
      const m = getMacros(a.ingredient, a.quantity || 0);
      return {
        protein: sum.protein + m.protein,
        fat:     sum.fat     + m.fat,
        carbs:   sum.carbs   + m.carbs,
      };
    }, { protein: 0, fat: 0, carbs: 0 });

    let macros = {
      protein: macrosRecetteInit.protein + macrosSide.protein,
      fat:     macrosRecetteInit.fat     + macrosSide.fat,
      carbs:   macrosRecetteInit.carbs   + macrosSide.carbs,
    };

    let types = getSuggestedTypes(repas.repasType, macros, objectifs);

    if (types.length === 0 && repas.recette) {
      const gaps = {
        protein: Math.max(0, objectifs.protein - macrosSide.protein),
        fat:     Math.max(0, objectifs.fat     - macrosSide.fat),
        carbs:   Math.max(0, objectifs.carbs   - macrosSide.carbs),
      };
      const macroToFree = Object.keys(gaps).reduce((a, b) => gaps[a] > gaps[b] ? a : b);
      if (baseRecipeMacros[macroToFree] > 0) {
        const newFactor = gaps[macroToFree] / baseRecipeMacros[macroToFree];
        const recetteMacros2 = { protein: 0, fat: 0, carbs: 0 };
        repas.recette.ingredients.forEach(ri => {
          const m = getMacros(ri.ingredient, (ri.quantity || 0) * newFactor);
          recetteMacros2.protein += m.protein;
          recetteMacros2.fat     += m.fat;
          recetteMacros2.carbs   += m.carbs;
        });
        macros = {
          protein: recetteMacros2.protein + macrosSide.protein,
          fat:     recetteMacros2.fat     + macrosSide.fat,
          carbs:   recetteMacros2.carbs   + macrosSide.carbs,
        };
        types = getSuggestedTypes(repas.repasType, macros, objectifs);
      }
    }

    const byType = {};
    types.forEach(type => {
      let opts = allIngredients.filter(ing =>
        (ing.sideTypes || []).some(st => typeof st === "string" ? st === type : st.sideType === type)
      );
      if (type === "FRUIT_SIDE") {
        const rest = Math.max(0, objectifs.carbs - macros.carbs);
        opts = opts.filter(ing => ing.carbs <= rest);
      }
      if (opts.length) byType[type] = opts;
    });

    return byType;
  }, [repas, user, allIngredients]);
}

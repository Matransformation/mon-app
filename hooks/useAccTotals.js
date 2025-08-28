import { useMemo } from "react";

export function useAccTotals(localAcc, allIngredients) {
  return useMemo(() => {
    return (localAcc || []).reduce(
      (sum, a) => {
        const ing = allIngredients.find((i) => i.id === a.ingredient.id) || a.ingredient || {};
        const f = (a.quantity || 0) / 100;
        return {
          cal: sum.cal + (ing.calories || 0) * f,
          p:   sum.p   + (ing.protein  || 0) * f,
          f:   sum.f   + (ing.fat      || 0) * f,
          c:   sum.c   + (ing.carbs    || 0) * f,
        };
      },
      { cal: 0, p: 0, f: 0, c: 0 }
    );
  }, [localAcc, allIngredients]);
}

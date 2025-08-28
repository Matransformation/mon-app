import { useMemo } from "react";

const isCheese = (ing) => (ing?.sideTypes || []).includes("CHEESE");
const isNonCheeseDairy = (ing) => {
  const st = ing?.sideTypes || [];
  return st.includes("DAIRY") && !st.includes("CHEESE");
};

export function useDairyRules({ recette, localAcc, allIngredients }) {
  const recipeHasCheese = !!(recette?.ingredients || []).some((ri) => isCheese(ri.ingredient));
  const recipeHasNonCheeseDairy = !!(recette?.ingredients || []).some((ri) =>
    isNonCheeseDairy(ri.ingredient)
  );
  const accHasCheese = !!(localAcc || []).some((a) => isCheese(a.ingredient));
  const accHasNonCheeseDairy = !!(localAcc || []).some((a) => isNonCheeseDairy(a.ingredient));

  const filtered = useMemo(() => {
    // Si la recette a déjà un laitier, on interdit tout ajout laitier
    if (recipeHasCheese || recipeHasNonCheeseDairy) return [];
    return (allIngredients || []).filter((ing) => {
      const st = ing.sideTypes || [];
      if (!st.includes("DAIRY")) return false;
      const isC = st.includes("CHEESE");
      const isD = st.includes("DAIRY") && !isC;
      if (accHasCheese && isD) return false;           // pas de laitier non-fromage si fromage déjà en acc
      if (accHasNonCheeseDairy && isC) return false;   // pas de fromage si un laitier non-fromage déjà en acc
      return true;
    });
  }, [allIngredients, recipeHasCheese, recipeHasNonCheeseDairy, accHasCheese, accHasNonCheeseDairy]);

  let info = null;
  if (recipeHasCheese || recipeHasNonCheeseDairy) {
    info = "Un laitier est déjà présent dans la recette — pas d’ajout laitier en accompagnement.";
  } else if ((accHasCheese || accHasNonCheeseDairy) && filtered.length === 0) {
    info = accHasCheese
      ? "Un fromage est déjà ajouté en accompagnement — vous ne pouvez pas ajouter un autre produit laitier."
      : "Un produit laitier est déjà ajouté en accompagnement — vous ne pouvez pas ajouter de fromage.";
  }

  return { filtered, info };
}

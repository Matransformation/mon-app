/**
 * Calcule recipeFactor et sideQty pour un accompagnement protéiné, 
 * de façon à combler juste le déficit protéique sans dépasser lipides/glucides.
 * 
 * @param {{p:number,f:number,g:number}} raw      Macros brutes de la recette
 * @param {{p:number,f:number,g:number}} obj      Objectifs macros du repas
 * @param {{protein:number,fat:number,carbs:number}} side  Macros du side à ajouter
 * @returns {{recipeFactor:number, sideQty:number}}
 */
export function computeRecipeAndSide(raw, obj, side) {
  const ratios = [];
  if (raw.p > 0) ratios.push(obj.p / raw.p);
  if (raw.f > 0) ratios.push(obj.f / raw.f);
  if (raw.g > 0) ratios.push(obj.g / raw.g);
  let recipeFactor = ratios.length ? Math.min(...ratios) : 1;

  while (recipeFactor > 0) {
    const scaledP = raw.p * recipeFactor;
    const deficitP = Math.max(0, obj.p - scaledP);
    const sideQty = (deficitP * 100) / side.protein;

    const maxF = side.fat   > 0
      ? ((obj.f - raw.f * recipeFactor) * 100) / side.fat
      : Infinity;
    const maxC = side.carbs > 0
      ? ((obj.g - raw.g * recipeFactor) * 100) / side.carbs
      : Infinity;

    if (sideQty <= maxF && sideQty <= maxC) {
      return { recipeFactor, sideQty: Math.floor(sideQty) };
    }
    recipeFactor = +(recipeFactor - 0.01).toFixed(2);
  }

  return { recipeFactor: 0, sideQty: 0 };
}

/**
 * Calcule la quantité de side pour combler uniquement le déficit protéique
 * (sans toucher à la scalabilité de la recette ni aux autres macros).
 *
 * @param {number} missingP  Protéines manquantes
 * @param {{protein:number, fat:number, carbs:number}} side
 * @returns {number} quantité en grammes
 */
export function computeProteinOnlyQty(missingP, side) {
  if (side.protein <= 0) return 0;
  return Math.floor((missingP * 100) / side.protein);
}

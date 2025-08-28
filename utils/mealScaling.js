// utils/mealScaling.js
// Fonctions pures et testables pour scaler la recette et trouver le facteur optimal.

export const DAIRY_CAP_IN_RECIPE = 150; // g
const MAX_SEARCH_FACTOR = 10;

const isNonCheeseDairy = (ing) => {
  const st = ing?.sideTypes || [];
  return st.includes("DAIRY") && !st.includes("CHEESE");
};

const isEggWhite = (nameLower) => /blanc d['’]?oeuf/.test(nameLower);
const isWholeEgg = (nameLower) => /(?:oeuf|œuf)/i.test(nameLower) && !isEggWhite(nameLower);

function roundQtySmart(q, eggWhite, eggWhole) {
  if (eggWhite) {
    const unit = 33;
    if (q < unit * 0.5) return 0;
    let v = Math.floor(q / unit) * unit;
    if (v < unit) v = unit;
    return v;
  }
  if (eggWhole) {
    const unit = 50;
    if (q < unit * 0.5) return 0;
    let v = Math.round(q / unit) * unit;
    if (v < unit) v = unit;
    return v;
  }
  return Math.round(q || 0);
}

/** Mise à l’échelle proportionnelle + cap produits laitiers (hors fromages) */
export function scaleRecipeWithProportionalCap(recette, factor) {
  if (!recette?.ingredients?.length) {
    return { items: [], totals: { cal: 0, p: 0, f: 0, c: 0 }, dairyCapped: false };
  }

  const raw = recette.ingredients.map((ri) => {
    const ing = ri.ingredient || {};
    const nameLower = (ing.name || "").toLowerCase();
    const rawQty = (ri.quantity || 0) * factor;
    return {
      ing,
      rawQty,
      eggWhite: isEggWhite(nameLower),
      eggWhole: isWholeEgg(nameLower),
    };
  });

  const dairyRawTotal = raw
    .filter((r) => isNonCheeseDairy(r.ing))
    .reduce((s, r) => s + r.rawQty, 0);

  let scale2 = 1;
  let dairyCapped = false;
  if (dairyRawTotal > DAIRY_CAP_IN_RECIPE) {
    scale2 = DAIRY_CAP_IN_RECIPE / dairyRawTotal;
    dairyCapped = true;
  }

  let items, totals;
  let iter = 0;
  while (true) {
    const tmpItemsAll = raw.map((r) => {
      const qty = roundQtySmart(r.rawQty * scale2, r.eggWhite, r.eggWhole);
      const f = (qty || 0) / 100;
      const ing = r.ing;
      return {
        id: ing.id,
        name: ing.name,
        unit: ing.unit || " g",
        qty,
        sideTypes: ing.sideTypes || [],
        macros: {
          cal: (ing.calories || 0) * f,
          p: (ing.protein || 0) * f,
          f: (ing.fat || 0) * f,
          c: (ing.carbs || 0) * f,
        },
      };
    });

    const tmpItems = tmpItemsAll.filter((it) => it.qty > 0);
    const dairySum = tmpItems
      .filter((it) => isNonCheeseDairy({ sideTypes: it.sideTypes }))
      .reduce((s, it) => s + it.qty, 0);

    if (!dairyCapped || dairySum <= DAIRY_CAP_IN_RECIPE || iter >= 3) {
      items = tmpItems;
      totals = tmpItems.reduce(
        (s, it) => ({
          cal: s.cal + it.macros.cal,
          p: s.p + it.macros.p,
          f: s.f + it.macros.f,
          c: s.c + it.macros.c,
        }),
        { cal: 0, p: 0, f: 0, c: 0 }
      );
      break;
    }

    const fix = (DAIRY_CAP_IN_RECIPE / Math.max(1, dairySum)) * 0.98;
    scale2 *= fix;
    iter += 1;
  }

  return { items, totals, dairyCapped };
}

function evaluateRecipeTotals(recette, factor) {
  return scaleRecipeWithProportionalCap(recette, factor).totals;
}

export function findBestFactorWithCap(recette, remaining, maxFactor = MAX_SEARCH_FACTOR) {
  if (!recette?.ingredients?.length) return 0;

  const eps = 0.001;
  let lo = 0;
  let hi = maxFactor;
  let best = 0;

  for (let i = 0; i < 18; i++) {
    const mid = (lo + hi) / 2;
    const tot = evaluateRecipeTotals(recette, mid);
    const over =
      tot.p > remaining.protein + eps ||
      tot.c > remaining.carbs + eps ||
      tot.f > remaining.fat + eps;

    if (over) hi = mid;
    else { best = mid; lo = mid; }
  }
  return Math.max(0, Math.min(maxFactor, best));
}

// hooks/useAutoCompleteSides.js
import { useMemo, useState, useEffect, useCallback } from "react";

const isPowderProtein = (ing) =>
  /whey|cas[ée]ine|isolate|protéine.*poudre|protein powder/i.test((ing?.name || "").toLowerCase());

const hasSide = (ing, type) => {
  const st = ing?.sideTypes || [];
  return st.includes?.(type) || st.some?.((s) => s?.sideType === type);
};

const typeForApply = (ing) => {
  if (hasSide(ing, "CEREAL")) return "CEREAL";
  if (hasSide(ing, "CARB")) return "CARB";
  if (hasSide(ing, "BREAKFAST_PROTEIN")) return "BREAKFAST_PROTEIN";
  if (hasSide(ing, "PROTEIN")) return "PROTEIN";
  if (hasSide(ing, "FAT")) return "FAT";
  if (hasSide(ing, "DAIRY")) return "DAIRY";
  if (hasSide(ing, "FRUIT_SIDE")) return "FRUIT_SIDE";
  if (hasSide(ing, "VEGETABLE_SIDE")) return "VEGETABLE_SIDE";
  return "CARB";
};

function estimateQtyFor(type, ing, gap) {
  const p100 = (ing.protein || 0) / 100;
  const c100 = (ing.carbs || 0) / 100;
  const f100 = (ing.fat || 0) / 100;

  if (type === "VEGETABLE_SIDE") return 150;
  if (type === "FRUIT_SIDE" || type === "DAIRY") return 100;

  if (type === "FAT") return f100 > 0 ? Math.max(0, Math.floor(gap.f / f100)) : 0;
  if (type === "CEREAL" || type === "CARB") return c100 > 0 ? Math.max(0, Math.floor(gap.c / c100)) : 0;
  if (p100 > 0) return Math.max(0, Math.floor(gap.p / p100));
  return 0;
}

function scoreCandidate(ing, type, gap) {
  const qty = estimateQtyFor(type, ing, gap);
  if (!Number.isFinite(qty) || qty <= 0) return null;
  const f = qty / 100;
  const left = {
    p: Math.max(0, gap.p - (ing.protein || 0) * f),
    c: Math.max(0, gap.c - (ing.carbs || 0) * f),
    f: Math.max(0, gap.f - (ing.fat || 0) * f),
  };
  const penalty = left.p * 2 + left.c * 1.2 + left.f;
  return { ing, type, qty: Math.round(qty), penalty };
}

const MIN_PERSIST_QTY_BY_TYPE = {
  VEGETABLE_SIDE: 100,
  FRUIT_SIDE: 40,
  DAIRY: 80,
};

export function useAutoCompleteSides({
  repas,
  currentFactor,
  localAcc,
  rest,
  suggestionsExt,
  vegOptions,
  allIngredients,
  applyAccompagnements,
  requireVegetable = false,
  preferFruit,
  preferDairy,
  canFruit,
  canDairy,
}) {
  const isBreakfast = repas?.repasType === "petit-dejeuner";

  const allBP = useMemo(
    () => (allIngredients || []).filter((i) => hasSide(i, "BREAKFAST_PROTEIN")),
    [allIngredients]
  );

  const bestList = useMemo(() => {
    if (!suggestionsExt) return [];
    const poolTypes = Object.keys(suggestionsExt);
    let pool = [];
    for (const t of poolTypes) {
      if (isBreakfast && t === "VEGETABLE_SIDE") continue;
      pool = pool.concat((suggestionsExt[t] || []).map((ing) => ({ ing, type: t })));
    }

    let scored = pool
      .map(({ ing, type }) => scoreCandidate(ing, type, rest))
      .filter(Boolean)
      .sort((a, b) => a.penalty - b.penalty);

    if (isBreakfast) {
      const whole = scored.filter((s) => !isPowderProtein(s.ing));
      const powders = scored.filter((s) => isPowderProtein(s.ing));
      scored = [...whole, ...powders];
    }

    const seen = new Set();
    const uniq = [];
    for (const s of scored) {
      if (seen.has(s.ing.id)) continue;
      seen.add(s.ing.id);
      uniq.push(s);
      if (uniq.length >= 12) break;
    }
    return uniq;
  }, [suggestionsExt, rest, isBreakfast]);

  const [bestPick, setBestPick] = useState("");
  useEffect(() => {
    setBestPick(bestList[0] ? `${bestList[0].type}:${bestList[0].ing.id}` : "");
  }, [rest.p, rest.c, rest.f, localAcc?.length, currentFactor, bestList.length]);

  const macroFromAcc = useCallback(
    (accList) =>
      (accList || []).reduce(
        (s, a) => {
          const ing = a.ingredient || {};
          const f = (a.quantity || 0) / 100;
          return {
            p: s.p + (ing.protein || 0) * f,
            c: s.c + (ing.carbs || 0) * f,
            f: s.f + (ing.fat || 0) * f,
          };
        },
        { p: 0, c: 0, f: 0 }
      ),
    []
  );

  const currentTotalsFrom = useCallback(
    (virtualAcc) => {
      const mSides = macroFromAcc(virtualAcc);
      return { p: mSides.p, c: mSides.c, f: mSides.f };
    },
    [macroFromAcc]
  );

  const deficitsFrom = useCallback(
    (virtualAcc) => {
      const t = currentTotalsFrom(virtualAcc);
      return {
        p: Math.max(0, rest.p - t.p),
        c: Math.max(0, rest.c - t.c),
        f: Math.max(0, rest.f - t.f),
      };
    },
    [currentTotalsFrom, rest.p, rest.c, rest.f]
  );

  /** Ajoute OU fusionne si déjà présent (évite P2002) */
  const addWithVirtual = useCallback(
    async (type, ing, virtualAcc, fallbackQty, options = {}) => {
      const now = deficitsFrom(virtualAcc);
      let desired = 0;

      const already = (virtualAcc || []).find((a) => a?.ingredient?.id === ing.id) || null;
      const existingQty = Math.max(0, Math.floor(already?.quantity || 0));

      // — DAIRY: laisser l’API fixer la qty par défaut (100 g) si demandé
      if (type === "DAIRY" && options.forceDefaultQtyForDairy) {
        if (already) return virtualAcc;
        const used = await applyAccompagnements(
          { ...repas, recipeFactor: currentFactor, accompagnements: virtualAcc },
          { DAIRY: { id: ing.id } }
        );
        const qty = typeof used === "object" ? used.quantity ?? used.qty ?? 100 : Number(used) || 100;
        return [...virtualAcc, { ingredient: ing, quantity: qty }];
      }

      if (type === "FRUIT_SIDE") {
        const otherFruitQty =
          (virtualAcc || []).reduce((s, a) => {
            if (!a?.ingredient) return s;
            const isFruit = hasSide(a.ingredient, "FRUIT_SIDE");
            const same = a.ingredient.id === ing.id;
            return isFruit && !same ? s + (a.quantity || 0) : s;
          }, 0) || 0;
        const remainingFruit = Math.max(0, 100 - otherFruitQty);
        if (remainingFruit <= 0) return virtualAcc;

        const p100 = (ing.protein || 0) / 100;
        const c100 = (ing.carbs || 0) / 100;
        const f100 = (ing.fat || 0) / 100;

        const byC = c100 > 0 ? Math.floor(now.c / c100) : remainingFruit;
        const byP = now.p > 0 && p100 > 0 ? Math.floor(now.p / p100) : remainingFruit;
        const byF = now.f > 0 && f100 > 0 ? Math.floor(now.f / f100) : remainingFruit;

        desired = Math.max(0, Math.min(remainingFruit, byC, byP, byF));
        if (desired <= 0 && !already) return virtualAcc;

        let nextTotal = existingQty + Math.max(0, desired);
        nextTotal = Math.min(nextTotal, remainingFruit);
        if (nextTotal <= 0) return virtualAcc;

        const used = await applyAccompagnements(
          { ...repas, recipeFactor: currentFactor, accompagnements: virtualAcc },
          { FRUIT_SIDE: { id: ing.id, quantity: Math.floor(nextTotal) } }
        );

        const qty = typeof used === "object" ? used.quantity ?? used.qty ?? nextTotal : Number(used) || nextTotal;

        if (already) {
          return virtualAcc.map((a) => (a.ingredient.id === ing.id ? { ingredient: ing, quantity: qty } : a));
        }
        return [...virtualAcc, { ingredient: ing, quantity: qty }];
      }

      // Autres types
      const p100 = (ing.protein || 0) / 100;
      const c100 = (ing.carbs || 0) / 100;
      const f100 = (ing.fat || 0) / 100;

      if (type === "DAIRY") {
        const cap = Math.max(1, fallbackQty || 100);
        const byP = p100 > 0 ? Math.floor((now.p || Infinity) / p100) : cap;
        const byC = c100 > 0 ? Math.floor((now.c || Infinity) / c100) : cap;
        const byF = f100 > 0 ? Math.floor((now.f || Infinity) / f100) : cap;
        desired = Math.max(0, Math.min(cap, byP, byC, byF));
      } else if (type === "CEREAL" || type === "CARB") {
        desired = c100 > 0 ? Math.max(1, Math.round(now.c / c100)) : 0;
      } else if (type === "PROTEIN" || type === "BREAKFAST_PROTEIN") {
        desired = p100 > 0 ? Math.max(1, Math.round(now.p / p100)) : 0;
      } else if (type === "FAT") {
        desired = f100 > 0 ? Math.max(1, Math.round(now.f / f100)) : 0;
      } else if (type === "VEGETABLE_SIDE") {
        desired = fallbackQty || 150;
      }

      if (!already && type in MIN_PERSIST_QTY_BY_TYPE) {
        const min = MIN_PERSIST_QTY_BY_TYPE[type] || 0;
        if (desired < min) return virtualAcc;
      }

      if (!Number.isFinite(desired) || desired <= 0) return virtualAcc;

      let target = existingQty + Math.floor(desired);
      if (type === "FAT") target = Math.min(target, 80);
      if (type === "CEREAL" || type === "CARB" || type === "PROTEIN" || type === "BREAKFAST_PROTEIN") {
        target = Math.min(target, 400);
      }

      const used = await applyAccompagnements(
        { ...repas, recipeFactor: currentFactor, accompagnements: virtualAcc },
        { [type]: { id: ing.id, quantity: Math.floor(target) } }
      );

      const qty = typeof used === "object" ? used.quantity ?? used.qty ?? target : Number(used) || target;

      if (already) {
        return virtualAcc.map((a) => (a?.ingredient?.id === ing.id ? { ingredient: ing, quantity: Math.floor(qty) } : a));
      }
      return [...virtualAcc, { ingredient: ing, quantity: Math.floor(qty) }];
    },
    [applyAccompagnements, currentFactor, deficitsFrom, repas]
  );

  // — Ajuste un item existant pour réduire un gap (utilisé hors "snack strict")
  const adjustExistingForGap = useCallback(
    async (virtualAcc) => {
      let guard = 0;
      while (guard++ < 4) {
        const gap = deficitsFrom(virtualAcc);
        if (gap.p <= 0 && gap.c <= 0 && gap.f <= 0) break;

        const order = Object.entries(gap).sort((a, b) => b[1] - a[1]).map(([k]) => k);

        let applied = false;

        for (const key of order) {
          if (gap[key] <= 0) continue;

          let candidates = [];
          if (key === "c") {
            candidates = (virtualAcc || []).filter(
              (a) => a?.ingredient && (hasSide(a.ingredient, "CEREAL") || hasSide(a.ingredient, "CARB"))
            ).sort((a, b) => (b.ingredient?.carbs || 0) - (a.ingredient?.carbs || 0));
          } else if (key === "p") {
            candidates = (virtualAcc || []).filter(
              (a) => a?.ingredient && (hasSide(a.ingredient, "PROTEIN") || hasSide(a.ingredient, "BREAKFAST_PROTEIN"))
            ).sort((a, b) => (b.ingredient?.protein || 0) - (a.ingredient?.protein || 0));
          } else if (key === "f") {
            candidates = (virtualAcc || []).filter((a) => a?.ingredient && hasSide(a.ingredient, "FAT"))
              .sort((a, b) => (b.ingredient?.fat || 0) - (a.ingredient?.fat || 0));
          }

          const target = candidates[0];
          if (!target) continue;

          const ing = target.ingredient || {};
          const cur = Math.max(0, Math.floor(target.quantity || 0));
          const p100 = (ing.protein || 0) / 100;
          const c100 = (ing.carbs || 0) / 100;
          const f100 = (ing.fat || 0) / 100;

          let addGrams = 0;
          if (key === "c" && c100 > 0) addGrams = Math.round(gap.c / c100);
          if (key === "p" && p100 > 0) addGrams = Math.round(gap.p / p100);
          if (key === "f" && f100 > 0) addGrams = Math.round(gap.f / f100);

          let nextQty = Math.max(cur, cur + addGrams);
          if (!Number.isFinite(nextQty) || nextQty <= cur) continue;

          if (key === "f") nextQty = Math.min(nextQty, 80);
          if (key === "c" || key === "p") nextQty = Math.min(nextQty, 400);

          const t = typeForApply(ing);
          await applyAccompagnements(
            { ...repas, recipeFactor: currentFactor, accompagnements: virtualAcc },
            { [t]: { id: ing.id, quantity: Math.floor(nextQty) } }
          );
          virtualAcc = (virtualAcc || []).map((a) => (a?.ingredient?.id === ing.id ? { ingredient: ing, quantity: Math.floor(nextQty) } : a));
          applied = true;
          break;
        }

        if (!applied) break;
      }
      return virtualAcc;
    },
    [repas, currentFactor, deficitsFrom, applyAccompagnements]
  );

  const autoComplete = useCallback(
    async (opts = {}) => {
      const allowFruit = opts.canFruit ?? canFruit;
      const allowDairy = opts.canDairy ?? canDairy;
      let virtualAcc = Array.isArray(opts.startWithAcc) ? [...opts.startWithAcc] : [...(localAcc || [])];

      // ========== SNACK STRICT (collation) ==========
      if (repas?.repasType === "collation" || opts.mode === "snack") {
        // 1) On n’ajoute que la source choisie, rien d’autre.
        if (opts.preferDairy && allowDairy) {
          const dairy =
            suggestionsExt?.DAIRY?.[0] ||
            (allIngredients || []).find((i) => hasSide(i, "DAIRY") && !hasSide(i, "CHEESE"));
          if (dairy) await addWithVirtual("DAIRY", dairy, virtualAcc, 100, { forceDefaultQtyForDairy: true });
          return;
        }
        if (opts.preferFruit && allowFruit) {
          const fruit =
            suggestionsExt?.FRUIT_SIDE?.[0] ||
            (allIngredients || []).filter((i) => hasSide(i, "FRUIT_SIDE")).sort((a, b) => (b.carbs || 0) - (a.carbs || 0))[0];
          if (fruit) await addWithVirtual("FRUIT_SIDE", fruit, virtualAcc, 100);
          return;
        }
        if (opts.preferProtein) {
          const prot =
            (suggestionsExt?.PROTEIN || []).slice().sort((a, b) => (b.protein || 0) - (a.protein || 0))[0] ||
            (allIngredients || []).filter((i) => hasSide(i, "PROTEIN")).slice().sort((a, b) => (b.protein || 0) - (a.protein || 0))[0];
          if (prot) await addWithVirtual("PROTEIN", prot, virtualAcc, 100);
          return;
        }
        if (opts.preferNuts) {
          const fat =
            (suggestionsExt?.FAT || []).slice().sort((a, b) => (b.fat || 0) - (a.fat || 0))[0] ||
            (allIngredients || []).filter((i) => hasSide(i, "FAT")).slice().sort((a, b) => (b.fat || 0) - (a.fat || 0))[0];
          if (fat) await addWithVirtual("FAT", fat, virtualAcc, 15);
          return;
        }

        // Si aucun choix explicite (rare) : on prend le plus grand déficit et on ajoute UNE seule source correspondante.
        const gap = deficitsFrom(virtualAcc);
        const main = gap.c >= gap.p && gap.c >= gap.f ? "c" : gap.p >= gap.f ? "p" : "f";
        if (main === "c" && allowFruit) {
          const fruit =
            (suggestionsExt?.FRUIT_SIDE || [])
              .slice()
              .sort((a, b) => (b.carbs || 0) - (a.carbs || 0))[0] ||
            (allIngredients || [])
              .filter((i) => hasSide(i, "FRUIT_SIDE"))
              .slice()
              .sort((a, b) => (b.carbs || 0) - (a.carbs || 0))[0];
          if (fruit) await addWithVirtual("FRUIT_SIDE", fruit, virtualAcc, 100);
        } else if (main === "p") {
          const prot =
            (suggestionsExt?.PROTEIN || []).slice().sort((a, b) => (b.protein || 0) - (a.protein || 0))[0] ||
            (allIngredients || []).filter((i) => hasSide(i, "PROTEIN")).slice().sort((a, b) => (b.protein || 0) - (a.protein || 0))[0];
          if (prot) await addWithVirtual("PROTEIN", prot, virtualAcc, 100);
        } else {
          const fat =
            (suggestionsExt?.FAT || []).slice().sort((a, b) => (b.fat || 0) - (a.fat || 0))[0] ||
            (allIngredients || []).filter((i) => hasSide(i, "FAT")).slice().sort((a, b) => (b.fat || 0) - (a.fat || 0))[0];
          if (fat) await addWithVirtual("FAT", fat, virtualAcc, 15);
        }
        return;
      }

      // ========== PETIT-DÉJEUNER ==========
      if (repas?.repasType === "petit-dejeuner") {
        if ((preferDairy ?? opts.preferDairy) && allowDairy) {
          const dairy =
            suggestionsExt?.DAIRY?.[0] ||
            (allIngredients || []).find((i) => hasSide(i, "DAIRY") && !hasSide(i, "CHEESE"));
          if (dairy) {
            virtualAcc = await addWithVirtual("DAIRY", dairy, virtualAcc, 100, { forceDefaultQtyForDairy: true });
          }
        }
        if ((preferFruit ?? opts.preferFruit) && allowFruit) {
          const fruit =
            suggestionsExt?.FRUIT_SIDE?.[0] ||
            (allIngredients || []).filter((i) => hasSide(i, "FRUIT_SIDE")).sort((a, b) => (b.carbs || 0) - (a.carbs || 0))[0];
          if (fruit) virtualAcc = await addWithVirtual("FRUIT_SIDE", fruit, virtualAcc, 100);
        }

        virtualAcc = await adjustExistingForGap(virtualAcc);

        let guard = 0;
        while (guard++ < 8) {
          const gap = deficitsFrom(virtualAcc);
          if (gap.p <= 0 && gap.c <= 0 && gap.f <= 0) break;

          if (gap.c > 0) {
            const cand =
              (suggestionsExt?.CEREAL || []).slice().sort((a, b) => (b.carbs || 0) - (a.carbs || 0))[0] ||
              (allIngredients || []).filter((i) => hasSide(i, "CEREAL")).slice().sort((a, b) => (b.carbs || 0) - (a.carbs || 0))[0] || null;
            if (cand) { virtualAcc = await addWithVirtual("CEREAL", cand, virtualAcc, 100); continue; }
          }
          if (gap.p > 0) {
            const cand =
              (suggestionsExt?.BREAKFAST_PROTEIN || []).slice().sort((a, b) => (b.protein || 0) - (a.protein || 0))[0] ||
              (allBP || []).slice().sort((a, b) => (b.protein || 0) - (a.protein || 0))[0] || null;
            if (cand) { virtualAcc = await addWithVirtual("BREAKFAST_PROTEIN", cand, virtualAcc, 100); continue; }
          }
          if (gap.f > 0) {
            const cand =
              (suggestionsExt?.FAT || []).slice().sort((a, b) => (b.fat || 0) - (a.fat || 0))[0] ||
              (allIngredients || []).filter((i) => hasSide(i, "FAT")).slice().sort((a, b) => (b.fat || 0) - (a.fat || 0))[0] || null;
            if (cand) { virtualAcc = await addWithVirtual("FAT", cand, virtualAcc, 15); continue; }
          }
        }
        return;
      }

      // ========== DÉJ / DÎNER ==========
      if (requireVegetable) {
        const veg = (suggestionsExt?.VEGETABLE_SIDE?.[0] || vegOptions?.[0]) ?? null;
        if (veg) virtualAcc = await addWithVirtual("VEGETABLE_SIDE", veg, virtualAcc, 150);
      }

      if ((preferDairy ?? opts.preferDairy) && allowDairy) {
        const dairy =
          suggestionsExt?.DAIRY?.[0] ||
          (allIngredients || []).find((i) => hasSide(i, "DAIRY") && !hasSide(i, "CHEESE"));
        if (dairy && !(virtualAcc || []).some((a) => a?.ingredient?.id === dairy.id)) {
          virtualAcc = await addWithVirtual("DAIRY", dairy, virtualAcc, 100, { forceDefaultQtyForDairy: true });
        }
      }

      if ((preferFruit ?? opts.preferFruit) && allowFruit) {
        const fruit =
          suggestionsExt?.FRUIT_SIDE?.[0] ||
          (allIngredients || []).filter((i) => hasSide(i, "FRUIT_SIDE")).sort((a, b) => (b.carbs || 0) - (a.carbs || 0))[0];
        if (fruit) virtualAcc = await addWithVirtual("FRUIT_SIDE", fruit, virtualAcc, 100);
      }

      virtualAcc = await adjustExistingForGap(virtualAcc);

      let guard = 0;
      while (guard++ < 8) {
        const gap = deficitsFrom(virtualAcc);
        if (gap.p <= 0 && gap.c <= 0 && gap.f <= 0) break;

        const main = Object.entries(gap).sort((a, b) => b[1] - a[1])[0][0];

        if (main === "c") {
          const cand =
            (suggestionsExt?.CARB || []).slice().sort((a, b) => (b.carbs || 0) - (a.carbs || 0))[0] ||
            (suggestionsExt?.CEREAL || []).slice().sort((a, b) => (b.carbs || 0) - (a.carbs || 0))[0] ||
            (allIngredients || []).filter((i) => hasSide(i, "CARB") || hasSide(i, "CEREAL")).slice().sort((a, b) => (b.carbs || 0) - (a.carbs || 0))[0];
          if (cand) { virtualAcc = await addWithVirtual(hasSide(cand, "CEREAL") ? "CEREAL" : "CARB", cand, virtualAcc, 100); continue; }
        }
        if (main === "p") {
          const cand =
            (suggestionsExt?.PROTEIN || []).slice().sort((a, b) => (b.protein || 0) - (a.protein || 0))[0] ||
            (allIngredients || []).filter((i) => hasSide(i, "PROTEIN")).slice().sort((a, b) => (b.protein || 0) - (a.protein || 0))[0];
          if (cand) { virtualAcc = await addWithVirtual("PROTEIN", cand, virtualAcc, 100); continue; }
        }
        if (main === "f") {
          const cand =
            (suggestionsExt?.FAT || []).slice().sort((a, b) => (b.fat || 0) - (a.fat || 0))[0] ||
            (allIngredients || []).filter((i) => hasSide(i, "FAT")).slice().sort((a, b) => (b.fat || 0) - (a.fat || 0))[0];
          if (cand) { virtualAcc = await addWithVirtual("FAT", cand, virtualAcc, 15); continue; }
        }
      }
    },
    [
      localAcc,
      preferDairy,
      preferFruit,
      canDairy,
      canFruit,
      suggestionsExt,
      vegOptions,
      allIngredients,
      addWithVirtual,
      adjustExistingForGap,
      deficitsFrom,
      repas,
      requireVegetable,
    ]
  );

  return { autoComplete, bestList, bestPick, setBestPick };
}

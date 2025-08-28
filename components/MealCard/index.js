// components/MealCard/index.js
import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import axios from "axios";
import { ExternalLink, Wand2, Info, Trash2 } from "lucide-react";

import useSuggestedAccompagnements from "../../hooks/useSuggestedAccompagnements";
import { useRecipeScaling } from "../../hooks/useRecipeScaling";
import { useMealTargets } from "../../hooks/useMealTargets";
import { useAccTotals } from "../../hooks/useAccTotals";
import { useDairyRules } from "../../hooks/useDairyRules";
import { useAutoCompleteSides } from "../../hooks/useAutoCompleteSides";
import { toast } from "../../lib/toast";
import { preserveScroll } from "../../lib/preserveScroll";

import MealHeader from "./MealHeader";
import MealImage from "./MealImage";
import MacroBars from "./MacroBars";
import InfoMessages from "./InfoMessages";
import AddedSidesList from "./AddedSidesList";
import BreakfastAutoModal from "./BreakfastAutoModal";
import SnackAutoModal from "./SnackAutoModal";

const IngredientsBlock = dynamic(() => import("./IngredientsBlock"));

const TYPE_PRIORITY = [
  "VEGETABLE_SIDE",
  "DAIRY",
  "FRUIT_SIDE",
  "PROTEIN",
  "BREAKFAST_PROTEIN",
  "CARB",
  "CEREAL",
  "FAT",
];
const MAX_SEARCH_FACTOR = 10;
const TARGET_BUFFER = 0.95;
const ADJUST_HINT_MIN = 0.1;

const primaryTypeOf = (ing) => {
  const types = ing?.sideTypes || [];
  for (const t of TYPE_PRIORITY) {
    if (types.includes?.(t) || types.some?.((s) => s?.sideType === t)) return t;
  }
  const first = types[0];
  return typeof first === "string" ? first : first?.sideType || null;
};

const hasTypeInList = (items, type) =>
  (items || []).some((it) => {
    const st = it?.ingredient?.sideTypes || it?.sideTypes || [];
    return st.includes?.(type) || st.some?.((s) => s?.sideType === type);
  });

const collectTypes = (items) => {
  const set = new Set();
  (items || []).forEach((it) => {
    const st = it?.ingredient?.sideTypes || it?.sideTypes || [];
    st.forEach((x) => {
      const t = typeof x === "string" ? x : x?.sideType;
      if (t) set.add(t);
    });
  });
  return set;
};

const hasSide = (ing, type) => {
  const st = ing?.sideTypes || [];
  return st.includes?.(type) || st.some?.((s) => s?.sideType === type);
};

const macrosOf = (ing, qty) => {
  const f = (Number(qty) || 0) / 100;
  return { p: (ing?.protein || 0) * f, c: (ing?.carbs || 0) * f, f: (ing?.fat || 0) * f };
};

// « Protéine stricte » côté UI : PROTEIN ou BREAKFAST_PROTEIN mais pas DAIRY/CHEESE
const isProteinStrictUI = (ing) =>
  (hasSide(ing, "PROTEIN") || hasSide(ing, "BREAKFAST_PROTEIN")) &&
  !hasSide(ing, "DAIRY") &&
  !hasSide(ing, "CHEESE");

// juste ici pour classer les protéines PDJ en dernier (optionnel)
const isPowderProtein = (ing) =>
  /whey|cas[ée]ine|isolate|protéine.*poudre|protein powder/i.test((ing?.name || "").toLowerCase());

export default function MealCard({
  repas,
  user,
  recipeFactor = 1,
  openModal,
  allIngredients,
  applyAccompagnements,
  removeAccompagnements,
}) {
  const cardRef = useRef(null);

  const { recette } = repas;
  const isBreakfast = repas?.repasType === "petit-dejeuner";
  const isSnack = repas?.repasType === "collation";

  // --- garde-fou scroll en plus de preserveScroll ---
  const scrollGuard = useCallback(async (work) => {
    const scroller = document.scrollingElement || document.documentElement || document.body;
    const startY = window.scrollY || scroller.scrollTop || 0;
    const startTop = cardRef.current?.getBoundingClientRect?.().top ?? null;

    const result = await work();

    // Laisse le layout se stabiliser (double rAF)
    await new Promise((r) => requestAnimationFrame(r));
    await new Promise((r) => requestAnimationFrame(r));

    if (cardRef.current && startTop != null) {
      const endTop = cardRef.current.getBoundingClientRect().top ?? null;
      if (endTop != null) {
        const diff = endTop - startTop;
        window.scrollTo({ top: (window.scrollY || scroller.scrollTop || 0) + diff, behavior: "auto" });
        return result;
      }
    }
    // fallback si remount
    window.scrollTo({ top: startY, behavior: "auto" });
    return result;
  }, []);

  // --- bloque les ancres vides qui scrollent en haut (#) ---
  const onClickCaptureBlockHash = useCallback((e) => {
    const a = e.target?.closest?.("a");
    if (!a) return;
    const href = a.getAttribute("href");
    if (href === "#" || href === "") {
      e.preventDefault();
      e.stopPropagation();
    }
  }, []);

  const [localAcc, setLocalAcc] = useState(repas.accompagnements || []);
  useEffect(() => setLocalAcc(repas.accompagnements || []), [repas.accompagnements]);

  // ✅ helpers “optimistic UI”
  const upsertLocalAcc = useCallback((ingredient, quantity) => {
    if (!ingredient) return;
    setLocalAcc((prev) => {
      const idx = (prev || []).findIndex((a) => a?.ingredient?.id === ingredient.id);
      if (idx === -1) return [...(prev || []), { ingredient, quantity: Math.floor(quantity) }];
      const next = [...prev];
      next[idx] = { ...next[idx], ingredient, quantity: Math.floor(quantity) };
      return next;
    });
  }, []);

  const removeLocalAcc = useCallback((ingredientId) => {
    setLocalAcc((prev) => (prev || []).filter((a) => a?.ingredient?.id !== ingredientId));
  }, []);

  // (optionnel) refetch léger après autoComplete, sans reload ni scroll
  const refetchAccompagnements = useCallback(async () => {
    try {
      const { data } = await axios.get(`/api/menu/repas/${repas.id}`);
      if (data?.accompagnements) setLocalAcc(data.accompagnements);
    } catch (e) {
      // silencieux
    }
  }, [repas.id]);

  const { calObj, pObj, cObj, fObj } = useMealTargets(user, repas.repasType);
  const { scaled, evaluateTotals } = useRecipeScaling(recette);

  const pCap = useMemo(() => pObj * TARGET_BUFFER, [pObj]);
  const cCap = useMemo(() => cObj * TARGET_BUFFER, [cObj]);
  const fCap = useMemo(() => fObj * TARGET_BUFFER, [fObj]);

  const [currentFactor, setCurrentFactor] = useState(recipeFactor || 1);
  useEffect(() => {
    if (!recette) return;
    if (Number.isFinite(recipeFactor) && recipeFactor > 0) {
      setCurrentFactor(recipeFactor);
      return;
    }
    const best = (function findBestFactorWithCap() {
      if (!recette?.ingredients?.length) return 0;
      const eps = 0.001;
      let lo = 0, hi = MAX_SEARCH_FACTOR, best = 0;
      for (let i = 0; i < 18; i++) {
        const mid = (lo + hi) / 2;
        const tot = evaluateTotals(mid);
        const over = tot.p > pCap + eps || tot.c > cCap + eps || tot.f > fCap + eps;
        if (over) hi = mid; else { best = mid; lo = mid; }
      }
      return Math.max(0, Math.min(MAX_SEARCH_FACTOR, best));
    })();
    setCurrentFactor(best || 1);
  }, [recette, pCap, cCap, fCap, recipeFactor, evaluateTotals]);

  const scaledNow = useMemo(() => scaled(currentFactor), [scaled, currentFactor]);
  const recetteTotals = scaledNow.totals;

  const sidesTotals = useAccTotals(localAcc, allIngredients);
  const pCon = recetteTotals.p + sidesTotals.p;
  const cCon = recetteTotals.c + sidesTotals.c;
  const fCon = recetteTotals.f + sidesTotals.f;
  const calCon = pCon * 4 + cCon * 4 + fCon * 9;

  const rest = useMemo(
    () => ({
      p: Math.max(0, pCap - pCon),
      c: Math.max(0, cCap - cCon),
      f: Math.max(0, fCap - fCon),
    }),
    [pCap, cCap, fCap, pCon, cCon, fCon]
  );

  const dairy = useDairyRules({ recette, localAcc, allIngredients });
  const suggestions = useSuggestedAccompagnements({
    repas: { ...repas, recipeFactor: currentFactor },
    user,
    allIngredients,
  });

  const requireVegetable =
    ["dejeuner", "diner"].includes(repas.repasType) &&
    !(hasTypeInList(recette?.ingredients, "VEGETABLE_SIDE") || hasTypeInList(localAcc, "VEGETABLE_SIDE"));

  const vegOptions = useMemo(
    () =>
      allIngredients.filter(
        (i) => i?.sideTypes?.includes?.("VEGETABLE_SIDE") || i?.sideTypes?.some?.((s) => s?.sideType === "VEGETABLE_SIDE")
      ),
    [allIngredients]
  );

  const recipeTypes = useMemo(() => collectTypes(recette?.ingredients), [recette?.ingredients]);
  const accTypes = useMemo(() => collectTypes(localAcc), [localAcc]);

  // Fruit : pas plus d’une source (recette + acc)
  const canFruit = useMemo(
    () => !(recipeTypes.has("FRUIT_SIDE") || accTypes.has("FRUIT_SIDE")),
    [recipeTypes, accTypes]
  );

  // Laitier : bloqué s'il y en a déjà (recette OU accompagnements)
  const recipeHasDairy = useMemo(() => recipeTypes.has("DAIRY") || recipeTypes.has("CHEESE"), [recipeTypes]);
  const accHasDairy = useMemo(() => accTypes.has("DAIRY") || accTypes.has("CHEESE"), [accTypes]);
  const canDairy = useMemo(() => !(recipeHasDairy || accHasDairy), [recipeHasDairy, accHasDairy]);
  const dairyBlockedReason = useMemo(() => {
    if (recipeHasDairy) return "La recette contient déjà un produit laitier.";
    if (accHasDairy) return "Un produit laitier est déjà ajouté.";
    return "";
  }, [recipeHasDairy, accHasDairy]);

  const { DAIRY: _drop, ...baseSugs } = suggestions;
  let suggestionsExt = { ...baseSugs };
  if (requireVegetable) suggestionsExt.VEGETABLE_SIDE = vegOptions;
  if (dairy.filtered.length) suggestionsExt.DAIRY = dairy.filtered;

  if (isBreakfast) {
    delete suggestionsExt.VEGETABLE_SIDE;

    if (suggestionsExt.CARB) {
      const cerealsOnly = (suggestionsExt.CARB || []).filter(
        (i) => i?.sideTypes?.includes?.("CEREAL") || i?.sideTypes?.some?.((s) => s?.sideType === "CEREAL")
      );
      if (cerealsOnly.length) suggestionsExt.CEREAL = cerealsOnly;
      delete suggestionsExt.CARB;
    }

    if (suggestionsExt.PROTEIN) delete suggestionsExt.PROTEIN;

    if (suggestionsExt.BREAKFAST_PROTEIN) {
      const whole = suggestionsExt.BREAKFAST_PROTEIN.filter((i) => !isPowderProtein(i));
      const powders = suggestionsExt.BREAKFAST_PROTEIN.filter(isPowderProtein);
      suggestionsExt.BREAKFAST_PROTEIN = [...whole, ...powders];
      if (!suggestionsExt.BREAKFAST_PROTEIN.length) delete suggestionsExt.BREAKFAST_PROTEIN;
    }
  }

  const { autoComplete } = useAutoCompleteSides({
    repas,
    currentFactor,
    localAcc,
    rest,
    suggestionsExt,
    vegOptions,
    allIngredients,
    applyAccompagnements,
    requireVegetable,
    canFruit,
    canDairy,
  });

  // ========== ACTIONS ==========
  const handleAdd = useCallback(
    async (type, id) => {
      if (type === "FRUIT_SIDE" && !canFruit) {
        toast({ title: "Non disponible", description: "Il y a déjà un fruit dans la recette.", variant: "info" });
        return;
      }
      if ((type === "DAIRY" || type === "CHEESE") && !canDairy) {
        toast({ title: "Non disponible", description: "Il y a déjà un produit laitier dans la recette.", variant: "info" });
        return;
      }
      if (isBreakfast && (type === "CARB" || type === "PROTEIN")) {
        toast({
          title: "Type non autorisé au petit-déjeuner",
          description:
            type === "CARB"
              ? "Utilise les céréales (CEREAL) pour les glucides au petit-déjeuner."
              : "Utilise les protéines PDJ (BREAKFAST_PROTEIN) pour les protéines au petit-déjeuner.",
          variant: "warning",
        });
        return;
      }

      const res = await applyAccompagnements({ ...repas, recipeFactor: currentFactor }, { [type]: id });
      const usedQty = typeof res === "object" ? res.quantity ?? res.qty ?? 0 : res ?? 0;
      const reason = typeof res === "object" ? res.reason : null;

      if (!usedQty || usedQty <= 0) {
        toast({ title: "Ajout impossible", description: reason || "Règles du repas (laitiers, limites, …)", variant: "warning" });
      } else {
        // ✅ MAJ locale immédiate
        const ingObj =
          (typeof res === "object" && res.ingredient) ||
          allIngredients.find((i) => i.id === (typeof id === "object" ? id.id : id));
        if (ingObj) upsertLocalAcc(ingObj, usedQty);
        toast({ title: "Accompagnement ajouté", description: `Quantité ajoutée : ${usedQty} g`, variant: "success" });
      }
    },
    [applyAccompagnements, repas, currentFactor, canFruit, canDairy, isBreakfast, allIngredients, upsertLocalAcc]
  );

  const handleDelete = useCallback(
    async (id) => {
      const res = await removeAccompagnements(repas, id);
      if (res?.ok) {
        // ✅ MAJ locale immédiate
        removeLocalAcc(id);
      }
    },
    [removeAccompagnements, repas, removeLocalAcc]
  );

  const handleClearAll = useCallback(async () => {
    try {
      const ids = (localAcc || []).map((a) => a?.ingredient?.id).filter(Boolean);
      if (!ids.length) {
        toast({ title: "Rien à supprimer", description: "Aucun accompagnement.", variant: "info" });
        return;
      }
      await Promise.all(ids.map((id) => removeAccompagnements(repas, id)));
      setLocalAcc([]);
      toast({ title: "Accompagnements supprimés", description: "Tout est remis à zéro.", variant: "success" });
    } catch (e) {
      console.error("clear all error", e);
      toast({ title: "Erreur", description: "Impossible de tout supprimer.", variant: "destructive" });
    }
  }, [localAcc, removeAccompagnements, repas]);

  const optionsForType = useCallback(
    (type, currentIng = null) => {
      const isFruitType = type === "FRUIT_SIDE";
      const isDairyType = type === "DAIRY" || type === "CHEESE";

      let effectiveType = type;
      if (isBreakfast) {
        const curIsProt = currentIng && (hasSide(currentIng, "PROTEIN") || hasSide(currentIng, "BREAKFAST_PROTEIN"));
        const curIsCarb = currentIng && (hasSide(currentIng, "CARB") || hasSide(currentIng, "CEREAL"));
        if (type === "PROTEIN" || curIsProt) effectiveType = "BREAKFAST_PROTEIN";
        if (type === "CARB" || curIsCarb) effectiveType = "CEREAL";
      }

      const currentIsSameType =
        !!currentIng &&
        ((isFruitType && hasSide(currentIng, "FRUIT_SIDE")) ||
          (isDairyType && (hasSide(currentIng, "DAIRY") || hasSide(currentIng, "CHEESE"))));

      if ((isFruitType && !canFruit && !currentIsSameType) || (isDairyType && !canDairy && !currentIsSameType)) {
        return [];
      }

      return (allIngredients || []).filter(
        (i) => i?.sideTypes?.includes?.(effectiveType) || i?.sideTypes?.some?.((s) => s?.sideType === (effectiveType))
      );
    },
    [allIngredients, canFruit, canDairy, isBreakfast]
  );

  // ========= REPLACE (FRUIT swap + PROTEIN swap au PDJ) =========
  const handleReplace = useCallback(
    async (accOrId, newId) => {
      try {
        if (!newId) return;

        let oldItem = null;
        if (accOrId?.ingredient) oldItem = accOrId;
        else if (accOrId) oldItem = (localAcc || []).find((a) => a?.ingredient?.id === accOrId) || null;
        if (!oldItem?.ingredient) return;

        const oldId = oldItem.ingredient.id;
        const oldQty = Math.max(1, Math.floor(Number(oldItem.quantity || 0) || 100));

        const newIng = allIngredients.find((i) => i.id === newId);
        if (!newIng) return;

        const newType = primaryTypeOf(newIng) || "CEREAL";

        const mOld = macrosOf(oldItem.ingredient, oldQty);
        const gap = {
          p: Math.max(0, rest.p + mOld.p),
          c: Math.max(0, rest.c + mOld.c),
          f: Math.max(0, rest.f + mOld.f),
        };

        const isFruitNew = hasSide(newIng, "FRUIT_SIDE");
        const isFruitOld = hasSide(oldItem.ingredient, "FRUIT_SIDE");

        const isProtNew = isProteinStrictUI(newIng);
        const isProtOld = isProteinStrictUI(oldItem.ingredient);

        const isDairyLikeNew = hasSide(newIng, "DAIRY") || hasSide(newIng, "CHEESE");
        const isDairyLikeOld = hasSide(oldItem.ingredient, "DAIRY") || hasSide(oldItem.ingredient, "CHEESE");

        if (isFruitNew && !canFruit && !isFruitOld) {
          toast({ title: "Non disponible", description: "Il y a déjà un fruit dans la recette.", variant: "info" });
          return;
        }
        if (isBreakfast && isDairyLikeNew && !canDairy && !isDairyLikeOld) {
          toast({ title: "Non disponible", description: "Il y a déjà un produit laitier dans la recette.", variant: "info" });
          return;
        }

        let desiredQty = oldQty;
        if (isFruitNew) {
          const otherFruitQty =
            (localAcc || []).reduce((s, a) => {
              if (!a?.ingredient) return s;
              if (a?.ingredient?.id === oldId) return s;
              const st = a?.ingredient?.sideTypes || [];
              const ok = st.includes?.("FRUIT_SIDE") || st.some?.((t) => t?.sideType === "FRUIT_SIDE");
              return ok ? s + (a.quantity || 0) : s;
            }, 0) || 0;
          const remaining = Math.max(0, 100 - otherFruitQty);

          const p100 = (newIng.protein || 0) / 100;
          const c100 = (newIng.carbs || 0) / 100;
          const f100 = (newIng.fat || 0) / 100;

          const byC = c100 > 0 ? Math.floor(gap.c / c100) : remaining;
          const byP = gap.p > 0 && p100 > 0 ? Math.floor(gap.p / p100) : remaining;
          const byF = gap.f > 0 && f100 > 0 ? Math.floor(gap.f / f100) : remaining;

          desiredQty = Math.max(0, Math.min(remaining, byC, byP, byF));
          if (desiredQty <= 0) {
            toast({ title: "Déjà comblé", description: "Pas de macros restantes pour un fruit.", variant: "info" });
            return;
          }
        } else if (isProtNew) {
          const p100 = (newIng.protein || 0) / 100;
          desiredQty = p100 > 0 ? Math.max(1, Math.floor(gap.p / p100)) : oldQty;
        }

        // === SWAP spécial FRUIT ===
        if (isFruitNew && isFruitOld) {
          await removeAccompagnements(repas, oldId);
          removeLocalAcc(oldId); // ✅ UI

          const virtualAfterRemove = (localAcc || []).filter((a) => a?.ingredient?.id !== oldId);
          const ctxAfterRemove = { ...repas, recipeFactor: currentFactor, accompagnements: virtualAfterRemove };

          const resAddFruit = await applyAccompagnements(ctxAfterRemove, {
            FRUIT_SIDE: { id: newIng.id, quantity: Math.floor(desiredQty) },
          });
          const usedQtyFruit =
            typeof resAddFruit === "object" ? resAddFruit.quantity ?? resAddFruit.qty ?? desiredQty : Number(resAddFruit) || desiredQty;

          if (!usedQtyFruit || usedQtyFruit <= 0) {
            const reason = typeof resAddFruit === "object" ? resAddFruit.error || resAddFruit.reason : null;
            // rollback visuel minimal : on ré-insère l'ancien
            upsertLocalAcc(oldItem.ingredient, oldQty);
            toast({ title: "Remplacement non appliqué", description: reason || "Règles du repas.", variant: "warning" });
            return;
          }

          upsertLocalAcc(newIng, usedQtyFruit); // ✅ UI
          toast({ title: "Fruit remplacé", description: `${newIng.name} — ${usedQtyFruit} g`, variant: "success" });
          return;
        }

        // === SWAP spécial PROTÉINE au PETIT-DÉJEUNER ===
        if (isBreakfast && isProtNew && isProtOld) {
          await removeAccompagnements(repas, oldId);
          removeLocalAcc(oldId); // ✅ UI

          const virtualAfterRemove = (localAcc || []).filter((a) => a?.ingredient?.id !== oldId);
          const ctxAfterRemove = { ...repas, recipeFactor: currentFactor, accompagnements: virtualAfterRemove };

          const resAddProt = await applyAccompagnements(ctxAfterRemove, {
            BREAKFAST_PROTEIN: { id: newIng.id, quantity: Math.floor(desiredQty) },
          });
          const usedQtyProt =
            typeof resAddProt === "object" ? resAddProt.quantity ?? resAddProt.qty ?? desiredQty : Number(resAddProt) || desiredQty;

          if (!usedQtyProt || usedQtyProt <= 0) {
            const reason = typeof resAddProt === "object" ? resAddProt.error || resAddProt.reason : null;
            upsertLocalAcc(oldItem.ingredient, oldQty); // rollback visuel
            toast({ title: "Remplacement non appliqué", description: reason || "Règles du repas.", variant: "warning" });
            return;
          }

          upsertLocalAcc(newIng, usedQtyProt); // ✅ UI
          toast({ title: "Protéine remplacée", description: `${newIng.name} — ${usedQtyProt} g`, variant: "success" });
          return;
        }

        // --- chemin add-first par défaut ---
        const resAdd = await applyAccompagnements(
          { ...repas, recipeFactor: currentFactor },
          { [newType]: { id: newIng.id, quantity: Math.floor(desiredQty) } }
        );
        const usedQty = typeof resAdd === "object" ? resAdd.quantity ?? resAdd.qty ?? desiredQty : Number(resAdd) || desiredQty;

        if (!usedQty || usedQty <= 0) {
          const reason = typeof resAdd === "object" ? resAdd.error || resAdd.reason : null;
          toast({ title: "Remplacement non appliqué", description: reason || "Règles du repas.", variant: "warning" });
          return;
        }

        upsertLocalAcc(newIng, usedQty); // ✅ UI
        if (newIng.id !== oldId) {
          await removeAccompagnements(repas, oldId);
          removeLocalAcc(oldId); // ✅ UI
        }
        toast({ title: "Accompagnement remplacé", description: `${newIng.name} — ${usedQty} g`, variant: "success" });
      } catch (e) {
        console.error("replace error", e);
        toast({ title: "Erreur", description: "Impossible de remplacer cet accompagnement.", variant: "destructive" });
      }
    },
    [allIngredients, localAcc, repas, currentFactor, removeAccompagnements, applyAccompagnements, rest, canFruit, canDairy, isBreakfast, upsertLocalAcc, removeLocalAcc]
  );

  // ------------ Helpers pour handleAdjust -------------
  const _ctxAccMin = (acc = []) =>
    (acc || [])
      .filter((a) => a?.ingredient?.id)
      .map((a) => ({
        ingredient: { id: a.ingredient.id, sideTypes: a.ingredient.sideTypes },
        quantity: Math.floor(a.quantity || 0),
      }));

  const _resIsSuccess = (res, oldQty, targetQty) => {
    if (res == null) return false;
    if (typeof res === "number") return res > 0 || targetQty > oldQty;
    if (typeof res === "boolean") return !!res;
    if (typeof res === "object") {
      if ("ok" in res) return !!res.ok;
      if ("success" in res) return !!res.success;
      const q = res.quantity ?? res.qty ?? res.newQuantity ?? res.finalQuantity ?? null;
      const d = res.delta ?? res.diff ?? null;
      if (Number.isFinite(d)) return d > 0;
      if (Number.isFinite(q)) return q > oldQty;
    }
    return false;
  };

  // ------------ AJUSTER -------------
  const handleAdjust = useCallback(
    async (accItem) => {
      try {
        const ing = accItem?.ingredient;
        const oldQty = Math.max(0, Math.floor(Number(accItem?.quantity || 0)));
        if (!ing || !Number.isFinite(oldQty)) return;

        const st = ing?.sideTypes || [];
        const isFruit =
          st.includes?.("FRUIT_SIDE") || st.some?.((s) => s?.sideType === "FRUIT_SIDE");
        const isCereal =
          st.includes?.("CEREAL") || st.some?.((s) => s?.sideType === "CEREAL");
        const isCarb =
          st.includes?.("CARB") || st.some?.((s) => s?.sideType === "CARB");
        const isProt =
          st.includes?.("PROTEIN") || st.some?.((s) => s?.sideType === "PROTEIN") ||
          st.includes?.("BREAKFAST_PROTEIN") || st.some?.((s) => s?.sideType === "BREAKFAST_PROTEIN");
        const isFat  = st.includes?.("FAT") || st.some?.((s) => s?.sideType === "FAT");

        const p100 = (ing.protein || 0) / 100;
        const c100 = (ing.carbs   || 0) / 100;
        const f100 = (ing.fat     || 0) / 100;

        const mOld = macrosOf(ing, oldQty);
        const gap = {
          p: Math.max(0, rest.p),
          c: Math.max(0, rest.c),
          f: Math.max(0, rest.f),
        };

        let target = oldQty;

        if (isFruit) {
          const otherFruitQty =
            (localAcc || []).reduce((s, a) => {
              if (!a?.ingredient || a.ingredient.id === ing.id) return s;
              const st2 = a.ingredient.sideTypes || [];
              const ok = st2.includes?.("FRUIT_SIDE") || st2.some?.((t) => t?.sideType === "FRUIT_SIDE");
              return ok ? s + (a.quantity || 0) : s;
            }, 0) || 0;

          const maxForThisFruit = Math.max(0, 100 - otherFruitQty);
          if (maxForThisFruit <= oldQty) {
            toast({ title: "Quota fruit atteint", description: "100 g max par repas.", variant: "info" });
            return;
          }

          const addByC = c100 > 0 ? Math.ceil(gap.c / c100) : (maxForThisFruit - oldQty);
          const addByP = gap.p > 0 && p100 > 0 ? Math.ceil(gap.p / p100) : (maxForThisFruit - oldQty);
          const addByF = gap.f > 0 && f100 > 0 ? Math.ceil(gap.f / f100) : (maxForThisFruit - oldQty);

          const add = Math.max(1, Math.min(maxForThisFruit - oldQty, addByC, addByP, addByF));
          target = Math.min(maxForThisFruit, oldQty + add);
        } else if (isCereal || isCarb) {
          const add = c100 > 0 ? Math.ceil(gap.c / c100) : 0;
          if (add <= 0) { toast({ title: "Ajustement inutile", description: "Rien à ajouter.", variant: "info" }); return; }
          target = Math.min(400, oldQty + add);
        } else if (isProt) {
          const add = p100 > 0 ? Math.ceil(gap.p / p100) : 0;
          if (add <= 0) { toast({ title: "Ajustement inutile", description: "Rien à ajouter.", variant: "info" }); return; }
          target = Math.min(400, oldQty + add);
        } else if (isFat) {
          const add = f100 > 0 ? Math.ceil(gap.f / f100) : 0;
          if (add <= 0) { toast({ title: "Ajustement inutile", description: "Rien à ajouter.", variant: "info" }); return; }
          target = Math.min(80, oldQty + add);
        } else {
          toast({ title: "Ajustement non disponible", description: "Type non ajustable finement.", variant: "info" });
          return;
        }

        if (target <= oldQty) {
          toast({ title: "Ajustement inutile", description: "Rien à ajouter.", variant: "info" });
          return;
        }

        const t = isFruit ? "FRUIT_SIDE" : isCereal ? "CEREAL" : isCarb ? "CARB" : isProt ? "PROTEIN" : "FAT";

        const ctx = { ...repas, recipeFactor: currentFactor, accompagnements: _ctxAccMin(localAcc) };

        let tried = Math.floor(target);
        let ok = false;
        let apiRes = null;
        for (let i = 0; i < 3 && tried > oldQty; i++) {
          apiRes = await applyAccompagnements(ctx, { [t]: { id: ing.id, quantity: tried } });
          if (_resIsSuccess(apiRes, oldQty, tried)) { ok = true; break; }
          tried = Math.max(oldQty + 1, tried - 1);
        }

        if (!ok) {
          toast({
            title: "Ajustement non appliqué",
            description: isFruit ? "Fruit déjà au maximum (quota 100 g partagé) ou règle micro bloquante." : "Règle du repas ou limite atteinte.",
            variant: "warning",
          });
          return;
        }

        const newQ = (apiRes && (apiRes.quantity ?? apiRes.qty)) || tried;
        upsertLocalAcc(ing, newQ); // ✅ UI

        toast({ title: "Ajustement effectué", description: `Nouvelle quantité : ${Math.floor(newQ)} g`, variant: "success" });
      } catch (e) {
        console.error("Adjust error:", e);
        toast({ title: "Erreur", description: "Impossible d’ajuster la quantité.", variant: "destructive" });
      }
    },
    [rest, localAcc, repas, currentFactor, applyAccompagnements, upsertLocalAcc]
  );

  // ==== Hints “Ajuster” ====
  const computeAdjustHint = useCallback(
    (accItem) => {
      if (!accItem?.ingredient) return null;
      const ing = accItem.ingredient;
      const st = ing?.sideTypes || [];
      const isFruit = st.includes?.("FRUIT_SIDE") || st.some?.((s) => s?.sideType === "FRUIT_SIDE");
      const isCereal = st.includes?.("CEREAL") || st.some?.((s) => s?.sideType === "CEREAL");
      const isCarb = st.includes?.("CARB") || st.some?.((s) => s?.sideType === "CARB");
      const isProt =
        st.includes?.("PROTEIN") || st.some?.((s) => s?.sideType === "PROTEIN") ||
        st.includes?.("BREAKFAST_PROTEIN") || st.some?.((s) => s?.sideType === "BREAKFAST_PROTEIN");
      const isFat = st.includes?.("FAT") || st.some?.((s) => s?.sideType === "FAT");

      const p100 = (ing.protein || 0) / 100;
      const c100 = (ing.carbs || 0) / 100;
      const f100 = (ing.fat || 0) / 100;
      const need = { p: rest.p, c: rest.c, f: rest.f };

      let key = null;
      if (isBreakfast) {
        if (need.c > 0 && (isCereal || isCarb || isFruit) && c100 > 0) key = "c";
        else if (need.p > 0 && isProt && p100 > 0) key = "p";
        else if (need.f > 0 && isFat && f100 > 0) key = "f";
      } else {
        const entries = [
          ["c", need.c > 0 && c100 > 0 && (isCereal || isCarb || isFruit)],
          ["p", need.p > 0 && p100 > 0 && isProt],
          ["f", need.f > 0 && f100 > 0 && isFat],
        ].filter(([, ok]) => ok);
        if (entries.length) key = entries[0][0];
      }
      if (!key) return null;

      let addGrams = 0;
      if (key === "c" && c100 > 0) addGrams = Math.round(need.c / c100);
      if (key === "p" && p100 > 0) addGrams = Math.round(need.p / p100);
      if (key === "f" && f100 > 0) addGrams = Math.round(need.f / f100);

      if (isFruit && key === "c") {
        const totalFruitNow =
          (localAcc || []).reduce((s, a) => {
            const st2 = a?.ingredient?.sideTypes || [];
            const ok = st2.includes?.("FRUIT_SIDE") || st2.some?.((t) => t?.sideType === "FRUIT_SIDE");
            return ok ? s + (a.quantity || 0) : s;
          }, 0) || 0;
        const remainAdd = Math.max(0, 100 - totalFruitNow);
        addGrams = Math.min(addGrams, remainAdd);
      }

      if (addGrams <= 0) return null;

      const deficit = key === "c" ? need.c : key === "p" ? need.p : need.f;
      const macroPerG = key === "c" ? c100 : key === "p" ? p100 : f100;
      const gain = addGrams * macroPerG;
      const pct = deficit > 0 ? (gain / deficit) * 100 : 0;
      if (pct < ADJUST_HINT_MIN * 100) return null;

      const reason =
        key === "c" ? "pour combler les glucides" : key === "p" ? "pour atteindre les protéines" : "pour compléter les lipides";

      return { key, pct: Math.round(pct), addGrams, reason };
    },
    [isBreakfast, rest.p, rest.c, rest.f, localAcc]
  );

  const adjustHints = useMemo(() => {
    const map = {};
    (localAcc || []).forEach((a) => {
      const h = computeAdjustHint(a);
      if (h) map[a?.ingredient?.id] = h;
    });
    return map;
  }, [localAcc, computeAdjustHint]);

  const bestAdjustTip = useMemo(() => {
    const needs = rest.p > 0 || rest.c > 0 || rest.f > 0;
    if (!needs) return null;

    const entries = (localAcc || [])
      .map((a) => {
        const h = adjustHints[a?.ingredient?.id];
        return h ? { ...h, ing: a?.ingredient } : null;
      })
      .filter(Boolean);

    const order = rest.c > 0 ? ["c", "p", "f"] : rest.p > 0 ? ["p", "c", "f"] : ["f", "c", "p"];
    for (const key of order) {
      const candidates = entries.filter((e) => e.key === key);
      if (candidates.length) {
        candidates.sort((a, b) => b.pct - a.pct);
        return candidates[0];
      }
    }
    return null;
  }, [rest, localAcc, adjustHints]);

  const [showPDJModal, setShowPDJModal] = useState(false);

  // ---------- Wrappers preserveScroll + guard + normalisation d'event ----------
  const onReplaceWrapped = useCallback(
    (...args) =>
      scrollGuard(() =>
        preserveScroll(() => handleReplace(...args), { anchor: cardRef.current })
      ),
    [handleReplace, scrollGuard]
  );

  const onDeleteWrapped = useCallback(
    (...args) =>
      scrollGuard(() =>
        preserveScroll(async () => {
          // Supporte onDelete(e, id) OU onDelete(id)
          let id = args[0];
          if (id && typeof id.preventDefault === "function") {
            id.preventDefault();
            id.stopPropagation?.();
            id = args[1];
          }
          await handleDelete(id);
        }, { anchor: cardRef.current })
      ),
    [handleDelete, scrollGuard]
  );

  const onAdjustWrapped = useCallback(
    (...args) =>
      scrollGuard(() =>
        preserveScroll(() => handleAdjust(...args), { anchor: cardRef.current })
      ),
    [handleAdjust, scrollGuard]
  );

  const AutoModalComponent = isSnack ? SnackAutoModal : BreakfastAutoModal;

  return (
    <div
      ref={cardRef}
      onClickCapture={onClickCaptureBlockHash}
      className="rounded-2xl border border-orange-100 bg-[#FFFBF7] p-6 shadow-sm"
    >
      <MealHeader repas={repas} onChangeClick={() => openModal?.(repas)} />
      <MealImage recette={recette} repasType={repas.repasType} />

      {recette?.id && (
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="line-clamp-2 text-base font-semibold text-gray-900">{recette.name}</p>
          <Link
            href={`/recettes/${recette.id}`}
            className="inline-flex items-center gap-1 rounded-full bg-[#fb8905] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#e07c04] cursor-pointer"
          >
            Voir <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      {scaledNow.dairyCapped && (
        <div className="mb-3 inline-flex w-full items-center gap-2 rounded-xl bg-orange-50 px-3 py-2 text-sm text-orange-900 ring-1 ring-orange-200">
          <Info className="h-4 w-4" />
          <span>Cap appliqué : produits laitiers limités à 150 g (hors fromages).</span>
        </div>
      )}

      <IngredientsBlock items={scaledNow.items} />

      <MacroBars
        pCon={pCon}
        cCon={cCon}
        fCon={fCon}
        calCon={calCon}
        pObj={pObj}
        cObj={cObj}
        fObj={fObj}
        calObj={calObj}
      />

      <InfoMessages calCon={calCon} calObj={calObj} requireVegetable={requireVegetable} />

      <div className="mb-2 text-xs text-gray-600">
        Il te manque <strong className="text-gray-900">{Math.round(rest.p)} g</strong> prot,
        <strong className="text-gray-900"> {Math.round(rest.c)} g</strong> gluc,
        <strong className="text-gray-900"> {Math.round(rest.f)} g</strong> lip.
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={async () => {
            if (canFruit || canDairy) {
              setShowPDJModal(true);
            } else {
              await scrollGuard(() =>
                preserveScroll(async () => {
                  await autoComplete();
                  await refetchAccompagnements(); // ← sync visuel sans reload
                }, { anchor: cardRef.current })
              );
            }
          }}
          className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white px-3.5 py-2 text-sm font-semibold text-gray-900 hover:bg-orange-50"
          title="Ajouter les accompagnements"
        >
          <Wand2 className="h-4 w-4" />
          Ajouter les accompagnements
        </button>

        {Boolean(localAcc?.length) && (
          <button
            type="button"
            onClick={async (e) => {
              e.preventDefault();
              e.stopPropagation();
              await scrollGuard(() =>
                preserveScroll(async () => {
                  await handleClearAll();
                }, { anchor: cardRef.current })
              );
            }}
            className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-white px-3.5 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
            title="Supprimer tous les accompagnements"
          >
            <Trash2 className="h-4 w-4" />
            Tout supprimer
          </button>
        )}
      </div>

      {bestAdjustTip && (
        <div className="mb-3 inline-flex w-full items-center gap-2 rounded-xl bg-orange-50 px-3 py-2 text-sm text-orange-900 ring-1 ring-orange-200">
          <Info className="h-4 w-4" />
          <span>
            Astuce : clique sur <strong>Ajuster</strong> à côté de «{bestAdjustTip.ing?.name}» — {bestAdjustTip.reason}{" "}
            <em>(+{bestAdjustTip.addGrams} g, ~{bestAdjustTip.pct}%)</em>.
          </span>
        </div>
      )}

      <AddedSidesList
        localAcc={localAcc}
        optionsForType={optionsForType}
        onReplace={onReplaceWrapped}
        onDelete={onDeleteWrapped}
        onAdjust={onAdjustWrapped}
        adjustHints={adjustHints}
      />

      <AutoModalComponent
        open={showPDJModal}
        onClose={() => setShowPDJModal(false)}
        canFruit={canFruit}
        canDairy={canDairy}
        dairyBlockedReason={dairyBlockedReason}
        repasType={repas.repasType}
        onSubmit={async ({ preferFruit, preferDairy }) => {
          await scrollGuard(() =>
            preserveScroll(async () => {
              await autoComplete({ preferFruit, preferDairy, canFruit, canDairy });
              await refetchAccompagnements(); // ← sync visuel sans reload
            }, { anchor: cardRef.current })
          );
          setShowPDJModal(false);
        }}
      />
    </div>
  );
}

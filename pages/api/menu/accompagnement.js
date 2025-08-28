// pages/api/menu/accompagnement.js
import prisma from "../../../lib/prisma";
import { startOfDay, endOfDay } from "date-fns";

// --- Constantes règles ---
const REPARTITION = {
  "petit-dejeuner": 0.3,
  dejeuner: 0.4,
  collation: 0.05,
  diner: 0.25,
};
const CHEESE_DAILY_CAP = 30;      // g par jour (recette + accompagnements)
const FRUIT_CAP = 100;            // g par repas, partagé entre tous les fruits
const FAT_CAP = 80;
const BULK_CAP = 400;             // CEREAL/CARB/PROTEIN/BREAKFAST_PROTEIN

// --- Helpers types ---
const hasSide = (ing, key) =>
  (ing?.sideTypes || []).some((st) => (typeof st === "string" ? st === key : st?.sideType === key));

const isCheese = (ing) =>
  hasSide(ing, "CHEESE") ||
  /fromage(?!\s*blanc)|parmesan|emmental|gruy[eè]re|comt[ée]|mozzarella|cheddar|raclette|cantal|brie|camembert|feta|pecorino|roquefort|reblochon|tomme|gorgonzola|ricotta|mascarpone|philadelphia|r[aâ]p[ée]/i.test(
    ing?.name || ""
  );

const isNonCheeseDairy = (ing) => hasSide(ing, "DAIRY") && !isCheese(ing);
const isProteinSide = (ing) => hasSide(ing, "PROTEIN") || hasSide(ing, "BREAKFAST_PROTEIN");

const primaryTypeOf = (ing) => {
  const order = [
    "VEGETABLE_SIDE",
    "FRUIT_SIDE",
    "DAIRY",
    "CEREAL",
    "CARB",
    "PROTEIN",
    "BREAKFAST_PROTEIN",
    "FAT",
  ];
  const sts = ing?.sideTypes || [];
  for (const t of order) {
    if (sts.includes?.(t) || sts.some?.((s) => s?.sideType === t)) return t;
  }
  return sts[0]?.sideType || sts[0] || null;
};

// Macros utilitaires
const macrosOf = (ing, qty) => {
  const f = (qty || 0) / 100;
  return {
    p: (ing?.protein || 0) * f,
    c: (ing?.carbs || 0) * f,
    f: (ing?.fat || 0) * f,
    cal: (ing?.calories || 0) * f,
  };
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Méthode ${req.method} non autorisée`);
  }

  try {
    const {
      repasId,
      ingredientId,
      quantity,         // demandé (facultatif)
      type,             // hint du front (facultatif)
      mode = "add",     // "add" | "set"
      current = [],     // [{ ingredientId, quantity, sideTypes }]
      recipeFactor,
    } = req.body || {};

    if (!repasId || !ingredientId) {
      return res.status(400).json({ error: "Paramètres manquants (repasId, ingredientId)." });
    }

    // 1) Charger le repas + recette + accompagnements + user
    const repas = await prisma.menuJournalier.findUnique({
      where: { id: repasId },
      include: {
        user: true,
        recette: {
          include: {
            ingredients: {
              include: { ingredient: { include: { sideTypes: true } } },
            },
          },
        },
        accompagnements: {
          include: { ingredient: { include: { sideTypes: true } } },
        },
      },
    });
    if (!repas) return res.status(404).json({ error: "Repas introuvable." });

    const user = repas.user;
    const recette = repas.recette;
    const rf = Number.isFinite(recipeFactor) ? recipeFactor : (repas.recipeFactor ?? 1);
    const isBreakfast = repas.repasType === "petit-dejeuner";

    // 2) Charger l’ingrédient à traiter
    const ing = await prisma.ingredient.findUnique({
      where: { id: ingredientId },
      include: { sideTypes: true },
    });
    if (!ing) return res.status(404).json({ error: "Ingrédient introuvable." });

    const addingIsCheese = isCheese(ing);
    const addingIsNonCheeseDairy = isNonCheeseDairy(ing);
    const addingIsDairyAny = addingIsCheese || addingIsNonCheeseDairy;
    const t = type || primaryTypeOf(ing);

    // 3) RÈGLES LAITIERS / FROMAGES / PDJ
    const recipeHasCheese = !!(recette?.ingredients || []).some((ri) => isCheese(ri.ingredient));
    const recipeHasNonCheeseDairy = !!(recette?.ingredients || []).some((ri) => isNonCheeseDairy(ri.ingredient));
    const recipeHasAnyDairy = recipeHasCheese || recipeHasNonCheeseDairy;

    const accHasCheese = (repas.accompagnements || []).some((a) => isCheese(a.ingredient));
    const accHasNonCheeseDairy = (repas.accompagnements || []).some((a) => isNonCheeseDairy(a.ingredient));

    // 3.a) Blocage laitier si laitier dans la RECETTE — uniquement AU PETIT-DÉJEUNER
    if (isBreakfast && recipeHasAnyDairy && addingIsDairyAny) {
      return res.status(400).json({
        error:
          "Un produit laitier est déjà présent dans la recette — ajout d’un laitier en accompagnement interdit au petit-déjeuner.",
        code: "DAIRY_IN_RECIPE_BREAKFAST",
      });
    }

    // 3.b) Exclusivité fromage ↔ autre laitier dans les accompagnements (toute la journée)
    if (addingIsCheese && accHasNonCheeseDairy) {
      return res.status(400).json({
        error: "Un produit laitier (hors fromage) est déjà ajouté — on ne peut pas ajouter de fromage.",
        code: "DAIRY_MUTUAL_EXCLUSION",
      });
    }
    if (addingIsNonCheeseDairy && accHasCheese) {
      return res.status(400).json({
        error: "Un fromage est déjà ajouté — on ne peut pas ajouter un autre produit laitier.",
        code: "DAIRY_MUTUAL_EXCLUSION",
      });
    }

    // 3.c) Petit-déjeuner : une seule source protéique en accompagnement
    const accHasProteinSide = (repas.accompagnements || []).some((a) => isProteinSide(a.ingredient));
    if (isBreakfast && isProteinSide(ing) && accHasProteinSide) {
      return res.status(400).json({
        error: "Petit-déjeuner : une seule source de protéine en accompagnement est autorisée.",
        code: "BREAKFAST_ONE_PROTEIN",
      });
    }

    // 4) CAP fromage / jour (recette + accompagnements)
    const dayStart = startOfDay(repas.date);
    const dayEnd = endOfDay(repas.date);
    const menusOfDay = await prisma.menuJournalier.findMany({
      where: { userId: repas.userId, date: { gte: dayStart, lte: dayEnd } },
      include: {
        recette: {
          include: {
            ingredients: { include: { ingredient: { include: { sideTypes: true } } } },
          },
        },
        accompagnements: {
          include: { ingredient: { include: { sideTypes: true } } },
        },
      },
    });
    const dayCheese = menusOfDay.reduce((sum, m) => {
      const rff = m.recipeFactor ?? 1;
      const fromRecipe =
        (m.recette?.ingredients || []).reduce((s, ri) => (isCheese(ri.ingredient) ? s + (ri.quantity || 0) * rff : s), 0) || 0;
      const fromAcc =
        (m.accompagnements || []).reduce((s, a) => (isCheese(a.ingredient) ? s + (a.quantity || 0) : s), 0) || 0;
      return sum + fromRecipe + fromAcc;
    }, 0);

    // 5) Cibles macros de ce repas
    const ratio = REPARTITION[repas.repasType] || 0;
    const pObj = user.poids * 1.8 * ratio;
    const fObj = ((user.metabolismeCible || 0) * 0.3) / 9 * ratio;
    const cObj =
      ((user.metabolismeCible || 0) - user.poids * 1.8 * 4 - (user.metabolismeCible || 0) * 0.3) / 4 * ratio;

    // 6) Couvert actuel (recette scalée + accompagnements)
    let pHave = 0, fHave = 0, cHave = 0;
    (recette?.ingredients || []).forEach((ri) => {
      const qty = (ri.quantity || 0) * rf;
      const m = macrosOf(ri.ingredient, qty);
      pHave += m.p; fHave += m.f; cHave += m.c;
    });
    (repas.accompagnements || []).forEach((a) => {
      const m = macrosOf(a.ingredient, a.quantity || 0);
      pHave += m.p; fHave += m.f; cHave += m.c;
    });

    const missP = Math.max(0, pObj - pHave);
    const missF = Math.max(0, fObj - fHave);
    const missC = Math.max(0, cObj - cHave);

    // 7) Calcul / normalisation quantité demandée
    const per100 = {
      p: (ing.protein || 0) / 100,
      c: (ing.carbs || 0) / 100,
      f: (ing.fat || 0) / 100,
    };

    let qty = Number.isFinite(quantity) && quantity > 0 ? Math.floor(quantity) : null;

    if (mode === "add" && (!qty || qty <= 0)) {
      if (t === "VEGETABLE_SIDE") qty = 150;
      else if (t === "FRUIT_SIDE") qty = FRUIT_CAP;
      else if (isNonCheeseDairy(ing)) qty = 100;
      else if (isCheese(ing)) qty = 20;
      else if (t === "CEREAL" || t === "CARB") qty = per100.c > 0 ? Math.floor(missC / per100.c) : 0;
      else if (t === "FAT") qty = per100.f > 0 ? Math.floor(missF / per100.f) : 0;
      else if (t === "PROTEIN" || t === "BREAKFAST_PROTEIN") qty = per100.p > 0 ? Math.floor(missP / per100.p) : 0;
      else qty = 0;
    }

    // 8) Clamps génériques (sera re-clampé plus bas si "set")
    if (t === "FRUIT_SIDE" && qty > FRUIT_CAP) qty = FRUIT_CAP;
    if (t === "FAT" && qty > FAT_CAP) qty = FAT_CAP;
    if (["CEREAL","CARB","PROTEIN","BREAKFAST_PROTEIN"].includes(t) && qty > BULK_CAP) qty = BULK_CAP;

    // 9) Cap fromage / jour (pré-limitation)
    if (isCheese(ing)) {
      const remaining = Math.max(0, CHEESE_DAILY_CAP - dayCheese);
      if (remaining <= 0) {
        return res.status(400).json({
          error: `Fromage : limite journalière de ${CHEESE_DAILY_CAP} g atteinte.`,
          code: "CHEESE_DAILY_CAP",
        });
      }
      if (qty && qty > remaining) qty = remaining;
    }

    // 10) Récupérer ligne existante si présente
    const existing = await prisma.accompagnement.findFirst({
      where: { menuId: repasId, ingredientId },
      include: { ingredient: { include: { sideTypes: true } } },
    });

    // 11) Mode SET — quantité finale demandée
    if (mode === "set") {
      let finalQty = Math.max(1, Math.floor(qty || 0));

      // FRUIT : clamp à (100 - autres fruits du repas)
      if (t === "FRUIT_SIDE") {
        // somme des autres fruits (recette + acc + éventuellement “current” si fourni)
        const fruitsInRecipe =
          (recette?.ingredients || []).reduce((s, ri) => {
            const st = ri.ingredient?.sideTypes || [];
            const isFruit = st.includes?.("FRUIT_SIDE") || st.some?.((x) => x?.sideType === "FRUIT_SIDE");
            return isFruit ? s + Math.round((ri.quantity || 0) * rf) : s;
          }, 0) || 0;

        const fruitsInAcc =
          (repas.accompagnements || []).reduce((s, a) => {
            const st = a?.ingredient?.sideTypes || [];
            const isFruit = st.includes?.("FRUIT_SIDE") || st.some?.((x) => x?.sideType === "FRUIT_SIDE");
            if (!isFruit) return s;
            // on enlève la quantité de CE même ingrédient si existant : on veut “autres fruits”
            return a.ingredientId === ingredientId ? s : s + Math.round(a.quantity || 0);
          }, 0) || 0;

        const fruitsFromCurrent =
          (current || []).reduce((s, a) => {
            const st = a?.sideTypes || [];
            const types = st.map((x) => (typeof x === "string" ? x : x?.sideType));
            const isFruit = types.includes("FRUIT_SIDE");
            if (!isFruit) return s;
            return a.ingredientId === ingredientId ? s : s + Math.round(a.quantity || 0);
          }, 0) || 0;

        const otherFruits = fruitsInRecipe + fruitsInAcc + fruitsFromCurrent;
        const remain = Math.max(0, FRUIT_CAP - otherFruits);
        finalQty = Math.min(finalQty, remain);
      }

      // CHEESE : clamp sur quota journée en tenant compte de l’existant
      if (isCheese(ing)) {
        const prev = existing?.quantity || 0;
        const maxFinal = Math.max(0, CHEESE_DAILY_CAP - (dayCheese - prev));
        finalQty = Math.min(finalQty, maxFinal);
      }

      // autres clamps
      if (t === "FAT") finalQty = Math.min(finalQty, FAT_CAP);
      if (["CEREAL","CARB","PROTEIN","BREAKFAST_PROTEIN"].includes(t)) finalQty = Math.min(finalQty, BULK_CAP);

      if (finalQty <= 0) {
        return res.status(200).json({ ok: false, reason: "NO_ROOM_OR_CAP", qty: 0 });
      }

      const row = await prisma.accompagnement.upsert({
        where: { menuId_ingredientId: { menuId: repasId, ingredientId } },
        update: { quantity: finalQty },
        create: { menu: { connect: { id: repasId } }, ingredient: { connect: { id: ingredientId } }, quantity: finalQty },
        include: { ingredient: true },
      });

      return res.status(200).json({ ok: true, quantity: row.quantity });
    }

    // ===== Mode ADD (historique) =====
    if (!qty || qty <= 0) {
      return res.status(400).json({
        error: "Rien à ajouter pour cet ingrédient (quantité calculée = 0).",
        code: "NOTHING_TO_ADD",
      });
    }

    // Fruit : en mode add, clamp au reste disponible (100 - autres fruits + quantité existante de ce fruit)
    if (t === "FRUIT_SIDE") {
      const otherFruits =
        (recette?.ingredients || []).reduce((s, ri) => {
          const st = ri.ingredient?.sideTypes || [];
          const isFruit = st.includes?.("FRUIT_SIDE") || st.some?.((x) => x?.sideType === "FRUIT_SIDE");
          return isFruit ? s + Math.round((ri.quantity || 0) * rf) : s;
        }, 0) +
        (repas.accompagnements || []).reduce((s, a) => {
          const st = a?.ingredient?.sideTypes || [];
          const isFruit = st.includes?.("FRUIT_SIDE") || st.some?.((x) => x?.sideType === "FRUIT_SIDE");
          if (!isFruit) return s;
          return a.ingredientId === ingredientId ? s : s + Math.round(a.quantity || 0);
        }, 0);

      const remain = Math.max(0, FRUIT_CAP - otherFruits);
      qty = Math.min(qty, remain);
      if (qty <= 0) return res.status(200).json({ ok: false, reason: "FRUIT_CAP", qty: 0 });
    }

    // Fromage : re-clamp sur quota restant (cheese/day)
    if (isCheese(ing)) {
      const remaining = Math.max(0, CHEESE_DAILY_CAP - dayCheese);
      if (remaining <= 0) {
        return res.status(400).json({
          error: `Fromage : limite journalière de ${CHEESE_DAILY_CAP} g atteinte.`,
          code: "CHEESE_DAILY_CAP",
        });
      }
      qty = Math.min(qty, remaining);
      if (qty <= 0) return res.status(200).json({ ok: false, reason: "CHEESE_CAP", qty: 0 });
    }

    // Upsert: si déjà présent, on remplace par la quantité finale (idempotent)
    const row = await prisma.accompagnement.upsert({
      where: { menuId_ingredientId: { menuId: repasId, ingredientId } },
      update: { quantity: Math.round(qty) },
      create: { menu: { connect: { id: repasId } }, ingredient: { connect: { id: ingredientId } }, quantity: Math.round(qty) },
      include: { ingredient: true },
    });

    return res.status(200).json({ ok: true, quantity: row.quantity });
  } catch (error) {
    console.error("❌ Erreur serveur API accompagnement :", error);
    if (error?.code === "P2002") {
      return res.status(409).json({
        error: "Cet accompagnement existe déjà pour ce repas.",
        code: "DUPLICATE",
      });
    }
    return res.status(500).json({ error: "Erreur serveur" });
  }
}

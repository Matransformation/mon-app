// File: hooks/useAccompagnements.js
import { useEffect, useState } from "react";
import axios from "axios";
import { computeProteinOnlyQty } from "../utils/macros";
import { startOfWeek } from "date-fns";

const CHEESE_DAILY_CAP = 30; // g (fromages uniquement)
const FRUIT_MAX = 100;       // g max partagé par repas pour les fruits

// Mini “utiles” pour éviter les miettes ridicules (en mode add auto)
const MIN_QTY = {
  FRUIT_SIDE: 40,   // ex. demi-fruit si besoin
  CEREAL: 30,
  CARB: 30,
  FAT: 10,
};

/* Utilitaires */
function computeOnlyQty(missing, per100g) {
  if (!per100g || per100g <= 0) return 0;
  return Math.floor((missing * 100) / per100g);
}

const isCheese = (ing) =>
  (ing?.sideTypes || []).includes("CHEESE") ||
  /fromage(?!\s*blanc)|parmesan|emmental|gruy[eè]re|comt[ée]|mozzarella|cheddar|raclette|cantal|brie|camembert|feta|pecorino|roquefort|reblochon|tomme|gorgonzola|ricotta|mascarpone|philadelphia|r[aâ]p[ée]/i.test(
    ing?.name || ""
  );

const isNonCheeseDairy = (ing) => {
  const st = ing?.sideTypes || [];
  return st.includes("DAIRY") && !st.includes("CHEESE");
};

const formatDateLocal = (date) =>
  date.getFullYear() +
  "-" +
  String(date.getMonth() + 1).padStart(2, "0") +
  "-" +
  String(date.getDate()).padStart(2, "0");

/**
 * Somme des fromages (recette + accompagnements) pour la journée.
 * Utilise l’API /api/menu/[userId].
 */
const getDailyCheeseIncludingRecipe = async (userId, dateLike) => {
  try {
    const d = new Date(dateLike);
    const weekStart = startOfWeek(d, { weekStartsOn: 1 });
    const { data: weekMenu } = await axios.get(`/api/menu/${userId}`, {
      params: { weekStart: formatDateLocal(weekStart) },
    });

    let total = 0;
    (weekMenu || [])
      .filter((item) => new Date(item.date).toDateString() === d.toDateString())
      .forEach((repas) => {
        // Fromages dans la RECETTE
        (repas.recette?.ingredients || []).forEach((ri) => {
          if (isCheese(ri.ingredient)) total += ri.quantity || 0;
        });
        // Fromages dans les ACCOMPAGNEMENTS
        (repas.accompagnements || []).forEach((a) => {
          if (isCheese(a.ingredient)) total += a.quantity || 0;
        });
      });

    return total; // g
  } catch (e) {
    console.warn("Cheese/day fetch failed:", e?.message || e);
    return 0; // fallback permissif
  }
};

export default function useAccompagnements({ user, reload }) {
  const [allIngredients, setAllIngredients] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1) Charger tous les ingrédients
  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get("/api/ingredients");
        setAllIngredients(data || []);
      } catch (err) {
        console.error("Erreur chargement ingrédients :", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /**
   * 2) Ajouter / Mettre à jour un accompagnement avec règles
   * - si choix = { TYPE: id }  => mode "add"
   * - si choix = { TYPE: { id, quantity } } => mode "set" (mise à jour de la quantité finale)
   *
   * Retourne au minimum { qty } (>0 si succès) + éventuellement { quantity } pour compat UI.
   */
  const applyAccompagnements = async (repas, choix) => {
    const [type] = Object.keys(choix || {});
    const value = choix[type];

    const id = typeof value === "object" && value !== null ? value.id : value;
    const quantityFromCaller =
      typeof value === "object" && value !== null && Number.isFinite(value.quantity)
        ? Math.max(1, Math.round(value.quantity))
        : null;

    if (!type || !id) return { qty: 0, reason: "Sélection invalide." };

    // Ingrédient choisi
    const ing = allIngredients.find((i) => i.id === id);
    if (!ing) return { qty: 0, reason: "Ingrédient introuvable." };

    // === RÈGLES LAITIERS (exclusions de “type”) ===
    const recipeHasCheese = !!(repas.recette?.ingredients || []).some((ri) => isCheese(ri.ingredient));
    const recipeHasNonCheeseDairy = !!(repas.recette?.ingredients || []).some((ri) => isNonCheeseDairy(ri.ingredient));
    const accHasCheese = !!(repas.accompagnements || []).some((a) => isCheese(a.ingredient));
    const accHasNonCheeseDairy = !!(repas.accompagnements || []).some((a) => isNonCheeseDairy(a.ingredient));

    const newIsCheese = isCheese(ing);
    const newIsNonCheeseDairy = isNonCheeseDairy(ing);

    if (type === "DAIRY" && (recipeHasCheese || recipeHasNonCheeseDairy)) {
      return { qty: 0, reason: "Un produit laitier est déjà présent dans la recette." };
    }
    if (type === "DAIRY") {
      if (accHasCheese && newIsNonCheeseDairy) {
        return { qty: 0, reason: "Déjà du fromage ajouté : pas d’autre laitier possible." };
      }
      if (accHasNonCheeseDairy && newIsCheese) {
        return { qty: 0, reason: "Déjà un produit laitier (hors fromage) : pas de fromage en plus." };
      }
    }

    // === Objectifs du repas ===
    const repartition = { "petit-dejeuner": 0.3, dejeuner: 0.4, collation: 0.05, diner: 0.25 };
    const ratio = repartition[repas.repasType] || 0;
    const objP = Math.round(user.poids * 1.8 * ratio);
    const objF = Math.round(((user.metabolismeCible || 0) * 0.3) / 9 * ratio);
    const objC = Math.round(
      (((user.metabolismeCible || 0) - user.poids * 1.8 * 4 - (user.metabolismeCible || 0) * 0.3) / 4) * ratio
    );

    // Couvert (recette * factor + accompagnements)
    let gotP = 0, gotF = 0, gotC = 0;
    (repas.recette?.ingredients || []).forEach((ri) => {
      const f = ((ri.quantity || 0) * (repas.recipeFactor || 1)) / 100;
      gotP += (ri.ingredient.protein || 0) * f;
      gotF += (ri.ingredient.fat || 0) * f;
      gotC += (ri.ingredient.carbs || 0) * f;
    });
    (repas.accompagnements || []).forEach((a) => {
      const f = (a.quantity || 0) / 100;
      gotP += (a.ingredient.protein || 0) * f;
      gotF += (a.ingredient.fat || 0) * f;
      gotC += (a.ingredient.carbs || 0) * f;
    });

    const missP = Math.max(0, objP - gotP);
    const missF = Math.max(0, objF - gotF);
    const missC = Math.max(0, objC - gotC);

    // === Quantité (si mode add) ===
    let quantity = quantityFromCaller; // si fourni ⇒ mode "set"
    if (!Number.isFinite(quantity) || quantity <= 0) {
      switch (type) {
        case "DAIRY": {
          quantity = newIsCheese ? 20 : 100;
          break;
        }
        case "FRUIT_SIDE": {
          quantity = computeOnlyQty(missC, ing.carbs);
          if (quantity > 0 && quantity < (MIN_QTY.FRUIT_SIDE || 0)) quantity = MIN_QTY.FRUIT_SIDE;
          quantity = Math.min(FRUIT_MAX, quantity);
          break;
        }
        case "VEGETABLE_SIDE":
          quantity = 150; break;
        case "PROTEIN":
        case "BREAKFAST_PROTEIN":
          quantity = computeProteinOnlyQty(missP, { protein: ing.protein, fat: ing.fat, carbs: ing.carbs });
          break;
        case "CARB":
        case "CEREAL":
          quantity = computeOnlyQty(missC, ing.carbs);
          if (quantity > 0 && quantity < (MIN_QTY.CEREAL || 0)) quantity = MIN_QTY.CEREAL;
          break;
        case "FAT":
          quantity = computeOnlyQty(missF, ing.fat);
          if (quantity > 0 && quantity < (MIN_QTY.FAT || 0)) quantity = MIN_QTY.FAT;
          break;
        default:
          quantity = 0;
      }
    }

    // === CAP JOURNALIER FROMAGE (pré-filtre UI pour “add”) ===
    if (newIsCheese && (!quantityFromCaller || quantityFromCaller > 0)) {
      const dayCheese = await getDailyCheeseIncludingRecipe(user.id, repas.date);
      const remaining = Math.max(0, CHEESE_DAILY_CAP - dayCheese);
      if (remaining <= 0) return { qty: 0, reason: `Limite quotidienne de fromage (${CHEESE_DAILY_CAP} g) déjà atteinte.` };
      if (!quantityFromCaller && quantity > remaining) quantity = remaining;
    }

    // ==== APPEL API ====
    try {
      const mode = Number.isFinite(quantityFromCaller) && quantityFromCaller > 0 ? "set" : "add";

      const payload = {
        repasId: repas.id,
        ingredientId: id,
        type,
        mode,
        // quantité demandée si "set" ou si "add" avec calcul local
        quantity: Math.max(0, Math.round(quantity || 0)) || undefined,
        // contexte pour clamp côté serveur (fruit partagé, etc.)
        current: (repas.accompagnements || []).map((a) => ({
          ingredientId: a?.ingredient?.id,
          quantity: Math.floor(a?.quantity || 0),
          sideTypes: a?.ingredient?.sideTypes || [],
        })),
        recipeFactor: repas.recipeFactor || 1,
      };

      const { data } = await axios.post("/api/menu/accompagnement", payload);

      // data peut être la ligne prisma avec { quantity }, ou { ok, quantity }, etc.
      const qty =
        (typeof data === "object" && (data.quantity ?? data.quantityUsed ?? data.qty)) ||
        (Number.isFinite(data) ? Number(data) : 0);

      if (qty > 0) {
        reload();
        return { qty, quantity: qty };
      }
      return { qty: 0, reason: data?.reason || "Ajustement non appliqué." };
    } catch (err) {
      const reason = err?.response?.data?.error || err?.response?.data?.reason || err.message || "Erreur serveur";
      console.error("❌ Erreur ajout/maj accompagnement :", reason);
      return { qty: 0, reason };
    }
  };

  // 3) Supprimer un accompagnement
  const removeAccompagnements = async (repas, ingredientId) => {
    try {
      await axios.delete(`/api/menu/repas/${repas.id}/accompagnements/${ingredientId}`);
      reload();
    } catch (err) {
      console.error("Erreur suppression accompagnement :", err);
    }
  };

  return {
    loading,
    allIngredients,
    applyAccompagnements,
    removeAccompagnements,
  };
}

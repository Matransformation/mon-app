// File: hooks/useAccompagnements.js
import { useEffect, useState } from "react";
import axios from "axios";
import { computeProteinOnlyQty } from "../utils/macros";

/**
 * Calcule la quantité à ajouter pour combler un déficit de glucides ou lipides.
 */
function computeOnlyQty(missing, per100g) {
  if (!per100g || per100g <= 0) return 0;
  return Math.floor((missing * 100) / per100g);
}

export default function useAccompagnements({ user, reload }) {
  const [allIngredients, setAllIngredients] = useState([]);
  const [loading, setLoading] = useState(true);

  // ─── 1) Charger tous les ingrédients ───────────────────────────────
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

  // ─── 2) Ajouter un accompagnement optimisé ───────────────────────────
  const applyAccompagnements = async (repas, choix) => {
    const [type] = Object.keys(choix);
    const value  = choix[type];
    const id     = typeof value === "object" ? value.id : value;

    // récupérer l’ingrédient
    const ing = allIngredients.find((i) => i.id === id);
    if (!ing) {
      console.error("Ingrédient introuvable :", id);
      return;
    }

    // calculer les objectifs de ce repas
    const repartition = {
      "petit-dejeuner": 0.3,
      dejeuner:         0.4,
      collation:        0.05,
      diner:            0.25,
    };
    const ratio  = repartition[repas.repasType] || 0;
    const objP   = Math.round(user.poids * 1.8 * ratio);
    const objF   = Math.round((user.metabolismeCible * 0.3 / 9) * ratio);
    const objC   = Math.round(
      ((user.metabolismeCible - user.poids * 1.8 * 4 - user.metabolismeCible * 0.3) / 4) * ratio
    );

    // calculer ce qui est déjà couvert
    let gotP = 0, gotF = 0, gotC = 0;
    (repas.recette?.ingredients || []).forEach((ri) => {
      const f = ((ri.quantity || 0) * (repas.recipeFactor || 1)) / 100;
      gotP += ri.ingredient.protein * f;
      gotF += ri.ingredient.fat     * f;
      gotC += ri.ingredient.carbs   * f;
    });
    (repas.accompagnements || []).forEach((a) => {
      const f = (a.quantity || 0) / 100;
      gotP += a.ingredient.protein * f;
      gotF += a.ingredient.fat     * f;
      gotC += a.ingredient.carbs   * f;
    });

    const missP = Math.max(0, objP - gotP);
    const missF = Math.max(0, objF - gotF);
    const missC = Math.max(0, objC - gotC);

    // déterminer la quantité à ajouter
    let quantity = 0;
    switch (type) {
      case "DAIRY":
      case "FRUIT_SIDE":
        quantity = 100;
        break;
      case "VEGETABLE_SIDE":
        quantity = 150;
        break;
      case "PROTEIN":
      case "BREAKFAST_PROTEIN":
        quantity = computeProteinOnlyQty(missP, {
          protein: ing.protein,
          fat:     ing.fat,
          carbs:   ing.carbs,
        });
        break;
      case "CARB":
      case "CEREAL":
        quantity = computeOnlyQty(missC, ing.carbs);
        break;
      case "FAT":
        quantity = computeOnlyQty(missF, ing.fat);
        break;
      default:
        quantity = 0;
    }

    if (quantity <= 0) {
      console.log(`💡 Rien à ajouter pour ${type} (quantité calculée = ${quantity})`);
      return;
    }

    // envoyer à l’API
    try {
      await axios.post("/api/menu/accompagnement", {
        repasId:      repas.id,
        ingredientId: id,
        quantity,
      });
      reload();
    } catch (err) {
      console.error("❌ Erreur ajout accompagnement :", err.response?.data || err.message);
    }
  };

  // ─── 3) Supprimer un accompagnement ─────────────────────────────────
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

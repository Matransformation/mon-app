import axios from "axios";
import { computeRecipeAndSide, computeProteinOnlyQty } from "../utils/macros";

const repartitionRepas = {
  "petit-dejeuner": 0.3,
  dejeuner:         0.4,
  collation:        0.05,
  diner:            0.25,
};

export default function useAccompagnements({
  user,
  allIngredients,
  proteinRichOptions,
  reload,
}) {
  /**
   * Ajoute / remplace les accompagnements choisis pour un repas
   * @param {object} repas   l’objet repas tel que renvoyé par l’API
   * @param {object} choix   { DAIRY?, BREAKFAST_PROTEIN?, VEGETABLE_SIDE?, FRUIT_SIDE?, FAT? }
   */
  const applyAccompagnements = async (repas, choix = {}) => {
    const existing = repas.accompagnements || [];
    const toSend = [];

    // 1) Conserver ceux qui ne sont pas remplacés
    existing.forEach(a => {
      const type = a.ingredient.sideTypes[0]?.sideType;
      if (!choix[type]) {
        toSend.push({ id: a.ingredient.id, quantity: a.quantity });
      }
    });

    // 2) Toujours DAIRY en 1er (100g)
    if (choix.DAIRY) {
      toSend.push({ id: choix.DAIRY, quantity: 100 });
    }

    // 3) Calcul macros de base + DAIRY
    const recetteIngredients = repas.recette?.ingredients || [];
    const raw = recetteIngredients.reduce((sum, ri) => ({
      p: sum.p + ri.ingredient.protein * ri.quantity / 100,
      f: sum.f + ri.ingredient.fat     * ri.quantity / 100,
      g: sum.g + ri.ingredient.carbs   * ri.quantity / 100,
      c: sum.c + ri.ingredient.calories* ri.quantity / 100,
    }), { p: 0, f: 0, g: 0, c: 0 });

    const dairyMacro = toSend.reduce((sum, a) => {
      const i = allIngredients.find(x => x.id === a.id) || {};
      return {
        p: sum.p + (i.protein || 0) * a.quantity / 100,
        f: sum.f + (i.fat     || 0) * a.quantity / 100,
        g: sum.g + (i.carbs   || 0) * a.quantity / 100,
      };
    }, { p: 0, f: 0, g: 0 });

    // 4) Objectifs pour ce repas
    const obj = {
      p: user.poids * 1.8 * repartitionRepas[repas.repasType],
      f: (user.metabolismeCible * 0.3 / 9) * repartitionRepas[repas.repasType],
      g: ((user.metabolismeCible - user.poids * 1.8 * 4 - user.metabolismeCible * 0.3) / 4)
         * repartitionRepas[repas.repasType],
    };

    // 5) Ajout de la protéine (BREAKFAST_PROTEIN) — prise en compte des œufs
    if (choix.BREAKFAST_PROTEIN) {
      const sideIng = proteinRichOptions.find(i => i.id === choix.BREAKFAST_PROTEIN);
      if (sideIng) {
        let qty = 0;

        // Si c'est un œuf, on ajoute 50 g (1 œuf) ou multiples de 50 g
        if (sideIng.name.toLowerCase().includes("oeuf")) {
          qty = 50;
        } else {
          const scalable = repas.recette?.scalable !== false;
          if (scalable) {
            const { sideQty } = computeRecipeAndSide(
              { p: raw.p + dairyMacro.p, f: raw.f + dairyMacro.f, g: raw.g + dairyMacro.g },
              obj,
              { protein: sideIng.protein, fat: sideIng.fat, carbs: sideIng.carbs }
            );
            qty = sideQty;
          } else {
            const afterP = raw.p + dairyMacro.p;
            const manqueP = Math.max(0, obj.p - afterP);
            qty = computeProteinOnlyQty(manqueP, sideIng);
          }
        }

        // si l'ajustement dépasse 0, on l'ajoute
        if (qty > 0) {
          // pour les œufs, arrondir à la dizaine de 50 g
          if (sideIng.name.toLowerCase().includes("oeuf")) {
            qty = Math.ceil(qty / 50) * 50;
          }
          toSend.push({ id: sideIng.id, quantity: qty });
        }
      }
    }

    // 6) Ajout des légumes, fruits et lipides si choisis
    if (choix.VEGETABLE_SIDE) {
      toSend.push({ id: choix.VEGETABLE_SIDE, quantity: 150 });
    }
    if (choix.FRUIT_SIDE) {
      toSend.push({ id: choix.FRUIT_SIDE, quantity: 100 });
    }
    if (choix.FAT) {
      toSend.push({ id: choix.FAT, quantity: 15 });
    }

    // 7) Envoi à l’API
    const body = { accompagnements: toSend };
    if (repas.recette?.id) {
      body.recetteId = repas.recette.id;
    }
    await axios.put(`/api/menu/repas/${repas.id}`, body);

    // 8) Reload du menu
    await reload();
  };

  /**
   * Enlève tous les accompagnements pour un repas
   */
  const removeAccompagnements = async (repas) => {
    const body = { accompagnements: [] };
    if (repas.recette?.id) {
      body.recetteId = repas.recette.id;
    }
    await axios.put(`/api/menu/repas/${repas.id}`, body);
    await reload();
  };

  return { applyAccompagnements, removeAccompagnements };
}

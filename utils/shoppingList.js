// utils/shoppingList.js
import slugify from "slugify";

/**
 * Parcourt le menu et agrège les quantités par ingrédient
 * @param {Array} menu         liste de vos repas (avec recette + accompagnements)
 * @param {Object} recipeRfMap optionnel, map { repasId: facteur de scaling }
 */
export function generateShoppingList(menu, recipeRfMap = {}) {
  const itemsMap = {};

  menu.forEach((repas) => {
    const rf = recipeRfMap[repas.id] || 1;

    // Ingrédients de la recette (scalés)
    repas.recette?.ingredients.forEach((ri) => {
      const qty = Math.round(ri.quantity * rf);
      const id = ri.ingredient.id;
      if (!itemsMap[id]) {
        itemsMap[id] = {
          id,
          name: ri.ingredient.name,
          unit: ri.ingredient.unit,
          quantity: 0,
          type: ri.ingredient.sideTypes[0]?.sideType || "Autre",
        };
      }
      itemsMap[id].quantity += qty;
    });

    // Accompagnements
    repas.accompagnements?.forEach((a) => {
      const id = a.ingredient.id;
      if (!itemsMap[id]) {
        itemsMap[id] = {
          id,
          name: a.ingredient.name,
          unit: a.ingredient.unit,
          quantity: 0,
          type: a.ingredient.sideTypes[0]?.sideType || "Autre",
        };
      }
      itemsMap[id].quantity += a.quantity;
    });
  });

  // Regrouper par type
  const grouped = {};
  Object.values(itemsMap).forEach((it) => {
    if (!grouped[it.type]) grouped[it.type] = [];
    grouped[it.type].push(it);
  });

  return grouped;
}

/**
 * Transforme le résultat groupé en Markdown (avec ancres slugifiées)
 * @param {Object} grouped résultat de generateShoppingList
 */
export function getShoppingListMarkdown(grouped) {
  let md = "";
  Object.entries(grouped).forEach(([type, items]) => {
    md += `## ${type}\n`;
    items.forEach((it) => {
      const slug = slugify(it.name, { lower: true, remove: /[*+~.()'"!:@]/g });
      md += `- [${it.name}](#ingredient-${slug}) — ${it.quantity}${it.unit}\n`;
    });
    md += `\n`;
  });
  return md;
}

// lib/menuGenerator.js

import prisma from "./prisma";
import { startOfWeek, endOfWeek, addDays } from "date-fns";

/**
 * Génère (ou régénère) le menu pour 7 jours de la semaine de `weekStartIso`
 * pour l'utilisateur `userId`.
 */
export async function generateWeeklyMenu(userId, weekStartIso) {
  // 1️⃣ Vérifier que l’utilisateur existe
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new Error("Utilisateur non trouvé.");
  }

  // 2️⃣ Calculer début et fin de la semaine ciblée
  const baseDate = weekStartIso ? new Date(weekStartIso) : new Date();
  const weekStart = startOfWeek(baseDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });

  // 3️⃣ Récupérer les menus existants pour cette semaine
  const existing = await prisma.menuJournalier.findMany({
    where: {
      userId,
      date: { gte: weekStart, lte: weekEnd },
    },
    select: { id: true },
  });
  const menuIds = existing.map((m) => m.id);

  // 4️⃣ Supprimer d’abord tous les accompagnements, puis les menus
  await prisma.$transaction([
    prisma.accompagnement.deleteMany({ where: { menuId: { in: menuIds } } }),
    prisma.menuJournalier.deleteMany({
      where: { userId, date: { gte: weekStart, lte: weekEnd } },
    }),
  ]);

  // 5️⃣ Préparer la répartition des macros par repas
  const repartition = {
    "petit-dejeuner": 0.3,
    dejeuner:         0.4,
    collation:        0.05,
    diner:            0.25,
  };

  // 6️⃣ Charger toutes les recettes et tous les ingrédients (pour collation)
  const [recettes, ingredients] = await Promise.all([
    prisma.recette.findMany({
      include: {
        categories: { include: { category: true } },
        ingredients: {
          include: { ingredient: { include: { sideTypes: true } } },
        },
        allowedSides: true,
      },
    }),
    prisma.ingredient.findMany({ include: { sideTypes: true } }),
  ]);

  // 7️⃣ Construire les créations : 7 jours × 4 repas
  const creations = [];
  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const date = addDays(weekStart, dayOffset);

    for (const repasType of Object.keys(repartition)) {
      const data = {
        user:      { connect: { id: userId } },
        date,
        repasType,
      };

      // 👉 7.1 Sélection de la recette (hors collation)
      let recette = null;
      if (repasType !== "collation") {
        const pool = recettes.filter((r) => {
          const cats = r.categories.map((c) =>
            c.category.name.toLowerCase()
          );
          if (repasType === "petit-dejeuner") {
            return cats.includes("petit déjeuner");
          }
          return !cats.includes("petit déjeuner") && !cats.includes("collation");
        });
        if (pool.length) {
          recette = pool[Math.floor(Math.random() * pool.length)];
        }
      }

      // 👉 7.2 Si on a une recette : ajuster macros et connecter
      if (recette) {
        const hasEgg = recette.ingredients.some((ri) =>
          ri.ingredient.name.toLowerCase().includes("oeuf")
        );

        if (!hasEgg) {
          // Calcul des totaux macros
          const totals = recette.ingredients.reduce(
            (tot, ri) => ({
              p: tot.p + (ri.ingredient.protein * ri.quantity) / 100,
              f: tot.f + (ri.ingredient.fat     * ri.quantity) / 100,
              g: tot.g + (ri.ingredient.carbs   * ri.quantity) / 100,
            }),
            { p: 0, f: 0, g: 0 }
          );

          // Objectifs par macro
          const target = {
            p: user.poids * 1.8 * repartition[repasType],
            f: ((user.metabolismeCible * 0.3) / 9) * repartition[repasType],
            g: (
              (user.metabolismeCible -
                user.poids * 1.8 * 4 -
                user.metabolismeCible * 0.3) / 4
            ) * repartition[repasType],
          };

          // Facteur minimal
          let factor = Math.min(
            target.p / totals.p,
            target.f / totals.f,
            target.g / totals.g
          );

          // Clamp DAIRY à 150g
          recette.ingredients.forEach((ri) => {
            const isDairy = ri.ingredient.sideTypes.some(
              (st) => st.sideType === "DAIRY"
            );
            if (isDairy && ri.quantity * factor > 150) {
              factor = Math.min(factor, 150 / ri.quantity);
            }
          });

          // Appliquer le facteur
          recette.ingredients = recette.ingredients.map((ri) => ({
            ...ri,
            quantity: Math.round(ri.quantity * factor),
          }));
        }

        data.recette = { connect: { id: recette.id } };
      }

      // 👉 7.3 Sinon, si collation : ajouter un accompagnement protéiné/dairy
      else if (repasType === "collation") {
        const pool = ingredients.filter((ing) =>
          ing.protein >= 10 &&
          ing.sideTypes.some((st) =>
            ["PROTEIN", "DAIRY"].includes(st.sideType)
          )
        );
        if (pool.length) {
          const chosen = pool[Math.floor(Math.random() * pool.length)];
          const qty = Math.min(
            150,
            Math.round((user.poids * 1.8 * repartition[repasType]) / (chosen.protein / 100))
          );
          data.accompagnements = {
            create: [{ ingredient: { connect: { id: chosen.id } }, quantity: qty }],
          };
        }
      }

      creations.push(prisma.menuJournalier.create({ data }));
    }
  }

  // 8️⃣ Exécuter toutes les insertions en parallèle
  await Promise.all(creations);
}

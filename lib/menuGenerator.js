// lib/menuGenerator.js

import prisma from "./prisma";
import { startOfWeek, addDays } from "date-fns";

/**
 * Génère (ou régénère) le menu pour 7 jours de la semaine de `weekStartIso`
 * pour l'utilisateur `userId`, du lundi au dimanche inclus.
 */
export async function generateWeeklyMenu(userId, weekStartIso) {
  // 1) Vérifier que l’utilisateur existe
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new Error("Utilisateur non trouvé.");
  }

  // 2) Calculer début (lundi) et fin (dimanche) de la semaine
  const base = weekStartIso ? new Date(weekStartIso) : new Date();
  const weekStart = startOfWeek(base, { weekStartsOn: 1 });
  const weekEnd = addDays(weekStart, 6);

  // 3) Supprimer d'abord les accompagnements et menus de la semaine existants
  const existing = await prisma.menuJournalier.findMany({
    where: { userId, date: { gte: weekStart, lte: weekEnd } },
    select: { id: true },
  });
  const menuIds = existing.map((m) => m.id);
  await prisma.$transaction([
    prisma.accompagnement.deleteMany({ where: { menuId: { in: menuIds } } }),
    prisma.menuJournalier.deleteMany({ where: { userId, date: { gte: weekStart, lte: weekEnd } } }),
  ]);

  // 4) Préparer la répartition des macros
  const repartition = {
    "petit-dejeuner": 0.3,
    dejeuner:         0.4,
    collation:        0.05,
    diner:            0.25,
  };

  // 5) Charger recettes et ingrédients pour collation
  const [recettes, ingredients] = await Promise.all([
    prisma.recette.findMany({
      include: {
        categories: { include: { category: true } },
        ingredients: { include: { ingredient: { include: { sideTypes: true } } } },
        allowedSides: true,
      },
    }),
    prisma.ingredient.findMany({ include: { sideTypes: true } }),
  ]);

  // 6) Construire les créations (7 jours × 4 types de repas)
  const creations = [];
  for (let i = 0; i < 7; i++) {
    const day = addDays(weekStart, i);

    for (const type of Object.keys(repartition)) {
      const data = {
        user:      { connect: { id: userId } },
        date:      day,
        repasType: type,
      };

      // Sélection de la recette (hors collation)
      let recette = null;
      if (type !== "collation") {
        const pool = recettes.filter((r) => {
          const cats = r.categories.map((c) => c.category.name.toLowerCase());
          return type === "petit-dejeuner"
            ? cats.includes("petit déjeuner")
            : !cats.includes("petit déjeuner") && !cats.includes("collation");
        });
        if (pool.length) {
          recette = pool[Math.floor(Math.random() * pool.length)];
        }
      }

      // Si recette trouvée → ajuster quantités + connexion
      if (recette) {
        const hasEgg = recette.ingredients.some((ri) =>
          ri.ingredient.name.toLowerCase().includes("oeuf")
        );
        if (!hasEgg) {
          // Calcul des macros totaux
          const totals = recette.ingredients.reduce(
            (s, ri) => ({
              p: s.p + (ri.ingredient.protein * ri.quantity) / 100,
              f: s.f + (ri.ingredient.fat     * ri.quantity) / 100,
              g: s.g + (ri.ingredient.carbs   * ri.quantity) / 100,
            }),
            { p: 0, f: 0, g: 0 }
          );
          // Objectifs macros
          const target = {
            p: user.poids * 1.8 * repartition[type],
            f: (user.metabolismeCible * 0.3 / 9) * repartition[type],
            g: ((user.metabolismeCible - user.poids * 1.8 * 4 - user.metabolismeCible * 0.3) / 4) * repartition[type],
          };
          // Facteur minimal
          let factor = Math.min(
            target.p / totals.p,
            target.f / totals.f,
            target.g / totals.g
          );
          // Clamp DAIRY à 150g
          recette.ingredients.forEach((ri) => {
            if (
              ri.ingredient.sideTypes.some((st) => st.sideType === "DAIRY") &&
              ri.quantity * factor > 150
            ) {
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
      // Sinon si collation → créer un accompagnement
      else if (type === "collation") {
        const pool = ingredients.filter((ing) =>
          ing.protein >= 10 &&
          ing.sideTypes.some((st) => ["PROTEIN", "DAIRY"].includes(st.sideType))
        );
        if (pool.length) {
          const ing = pool[Math.floor(Math.random() * pool.length)];
          const qty = Math.min(
            150,
            Math.round((user.poids * 1.8 * repartition[type]) / (ing.protein / 100))
          );
          data.accompagnements = {
            create: [{ ingredient: { connect: { id: ing.id } }, quantity: qty }],
          };
        }
      }

      creations.push(prisma.menuJournalier.create({ data }));
    }
  }

  // 7) Exécution parallèle
  await Promise.all(creations);
}

// lib/menuGenerator.js

import prisma from "./prisma";
import { startOfWeek, addDays } from "date-fns";

/**
 * Génère uniquement les jours manquants (0 à 7 entrées) pour la semaine
 * de weekStartIso (ISO string) ou la semaine en cours si non fourni.
 */
export async function generateWeeklyMenu(userId, weekStartIso) {
  // 1) Vérifier que l’utilisateur existe
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new Error("Utilisateur non trouvé.");
  }

  // 2) Déterminer weekStart & weekEnd (inclusif sur 7 jours)
  const baseDate = weekStartIso ? new Date(weekStartIso) : new Date();
  const weekStart = startOfWeek(baseDate, { weekStartsOn: 1 });
  const weekEnd   = addDays(weekStart, 7); // exclusive : lundi suivant

  // 3) Récupérer les dates déjà présentes
  const existants = await prisma.menuJournalier.findMany({
    where: {
      userId,
      date: { gte: weekStart, lt: weekEnd },
    },
    select: { date: true },
  });
  const existDates = new Set(
    existants.map((m) => m.date.toISOString().slice(0, 10))
  );

  // 4) Construire la liste ISO des 7 jours de la semaine
  const allDates = Array.from({ length: 7 }).map((_, i) =>
    addDays(weekStart, i).toISOString().slice(0, 10)
  );
  const missingDates = allDates.filter((d) => !existDates.has(d));

  if (missingDates.length === 0) {
    // rien à faire
    return;
  }

  // 5) Préparer données partagées
  const repartition = {
    "petit-dejeuner": 0.3,
    dejeuner:         0.4,
    collation:        0.05,
    diner:            0.25,
  };
  const [recettes, ingredients] = await Promise.all([
    prisma.recette.findMany({
      include: {
        categories:   { include: { category: true } },
        ingredients:  { include: { ingredient: { include: { sideTypes: true } } } },
        allowedSides: true,
      },
    }),
    prisma.ingredient.findMany({ include: { sideTypes: true } }),
  ]);

  // 6) Construire et lancer les créations
  const creations = [];
  for (const dateIso of missingDates) {
    const day = new Date(dateIso);
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
          const cats = r.categories.map((c) =>
            c.category.name.toLowerCase()
          );
          return type === "petit-dejeuner"
            ? cats.includes("petit déjeuner")
            : !cats.includes("petit déjeuner") &&
              !cats.includes("collation");
        });
        if (pool.length) {
          recette = pool[Math.floor(Math.random() * pool.length)];
        }
      }

      // Si on a une recette → ajuster et connecter
      if (recette) {
        const hasEgg = recette.ingredients.some((ri) =>
          ri.ingredient.name.toLowerCase().includes("oeuf")
        );
        if (!hasEgg) {
          const totals = recette.ingredients.reduce(
            (s, ri) => ({
              p: s.p + ri.ingredient.protein * ri.quantity / 100,
              f: s.f + ri.ingredient.fat     * ri.quantity / 100,
              g: s.g + ri.ingredient.carbs   * ri.quantity / 100,
            }),
            { p: 0, f: 0, g: 0 }
          );
          const target = {
            p: user.poids * 1.8 * repartition[type],
            f: (user.metabolismeCible * 0.3 / 9) * repartition[type],
            g:
              ((user.metabolismeCible -
                user.poids * 1.8 * 4 -
                user.metabolismeCible * 0.3) /
                4) *
              repartition[type],
          };
          let factor = Math.min(
            target.p / totals.p,
            target.f / totals.f,
            target.g / totals.g
          );
          recette.ingredients.forEach((ri) => {
            if (
              ri.ingredient.sideTypes.some((st) => st.sideType === "DAIRY") &&
              ri.quantity * factor > 150
            ) {
              factor = Math.min(factor, 150 / ri.quantity);
            }
          });
          recette.ingredients = recette.ingredients.map((ri) => ({
            ...ri,
            quantity: Math.round(ri.quantity * factor),
          }));
        }
        data.recette = { connect: { id: recette.id } };
      }
      // Sinon, si collation → accompagnement auto
      else if (type === "collation") {
        const pool = ingredients.filter((i) =>
          i.protein >= 10 &&
          i.sideTypes.some((st) =>
            ["PROTEIN", "DAIRY"].includes(st.sideType)
          )
        );
        if (pool.length) {
          const ing = pool[Math.floor(Math.random() * pool.length)];
          const qty = Math.min(
            150,
            Math.round(user.poids * 1.8 * repartition[type] / (ing.protein / 100))
          );
          data.accompagnements = {
            create: [{ ingredient: { connect: { id: ing.id } }, quantity: qty }],
          };
        }
      }

      creations.push(prisma.menuJournalier.create({ data }));
    }
  }

  await Promise.all(creations);
}

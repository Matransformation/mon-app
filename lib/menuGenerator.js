// lib/menuGenerator.js
import prisma from "./prisma";
import { startOfWeek, endOfWeek, addDays } from "date-fns";

export async function generateWeeklyMenu(userId, weekStartIso) {
  // 1) Vérifier que l’utilisateur existe
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error(`Utilisateur non trouvé : ${userId}`);

  // 2) Début et fin de la semaine
  const baseDate = weekStartIso ? new Date(weekStartIso) : new Date();
  const weekStart = startOfWeek(baseDate, { weekStartsOn: 1 });
  const weekEnd   = endOfWeek(weekStart,  { weekStartsOn: 1 });

  // 3) Purger l’ancien menu
  const toRemove = await prisma.menuJournalier.findMany({
    where: { userId, date: { gte: weekStart, lte: weekEnd } },
    select: { id: true }
  });
  const menuIds = toRemove.map(m => m.id);

  // 4+5) Transaction : d’abord les accompagnements, puis les menus
  await prisma.$transaction([
    prisma.accompagnement.deleteMany({ where: { menuId: { in: menuIds } } }),
    prisma.menuJournalier.deleteMany({ where: { userId, date: { gte: weekStart, lte: weekEnd } } })
  ]);

  // 6) Répartition des macros
  const repartition = {
    "petit-dejeuner": 0.3,
    dejeuner:         0.4,
    collation:        0.05,
    diner:            0.25,
  };

  // 7) Charger recettes & ingrédients
  const [recettes, ingredients] = await Promise.all([
    prisma.recette.findMany({
      include: {
        categories: { include: { category: true } },
        ingredients: { include: { ingredient: { include: { sideTypes: true } } } },
        allowedSides: true,
      }
    }),
    prisma.ingredient.findMany({ include: { sideTypes: true } })
  ]);

  // 8) Construire les insertions
  const creations = [];
  for (let i = 0; i < 7; i++) {
    const day = addDays(weekStart, i);
    for (const type of Object.keys(repartition)) {
      const data = { user: { connect: { id: userId } }, date: day, repasType: type };

      // 8.1) Recette (hors collation)
      let recette = null;
      if (type !== "collation") {
        const pool = recettes.filter(r => {
          const cats = r.categories.map(c => c.category.name.toLowerCase());
          return type === "petit-dejeuner"
            ? cats.includes("petit déjeuner")
            : !cats.includes("petit déjeuner") && !cats.includes("collation");
        });
        recette = pool.length && pool[Math.floor(Math.random() * pool.length)];
      }

      // 8.2) Si recette → ajuster quantités & connecter
      if (recette) {
        const hasEgg = recette.ingredients.some(ri =>
          ri.ingredient.name.toLowerCase().includes("oeuf")
        );
        if (!hasEgg) {
          const totals = recette.ingredients.reduce((s, ri) => ({
            p: s.p + ri.ingredient.protein * ri.quantity / 100,
            f: s.f + ri.ingredient.fat     * ri.quantity / 100,
            g: s.g + ri.ingredient.carbs   * ri.quantity / 100,
          }), { p: 0, f: 0, g: 0 });

          const target = {
            p: user.poids * 1.8 * repartition[type],
            f: (user.metabolismeCible * 0.3 / 9) * repartition[type],
            g: ((user.metabolismeCible - user.poids * 1.8 * 4 - user.metabolismeCible * 0.3) / 4) * repartition[type],
          };

          let factor = Math.min(target.p / totals.p, target.f / totals.f, target.g / totals.g);

          // clamp DAIRY à 150 g
          recette.ingredients.forEach(ri => {
            if (
              ri.ingredient.sideTypes.some(st => st.sideType === "DAIRY") &&
              ri.quantity * factor > 150
            ) {
              factor = Math.min(factor, 150 / ri.quantity);
            }
          });

          recette.ingredients = recette.ingredients.map(ri => ({
            ...ri,
            quantity: Math.round(ri.quantity * factor),
          }));
        }

        data.recette = { connect: { id: recette.id } };
      }
      // 8.3) Sinon collation → auto-accompagnement
      else if (type === "collation") {
        const pool = ingredients.filter(i =>
          i.protein >= 10 &&
          i.sideTypes.some(st => ["PROTEIN", "DAIRY"].includes(st.sideType))
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

  // 9) Exécuter tous les create
  await Promise.all(creations);
}

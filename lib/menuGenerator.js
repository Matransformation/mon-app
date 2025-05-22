// lib/menuGenerator.js
import prisma from "./prisma";
import { startOfWeek, endOfWeek, addDays } from "date-fns";

export async function generateWeeklyMenu(userId, weekStartIso) {
  // 1) Vérifier l’utilisateur
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("Utilisateur non trouvé");

  // 2) Calculer début/fin de semaine
  const base = weekStartIso ? new Date(weekStartIso) : new Date();
  const weekStart = startOfWeek(base, { weekStartsOn: 1 });
  const weekEnd   = endOfWeek(weekStart, { weekStartsOn: 1 });

  // 3) Récupérer IDs des menus existants
  const toRemove = await prisma.menuJournalier.findMany({
    where: { userId, date: { gte: weekStart, lte: weekEnd } },
    select: { id: true },
  });
  const menuIds = toRemove.map(m => m.id);

  // 4) Transaction : suppression des accompagnements puis des menus
  await prisma.$transaction([
    prisma.accompagnement.deleteMany({ where: { menuId: { in: menuIds } } }),
    prisma.menuJournalier.deleteMany({
      where: { userId, date: { gte: weekStart, lte: weekEnd } }
    }),
  ]);

  // 5) Charger en parallèle recettes et ingrédients
  const repartitions = {
    "petit-dejeuner": 0.3,
    dejeuner:         0.4,
    collation:        0.05,
    diner:            0.25,
  };
  const [recettes, ingredients] = await Promise.all([
    prisma.recette.findMany({
      include: {
        categories:    { include: { category: true } },
        ingredients:   { include: { ingredient: { include: { sideTypes: true } } } },
        allowedSides:  true,
      },
    }),
    prisma.ingredient.findMany({ include: { sideTypes: true } }),
  ]);

  // 6) Générer 7 jours × 4 repas
  const creations = [];
  for (let i = 0; i < 7; i++) {
    const day = addDays(weekStart, i);
    for (const type of Object.keys(repartitions)) {
      const data = { user: { connect: { id: userId } }, date: day, repasType: type };

      // 6.1) Choix de la recette (sauf collation)
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

      // 6.2) Si on a une recette, ajuster quantités
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
            p: user.poids * 1.8 * repartitions[type],
            f: (user.metabolismeCible * 0.3 / 9) * repartitions[type],
            g: ((user.metabolismeCible - user.poids * 1.8 * 4 - user.metabolismeCible * 0.3) / 4) * repartitions[type],
          };
          let factor = Math.min(target.p / totals.p, target.f / totals.f, target.g / totals.g);
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
      // 6.3) Sinon, si collation → créer un accompagnement
      else if (type === "collation") {
        const pool = ingredients.filter(i =>
          i.protein >= 10 &&
          i.sideTypes.some(st => ["PROTEIN","DAIRY"].includes(st.sideType))
        );
        if (pool.length) {
          const ing = pool[Math.floor(Math.random() * pool.length)];
          const qty = Math.min(150, Math.round(user.poids * 1.8 * repartitions[type] / (ing.protein/100)));
          data.accompagnements = { create: [{ ingredient: { connect: { id: ing.id } }, quantity: qty }] };
        }
      }

      creations.push(prisma.menuJournalier.create({ data }));
    }
  }

  // 7) Exécuter
  await Promise.all(creations);
}

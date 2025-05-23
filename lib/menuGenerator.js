// lib/menuGenerator.js

import prisma from "./prisma";
import { startOfWeek, endOfWeek, addDays } from "date-fns";

/**
 * Génère (ou régénère) le menu pour 7 jours (lundi → dimanche)
 * de la semaine de `weekStartIso` pour l’utilisateur `userId`.
 */
export async function generateWeeklyMenu(userId, weekStartIso) {
  console.log("🛠️  generateWeeklyMenu called with:", { userId, weekStartIso });

  // 1️⃣ Récupérer l’utilisateur
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("Utilisateur non trouvé.");
  console.log("✔️  User found:", user.email);

  // 2️⃣ Calculer weekStart & weekEnd
  let weekStart;
  if (weekStartIso) {
    const iso = weekStartIso.slice(0, 10); // "YYYY-MM-DD"
    const [y, m, d] = iso.split("-").map(Number);
    weekStart = new Date(y, m - 1, d);
  } else {
    weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  }
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
  console.log(
    `🔢  Target week from ${weekStart.toDateString()} to ${weekEnd.toDateString()}`
  );

  // Affiche chaque jour de la cible
  for (let i = 0; i < 7; i++) {
    console.log("➡️ ", addDays(weekStart, i).toDateString());
  }

  // 3️⃣ Supprimer anciens menus + accompagnements
  const toRemove = await prisma.menuJournalier.findMany({
    where: {
      userId,
      date: { gte: weekStart, lte: weekEnd },
    },
    select: { id: true, date: true },
  });
  console.log("🗑️  Found toRemove entries:", toRemove.map((m) => m.date.toDateString()));
  const menuIds = toRemove.map((m) => m.id);

  await prisma.$transaction([
    prisma.accompagnement.deleteMany({ where: { menuId: { in: menuIds } } }),
    prisma.menuJournalier.deleteMany({
      where: { userId, date: { gte: weekStart, lte: weekEnd } },
    }),
  ]);
  console.log("✅  Deleted old menus and their accompagnements");

  // 4️⃣ Charger recettes & ingrédients
  const repartition = {
    "petit-dejeuner": 0.3,
    dejeuner: 0.4,
    collation: 0.05,
    diner: 0.25,
  };
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
  console.log(`📦  Loaded ${recettes.length} recettes and ${ingredients.length} ingredients`);

  // 5️⃣ Construire et insérer
  const creations = [];
  for (let i = 0; i < 7; i++) {
    const day = addDays(weekStart, i);
    for (const type of Object.keys(repartition)) {
      const data = {
        user: { connect: { id: userId } },
        date: day,
        repasType: type,
      };

      // Choisir recette
      let recette = null;
      if (type !== "collation") {
        const pool = recettes.filter((r) => {
          const cats = r.categories.map((c) => c.category.name.toLowerCase());
          if (type === "petit-dejeuner") return cats.includes("petit déjeuner");
          return !cats.includes("petit déjeuner") && !cats.includes("collation");
        });
        recette = pool.length && pool[Math.floor(Math.random() * pool.length)];
      }

      if (recette) {
        data.recette = { connect: { id: recette.id } };
      } else if (type === "collation") {
        const pool = ingredients.filter(
          (i) =>
            i.protein >= 10 &&
            i.sideTypes.some((st) => ["PROTEIN", "DAIRY"].includes(st.sideType))
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

      console.log(`➕  Create ${type} on ${day.toDateString()}`, data);
      creations.push(prisma.menuJournalier.create({ data }));
    }
  }

  await Promise.all(creations);
  console.log("🎉  All creations done!");
}

// File: lib/menuGenerator.js
import prisma from "./prisma";
import { startOfWeek, endOfWeek, addDays, parseISO } from "date-fns";

/** Normalise pour comparaisons (sans accents, minuscule). */
function norm(s = "") {
  return String(s)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

/** Flags d’usage (catégories). */
function catsToFlags(recette) {
  const cats = (recette.categories || []).map((c) => norm(c.category?.name));
  const joined = cats.join(" ");
  const isBreakfast = /(^|\s)(petit ?dejeuner|breakfast|matin)(\s|$)/.test(joined);
  const isSnack     = /(^|\s)(collation|snack|gouter|gou?ter)(\s|$)/.test(joined);
  return { isBreakfast, isSnack };
}

/** Renvoie true pour toutes les recettes sauf les petits-déjeuners */
function isNotBreakfast(recette) {
  const cats = (recette.categories || []).map((c) => norm(c.category?.name));

  // Vérifie si la recette est un petit-déjeuner
  const isBreakfast = cats.some((n) =>
    /(^|\s)(petit ?dejeuner|breakfast|matin)(\s|$)/.test(n)
  );

  // On garde toutes les recettes sauf les petits-déjeuners
  return !isBreakfast;
}


/**
 * Génère (ou régénère) les 7 jours d’une semaine pour `userId` à partir de `weekStartIso`.
 * - Collation : slot vide (ni recette ni accompagnements).
 * - Déjeuner & Dîner : seulement des recettes de catégorie "Printemps" (sinon slot vide).
 * - Petit-déjeuner : recette depuis pool breakfast (comme avant).
 * - Aucun accompagnement n’est généré ici.
 */
export async function generateWeeklyMenu(userId, weekStartIso) {
  console.log("🛠️  generateWeeklyMenu called with:", { userId, weekStartIso });

  // 1) Utilisateur
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("Utilisateur non trouvé.");
  console.log("✔️  User:", user.email);

  // 2) Plage semaine (lun→dim)
  const weekStart = startOfWeek(weekStartIso ? parseISO(weekStartIso) : new Date(), { weekStartsOn: 1 });
  const weekEnd   = endOfWeek(weekStart, { weekStartsOn: 1 });
  console.log(`🔢  Week ${weekStart.toDateString()} → ${weekEnd.toDateString()}`);

  // 3) Purge ancienne semaine (menus + accompagnements)
  const old = await prisma.menuJournalier.findMany({
    where: { userId, date: { gte: weekStart, lte: weekEnd } },
    select: { id: true },
  });
  const oldIds = old.map((m) => m.id);
  if (oldIds.length) {
    await prisma.$transaction([
      prisma.accompagnement.deleteMany({ where: { menuId: { in: oldIds } } }),
      prisma.menuJournalier.deleteMany({ where: { id: { in: oldIds } } }),
    ]);
  }
  console.log(`🧹  Deleted ${oldIds.length} previous day(s)`);

  // 4) Charger les recettes
  const recettes = await prisma.recette.findMany({
    include: {
      categories: { include: { category: true } },
      ingredients: { include: { ingredient: { include: { sideTypes: true } } } },
      allowedSides: true,
    },
  });
  console.log(`📦  Loaded ${recettes.length} recettes`);

  // Pools
  const pools = { breakfast: [], snack: [], main: [] };
  for (const r of recettes) {
    const { isBreakfast, isSnack } = catsToFlags(r);
    if (isBreakfast) pools.breakfast.push(r);
    else if (isSnack) pools.snack.push(r);
    else pools.main.push(r);
  }

  // Spécifique printemps pour midi/soir (main only)
  const springMain = pools.main.filter(isNotBreakfast);

  console.log(
    `🍽️ Pools → breakfast:${pools.breakfast.length} | snack:${pools.snack.length} | main:${pools.main.length} | springMain:${springMain.length}`
  );

  const pick = (arr) => (arr.length ? arr[Math.floor(Math.random() * arr.length)] : null);

  // 5) Créer 7 x 4 repas (avec contraintes)
  const creations = [];
  const TYPES = ["petit-dejeuner", "dejeuner", "collation", "diner"];

  for (let i = 0; i < 7; i++) {
    const day = addDays(weekStart, i);

    for (const type of TYPES) {
      const data = {
        user: { connect: { id: userId } },
        date: day,
        repasType: type,
      };

      if (type === "collation") {
        // 👉 Slot vide pour collation (l’utilisateur choisira des accompagnements)
        creations.push(prisma.menuJournalier.create({ data }));
        continue;
      }

      if (type === "petit-dejeuner") {
        // Petit-déj : choisir une recette breakfast si possible
        let recette = pick(pools.breakfast.length ? pools.breakfast : recettes);
        if (recette) data.recette = { connect: { id: recette.id } };
        else console.warn(`⚠️ Aucune recette trouvée pour petit-dejeuner (${day.toDateString()}) — slot vide`);
        creations.push(prisma.menuJournalier.create({ data }));
        continue;
      }

      // Déjeuner / Dîner → uniquement PRINTEMPS (sur pool main)
      let recette = pick(springMain);
      if (!recette) {
        console.warn(`⚠️ Aucune recette "Printemps" pour ${type} (${day.toDateString()}) — slot vide`);
      } else {
        data.recette = { connect: { id: recette.id } };
      }
      creations.push(prisma.menuJournalier.create({ data }));
    }
  }

  await Promise.all(creations);
  console.log("🎉  Weekly menu generated successfully with rules (collation empty, lunch/dinner = Printemps)");
}

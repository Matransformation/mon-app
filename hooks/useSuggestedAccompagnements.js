// File: hooks/useSuggestedAccompagnements.js
import { useMemo } from "react";

// Répartition objectifs
const repartitionRepas = {
  "petit-dejeuner": 0.3,
  dejeuner: 0.4,
  collation: 0.05,
  diner: 0.25,
};

// Seuil “manque significatif”
const isSignificantGap = (val, target) => val < target * 0.95;

// Utils sideTypes
const sideTypesOf = (ing) => {
  const st = ing?.sideTypes || [];
  return st.map((x) => (typeof x === "string" ? x : x?.sideType)).filter(Boolean);
};

const hasSide = (ing, key) => sideTypesOf(ing).includes(key);

const isCheese = (ing) =>
  hasSide(ing, "CHEESE") ||
  /fromage(?!\s*blanc)|parmesan|emmental|gruy[eè]re|comt[ée]|mozzarella|cheddar|raclette|cantal|brie|camembert|feta|pecorino|roquefort|reblochon|tomme|gorgonzola|ricotta|mascarpone|philadelphia|r[aâ]p[ée]/i.test(
    ing?.name || ""
  );

const isNonCheeseDairy = (ing) => hasSide(ing, "DAIRY") && !isCheese(ing);

const isProteinSide = (ing) => hasSide(ing, "PROTEIN") || hasSide(ing, "BREAKFAST_PROTEIN");

// Poudres masquées par défaut
const looksLikePowder = (ing) =>
  /whey|cas[ée]ine|isolate|gainer|protein powder|protéine en poudre|impact whey/i.test(
    ing?.name || ""
  ) || ing?.ingredientType === "POWDER";

// Macros utilitaires pour 100 g → qty
const macrosFrom = (ing, qty) => {
  const f = (qty || 0) / 100;
  return {
    p: (ing?.protein || 0) * f,
    f: (ing?.fat || 0) * f,
    c: (ing?.carbs || 0) * f,
  };
};

// Score simple pour trier par adéquation macro
const scoreForProtein = (ing) => (ing?.protein || 0) - 0.2 * ((ing?.fat || 0) + (ing?.carbs || 0));
const scoreForCarb = (ing) => (ing?.carbs || 0) - 0.3 * (ing?.fat || 0);
const scoreForFat = (ing) => (ing?.fat || 0) - 0.2 * (ing?.carbs || 0);

export default function useSuggestedAccompagnements({ repas, user, allIngredients }) {
  return useMemo(() => {
    if (!user || !repas || !Array.isArray(allIngredients)) return {};

    const includePowders = false; // 🔒 par défaut, on masque les poudres

    // Objectifs du repas
    const ratio = repartitionRepas[repas.repasType] || 0;
    const objectifs = {
      protein: user.poids * 1.8 * ratio,
      fat: (user.metabolismeCible * 0.3) / 9 * ratio,
      carbs: ((user.metabolismeCible - user.poids * 1.8 * 4 - user.metabolismeCible * 0.3) / 4) * ratio,
    };

    // Macros actuelles = recette figée (recipeFactor) + accompagnements existants
    const rf = repas.recipeFactor ?? 1;
    const macrosRecette = (repas.recette?.ingredients || []).reduce(
      (s, ri) => {
        const qty = (ri.quantity || 0) * rf;
        const m = macrosFrom(ri.ingredient, qty);
        return { p: s.p + m.p, f: s.f + m.f, c: s.c + m.c };
      },
      { p: 0, f: 0, c: 0 }
    );
    const macrosAcc = (repas.accompagnements || []).reduce(
      (s, a) => {
        const m = macrosFrom(a.ingredient, a.quantity || 0);
        return { p: s.p + m.p, f: s.f + m.f, c: s.c + m.c };
      },
      { p: 0, f: 0, c: 0 }
    );
    const macros = {
      protein: macrosRecette.p + macrosAcc.p,
      fat: macrosRecette.f + macrosAcc.f,
      carbs: macrosRecette.c + macrosAcc.c,
    };

    // Contexte laitiers / PDJ
    const recipeHasCheese = !!(repas.recette?.ingredients || []).some((ri) => isCheese(ri.ingredient));
    const recipeHasNonCheeseDairy = !!(repas.recette?.ingredients || []).some((ri) =>
      isNonCheeseDairy(ri.ingredient)
    );
    const recipeHasAnyDairy = recipeHasCheese || recipeHasNonCheeseDairy;

    const accHasCheese = (repas.accompagnements || []).some((a) => isCheese(a.ingredient));
    const accHasNonCheeseDairy = (repas.accompagnements || []).some((a) =>
      isNonCheeseDairy(a.ingredient)
    );
    const isBreakfast = repas.repasType === "petit-dejeuner";
    const accHasProtein = (repas.accompagnements || []).some((a) => isProteinSide(a.ingredient));

    // Manques
    const manque = {
      protein: isSignificantGap(macros.protein, objectifs.protein),
      carbs: isSignificantGap(macros.carbs, objectifs.carbs),
      fat: isSignificantGap(macros.fat, objectifs.fat),
    };

    // Pool de base filtré (pas de poudres par défaut)
    let pool = allIngredients.filter((ing) => (includePowders ? true : !looksLikePowder(ing)));

    // 1) LÉGUMES (priorité dej/dîner si pas dans recette ni accompagnements)
    const hasVegetableAlready =
      (repas.recette?.ingredients || []).some((ri) => hasSide(ri.ingredient, "VEGETABLE_SIDE")) ||
      (repas.accompagnements || []).some((a) => hasSide(a.ingredient, "VEGETABLE_SIDE"));
    const needVegetable = ["dejeuner", "diner"].includes(repas.repasType) && !hasVegetableAlready;

    // 2) LAITIERS — règles de masquage (juste côté suggestion ; l’API reste juge)
    let dairyAllowed = !recipeHasAnyDairy; // si laitier dans la recette ⇒ pas de suggestions laitiers
    let dairyFilterFn = (ing) => true;
    if (accHasCheese) {
      // déjà du fromage en accompagnement ⇒ proposer seulement fromages OU rien selon politique ; ici on retire les non-fromage
      dairyFilterFn = (ing) => isCheese(ing);
    }
    if (accHasNonCheeseDairy) {
      // déjà un laitier non-fromage ⇒ ne pas proposer de fromages
      dairyFilterFn = (ing) => isNonCheeseDairy(ing);
    }

    // 3) Types à proposer selon manques + contexte
    const typesWanted = new Set();

    if (needVegetable) typesWanted.add("VEGETABLE_SIDE");

    if (manque.carbs) {
      typesWanted.add("FRUIT_SIDE");
      typesWanted.add("CEREAL");
      typesWanted.add("CARB");
    }

    if (manque.protein) {
      if (isBreakfast) {
        if (!accHasProtein) typesWanted.add("BREAKFAST_PROTEIN"); // une seule source au PDJ
      } else {
        typesWanted.add("PROTEIN");
      }
    }

    if (manque.fat) typesWanted.add("FAT");

    if (!manque.protein && !manque.carbs && !manque.fat) {
      // Pas de manque mais on laisse des options légères
      if (isBreakfast && !accHasProtein) typesWanted.add("BREAKFAST_PROTEIN");
      typesWanted.add("FRUIT_SIDE");
      if (!needVegetable) typesWanted.add("VEGETABLE_SIDE");
    }

    // 4) Construire les listes par type
    const byType = {};

    // Helper: limiter et trier par adéquation macro
    const topN = (arr, n) => arr.slice(0, n);

    // VEGETABLE_SIDE
    if (typesWanted.has("VEGETABLE_SIDE")) {
      const veg = pool.filter((ing) => hasSide(ing, "VEGETABLE_SIDE"));
      // Tri simple alpha
      byType.VEGETABLE_SIDE = topN(veg.sort((a, b) => a.name.localeCompare(b.name)), 5);
    }

    // DAIRY (avec règles de masquage)
    if (dairyAllowed) {
      let dairy = pool.filter((ing) => hasSide(ing, "DAIRY"));
      dairy = dairy.filter(dairyFilterFn);
      if (dairy.length) byType.DAIRY = topN(dairy.sort((a, b) => a.name.localeCompare(b.name)), 5);
    }

    // FRUIT_SIDE
    if (typesWanted.has("FRUIT_SIDE")) {
      let fruits = pool.filter((ing) => hasSide(ing, "FRUIT_SIDE"));
      // éviter les fruits très gras (rare) ; tri par glucides
      fruits = fruits.sort((a, b) => (b.carbs || 0) - (a.carbs || 0));
      byType.FRUIT_SIDE = topN(fruits, 5);
    }

    // CEREAL / CARB
    if (typesWanted.has("CEREAL") || typesWanted.has("CARB")) {
      let starchy = pool.filter((ing) => hasSide(ing, "CEREAL") || hasSide(ing, "CARB"));
      // trier par glucides nets (faible lipides mieux classés)
      starchy = starchy
        .slice()
        .sort((a, b) => scoreForCarb(b) - scoreForCarb(a));
      if (typesWanted.has("CEREAL"))
        byType.CEREAL = topN(starchy.filter((i) => hasSide(i, "CEREAL")), 5);
      if (typesWanted.has("CARB"))
        byType.CARB = topN(starchy.filter((i) => hasSide(i, "CARB")), 5);
    }

    // PROTEIN / BREAKFAST_PROTEIN
    if (typesWanted.has("PROTEIN") || typesWanted.has("BREAKFAST_PROTEIN")) {
      let prots = pool.filter((ing) => hasSide(ing, "PROTEIN") || hasSide(ing, "BREAKFAST_PROTEIN"));
      // au PDJ si une protéine est déjà présente dans les accompagnements, on ne propose rien
      if (isBreakfast && accHasProtein) {
        prots = [];
      }
      // trier protéines denses et “propres” (peu gras/sucre)
      prots = prots
        .filter((ing) => !looksLikePowder(ing)) // sécurité anti-poudre même si includePowders=false déjà appliqué
        .slice()
        .sort((a, b) => scoreForProtein(b) - scoreForProtein(a));
      if (typesWanted.has("BREAKFAST_PROTEIN"))
        byType.BREAKFAST_PROTEIN = topN(
          prots.filter((i) => hasSide(i, "BREAKFAST_PROTEIN") || hasSide(i, "PROTEIN")),
          5
        );
      if (typesWanted.has("PROTEIN"))
        byType.PROTEIN = topN(prots.filter((i) => hasSide(i, "PROTEIN")), 5);
    }

    // FAT
    if (typesWanted.has("FAT")) {
      let fats = pool.filter((ing) => hasSide(ing, "FAT"));
      fats = fats.slice().sort((a, b) => scoreForFat(b) - scoreForFat(a));
      byType.FAT = topN(fats, 5);
    }

    return byType;
  }, [repas, user, allIngredients]);
}

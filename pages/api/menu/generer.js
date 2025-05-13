// pages/api/menu/generer.js

import prisma from "../../../lib/prisma";
import { startOfWeek, endOfWeek, addDays } from "date-fns";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res
      .status(405)
      .json({ message: `Méthode ${req.method} non autorisée` });
  }

  // On récupère userId et, si fourni, weekStart en ISO
  const { userId, weekStart: weekStartIso } = req.body;
  if (!userId) {
    return res.status(400).json({ message: "userId manquant." });
  }

  try {
    // 1) Vérifier que l’utilisateur existe
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    // 2) Calculer début et fin de la semaine :
    //    si weekStartIso est passé, on l'utilise, sinon on prend today.
    const baseDate = weekStartIso ? new Date(weekStartIso) : new Date();
    const weekStart = startOfWeek(baseDate, { weekStartsOn: 1 });
    const weekEnd   = endOfWeek(weekStart,  { weekStartsOn: 1 });

    // 3) Récupérer les menus existants pour pouvoir supprimer leurs accompagnements
    const toRemove = await prisma.menuJournalier.findMany({
      where: {
        userId,
        date: { gte: weekStart, lte: weekEnd },
      },
      select: { id: true },
    });
    const menuIds = toRemove.map((m) => m.id);

    // 4) Supprimer d’abord tous les accompagnements liés
    if (menuIds.length) {
      await prisma.accompagnement.deleteMany({
        where: { menuId: { in: menuIds } },
      });
    }

    // 5) Puis supprimer les menus eux‑mêmes
    await prisma.menuJournalier.deleteMany({
      where: {
        userId,
        date: { gte: weekStart, lte: weekEnd },
      },
    });

    // 6) Préparer la génération
    const repartition = {
      "petit-dejeuner": 0.3,
      dejeuner:         0.4,
      collation:        0.05,
      diner:            0.25,
    };

    // 7) Charger toutes les recettes + ingrédients + sideTypes + allowedSides
    const recettes = await prisma.recette.findMany({
      include: {
        categories: { include: { category: true } },
        ingredients: {
          include: { ingredient: { include: { sideTypes: true } } },
        },
        allowedSides: true,
      },
    });

    // 8) Charger tous les ingrédients (pour collation)
    const ingredients = await prisma.ingredient.findMany({
      include: { sideTypes: true },
    });

    // 9) Construire les créations
    const creations = [];
    for (let i = 0; i < 7; i++) {
      const day = addDays(weekStart, i);

      for (const type of Object.keys(repartition)) {
        // base des données à créer
        const data = {
          user:      { connect: { id: userId } },
          date:      day,
          repasType: type,
        };

        // 9.1) Choix de la recette (sauf collation)
        let recette = null;
        if (type !== "collation") {
          const pool = recettes.filter((r) => {
            const cats = r.categories.map((c) =>
              c.category.name.toLowerCase()
            );
            if (type === "petit-dejeuner") {
              return cats.includes("petit déjeuner");
            } else {
              return (
                !cats.includes("petit déjeuner") &&
                !cats.includes("collation")
              );
            }
          });
          if (pool.length) {
            recette = pool[Math.floor(Math.random() * pool.length)];
          }
        }

        // 9.2) Si on a une recette, on applique scalabilité + clamp DAIRY + connect
        if (recette) {
          const hasEgg = recette.ingredients.some((ri) =>
            ri.ingredient.name.toLowerCase().includes("oeuf")
          );

          if (!hasEgg) {
            // calcul des totaux
            const totals = recette.ingredients.reduce(
              (s, ri) => ({
                p: s.p + (ri.ingredient.protein * ri.quantity) / 100,
                f: s.f + (ri.ingredient.fat     * ri.quantity) / 100,
                g: s.g + (ri.ingredient.carbs   * ri.quantity) / 100,
              }),
              { p: 0, f: 0, g: 0 }
            );
            // objectifs
            const target = {
              p: user.poids * 1.8 * repartition[type],
              f: ((user.metabolismeCible * 0.3) / 9) * repartition[type],
              g:
                ((user.metabolismeCible -
                  user.poids * 1.8 * 4 -
                  user.metabolismeCible * 0.3) /
                  4) *
                repartition[type],
            };
            // facteur minimal
            let factor = Math.min(
              target.p / totals.p,
              target.f / totals.f,
              target.g / totals.g
            );
            // clamp DAIRY à 150g
            recette.ingredients.forEach((ri) => {
              const isDairy = ri.ingredient.sideTypes.some(
                (st) => st.sideType === "DAIRY"
              );
              if (isDairy && ri.quantity * factor > 150) {
                factor = Math.min(factor, 150 / ri.quantity);
              }
            });
            // appliquer le facteur
            recette.ingredients = recette.ingredients.map((ri) => ({
              ...ri,
              quantity: Math.round(ri.quantity * factor),
            }));
          }

          data.recette = { connect: { id: recette.id } };
        }

        // 9.3) Si c’est une collation, on ajoute un accompagnement auto
        else if (type === "collation") {
          const pool = ingredients.filter(
            (i) =>
              i.protein >= 10 &&
              i.sideTypes.some((st) =>
                ["PROTEIN", "DAIRY"].includes(st.sideType)
              )
          );
          if (pool.length) {
            const ing = pool[Math.floor(Math.random() * pool.length)];
            const qty = Math.min(
              150,
              Math.round(
                (user.poids * 1.8 * repartition[type]) / (ing.protein / 100)
              )
            );
            data.accompagnements = {
              create: [
                {
                  ingredient: { connect: { id: ing.id } },
                  quantity: qty,
                },
              ],
            };
          }
        }

        // on ajoute la création à la liste
        creations.push(prisma.menuJournalier.create({ data }));
      }
    }

    // 10) Lancer les créations en parallèle
    await Promise.all(creations);

    return res
      .status(200)
      .json({ message: "Menu généré avec règles appliquées." });
  } catch (err) {
    console.error("Erreur génération menu :", err);
    return res
      .status(500)
      .json({ message: "Erreur serveur lors de la génération" });
  }
}

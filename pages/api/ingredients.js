// pages/api/ingredients.js

import prisma from "../../lib/prisma";

export default async function handler(req, res) {
  const { type } = req.query;

  // ─── GET : lister les ingrédients avec leurs sideTypes ─────────────────
  if (req.method === "GET") {
    try {
      const ingredients = await prisma.ingredient.findMany({
        where: type ? { ingredientType: type } : {},
        include: {
          sideTypes: { select: { sideType: true } },
        },
      });

      const data = ingredients.map(({ sideTypes, ...ing }) => ({
        ...ing,
        sideTypes: sideTypes.map((st) => st.sideType),
      }));

      return res.status(200).json(data);
    } catch (error) {
      // Log complet côté serveur
      console.error("GET /api/ingredients error:", {
        message: error.message,
        stack: error.stack,
      });
      // Renvoyer aussi les détails au client pour debug
      return res
        .status(500)
        .json({
          message: "Erreur lors de la récupération des ingrédients",
          details: error.message,
        });
    }
  }

  // ─── POST : créer un ingrédient + ses sideTypes ───────────────────────
  if (req.method === "POST") {
    const {
      name,
      unit,
      price,
      calories,
      protein,
      fat,
      carbs,
      ingredientType,
      sideTypes = [],
    } = req.body;

    try {
      const newIngredient = await prisma.ingredient.create({
        data: {
          name,
          unit: unit || "g",
          price:    parseFloat(price),
          calories: parseInt(calories, 10),
          protein:  parseInt(protein, 10),
          fat:      parseInt(fat, 10),
          carbs:    parseInt(carbs, 10),
          ingredientType: ingredientType || null,
          sideTypes: {
            create: sideTypes.map((st) => ({ sideType: st })),
          },
        },
        include: {
          sideTypes: { select: { sideType: true } },
        },
      });

      const result = {
        ...newIngredient,
        sideTypes: newIngredient.sideTypes.map((st) => st.sideType),
      };

      return res.status(201).json(result);
    } catch (error) {
      console.error("POST /api/ingredients error:", {
        message: error.message,
        stack: error.stack,
      });
      return res
        .status(500)
        .json({
          message: "Erreur lors de la création de l'ingrédient",
          details: error.message,
        });
    }
  }

  // ─── autres méthodes non autorisées ───────────────────────────────────
  res.setHeader("Allow", ["GET", "POST"]);
  res.status(405).end(`Méthode ${req.method} non autorisée`);
}

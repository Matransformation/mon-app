// pages/api/recettes.js

import prisma from "../../lib/prisma";
import { IncomingForm } from "formidable";
import fs from "fs";
import path from "path";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  const { method } = req;

  if (method === "POST") {
    const form = new IncomingForm();
    const uploadDir = path.join(process.cwd(), "public/uploads");
    form.uploadDir = uploadDir;
    form.keepExtensions = true;

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error("Erreur parsing formulaire :", err);
        return res.status(500).json({ error: "Erreur lors de l'upload du fichier" });
      }

      try {
        const name            = fields.name?.[0] || "";
        const description     = fields.description?.[0] || "";
        const preparationTime = parseInt(fields.preparationTime?.[0]  || "0", 10);
        const cookingTime     = parseInt(fields.cookingTime?.[0]     || "0", 10);
        const ingredientsRaw  = fields.ingredients?.[0]   || "[]";
        const stepsRaw        = fields.steps?.[0]         || "[]";
        const categoriesRaw   = fields.categories?.[0]    || "[]";
        const allowedSidesRaw = fields.allowedSides?.[0]  || "[]";

        const ingredients   = JSON.parse(ingredientsRaw);
        const steps         = JSON.parse(stepsRaw);
        const categories    = JSON.parse(categoriesRaw);
        const allowedSides  = JSON.parse(allowedSidesRaw);

        const photoFile = files.photo?.[0];
        const photoUrl  = photoFile
          ? `/uploads/${path.basename(photoFile.filepath)}`
          : null;

        // Unité par défaut
        const ingredientsWithDefaultUnit = ingredients.map((ing) => ({
          ...ing,
          unit: ing.unit || "g",
        }));

        // Calcul macros & prix
        let totalCalories = 0;
        let totalProtein  = 0;
        let totalFat      = 0;
        let totalCarbs    = 0;
        let totalPrice    = 0;

        for (const ing of ingredientsWithDefaultUnit) {
          const ingredientData = await prisma.ingredient.findUnique({
            where: { id: ing.id },
          });
          if (ingredientData) {
            const ratio = ing.quantity / 100;
            totalCalories += ingredientData.calories * ratio;
            totalProtein  += ingredientData.protein  * ratio;
            totalFat      += ingredientData.fat      * ratio;
            totalCarbs    += ingredientData.carbs    * ratio;
            totalPrice    += (ingredientData.price * ing.quantity) / 1000;
          }
        }

        const createdRecette = await prisma.recette.create({
          data: {
            name,
            description,
            preparationTime,
            cookingTime,
            steps,
            photoUrl,
            price:    totalPrice,
            calories: Math.round(totalCalories),
            protein:  Math.round(totalProtein),
            fat:      Math.round(totalFat),
            carbs:    Math.round(totalCarbs),
            ingredients: {
              create: ingredientsWithDefaultUnit.map((ing) => ({
                quantity: parseFloat(ing.quantity),
                unit:     ing.unit,
                ingredient: { connect: { id: ing.id } },
              })),
            },
            categories: {
              create: categories.map((catId) => ({
                category: { connect: { id: catId } },
              })),
            },
            allowedSides: {
              create: allowedSides.map((st) => ({ sideType: st })),
            },
          },
        });

        return res.status(200).json({ recette: createdRecette });
      } catch (error) {
        console.error("Erreur Prisma création recette :", error);
        return res.status(500).json({
          error:   "Erreur lors de la création de la recette",
          details: error.message,
        });
      }
    });

  } else if (method === "GET") {
    try {
      const recettes = await prisma.recette.findMany({
        include: {
          ingredients:  { include: { ingredient: true } },
          categories:   { include: { category:   true } },
          allowedSides: true,
        },
      });

      // Retourner allowedSides en simple tableau de string
      const data = recettes.map(({ allowedSides, ...r }) => ({
        ...r,
        allowedSides: allowedSides.map((a) => a.sideType),
      }));

      return res.status(200).json(data);
    } catch (error) {
      console.error("Erreur chargement recettes :", error);
      return res.status(500).json({
        error:   "Erreur lors de la récupération des recettes",
        details: error.message,
      });
    }

  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).json({ error: `Méthode ${method} non autorisée` });
  }
}

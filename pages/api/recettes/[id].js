// pages/api/recettes/[id].js

import { IncomingForm } from "formidable";
import path from "path";
import prisma from "../../../lib/prisma";

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  const { method } = req;
  const { id }     = req.query;

  if (method === "GET") {
    try {
      const recette = await prisma.recette.findUnique({
        where: { id },
        include: {
          ingredients:  { include: { ingredient: true } },
          categories:   { include: { category:   true } },
          allowedSides: true,
        },
      });
      if (!recette) {
        return res.status(404).json({ error: "Recette non trouvée" });
      }
      return res.status(200).json({
        ...recette,
        scalable: recette.scalable,
        allowedSides: recette.allowedSides.map(a => a.sideType),
      });
    } catch (error) {
      console.error("GET /api/recettes/[id] error:", error);
      return res.status(500).json({ error: "Erreur serveur" });
    }
  }

  if (method === "PUT") {
    const form = new IncomingForm();
    form.uploadDir      = path.join(process.cwd(), "public/uploads");
    form.keepExtensions = true;

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error("Form parsing error:", err);
        return res.status(500).json({ error: "Erreur formulaire" });
      }

      try {
        // 1) Parsing des champs
        const name            = fields.name?.[0] || "";
        const description     = fields.description?.[0] || "";
        const preparationTime = parseInt(fields.preparationTime?.[0] || "0", 10);
        const cookingTime     = parseInt(fields.cookingTime?.[0]     || "0", 10);
        const steps           = JSON.parse(fields.steps?.[0]           || "[]");
        const ingredients     = JSON.parse(fields.ingredients?.[0]     || "[]");
        const categories      = JSON.parse(fields.categories?.[0]      || "[]");
        const allowedSides    = JSON.parse(fields.allowedSides?.[0]    || "[]");
        const scalable        = JSON.parse(fields.scalable?.[0]        || "true");

        const photoFile = files.photo?.[0];
        const photoUrl  = photoFile
          ? `/uploads/${path.basename(photoFile.filepath)}`
          : undefined;

        // 2) Supprimer les anciens liens
        await prisma.recetteIngredient.deleteMany({ where: { recetteId: id } });
        await prisma.recetteCategory.deleteMany  ({ where: { recetteId: id } });
        await prisma.recetteAllowedSide.deleteMany({ where: { recetteId: id } });

        // 3) Mettre à jour la recette
        await prisma.recette.update({
          where: { id },
          data: {
            name,
            description,
            preparationTime,
            cookingTime,
            steps,
            photoUrl,
            calories: parseFloat(fields.calories?.[0] || "0"),
            protein:  parseFloat(fields.protein?.[0]  || "0"),
            fat:      parseFloat(fields.fat?.[0]      || "0"),
            carbs:    parseFloat(fields.carbs?.[0]    || "0"),
            scalable,
          },
        });

        // 4) Recréer les ingrédients
        if (ingredients.length) {
          await prisma.recetteIngredient.createMany({
            data: ingredients.map(ing => ({
              recetteId:    id,
              ingredientId: ing.id,
              quantity:     parseFloat(ing.quantity),
              unit:         ing.unit || "g",
            })),
          });
        }

        // 5) Recréer les catégories
        if (categories.length) {
          const validCats = await prisma.category.findMany({
            where: { id: { in: categories } },
          });
          await prisma.recetteCategory.createMany({
            data: validCats.map(c => ({
              recetteId:  id,
              categoryId: c.id,
            })),
          });
        }

        // 6) Recréer les accompagnements autorisés
        if (allowedSides.length) {
          await prisma.recetteAllowedSide.createMany({
            data: allowedSides.map(st => ({
              recetteId: id,
              sideType:  st,
            })),
          });
        }

        // 7) Renvoyer la recette mise à jour
        const updated = await prisma.recette.findUnique({
          where: { id },
          include: {
            ingredients:  { include: { ingredient: true } },
            categories:   { include: { category:   true } },
            allowedSides: true,
          },
        });
        return res.status(200).json({
          ...updated,
          scalable: updated.scalable,
          allowedSides: updated.allowedSides.map(a => a.sideType),
        });
      } catch (error) {
        console.error("PUT /api/recettes/[id] error:", error);
        return res.status(500).json({ error: "Erreur mise à jour" });
      }
    });
    return;
  }

  if (method === "DELETE") {
    try {
      await prisma.recetteIngredient.deleteMany({ where: { recetteId: id } });
      await prisma.recetteCategory.deleteMany  ({ where: { recetteId: id } });
      await prisma.recetteAllowedSide.deleteMany({ where: { recetteId: id } });
      await prisma.recette.delete({ where: { id } });
      return res.status(200).json({ message: "Recette supprimée" });
    } catch (error) {
      console.error("DELETE /api/recettes/[id] error:", error);
      return res.status(500).json({ error: "Erreur suppression" });
    }
  }

  res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
  return res.status(405).end(`Méthode ${method} non autorisée`);
}

// pages/api/ingredient/[id].js

import prisma from "../../../lib/prisma";

// Liste des valeurs autorisées par votre enum Prisma SideType
const VALID_SIDE_TYPES = [
  "PROTEIN",
  "BREAKFAST_PROTEIN",
  "FRUIT_SIDE",
  "CARB",
  "FAT",
  "DAIRY",
  "CEREAL",
  "VEGETABLE_SIDE",
];

export default async function handler(req, res) {
  const { id } = req.query;

  // ─── PUT : mise à jour d’un ingrédient et de ses sideTypes ───────────
  if (req.method === "PUT") {
    const {
      name,
      unit,
      price,
      calories,
      protein,
      fat,
      carbs,
      ingredientType,
      sideTypes = [], // ex. ["CARB","BREAKFAST_PROTEIN","FRUIT_SIDE"]
    } = req.body;

    // on ne garde que les valeurs connues par l'enum
    const filteredSides = sideTypes.filter((st) =>
      VALID_SIDE_TYPES.includes(st)
    );

    try {
      const updated = await prisma.ingredient.update({
        where: { id },
        data: {
          name,
          unit,
          price:          parseFloat(price),
          calories:       parseInt(calories, 10),
          protein:        parseInt(protein,  10),
          fat:            parseInt(fat,      10),
          carbs:          parseInt(carbs,    10),
          ingredientType: ingredientType || null,
          sideTypes: {
            // on supprime d'abord tous les anciens liens
            deleteMany: {},
            // puis on recrée uniquement ceux qui sont valides
            create:     filteredSides.map((st) => ({ sideType: st })),
          },
        },
        include: { sideTypes: { select: { sideType: true } } },
      });

      return res.status(200).json({
        ...updated,
        sideTypes: updated.sideTypes.map((st) => st.sideType),
      });
    } catch (error) {
      console.error("PUT /api/ingredient/[id] :", error);
      return res
        .status(500)
        .json({ message: "Erreur lors de la mise à jour de l'ingrédient" });
    }
  }

  // ─── DELETE : suppression (2 étapes pour éviter la FK) ───────────────
  if (req.method === "DELETE") {
    try {
      await prisma.ingredientSideType.deleteMany({ where: { ingredientId: id } });
      await prisma.ingredient.delete({ where: { id } });
      return res.status(204).end();
    } catch (error) {
      console.error("DELETE /api/ingredient/[id] :", error);
      return res
        .status(500)
        .json({ message: "Erreur lors de la suppression de l'ingrédient" });
    }
  }

  // Méthode non autorisée
  res.setHeader("Allow", ["PUT", "DELETE"]);
  res.status(405).end(`Méthode ${req.method} non autorisée`);
}

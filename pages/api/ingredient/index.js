// pages/api/ingredients/index.js
import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
  if (req.method === "GET") {
    // pas de 304
    res.setHeader("Cache-Control", "no-store");
    try {
      const list = await prisma.ingredient.findMany({
        include: { sideTypes: true },
      });
      // on n’envoie que les valeurs
      const data = list.map(({ sideTypes, ...i }) => ({
        ...i,
        sideTypes: sideTypes.map((st) => st.sideType),
      }));
      return res.status(200).json(data);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Erreur serveur" });
    }
  }

  if (req.method === "POST") {
    const {
      name, unit, price, calories,
      protein, fat, carbs,
      ingredientType,
      sideTypes = [],
    } = req.body;
    try {
      const created = await prisma.ingredient.create({
        data: {
          name,
          unit,
          price:     parseFloat(price),
          calories:  parseInt(calories,10),
          protein:   parseInt(protein,10),
          fat:       parseInt(fat,10),
          carbs:     parseInt(carbs,10),
          ingredientType,
          sideTypes: {
            create: sideTypes.map((v) => ({ sideType: v })),
          },
        },
        include: { sideTypes: true },
      });
      // on renvoie back un tableau de strings
      return res.status(201).json({
        ...created,
        sideTypes: created.sideTypes.map((st) => st.sideType),
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Erreur création ingrédient" });
    }
  }

  res.setHeader("Allow", ["GET","POST"]);
  res.status(405).end(`Méthode ${req.method} non autorisée`);
}

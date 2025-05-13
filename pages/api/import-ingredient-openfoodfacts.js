import prisma from "../../lib/prisma";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Méthode non autorisée" });
  }

  const { name, calories, protein, fat, carbs } = req.body;

  if (!name || calories == null || protein == null || fat == null || carbs == null) {
    return res.status(400).json({ message: "Champs manquants" });
  }

  try {
    const newIngredient = await prisma.ingredient.create({
      data: {
        name,
        price: 10, // prix par défaut en €/kg (à ajuster ensuite si besoin)
        calories: parseInt(calories),
        protein: parseInt(protein),
        fat: parseInt(fat),
        carbs: parseInt(carbs),
      },
    });

    res.status(201).json(newIngredient);
  } catch (error) {
    console.error("Erreur création ingrédient:", error);
    res.status(500).json({ message: "Erreur serveur création ingrédient" });
  }
}

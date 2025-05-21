// File: pages/api/menu/accompagnement.js
import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { repasId, ingredientId, quantity } = req.body;

    console.log("🛠️ API reçue :", { repasId, ingredientId, quantity });

    if (!repasId || !ingredientId || !quantity) {
      return res.status(400).json({ error: "Paramètres manquants" });
    }

    try {
      const created = await prisma.accompagnement.create({
        data: {
          menu: { connect: { id: repasId } }, // Assure-toi que repasId correspond bien au menu.id
          ingredient: { connect: { id: ingredientId } },
          quantity: parseInt(quantity, 10),
        },
      });

      return res.status(200).json(created);
    } catch (error) {
      console.error("❌ Erreur serveur API accompagnement :", error);
      return res.status(500).json({ error: "Erreur serveur" });
    }
  }

  res.setHeader("Allow", ["POST"]);
  res.status(405).end(`Méthode ${req.method} non autorisée`);
}

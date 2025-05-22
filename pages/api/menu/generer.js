// pages/api/menu/generer.js
import { generateWeeklyMenu } from "../../../lib/menuGenerator";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res
      .status(405)
      .json({ message: `Méthode ${req.method} non autorisée` });
  }

  const { userId, weekStart: weekStartIso } = req.body;
  if (!userId) {
    return res.status(400).json({ message: "userId manquant." });
  }

  try {
    await generateWeeklyMenu(userId, weekStartIso);
    return res
      .status(200)
      .json({ message: "Menu généré avec règles appliquées." });
  } catch (err) {
    console.error("Erreur génération menu :", err);
    return res
      .status(500)
      .json({
        message: "Erreur serveur lors de la génération",
        detail: err.message,
      });
  }
}

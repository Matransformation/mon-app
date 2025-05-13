// /pages/api/categories/index.js
import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
  const { method } = req;

  if (method === "GET") {
    try {
      const categories = await prisma.category.findMany();
      res.status(200).json(categories);
    } catch (error) {
      console.error("Erreur récupération des catégories :", error);
      res.status(500).json({ error: "Erreur lors de la récupération des catégories" });
    }
  } 
  else if (method === "POST") {
    const { name } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({ error: "Le nom de la catégorie est requis." });
    }

    try {
      const newCategory = await prisma.category.create({
        data: { name },
      });
      res.status(201).json(newCategory);
    } catch (error) {
      console.error("Erreur création de la catégorie :", error);
      res.status(500).json({ error: "Erreur lors de la création de la catégorie" });
    }
  } 
  else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).json({ error: `Méthode ${method} non autorisée` });
  }
}

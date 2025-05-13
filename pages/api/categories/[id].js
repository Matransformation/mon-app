// /pages/api/categories/[id].js
import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
  const { method } = req;
  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "ID de catégorie invalide." });
  }

  if (method === "GET") {
    try {
      const category = await prisma.category.findUnique({
        where: { id },
      });

      if (!category) {
        return res.status(404).json({ error: "Catégorie non trouvée" });
      }

      res.status(200).json(category);
    } catch (error) {
      console.error("Erreur récupération de la catégorie :", error);
      res.status(500).json({ error: "Erreur lors de la récupération de la catégorie" });
    }
  } 
  else if (method === "PUT") {
    const { name } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({ error: "Le nom de la catégorie est requis." });
    }

    try {
      const updatedCategory = await prisma.category.update({
        where: { id },
        data: { name },
      });
      res.status(200).json(updatedCategory);
    } catch (error) {
      console.error("Erreur mise à jour de la catégorie :", error);
      res.status(500).json({ error: "Erreur lors de la mise à jour de la catégorie" });
    }
  } 
  else if (method === "DELETE") {
    try {
      await prisma.category.delete({
        where: { id },
      });
      res.status(200).json({ message: "Catégorie supprimée avec succès" });
    } catch (error) {
      console.error("Erreur suppression de la catégorie :", error);
      res.status(500).json({ error: "Erreur lors de la suppression de la catégorie" });
    }
  } 
  else {
    res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
    res.status(405).json({ error: `Méthode ${method} non autorisée` });
  }
}

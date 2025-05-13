// pages/api/utilisateur/[id]/favoris.js
import { getToken } from "next-auth/jwt";
import prisma from "../../../../lib/prisma";

export default async function handler(req, res) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token || token.id !== req.query.id) {
    return res.status(401).json({ error: "Non autorisé" });
  }

  const userId = req.query.id;

  switch (req.method) {
    case "GET":
      try {
        const favoris = await prisma.favori.findMany({
          where: { utilisateurId: userId },
          include: { recette: true },
        });
        const recettes = favoris.map((f) => f.recette);
        return res.status(200).json(recettes);
      } catch (err) {
        console.error("Erreur GET favoris :", err);
        return res.status(500).json({ error: "Erreur serveur" });
      }

    case "POST": {
      const { recetteId } = req.body;
      if (!recetteId) return res.status(400).json({ error: "recetteId requis" });

      try {
        await prisma.favori.create({
          data: {
            utilisateurId: userId,
            recetteId,
          },
        });
        return res.status(201).json({ message: "Ajouté aux favoris" });
      } catch (err) {
        console.error("Erreur POST favoris :", err);
        return res.status(500).json({ error: "Erreur serveur" });
      }
    }

    case "DELETE": {
      const { recetteId } = req.body;
      if (!recetteId) return res.status(400).json({ error: "recetteId requis" });

      try {
        await prisma.favori.deleteMany({
          where: {
            utilisateurId: userId,
            recetteId,
          },
        });
        return res.status(200).json({ message: "Retiré des favoris" });
      } catch (err) {
        console.error("Erreur DELETE favoris :", err);
        return res.status(500).json({ error: "Erreur serveur" });
      }
    }

    default:
      res.setHeader("Allow", ["GET", "POST", "DELETE"]);
      return res.status(405).end(`Méthode ${req.method} non autorisée`);
  }
}

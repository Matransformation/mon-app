// pages/api/likes/index.js

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { userId, postId } = req.body;

    if (!userId || !postId) {
      return res.status(400).json({ error: "userId et postId requis" });
    }

    try {
      const existingLike = await prisma.like.findUnique({
        where: {
          userId_postId: {
            userId,
            postId,
          },
        },
      });

      if (existingLike) {
        await prisma.like.delete({
          where: {
            userId_postId: {
              userId,
              postId,
            },
          },
        });
      } else {
        await prisma.like.create({
          data: {
            userId,
            postId,
          },
        });
      }

      // 🔁 Mise à jour : renvoyer la liste des likes à jour
      const updatedLikes = await prisma.like.findMany({
        where: { postId },
      });

      return res.status(200).json({ updatedLikes });
    } catch (error) {
      console.error("Erreur like :", error);
      return res.status(500).json({ error: "Erreur lors du traitement du like" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).json({ error: "Méthode non autorisée" });
  }
}

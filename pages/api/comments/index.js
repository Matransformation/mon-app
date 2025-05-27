// pages/api/comments/index.js

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { content, authorId, postId } = req.body;

    if (!content || !authorId || !postId) {
      return res.status(400).json({ error: "Champs requis manquants" });
    }

    try {
      const comment = await prisma.comment.create({
        data: {
          content,
          authorId,
          postId,
        },
        include: {
          author: { select: { id: true, name: true, image: true } },
        },
      });

      res.status(201).json(comment);
    } catch (error) {
      res.status(500).json({ error: "Erreur lors de l'ajout du commentaire" });
    }
  } else {
    res.status(405).json({ error: "Méthode non autorisée" });
  }
}

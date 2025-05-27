// pages/api/posts/index.js

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const posts = await prisma.post.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          author: {
            select: { id: true, name: true, image: true }
          },
          comments: {
            include: {
              author: {
                select: { id: true, name: true, image: true }
              }
            },
            orderBy: { createdAt: "asc" }
          },
          likes: true,
        },
      });

      return res.status(200).json(posts);
    } catch (error) {
      console.error("Erreur API GET /posts :", error);
      return res.status(500).json({ error: "Erreur serveur" });
    }
  }

  if (req.method === "POST") {
    const { content, authorId, imageUrl = null } = req.body;

    if (!authorId || !content) {
      return res.status(400).json({ error: "Champs requis manquants" });
    }

    try {
      const post = await prisma.post.create({
        data: {
          content,
          authorId,
          imageUrl, // peut être null
        },
        include: {
          author: { select: { id: true, name: true, image: true } },
          comments: {
            include: {
              author: { select: { id: true, name: true, image: true } },
            },
            orderBy: { createdAt: "asc" },
          },
          likes: true,
        },
      });

      return res.status(201).json(post);
    } catch (error) {
      console.error("Erreur API POST /posts :", error);
      return res.status(500).json({ error: "Erreur serveur lors de la création du post" });
    }
  }

  return res.status(405).json({ error: "Méthode non autorisée" });
}

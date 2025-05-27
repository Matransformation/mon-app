// pages/api/posts/index.js

import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const posts = await prisma.post.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          author: {
            select: { id: true, name: true, image: true },
          },
          comments: {
            include: {
              author: { select: { id: true, name: true, image: true } },
            },
            orderBy: { createdAt: "asc" },
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
    const session = await getServerSession(req, res, authOptions);
    if (!session) return res.status(401).json({ error: "Non autorisé" });

    const { content, imageUrl } = req.body;

    if (!content) {
      return res.status(400).json({ error: "Contenu requis" });
    }

    try {
      const post = await prisma.post.create({
        data: {
          content,
          authorId: session.user.id,
          imageUrl: imageUrl || null,
        },
        include: {
          author: {
            select: { id: true, name: true, image: true },
          },
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
      console.error("Erreur Prisma POST:", error);
      return res.status(500).json({ error: "Erreur enregistrement post" });
    }
  }

  return res.status(405).json({ error: "Méthode non autorisée" });
}

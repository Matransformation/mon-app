// pages/api/posts/index.js

import { IncomingForm } from "formidable";
import cloudinary from "../../../lib/cloudinary";
import fs from "fs";
import prisma from "../../../lib/prisma";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method === "POST") {
    const form = new IncomingForm({ keepExtensions: true });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error("Erreur parsing form:", err);
        return res.status(500).json({ error: "Erreur d'analyse du formulaire" });
      }

      try {
        const content = fields.content?.[0] || "";
        const authorId = fields.authorId?.[0] || null;
        const photoFile = files.image?.[0];

        if (!authorId || !content.trim()) {
          return res.status(400).json({ error: "Champs requis manquants" });
        }

        let imageUrl = null;
        if (photoFile) {
          const uploadResult = await cloudinary.uploader.upload(photoFile.filepath, {
            folder: "posts",
          });
          imageUrl = uploadResult.secure_url;
        }

        const newPost = await prisma.post.create({
          data: {
            content,
            authorId,
            imageUrl,
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

        return res.status(201).json(newPost);
      } catch (error) {
        console.error("Erreur lors de la création du post:", error);
        return res.status(500).json({ error: "Erreur serveur lors de la création du post" });
      }
    });
  }

  if (req.method === "GET") {
    try {
      const posts = await prisma.post.findMany({
        orderBy: { createdAt: "desc" },
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
      return res.status(200).json(posts);
    } catch (error) {
      console.error("Erreur GET /posts:", error);
      return res.status(500).json({ error: "Erreur serveur" });
    }
  }

  return res.status(405).json({ error: "Méthode non autorisée" });
}

// pages/api/posts/index.js

import prisma from "../../../lib/prisma";
import { IncomingForm } from "formidable";
import cloudinary from "../../../lib/cloudinary";
import fs from "fs";
import path from "path";

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
        console.error("❌ Erreur parsing formulaire :", err);
        return res.status(500).json({ error: "Erreur lors de l'upload du fichier" });
      }

      try {
        const content = fields.content?.[0] || "";
        const authorId = fields.authorId?.[0] || null;
        const imageFile = files.image?.[0];

        console.log("📩 Champs reçus :");
        console.log("content:", content);
        console.log("authorId:", authorId);
        console.log("imageFile:", imageFile);

        if (!authorId || !content.trim()) {
          console.warn("⚠️ Champs requis manquants");
          return res.status(400).json({ error: "Champs requis manquants" });
        }

        let imageUrl = null;
        if (imageFile) {
          try {
            console.log("📤 Envoi de l'image vers Cloudinary...");
            const uploadResult = await cloudinary.uploader.upload(imageFile.filepath, {
              folder: "posts",
            });
            console.log("✅ Image uploadée :", uploadResult.secure_url);
            imageUrl = uploadResult.secure_url;
          } catch (uploadError) {
            console.error("❌ Erreur upload Cloudinary :", uploadError);
            return res.status(500).json({ error: "Erreur Cloudinary", details: uploadError.message });
          }
        }

        console.log("📝 Création du post en base...");
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

        console.log("✅ Post créé avec succès :", newPost.id);
        return res.status(201).json(newPost);
      } catch (error) {
        console.error("❌ Erreur Prisma création post :", error);
        return res.status(500).json({
          error: "Erreur lors de la création du post",
          details: error.message,
        });
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
      console.error("❌ Erreur GET /posts:", error);
      return res.status(500).json({ error: "Erreur serveur" });
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).json({ error: `Méthode ${req.method} non autorisée` });
}

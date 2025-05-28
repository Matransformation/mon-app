import prisma from "../../../lib/prisma";
import { IncomingForm } from "formidable";
import cloudinary from "../../../lib/cloudinary";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  console.log("📩 Requête reçue :", req.method);

  if (req.method === "POST") {
    console.log("📝 Traitement POST...");

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
        console.log("📷 imageFile reçu :", imageFile);

        if (!authorId || !content.trim()) {
          return res.status(400).json({ error: "Champs requis manquants" });
        }

        let imageUrl = null;
        if (imageFile) {
          const uploadResult = await cloudinary.uploader.upload(imageFile.filepath, {
            folder: "posts",
          });
          console.log("✅ Image uploadée :", uploadResult.secure_url);
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

        console.log("✅ Nouveau post créé :", newPost.id);
        return res.status(201).json(newPost);
      } catch (error) {
        console.error("❌ Erreur Prisma création post :", error);
        return res.status(500).json({
          error: "Erreur lors de la création du post",
          details: error.message,
        });
      }
    });

    return; // très important
  }

  if (req.method === "GET") {
    console.log("📥 Récupération des posts...");
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

  console.warn("🚫 Méthode non autorisée :", req.method);
  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).json({ error: `Méthode ${req.method} non autorisée` });
}

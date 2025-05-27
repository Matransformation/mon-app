// pages/api/posts/index.js

import { PrismaClient } from "@prisma/client";
import formidable from "formidable";
import cloudinary from "../../../lib/cloudinary";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

export const config = {
  api: {
    bodyParser: false, // nécessaire pour formidable
  },
};

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === "GET") {
    // (inchangé)
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
      console.error("Erreur API GET /posts :", error);
      return res.status(500).json({ error: "Erreur serveur" });
    }
  }

  if (req.method === "POST") {
    const session = await getServerSession(req, res, authOptions);
    if (!session) return res.status(401).json({ error: "Non autorisé" });

    const form = formidable({ keepExtensions: true });

    form.parse(req, async (err, fields, files) => {
      if (err) return res.status(500).json({ error: "Erreur d’upload" });

      const content = Array.isArray(fields.content)
        ? fields.content[0]
        : fields.content;

      const file = files.image?.[0];
      let imageUrl = null;

      if (file) {
        try {
          const upload = await cloudinary.uploader.upload(file.filepath, {
            folder: "posts",
          });
          imageUrl = upload.secure_url;
        } catch (uploadErr) {
          console.error("Erreur upload Cloudinary:", uploadErr);
          return res.status(500).json({ error: "Erreur upload image" });
        }
      }

      try {
        const post = await prisma.post.create({
          data: {
            content,
            authorId: session.user.id,
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

        return res.status(201).json(post);
      } catch (error) {
        console.error("Erreur Prisma POST:", error);
        return res.status(500).json({ error: "Erreur enregistrement post" });
      }
    });
  }

  return res.status(405).json({ error: "Méthode non autorisée" });
}

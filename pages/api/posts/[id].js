import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: "Non authentifié" });
  }

  const userId = session.user.id;
  const isAdmin = session.user.role === "admin";

  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "ID de post invalide" });
  }

  if (req.method === "DELETE") {
    try {
      const post = await prisma.post.findUnique({ where: { id } });

      if (!post) {
        return res.status(404).json({ error: "Post non trouvé" });
      }

      if (post.authorId !== userId && !isAdmin) {
        return res.status(403).json({ error: "Accès refusé" });
      }

      // Supprimer les commentaires liés
      await prisma.comment.deleteMany({
        where: { postId: id },
      });

      // Supprimer les likes liés
      await prisma.like.deleteMany({
        where: { postId: id },
      });

      // Puis supprimer le post
      await prisma.post.delete({ where: { id } });

      return res.status(200).json({ message: "Post, commentaires et likes supprimés" });
    } catch (error) {
      console.error("Erreur suppression post :", error);
      return res.status(500).json({ error: "Erreur serveur" });
    }
  }

  if (req.method === "PUT") {
    const { content, imageUrl } = req.body;

    if (!content || typeof content !== "string") {
      return res.status(400).json({ error: "Contenu invalide" });
    }

    try {
      const post = await prisma.post.findUnique({ where: { id } });
      if (!post) return res.status(404).json({ error: "Post non trouvé" });

      if (post.authorId !== userId && !isAdmin) {
        return res.status(403).json({ error: "Accès refusé" });
      }

      const updatedPost = await prisma.post.update({
        where: { id },
        data: { content, imageUrl },
      });

      return res.status(200).json(updatedPost);
    } catch (error) {
      console.error("Erreur mise à jour post :", error);
      return res.status(500).json({ error: "Erreur serveur" });
    }
  }

  return res.status(405).json({ error: "Méthode non autorisée" });
}

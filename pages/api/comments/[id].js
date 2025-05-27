import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]"; // adapte chemin

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: "Non authentifié" });

  const userId = session.user.id;
  const isAdmin = !!session.user.isAdmin;
  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "ID de commentaire invalide" });
  }

  if (req.method === "DELETE") {
    try {
      const comment = await prisma.comment.findUnique({ where: { id } });
      if (!comment) return res.status(404).json({ error: "Commentaire non trouvé" });

      if (comment.authorId !== userId && !isAdmin) {
        return res.status(403).json({ error: "Accès refusé" });
      }

      await prisma.comment.delete({ where: { id } });
      return res.status(200).json({ message: "Commentaire supprimé" });
    } catch (error) {
      console.error("Erreur suppression commentaire :", error);
      return res.status(500).json({ error: "Erreur serveur" });
    }
  }

  if (req.method === "PUT") {
    const { content } = req.body;
    if (!content || typeof content !== "string") {
      return res.status(400).json({ error: "Contenu invalide" });
    }

    try {
      const comment = await prisma.comment.findUnique({ where: { id } });
      if (!comment) return res.status(404).json({ error: "Commentaire non trouvé" });

      if (comment.authorId !== userId && !isAdmin) {
        return res.status(403).json({ error: "Accès refusé" });
      }

      const updatedComment = await prisma.comment.update({
        where: { id },
        data: { content },
      });

      return res.status(200).json(updatedComment);
    } catch (error) {
      console.error("Erreur mise à jour commentaire :", error);
      return res.status(500).json({ error: "Erreur serveur" });
    }
  }

  return res.status(405).json({ error: "Méthode non autorisée" });
}

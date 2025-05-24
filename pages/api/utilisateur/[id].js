// pages/api/utilisateur/[id].js
import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
  const { method } = req;
  const { id } = req.query;

  if (method === "GET") {
    try {
      const utilisateur = await prisma.user.findUnique({ where: { id } });

      if (!utilisateur) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }

      return res.status(200).json(utilisateur);
    } catch (error) {
      console.error("Erreur récupération utilisateur :", error);
      return res.status(500).json({ message: "Erreur récupération utilisateur" });
    }
  }

  if (method === "PUT") {
    const { name, email, role } = req.body;
    const data = {};
    if (name !== undefined) data.name = name;
    if (email !== undefined) data.email = email;
    if (role !== undefined) data.role = role;

    try {
      const updatedUser = await prisma.user.update({
        where: { id },
        data,
      });
      return res.status(200).json(updatedUser);
    } catch (error) {
      console.error("Erreur mise à jour utilisateur :", error);
      return res.status(500).json({ message: "Erreur mise à jour utilisateur" });
    }
  }

  if (method === "DELETE") {
    try {
      await prisma.$transaction([
        prisma.accompagnement.deleteMany({ where: { menu: { userId: id } } }),
        prisma.menuJournalier.deleteMany({ where: { userId: id } }),
        prisma.repasJournalier.deleteMany({ where: { userId: id } }),
        prisma.favori.deleteMany({ where: { utilisateurId: id } }),
        prisma.historiquePoids.deleteMany({ where: { utilisateurId: id } }),
        prisma.mensurations.deleteMany({ where: { utilisateurId: id } }),
        prisma.account.deleteMany({ where: { userId: id } }),
        prisma.session.deleteMany({ where: { userId: id } }),
        prisma.emailVerificationToken.deleteMany({ where: { userId: id } }),
        prisma.passwordResetToken.deleteMany({ where: { userId: id } }),
        prisma.user.delete({ where: { id } }),
      ]);

      return res.status(200).json({ message: "Utilisateur supprimé" });
    } catch (error) {
      console.error("Erreur suppression utilisateur :", error);
      return res.status(500).json({ message: "Erreur suppression utilisateur" });
    }
  }

  res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
  return res.status(405).json({ message: `Méthode ${method} non autorisée` });
}

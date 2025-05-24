// pages/api/admin/utilisateurs/delete-many.js
import prisma from "../../../../lib/prisma";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Méthode non autorisée" });
  }

  const { ids } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ message: "Liste d'identifiants manquante ou vide" });
  }

  try {
    await prisma.$transaction([
      prisma.accompagnement.deleteMany({ where: { menu: { userId: { in: ids } } } }),
      prisma.menuJournalier.deleteMany({ where: { userId: { in: ids } } }),
      prisma.repasJournalier.deleteMany({ where: { userId: { in: ids } } }),
      prisma.favori.deleteMany({ where: { utilisateurId: { in: ids } } }),
      prisma.historiquePoids.deleteMany({ where: { utilisateurId: { in: ids } } }),
      prisma.mensurations.deleteMany({ where: { utilisateurId: { in: ids } } }),
      prisma.account.deleteMany({ where: { userId: { in: ids } } }),
      prisma.session.deleteMany({ where: { userId: { in: ids } } }),
      prisma.emailVerificationToken.deleteMany({ where: { userId: { in: ids } } }),
      prisma.passwordResetToken.deleteMany({ where: { userId: { in: ids } } }),
      prisma.user.deleteMany({ where: { id: { in: ids } } }),
    ]);

    return res.status(200).json({ message: "Utilisateurs supprimés" });
  } catch (err) {
    console.error("Erreur suppression multiple utilisateurs:", err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
}

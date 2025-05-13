import prisma from "../../../lib/prisma";
import bcrypt from "bcrypt"; // Assurez-vous d'installer bcrypt via `npm install bcrypt`

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Méthode non autorisée" });
  }

  const { utilisateurId, newPassword } = req.body;

  if (!utilisateurId || !newPassword) {
    return res.status(400).json({ message: "Informations manquantes" });
  }

  try {
    // Hacher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Mettre à jour le mot de passe dans la base de données
    const utilisateur = await prisma.user.update({
      where: { id: utilisateurId },
      data: {
        password: hashedPassword, // Mise à jour du mot de passe avec le hash
      },
    });

    res.status(200).json({ message: "Mot de passe mis à jour" });
  } catch (error) {
    console.error("Erreur de mise à jour du mot de passe :", error);
    res.status(500).json({ message: "Erreur lors de la mise à jour" });
  }
}

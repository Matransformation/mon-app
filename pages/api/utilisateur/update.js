// pages/api/utilisateur/update.js
import { getServerSession } from "next-auth/next";
import { authOptions }      from "../auth/[...nextauth]";
import prisma               from "../../../lib/prisma";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Méthode non autorisée" });
  }

  // 1) Vérifier la session NextAuth
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) {
    return res.status(401).json({ message: "Non authentifié" });
  }

  // 2) Récupérer les données envoyées
  const { id, email, nom } = req.body;
  // On n’autorise que l’utilisateur connecté à modifier son propre profil
  if (session.user.email !== email && session.user.id !== id) {
    return res.status(403).json({ message: "Accès refusé" });
  }

  try {
    // 3) Mettre à jour en base
    const updated = await prisma.user.update({
      where: { id },
      data: { email, nom },
    });
    return res
      .status(200)
      .json({ message: "Informations mises à jour", user: { email: updated.email, nom: updated.nom } });
  } catch (err) {
    console.error("Erreur update utilisateur :", err);
    return res.status(500).json({ message: "Erreur interne du serveur" });
  }
}

// pages/api/utilisateur/info.js
import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
  const { email } = req.query;
  if (!email) return res.status(400).json({ error: "Email requis" });

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        email: true,
        name: true,
        nom: true, // 👈 assure-toi que ce champ est bien demandé
      },
    });

    if (!user) return res.status(404).json({ error: "Utilisateur introuvable" });

    return res.status(200).json(user);
  } catch (err) {
    console.error("Erreur récupération utilisateur :", err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
}

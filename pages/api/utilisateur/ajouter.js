import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Méthode non autorisée" });
  }

  try {
    const nouvelUtilisateur = await prisma.utilisateur.create({
      data: {
        email: "test@example.com",
        poids: 75,
        metabolismeCible: 1580
      }
    });

    res.status(200).json({ message: "Utilisateur créé", utilisateur: nouvelUtilisateur });
  } catch (error) {
    console.error("Erreur création utilisateur :", error); // 👈 très important
    res.status(500).json({ message: "Erreur serveur" });
  }
}

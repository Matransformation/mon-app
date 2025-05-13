import prisma from "../../../lib/prisma"; // Assure-toi d'avoir configuré Prisma correctement

export default async function handler(req, res) {
  const { method } = req;

  // Si la méthode est GET, on récupère tous les utilisateurs
  if (method === "GET") {
    try {
      const utilisateurs = await prisma.user.findMany(); // Récupérer tous les utilisateurs
      res.status(200).json(utilisateurs); // Retourner les utilisateurs en JSON
    } catch (error) {
      console.error("Erreur récupération utilisateurs :", error);
      res.status(500).json({ message: "Erreur lors de la récupération des utilisateurs" });
    }
  } 
  // Si la méthode est POST, on ajoute un nouvel utilisateur
  else if (method === "POST") {
    const { name, email } = req.body;

    try {
      const newUser = await prisma.user.create({
        data: { name, email },
      });
      res.status(201).json(newUser);
    } catch (error) {
      console.error("Erreur création utilisateur :", error);
      res.status(500).json({ message: "Erreur lors de la création de l'utilisateur" });
    }
  }
  else {
    res.status(405).json({ message: "Méthode non autorisée" }); // Si la méthode est incorrecte
  }
}

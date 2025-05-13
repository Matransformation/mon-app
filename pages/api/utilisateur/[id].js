import prisma from "../../../lib/prisma"; // Assurez-vous d'avoir correctement configuré Prisma

export default async function handler(req, res) {
  const { method } = req;
  const { id } = req.query; // Récupère l'ID de l'URL

  // Si la méthode est GET, récupérer un utilisateur par son ID
  if (method === "GET") {
    try {
      const utilisateur = await prisma.user.findUnique({
        where: { id },
      });

      if (!utilisateur) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }

      res.status(200).json(utilisateur);
    } catch (error) {
      console.error("Erreur récupération utilisateur par ID :", error);
      res.status(500).json({ message: "Erreur lors de la récupération de l'utilisateur" });
    }
  }
  // Si la méthode est PUT, mettre à jour un utilisateur par son ID
  else if (method === "PUT") {
    const { name, email, role } = req.body; // Récupère le rôle, le nom et l'email envoyés pour la mise à jour
    try {
      const updatedUser = await prisma.user.update({
        where: { id },
        data: { name, email, role }, // Inclut le rôle dans la mise à jour
      });
      res.status(200).json(updatedUser);
    } catch (error) {
      console.error("Erreur mise à jour utilisateur par ID :", error);
      res.status(500).json({ message: "Erreur lors de la mise à jour de l'utilisateur" });
    }
  }
  else {
    res.status(405).json({ message: "Méthode non autorisée" });
  }
}

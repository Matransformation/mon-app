import prisma from "../../lib/prisma";

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const accompagnements = await prisma.accompagnement.findMany();
      res.status(200).json(accompagnements);
    } catch (error) {
      console.error("Erreur récupération accompagnements :", error);
      res.status(500).json({ message: "Erreur lors de la récupération des accompagnements" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Méthode ${req.method} non autorisée`);
  }
}

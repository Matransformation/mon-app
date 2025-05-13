// pages/api/menu/[userId]/index.js

import prisma from "../../../../lib/prisma";

export default async function handler(req, res) {
  const { userId } = req.query;

  if (req.method === "GET") {
    try {
      const menu = await prisma.menuJournalier.findMany({
        where: { userId },
        include: {
          recette: {
            include: {
              ingredients: {
                include: {
                  ingredient: {
                    include: { sideTypes: true }
                  }
                }
              },
              allowedSides: { select: { sideType: true } },
            }
          },
          accompagnements: {
            include: {
              ingredient: {
                include: { sideTypes: true }
              }
            }
          }
        }
      });
      return res.status(200).json(menu);
    } catch (err) {
      console.error("GET /api/menu/[userId] :", err);
      return res.status(500).json({ message: "Erreur serveur" });
    }
  }

  res.setHeader("Allow", ["GET"]);
  return res.status(405).end(`Méthode ${req.method} non autorisée`);
}

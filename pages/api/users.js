// pages/api/users.js
import prisma from "../../lib/prisma";

export default async function handler(req, res) {
  const { method } = req;

  if (method === 'GET') {
    try {
      // Récupère uniquement les champs nécessaires
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
        },
      });
      return res.status(200).json(users);
    } catch (error) {
      console.error('GET /api/users error:', error);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  res.setHeader('Allow', ['GET']);
  return res.status(405).end(`Méthode ${method} non autorisée`);
}

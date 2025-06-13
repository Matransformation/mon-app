// pages/api/notifications/unreadCount.js
import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
  const { method } = req;
  const { userId } = req.query;

  if (method === 'GET') {
    try {
      let count;
      if (userId) {
        // Count unread for specific user OR global
        count = await prisma.notification.count({
          where: {
            opened: false,
            OR: [
              { global: true },
              { userId: userId }
            ]
          }
        });
      } else {
        // Count unread global only
        count = await prisma.notification.count({
          where: { opened: false, global: true }
        });
      }
      return res.status(200).json({ count });
    } catch (error) {
      console.error('GET /api/notifications/unreadCount error:', error);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  res.setHeader('Allow', ['GET']);
  return res.status(405).end(`Méthode ${method} non autorisée`);
}

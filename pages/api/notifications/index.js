// pages/api/notifications/index.js
import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
  const { method } = req;
  const { userId } = req.query;

  if (method === 'GET') {
    try {
      let notifications;
      // Si userId passé, on filtre, sinon toutes
      if (userId) {
        notifications = await prisma.notification.findMany({
          where: { global: false, userId },
          orderBy: { createdAt: 'desc' },
        });
      } else {
        notifications = await prisma.notification.findMany({
          orderBy: { createdAt: 'desc' },
        });
      }
      return res.status(200).json(notifications);
    } catch (error) {
      console.error('GET /api/notifications error:', error);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  if (method === 'POST') {
    const { userId: uid, message, global } = req.body;
    if (!message) return res.status(400).json({ error: 'message required' });
    try {
      const data = { message, opened: false };
      if (global) {
        data.global = true;
      } else {
        if (!uid) return res.status(400).json({ error: 'userId required for non-global notification' });
        data.userId = uid;
        data.global = false;
      }
      const notif = await prisma.notification.create({ data });
      return res.status(201).json(notif);
    } catch (error) {
      console.error('POST /api/notifications error:', error);
      return res.status(500).json({ error: 'Erreur création notification' });
    }
  }

  if (method === 'PUT') {
    const { id } = req.query;
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'message required' });
    try {
      const notif = await prisma.notification.update({
        where: { id },
        data: { message },
      });
      return res.status(200).json(notif);
    } catch (error) {
      console.error('PUT /api/notifications/[id] error:', error);
      return res.status(500).json({ error: 'Erreur mise à jour' });
    }
  }

  if (method === 'DELETE') {
    const { id } = req.query;
    try {
      await prisma.notification.delete({ where: { id } });
      return res.status(200).json({ message: 'Supprimé' });
    } catch (error) {
      console.error('DELETE /api/notifications/[id] error:', error);
      return res.status(500).json({ error: 'Erreur suppression' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
  return res.status(405).end(`Méthode ${method} non autorisée`);
}

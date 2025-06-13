// pages/api/notifications/[id].js
import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
  const { method } = req;
  const { id } = req.query;

  if (method === 'PUT') {
    try {
      const { opened } = req.body;
      const updated = await prisma.notification.update({
        where: { id },
        data: { opened: Boolean(opened) },
      });
      return res.status(200).json(updated);
    } catch (error) {
      console.error('PUT /api/notifications/[id] error:', error);
      return res.status(500).json({ error: 'Erreur mise à jour notification' });
    }
  }

  if (method === 'DELETE') {
    try {
      await prisma.notification.delete({ where: { id } });
      return res.status(200).json({ message: 'Supprimée' });
    } catch (error) {
      console.error('DELETE /api/notifications/[id] error:', error);
      return res.status(500).json({ error: 'Erreur suppression' });
    }
  }

  res.setHeader('Allow', ['PUT','DELETE']);
  return res.status(405).end(`Méthode ${method} non autorisée`);
}

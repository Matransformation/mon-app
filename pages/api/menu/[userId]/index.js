import prisma from "../../../../lib/prisma";
import { startOfWeek } from 'date-fns';
import fetch from 'node-fetch'; // ou global.fetch selon ta config

export default async function handler(req, res) {
  const { userId } = req.query;
  const uid = userId;

  // Calcul de la semaine
  const weekStart = req.query.weekStart
    ? new Date(req.query.weekStart)
    : startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  if (req.method === "GET") {
    try {
      // 1) Récupérer les menus existants
      let menu = await prisma.menuJournalier.findMany({
        where: { userId: uid, date: { gte: weekStart, lt: weekEnd } },
        include: { /* tes includes */ },
      });

      // 2) S’il manque des jours, appeler ton générateur
      if (menu.length < 7) {
        console.log(`Seuls ${menu.length} jours trouvés, on génère la semaine via /api/menu/generer`);
        const genRes = await fetch(
          `${process.env.NEXT_PUBLIC_URL}/api/menu/generer`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: uid,
              weekStart: weekStart.toISOString(),
            }),
          }
        );
        if (!genRes.ok) {
          const err = await genRes.json();
          console.error('Erreur génération auto:', err);
          return res.status(500).json({ message: 'Échec génération menus', detail: err });
        }
        // 3) Re-fetch après génération
        menu = await prisma.menuJournalier.findMany({
          where: { userId: uid, date: { gte: weekStart, lt: weekEnd } },
          include: { /* tes includes */ },
        });
      }

      // 4) Retourner
      return res.status(200).json(menu);
    } catch (err) {
      console.error('GET /api/menu/[userId] error:', err);
      return res.status(500).json({ message: 'Erreur serveur', error: err.message });
    }
  }

  res.setHeader('Allow', ['GET']);
  return res.status(405).end(`Méthode ${req.method} non autorisée`);
}

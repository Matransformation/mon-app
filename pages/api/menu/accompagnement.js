import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { repasId, accompagnements } = req.body;

    if (!repasId || !Array.isArray(accompagnements)) {
      return res.status(400).json({ error: "Paramètres manquants" });
    }

    // Supprimer les anciens accompagnements
    await prisma.accompagnement.deleteMany({
      where: { repasId },
    });

    // Ajouter les nouveaux
    for (const a of accompagnements) {
      await prisma.accompagnement.create({
        data: {
          repas: { connect: { id: repasId } },
          ingredient: { connect: { id: a.ingredientId } },
          quantity: a.quantity,
        },
      });
    }

    return res.status(200).json({ success: true });
  }

  if (req.method === "DELETE") {
    const { repasId } = req.query;

    if (!repasId) {
      return res.status(400).json({ error: "repasId manquant" });
    }

    await prisma.accompagnement.deleteMany({
      where: { repasId: parseInt(repasId) },
    });

    return res.status(200).json({ success: true });
  }

  res.setHeader("Allow", ["POST", "DELETE"]);
  res.status(405).end(`Méthode ${req.method} non autorisée`);
}

// pages/api/utilisateur/objectif.js
import prisma from "../../../lib/prisma"

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  const { utilisateurId, objectifPoids } = req.body
  if (!utilisateurId || objectifPoids === undefined) {
    return res.status(400).json({ error: "Paramètres invalides" })
  }

  try {
    const updated = await prisma.user.update({
      where: { id: utilisateurId },
      data: {
        // on force la conversion en string
        objectifPoids: String(objectifPoids),
      },
    })
    return res.status(200).json({ objectifPoids: updated.objectifPoids })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: "Erreur serveur" })
  }
}

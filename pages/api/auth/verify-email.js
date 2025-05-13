// pages/api/auth/verify-email.js

import prisma from '../../../lib/prisma'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Méthode non autorisée' })
  }

  const { token } = req.body
  if (!token) {
    return res.status(400).json({ message: 'Le code est requis.' })
  }

  try {
    // 1) Recherche du token en base
    const record = await prisma.emailVerificationToken.findUnique({
      where: { token }
    })

    if (!record) {
      return res.status(400).json({ message: 'Code invalide.' })
    }

    // 2) Vérification de l'expiration
    if (record.expiresAt < new Date()) {
      // on peut supprimer l'ancien token
      await prisma.emailVerificationToken.delete({
        where: { token }
      })
      return res.status(400).json({ message: 'Code expiré.' })
    }

    // 3) Mettre à jour l'utilisateur
    await prisma.user.update({
      where: { id: record.userId },
      data: { emailVerified: new Date() }
    })

    // 4) Supprimer le token pour ne plus le réutiliser
    await prisma.emailVerificationToken.delete({
      where: { token }
    })

    // 5) Réponse de succès
    return res.status(200).json({ message: 'Email vérifié avec succès !' })
  } catch (error) {
    console.error('Erreur verify-email:', error)
    return res
      .status(500)
      .json({ message: 'Erreur interne du serveur', detail: error.message })
  }
}

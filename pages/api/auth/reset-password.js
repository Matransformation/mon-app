// pages/api/auth/reset-password.js

import prisma from '../../../lib/prisma'
import { hashPassword } from '../../../lib/auth'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Méthode non autorisée' })

  const { token, password } = req.body

  if (!token || !password) {
    return res.status(400).json({ message: 'Token et mot de passe requis' })
  }

  try {
    const record = await prisma.passwordResetToken.findUnique({ where: { token } })

    if (!record || record.expiresAt < new Date()) {
      return res.status(400).json({ message: 'Lien expiré ou invalide' })
    }

    const hashed = await hashPassword(password)

    await prisma.user.update({
      where: { id: record.userId },
      data: { password: hashed },
    })

    await prisma.passwordResetToken.delete({ where: { token } })

    return res.status(200).json({ message: 'Mot de passe mis à jour avec succès !' })
  } catch (error) {
    console.error('Erreur reset-password:', error)
    return res.status(500).json({ message: 'Erreur serveur', detail: error.message })
  }
}

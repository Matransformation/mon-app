import prisma from '../../../lib/prisma'
import { hashPassword } from '../../../lib/auth'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { token, password } = req.body

  const record = await prisma.passwordResetToken.findUnique({ where: { token } })
  if (!record || record.expiresAt < new Date()) {
    return res.status(400).json({ message: 'Token invalide ou expiré' })
  }

  const hashed = await hashPassword(password)
  await prisma.user.update({ where: { id: record.userId }, data: { password: hashed } })
  await prisma.passwordResetToken.delete({ where: { token } })

  return res.status(200).json({ message: 'Mot de passe mis à jour !' })
}

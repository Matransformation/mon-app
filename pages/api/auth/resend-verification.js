import prisma from '../../../lib/prisma'
import { randomBytes } from 'crypto'
import { addHours } from 'date-fns'
import sgMail from '@sendgrid/mail'
import { getServerSession } from 'next-auth/next'
import authOptions from '../../../pages/api/auth/[...nextauth]'  // Assure-toi que le chemin est correct

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Méthode non autorisée' })
  }

  try {
    // 1) Vérifier la session NextAuth
    const session = await getServerSession(req, res, authOptions)
    console.log('Session:', session) // Ajoute un log pour vérifier la session
    if (!session?.user?.email) {
      return res.status(401).json({ message: 'Non authentifié' })
    }

    // 2) Récupérer l’utilisateur
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable' })
    }

    // 3) Générer un nouveau code
    const token = randomBytes(3).toString('hex').toUpperCase()  // ex: "A1B2C3"
    const expiresAt = addHours(new Date(), 1)

    // Supprimer les anciens
    await prisma.emailVerificationToken.deleteMany({
      where: { userId: user.id }
    })

    // Créer le nouveau
    await prisma.emailVerificationToken.create({
      data: { userId: user.id, token, expiresAt }
    })

    // 4) Envoyer l’email
    const html = `
      <p>Bonjour ${user.name || ''},</p>
      <p>Voici votre nouveau code de vérification : <strong>${token}</strong></p>
      <p>Il expire dans 1 heure.</p>
    `
    await sgMail.send({
      to: user.email,
      from: process.env.EMAIL_FROM,
      subject: 'Votre nouveau code de vérification',
      html
    })

    return res.status(200).json({ message: 'Code renvoyé ! Vérifiez votre boîte.' })
  } catch (error) {
    console.error('Erreur resend-verification:', error)
    return res
      .status(500)
      .json({ message: 'Erreur interne du serveur', detail: error.message })
  }
}

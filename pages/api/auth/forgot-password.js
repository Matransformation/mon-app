// pages/api/auth/forgot-password.js

import prisma from '../../../lib/prisma'
import { randomBytes } from 'crypto'
import { addHours } from 'date-fns'
import sgMail from '@sendgrid/mail'

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Méthode non autorisée' })
  }

  const { email } = req.body
  if (!email) {
    return res.status(400).json({ message: 'Email requis' })
  }

  try {
    // 1) Vérifier l’utilisateur
    const user = await prisma.user.findUnique({ where: { email } })

    // Réponse standard même si l'utilisateur n'existe pas (mais ici tu préfères afficher un message clair)
    if (!user) {
      return res
        .status(404)
        .json({ message: "Aucun compte n'est associé à cette adresse email." })
    }

    // 2) Générer le token et sa date d’expiration
    const token = randomBytes(32).toString('hex')
    const expiresAt = addHours(new Date(), 1)

    // 3) Supprimer d’éventuels anciens tokens pour cet utilisateur
    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } })

    // 4) Créer un nouveau token en base
    await prisma.passwordResetToken.create({
      data: { userId: user.id, token, expiresAt },
    })

    // 5) Envoyer l’email
    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password/${token}`

    await sgMail.send({
      to: email,
      from: {
        email: process.env.EMAIL_FROM,
        name: 'Ma Transformation',
      },
      subject: 'Réinitialisation de votre mot de passe',
      html: `
        <p>Bonjour,</p>
        <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
        <p>
          Cliquez <a href="${resetUrl}">ici</a> pour en choisir un nouveau.
          Le lien expire dans 1 heure.
        </p>
        <p>Si vous n’êtes pas à l’origine de cette demande, ignorez ce message.</p>
        <br/>
        <p>— L’équipe MaTransformation</p>
      `,
    })

    return res.status(200).json({ message: 'Si l’email existe, un lien a été envoyé.' })
  } catch (error) {
    console.error('Erreur forgot-password:', error)
    return res
      .status(500)
      .json({ message: 'Erreur interne du serveur', detail: error.message })
  }
}

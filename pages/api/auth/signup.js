import prisma from '../../../lib/prisma'
import { hashPassword } from '../../../lib/auth'
import { randomBytes } from 'crypto'
import { addHours, addDays } from 'date-fns'
import sgMail from '@sendgrid/mail'

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Méthode non autorisée' })
  }

  const { name, email, password, phone, birthdate, gender } = req.body

  if (!email || !password || !name) {
    return res.status(422).json({ message: 'Nom, email et mot de passe requis' })
  }

  try {
    // 1) Vérifier si l'utilisateur existe déjà
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return res.status(409).json({ message: 'Cet e-mail est déjà utilisé.' })
    }

    // 2) Hasher le mot de passe et créer l'utilisateur
    const hashed = await hashPassword(password)
    const trialEndsAt = addDays(new Date(), 7) // Période d'essai de 7 jours

    // Log pour débogage de trialEndsAt
    console.log("trialEndsAt:", trialEndsAt.toISOString()) // Log pour vérifier la date

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        phone,
        birthdate: new Date(birthdate),
        sexe: gender,
        trialEndsAt, // Assurer que cette date est correctement définie
        isSubscribed: false, // Par défaut, l'utilisateur n'est pas abonné
      }
    })

    // Log pour vérifier que l'utilisateur a bien été créé et que trialEndsAt est bien défini
    console.log("User Created:", user)

    // 3) Générer un code de vérification (6 chiffres ou lettres)
    const token = randomBytes(3).toString('hex').toUpperCase()
    const expiresAt = addHours(new Date(), 1)

    // Supprimer d'anciens tokens
    await prisma.emailVerificationToken.deleteMany({ where: { userId: user.id } })

    // Créer le token en base
    await prisma.emailVerificationToken.create({
      data: { userId: user.id, token, expiresAt }
    })

    // 4) Envoyer le mail de vérification
    const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-email?email=${encodeURIComponent(email)}`
    const html = `
      <p>Bonjour ${name},</p>
      <p>Voici votre code de vérification : <strong>${token}</strong></p>
      <p>Il expire dans 1 heure.</p>
      <p>Si vous n’avez pas demandé cette inscription, ignorez ce message.</p>
      <p><a href="${verificationUrl}">Cliquez ici</a> pour ouvrir la page de vérification.</p>
    `
    await sgMail.send({
      to: email,
      from: process.env.EMAIL_FROM,
      subject: '📩 Vérifiez votre adresse email',
      html
    })

    // 5) Succès
    return res.status(201).json({ message: 'Utilisateur créé. Un email de vérification a été envoyé.' })
  } catch (err) {
    console.error('Signup error:', err)
    return res.status(500).json({ message: 'Erreur interne', detail: err.message })
  }
}

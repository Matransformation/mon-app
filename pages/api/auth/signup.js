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

  const { name, email, password } = req.body

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

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        trialEndsAt,
        isSubscribed: false,
      }
    })

    // ◼️ APPEL À KLAVIYO POUR CRÉER / METTRE À JOUR LE PROFIL + L’AJOUTER À LA LISTE ◼️
    // (On ignore volontairement les erreurs Klaviyo pour ne pas bloquer la création d’utilisateur)
    (async () => {
      try {
        const klaviyoApiKey = process.env.KLAVIYO_PRIVATE_API_KEY
        const klaviyoListId = 'SSM6Ju' // Remplacez par votre List ID

        if (klaviyoApiKey) {
          // 1. Créer ou mettre à jour le profil
          const profileRes = await fetch('https://a.klaviyo.com/api/profiles/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Klaviyo-API-Key': klaviyoApiKey,
              revision: '2023-02-22',
            },
            body: JSON.stringify({
              data: {
                type: 'profile',
                attributes: {
                  email: user.email,
                  first_name: user.name.split(' ').slice(0, -1).join(' ') || '', // ou formater comme vous préférez
                  last_name: user.name.split(' ').slice(-1)[0] || '',
                },
              },
            }),
          })

          if (profileRes.ok) {
            // 2. Ajouter ce profil à la liste
            await fetch(
              `https://a.klaviyo.com/api/lists/${klaviyoListId}/relationships/profiles/`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Klaviyo-API-Key': klaviyoApiKey,
                  revision: '2023-02-22',
                },
                body: JSON.stringify({
                  data: [
                    {
                      type: 'profile',
                      attributes: { email: user.email },
                    },
                  ],
                }),
              }
            )
            console.log(`✅ Utilisateur ${user.email} ajouté à Klaviyo.`)
          } else {
            const errText = await profileRes.text()
            console.error('❌ Klaviyo – Échec création profil :', errText)
          }
        } else {
          console.warn('⚠️ KLAVIYO_PRIVATE_API_KEY manquante, on n’envoie pas vers Klaviyo.')
        }
      } catch (klaviyoErr) {
        console.error('🔥 Erreur non bloquante Klaviyo:', klaviyoErr)
      }
    })()

    // 3) Générer un code de vérification (6 caractères hexadécimaux)
    const token = randomBytes(3).toString('hex').toUpperCase()
    const expiresAt = addHours(new Date(), 1)

    await prisma.emailVerificationToken.deleteMany({ where: { userId: user.id } })
    await prisma.emailVerificationToken.create({
      data: { userId: user.id, token, expiresAt }
    })

    // 4) Préparer et envoyer le mail de vérification
    const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-email?email=${encodeURIComponent(email)}`

    const text = `
Bonjour ${name},

Voici votre code de vérification : ${token}

Il expire dans 1 heure.

Si vous n’avez pas demandé cette inscription, ignorez ce message.

Accédez à la page de vérification ici : ${verificationUrl}

Cordialement,
L'équipe Ma Transformation
`

    const html = `
      <p>Bonjour ${name},</p>
      <p>Voici votre code de vérification : <strong>${token}</strong></p>
      <p>Il expire dans 1 heure.</p>
      <p>Si vous n’avez pas demandé cette inscription, ignorez ce message.</p>
      <p><a href="${verificationUrl}">Cliquez ici</a> pour ouvrir la page de vérification.</p>
      <hr/>
      <p>
        Ma Transformation<br/>
        10 rue Jules Védrines, 64600 Anglet<br/>
        Contact : <a href="mailto:${process.env.EMAIL_FROM}">${process.env.EMAIL_FROM}</a>
      </p>
    `

    await sgMail.send({
      to: email,
      from: {
        email: process.env.EMAIL_FROM,
        name: 'Ma Transformation'
      },
      subject: 'Confirmation de votre adresse email sur Ma Transformation',
      text,
      html
    })

    return res.status(201).json({ message: 'Utilisateur créé. Un email de vérification a été envoyé.' })
  } catch (err) {
    console.error('Signup error:', err)
    return res.status(500).json({ message: 'Erreur interne', detail: err.message })
  }
}

// pages/api/exchange.js
import { getServerSession } from 'next-auth/next'
import { authOptions }      from './auth/[...nextauth]'
import sgMail               from '@sendgrid/mail'
import prisma               from '../../lib/prisma'

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  const session = await getServerSession(req, res, authOptions)
  if (!session) return res.status(401).json({ error: 'Unauthorized' })

  const { rewardLabel, pts } = req.body
  if (typeof pts !== 'number') {
    return res.status(400).json({ error: 'Missing or invalid pts' })
  }

  const userEmail = session.user.email
  const userName  = session.user.name || userEmail
  const fromEmail = process.env.EMAIL_FROM

  // 1) Envoi du mail
  const msg = {
    to:      'contact@matransformation.fr',
    from:    { email: fromEmail, name: 'Ma Transformation' },
    subject: `Nouvelle demande d'échange – ${userName}`,
    text:    `L'utilisateur ${userName} <${userEmail}> souhaite échanger ses points pour : ${rewardLabel}`,
    html:    `<p>L'utilisateur <strong>${userName}</strong> &lt;${userEmail}&gt; souhaite échanger ses points pour : <strong>${rewardLabel}</strong></p>`
  }

  try {
    const [response] = await sgMail.send(msg)
    console.log('SendGrid status:', response.statusCode)
  } catch (err) {
    console.error('SendGrid error:', err.response?.body || err)
    return res.status(500).json({ error: 'Échec de l’envoi du mail', details: err.response?.body })
  }

  // 2) Mise à jour de la DB : décrémenter les points
  try {
    const userId = session.user.id
    const updated = await prisma.userPoint.update({
      where: { userId },
      data:  { points: { decrement: pts } }
    })
    // 3) On retourne le nouveau solde
    return res.status(200).json({ ok: true, points: updated.points })
  } catch (dbErr) {
    console.error('Prisma update error:', dbErr)
    return res.status(500).json({ error: 'Échec mise à jour points' })
  }
}

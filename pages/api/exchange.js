// pages/api/exchange.js
import { getServerSession } from 'next-auth/next'
import { authOptions }      from './auth/[...nextauth]'
import sgMail               from '@sendgrid/mail'

// Utilise la même clé que pour signup.js
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  const session = await getServerSession(req, res, authOptions)
  if (!session) return res.status(401).json({ error: 'Unauthorized' })

  const { rewardLabel } = req.body
  const userEmail = session.user.email
  const userName  = session.user.name || userEmail

  // Vérifie bien que EMAIL_FROM est défini et validé chez SendGrid
  const fromEmail = process.env.EMAIL_FROM
  if (!fromEmail) {
    console.error('🚨 EMAIL_FROM non défini !')
    return res.status(500).json({ error: 'EMAIL_FROM missing' })
  }

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
    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('SendGrid error status:', err.code)
    if (err.response && err.response.body) {
      console.error('SendGrid error body:', err.response.body)
    } else {
      console.error(err)
    }
    return res.status(500).json({
      error:   'Échec de l’envoi du mail',
      details: err.response?.body || err.message
    })
  }
}

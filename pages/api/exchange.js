// pages/api/exchange.js
import { getServerSession } from 'next-auth/next'
import { authOptions }      from './auth/[...nextauth]'
import sendgrid             from '@sendgrid/mail'

sendgrid.setApiKey(process.env.SENDGRID_API_KEY)

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

  try {
    const msg = {
      to:      'contact@matransformation.fr',
      from:    process.env.SENDGRID_FROM_EMAIL, // ex: "no-reply@matransformation.fr"
      subject: `Nouvelle demande d'échange – ${userName}`,
      text:    `L'utilisateur ${userName} <${userEmail}> souhaite échanger ses points pour : ${rewardLabel}`,
      html:    `<p>L'utilisateur <strong>${userName}</strong> &lt;${userEmail}&gt; souhaite échanger ses points pour : <strong>${rewardLabel}</strong></p>`
    }
    const [response] = await sendgrid.send(msg)
    console.log('SendGrid status:', response.statusCode)
    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('SendGrid error:', err)
    return res.status(500).json({ error: 'Échec de l’envoi du mail' })
  }
}

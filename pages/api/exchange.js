import { getServerSession } from 'next-auth/next';
import { authOptions } from '../api/auth/[...nextauth]';
import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });

  const { rewardLabel } = req.body;
  const userEmail = session.user.email;
  const userName = session.user.name || userEmail;

  // Configure ton transporter SMTP via env
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  // Envoie l'email
  await transporter.sendMail({
    from: `MaTransformation <${process.env.SMTP_USER}>`,
    to: 'contact@matransformation.fr',
    subject: `Nouvelle demande d'échange - ${userName}`,
    text: `L'utilisateur ${userName} <${userEmail}> souhaite échanger pour: ${rewardLabel}`,
  });

  res.status(200).json({ ok: true });
}
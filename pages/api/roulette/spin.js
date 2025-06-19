// File: pages/api/roulette/spin.js

import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]"
import prisma from "../../../lib/prisma"
import sgMail from "@sendgrid/mail"

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end()

  // 1) Authentifier
  const session = await getServerSession(req, res, authOptions)
  const user = session?.user
  if (!user) return res.status(401).json({ error: "Non authentifié" })

  // 2) Vérifier qu’il n’a pas déjà joué aujourd’hui
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const already = await prisma.rouletteDraw.findFirst({
    where: { userId: user.id, createdAt: { gte: todayStart } },
  })
  if (already) {
    return res.status(400).json({ error: "Vous avez déjà joué aujourd’hui." })
  }

  // 3) Récupérer tous les lots
  const items = await prisma.rouletteItem.findMany()
  if (!items.length) {
    return res.status(500).json({ error: "Aucun lot disponible" })
  }

  // 4) Tirage aléatoire pondéré
  const totalWeight = items.reduce((sum, i) => sum + i.probability, 0)
  let rand = Math.random() * totalWeight, cum = 0
  let selected = items[0]
  for (const item of items) {
    cum += item.probability
    if (rand <= cum) { selected = item; break }
  }

  // 5) Sauvegarder le tirage
  const draw = await prisma.rouletteDraw.create({
    data: {
      userId: user.id,
      itemId: selected.id,
    },
    include: { item: true },
  })

  // … après avoir tiré et sauvegardé le tirage…

// 6) Si c’est un coupon, on envoie le mail via SendGrid
if (selected.couponCode && user.email) {
    const msg = {
      to: user.email,
      from: {
        email: process.env.EMAIL_FROM,     // e.g. "no-reply@matransformation.fr"
        name: "Matransformation",           // Nom de l’expéditeur
      },
      subject: "Votre coupon de réduction 🎉",
      text: `
  Bonjour ${user.name || user.email},
  
  Félicitations ! Vous avez gagné un coupon de réduction : ${selected.couponCode}
  
  Rendez-vous sur https://www.matransformation.fr pour l’utiliser.
  
  À bientôt,
  L’équipe Matransformation
      `,
      html: `
        <p>Bonjour ${user.name || user.email},</p>
        <p>🎁 Félicitations ! Vous avez gagné un coupon :</p>
        <h2 style="color:#fe8802;">${selected.couponCode}</h2>
        <p>Rendez-vous sur <a href="https://www.matransformation.fr">matransformation.fr</a> pour l’utiliser.</p>
        <p>À bientôt,<br/>L’équipe Matransformation</p>
      `,
    }
  
    try {
      await sgMail.send(msg)
    } catch (err) {
      console.error("Erreur envoi email coupon :", err)
    }
  }
  

  // 7) Répondre avec le lot
  return res.status(200).json({ result: draw.item })
}

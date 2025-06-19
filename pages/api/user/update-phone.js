// File: pages/api/user/update-phone.js

import prisma from "../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]"; 

export default async function handler(req, res) {
  // 1. Vérifier la méthode
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Méthode ${req.method} non autorisée`);
  }

  // 2. Authentifier l'utilisateur
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: "Non authentifié" });
  }

  // 3. Récupérer et valider le numéro
  const { phone } = req.body;
  if (!phone || typeof phone !== "string") {
    return res.status(400).json({ error: "Numéro de téléphone manquant ou invalide" });
  }

  // (optionnel) Simple regex pour FR : commence par 0 ou +33 et 9 chiffres
  const frRegex = /^(0|\+33)[1-9](?:\d{2}){4}$/;
  if (!frRegex.test(phone.replace(/\s+/g, ""))) {
    return res.status(400).json({ error: "Format de téléphone invalide" });
  }

  // 4. Mettre à jour dans la base
  try {
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data:  { phone },
      select: { id: true, phone: true },
    });
    return res.status(200).json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("POST /api/user/update-phone error:", error);
    return res.status(500).json({ error: "Impossible de mettre à jour le numéro" });
  }
}

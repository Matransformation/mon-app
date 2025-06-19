// File: pages/api/user/me.js

import { getServerSession } from "next-auth/next";
import { authOptions }      from "../auth/[...nextauth]";
import prisma               from "../../../lib/prisma";

export default async function handler(req, res) {
  // 1) Vérifier que l'utilisateur est authentifié
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: "Non authentifié" });
  }

  // 2) Récupérer en base son profil à jour
  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { 
        id: true,
        nom: true,
        name: true,
        email: true,
        phone: true 
      },
    });
    return res.status(200).json(user);
  } catch (err) {
    console.error("GET /api/user/me error", err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
}

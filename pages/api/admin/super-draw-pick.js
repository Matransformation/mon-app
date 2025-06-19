// File: pages/api/admin/super-draw-pick.js

import { getServerSession } from "next-auth/next";
import { authOptions }      from "../auth/[...nextauth]";
import prisma               from "../../../lib/prisma";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session || session.user.role !== "admin") {
    return res.status(403).json({ error: "Unauthorized" });
  }
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    // Même requête que pour lister, on récupère tous les candidats persistants
    const candidates = await prisma.user.findMany({
      where: {
        rouletteDraws: {
          some: {
            item: { isSuperDraw: true }
          }
        }
      },
      select: {
        id: true,
        nom: true,
        phone: true
      }
    });

    if (candidates.length === 0) {
      return res.status(400).json({ error: "Aucun candidat Super-Roue" });
    }

    // Tirage aléatoire
    const winner = candidates[Math.floor(Math.random() * candidates.length)];

    return res.status(200).json({ user: winner });
  } catch (error) {
    console.error("POST /api/admin/super-draw-pick error:", error);
    return res.status(500).json({ error: "Server error" });
  }
}

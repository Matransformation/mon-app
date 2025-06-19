// File: pages/api/admin/super-draw-entries.js

import { getServerSession } from "next-auth/next";
import { authOptions }      from "../auth/[...nextauth]";
import prisma               from "../../../lib/prisma";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session || session.user.role !== "admin") {
    return res.status(403).json({ error: "Unauthorized" });
  }
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    // Tous les users qui ont au moins un tirage avec isSuperDraw = true
    const candidates = await prisma.user.findMany({
      where: {
        rouletteDraws: {
          some: {
            item: {
              isSuperDraw: true
            }
          }
        }
      },
      select: {
        id: true,
        nom: true,
        phone: true
      },
      orderBy: {
        nom: "asc"
      }
    });

    return res.status(200).json(candidates);
  } catch (error) {
    console.error("GET /api/admin/super-draw-entries error:", error);
    return res.status(500).json({ error: "Server error" });
  }
}

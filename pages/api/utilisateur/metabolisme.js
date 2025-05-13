import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Méthode non autorisée" });
  }

  const { utilisateurId, sexe, age, taille, activite } = req.body;

  if (!utilisateurId || !sexe || !age || !taille || !activite) {
    return res.status(400).json({ message: "Champs manquants pour le calcul" });
  }

  try {
    const dernierPoids = await prisma.historiquePoids.findFirst({
      where: { utilisateurId },
      orderBy: { date: "desc" },
    });

    if (!dernierPoids?.poids) {
      return res.status(400).json({ message: "Poids non trouvé pour ce profil" });
    }

    const poids = dernierPoids.poids;

    // Formule de Mifflin-St Jeor
    let metabolismeBase;
    if (sexe === "homme") {
      metabolismeBase = 10 * poids + 6.25 * taille - 5 * age + 5;
    } else {
      metabolismeBase = 10 * poids + 6.25 * taille - 5 * age - 161;
    }

    const coefficients = {
      "sédentaire": 1.2,
      "légèrement actif": 1.375,
      "modérément actif": 1.55,
      "très actif": 1.725,
      "extrêmement actif": 1.9,
    };

    const coeff = coefficients[activite] || 1.2;
    const metabolismeSansDeficit = metabolismeBase * coeff;

    // Application d’un déficit de 20 %
    const metabolismeCible = Math.round(metabolismeSansDeficit * 0.8);

    await prisma.user.update({
      where: { id: utilisateurId },
      data: {
        sexe,
        age: parseInt(age),
        taille: parseInt(taille),
        activite,
        metabolismeCible,
      },
    });

    res.status(200).json({
      message: "Métabolisme avec déficit mis à jour",
      metabolismeCible,
    });
  } catch (error) {
    console.error("Erreur calcul métabolisme:", error);
    res.status(500).json({ message: "Erreur serveur lors du calcul" });
  }
}

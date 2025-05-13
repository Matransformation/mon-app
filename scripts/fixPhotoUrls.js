// scripts/fixPhotoUrls.js
import { PrismaClient } from "@prisma/client";
import path from "path";

const prisma = new PrismaClient();

async function fixPhotoUrls() {
  const recettes = await prisma.recette.findMany();

  for (const recette of recettes) {
    const fullPath = recette.photoUrl;

    // Sauter si déjà correct
    if (!fullPath || fullPath.startsWith("/uploads/")) continue;

    // Extraire uniquement le nom du fichier
    const fixedUrl = `/uploads/${path.basename(fullPath)}`;

    await prisma.recette.update({
      where: { id: recette.id },
      data: { photoUrl: fixedUrl },
    });

    console.log(`✔️ Recette "${recette.name}" corrigée : ${fixedUrl}`);
  }

  await prisma.$disconnect();
}

fixPhotoUrls().catch((e) => {
  console.error(e);
  prisma.$disconnect();
});

// pages/server-sitemap.xml.js

import { getServerSideSitemap } from 'next-sitemap';
import prisma from "../lib/prisma";

export async function getServerSideProps(ctx) {
  const recettes = await prisma.recette.findMany({
    where: {
      isPublic: true, // Assure-toi que ce champ existe dans ton modèle
    },
    select: {
      slug: true,
      updatedAt: true,
    },
  });

  const fields = recettes.map((recette) => ({
    loc: `https://matransformation.fr/recettes/${recette.slug}`,
    lastmod: recette.updatedAt.toISOString(),
    changefreq: 'weekly',
    priority: 0.8,
  }));

  return getServerSideSitemap(ctx, fields);
}

// Ce composant est requis mais vide, c’est normal
export default function Sitemap() {}

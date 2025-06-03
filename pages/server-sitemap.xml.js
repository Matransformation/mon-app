// pages/server-sitemap.xml.js

import { getServerSideSitemap } from 'next-sitemap';
import { prisma } from "../../lib/prisma";

export async function getServerSideProps(ctx) {
  const recettes = await prisma.recette.findMany({
    where: {
      isPublic: true, // ce champ doit exister et être bien renseigné
    },
    select: {
      id: true,
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

export default function Sitemap() {}

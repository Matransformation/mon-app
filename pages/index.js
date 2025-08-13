import Head from "next/head";
import { useRouter } from "next/router";

import Header from "../components/Header";
import Footer from "../components/Footer";

// ✅ composants home
import Hero from "../components/home/Hero";
import SocialProof from "../components/home/SocialProof";
import SellingBlock from "../components/home/SellingBlock";
import Features from "../components/home/Features";
import FAQ from "../components/home/FAQ";
import CTA from "../components/home/CTA";
import StickyCTA from "../components/home/StickyCTA";

import prisma from "../lib/prisma";

export async function getServerSideProps() {
  let usersCount = 0;
  try {
    usersCount = await prisma.user.count();
  } catch {
    usersCount = 2000; // fallback soft
  }
  return { props: { usersCount } };
}

const FEATURES = [
  {
    img: "https://res.cloudinary.com/diccvjf98/image/upload/v1749906494/1_zddqro.png",
    title: "Recettes simples et équilibrées",
    desc: "Des idées de repas sains, adaptés à tes objectifs et faciles à suivre au quotidien.",
  },
  {
    img: "https://res.cloudinary.com/diccvjf98/image/upload/v1749906494/3_ontjyy.png",
    title: "Menus personnalisés",
    desc: "Des plans alimentaires sur-mesure selon ton métabolisme, ton poids et ton objectif.",
  },
  {
    img: "https://res.cloudinary.com/diccvjf98/image/upload/v1749906494/2_u7shls.png",
    title: "Suivi de ta progression",
    desc: "Visualise ton évolution semaine après semaine : poids, objectifs atteints, transformation.",
  },
];

/** Logos presse (Cloudinary) — f_auto,q_auto,dpr_auto,h_80 */
const LOGOS = [
  { src: "https://res.cloudinary.com/diccvjf98/image/upload/f_auto,q_auto,dpr_auto,h_80/v1755117039/2_rvwrlb.png", alt: "La Dépêche du Midi" },
  { src: "https://res.cloudinary.com/diccvjf98/image/upload/f_auto,q_auto,dpr_auto,h_80/v1755117039/1_lrjbaq.png", alt: "Marie Claire" },
  { src: "https://res.cloudinary.com/diccvjf98/image/upload/f_auto,q_auto,dpr_auto,h_80/v1755117039/3_bo8rcf.png", alt: "France Bleu" },
];

/** Contenu FAQ d’exemple (modifiable) */
const FAQ_ITEMS = [
  {
    question: "Comment fonctionne l’essai de 7 jours ?",
    answer:
      "Tu crées ton compte et tu accèdes à l’ensemble des menus et recettes.\nTu peux arrêter avant la fin de l’essai, sans engagement.",
  },
  {
    question: "Les menus sont-ils personnalisés ?",
    answer:
      "Oui. Nous adaptons les quantités à ton profil (taille, poids, objectif, activité) et tu peux exclure certains aliments.",
  },
  {
    question: "Je manque de temps pour cuisiner…",
    answer:
      "Nos recettes sont pensées pour le quotidien : simples, rapides et avec des ingrédients faciles à trouver.",
  },
  {
    question: "Puis-je utiliser MaTransformation pour ma famille ?",
    answer:
      "Bien sûr. Beaucoup d’utilisateurs cuisinent pour 2 à 4 personnes en ajustant directement les quantités.",
  },
  {
    question: "Puis-je annuler quand je veux ?",
    answer:
      "Oui. Tu peux résilier en 2 clics dans ton compte. Pas de frais cachés.",
  },
];

const FAQ_CONTACT = {
  email: "support@matransformation.fr",
  ctaHref: "/register",
  ctaText: "Essayer 7 jours gratuitement",
};

export default function Home({ usersCount }) {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900">
      <Head>
        <title>MaTransformation — Perdre du poids simplement</title>
        <meta name="description" content="Des menus adaptés à ton corps, des recettes équilibrées et un vrai suivi." />
        <meta property="og:title" content="MaTransformation — Perdre du poids simplement" />
        <meta property="og:description" content="Des menus adaptés à ton corps, des recettes équilibrées et un vrai suivi." />
        <meta property="og:image" content="/matransformation-og.jpg" />
      </Head>

      <Header />

      <main className="flex-1">
        {/* 1) Hero */}
        <Hero
          desktopSrc="https://res.cloudinary.com/diccvjf98/image/upload/v1755089542/SEPTEMBRE_ht28n4.png"
          mobileSrc="https://res.cloudinary.com/diccvjf98/image/upload/v1755089542/SEPTEMBRE_1080_x_1350_px_le1ipb.png"
          href="/register"
          alt="MaTransformation — menus personnalisés"
        />

        {/* 2) Ruban de logos (presse) */}
        <SocialProof logos={LOGOS} />

        {/* 3) SellingBlock */}
        <SellingBlock
          desktopImageSrc="https://res.cloudinary.com/diccvjf98/image/upload/v1755093968/Des_recettes_1_xhwj8j.png"
          mobileImageSrc="https://res.cloudinary.com/diccvjf98/image/upload/v1755093968/Des_recettes_1_xhwj8j.png"
          ctaLabel="Essayer 7 jours gratuitement"
          onCtaClick={() => router.push("/register")}
        />

        {/* 4) Features */}
        <Features items={FEATURES} usersCount={usersCount} />

        {/* 5) CTA doux */}
        <CTA
          title="Prêt·e à te lancer ?"
          subtitle="Rejoins des milliers de personnes qui progressent chaque semaine."
          ctaHref="/register"
          ctaText="Essayer 7 jours gratuitement"
        />

        {/* 6) FAQ */}
        <FAQ title="Questions fréquentes" faqs={FAQ_ITEMS} contact={FAQ_CONTACT} />
      </main>

      {/* Sticky CTA mobile */}
      <StickyCTA label="7 jours d'essai, cliquez ici" href="/register" />

      <Footer />
    </div>
  );
}

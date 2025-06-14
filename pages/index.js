import { useState } from "react";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";
import prisma from '../lib/prisma';

export async function getServerSideProps() {
  // Récupère le nombre d'utilisateurs pour la social proof
  const usersCount = await prisma.user.count();
  return {
    props: { usersCount },
  };
}

export default function Home({ usersCount }) {
  const [openIndex, setOpenIndex] = useState(null);

  const features = [
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

  const faqs = [
    {
      question: "Comment fonctionne l’essai gratuit ?",
      answer:
        "Tu crées ton compte gratuitement et tu profites de toutes les fonctionnalités pendant 7 jours. Aucun engagement, aucun paiement demandé avant la fin de l’essai.",
    },
    {
      question: "À qui s’adresse MaTransformation ?",
      answer:
        "À toute personne souhaitant perdre du poids, mieux manger, ou se remettre en forme durablement. Pas besoin d’être expert ou de suivre un régime compliqué.",
    },
    {
      question: "Puis-je adapter mes repas selon mes goûts ?",
      answer:
        "Oui ! Tu peux modifier les accompagnements, choisir d'autres ingrédients et adapter les quantités selon tes préférences.",
    },
    {
      question: "Est-ce que je dois faire du sport ?",
      answer:
        "L’activité physique est un vrai plus, mais tu peux commencer ta transformation uniquement par l’alimentation. Tu avances à ton rythme.",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen font-sans text-gray-900">
      <Header />
      <main className="flex-1">
        {/* HERO */}
        <section className="relative flex items-center justify-center text-white bg-orange-500 h-[70vh] overflow-hidden">
          {/* Mobile banner */}
          <img
            src="https://res.cloudinary.com/diccvjf98/image/upload/v1749826619/Design_sans_titre_46_kbofuh.png"
            alt="Bannière mobile"
            className="absolute inset-0 w-full h-full object-cover sm:hidden"
            loading="eager"
          />
          {/* Desktop banner */}
          <img
            src="https://res.cloudinary.com/diccvjf98/image/upload/v1749824311/Design_sans_titre_44_bcwldm.png"
            alt="Bannière desktop"
            className="hidden sm:block absolute inset-0 w-full h-full object-cover"
            loading="eager"
          />

          <div className="relative z-10 text-center px-10 sm:px-16 max-w-2xl flex flex-col items-center justify-center h-full">
            <h1 className="text-2xl sm:text-4xl md:text-6xl font-extrabold mb-4 text-orange-500">
              Perdre du poids <br className="sm:hidden" />
              n’a jamais été <br className="sm:hidden" />
              aussi simple.
            </h1>
            <p className="hidden sm:block text-lg md:text-2xl mb-6 text-orange-500">
              Un accompagnement nutritionnel intelligent, des menus adaptés à ton corps, et un vrai suivi.
            </p>
            <Link
              href="/register"
              className="bg-orange-500 text-white font-semibold py-3 px-6 rounded-full hover:bg-orange-600 transition text-sm sm:text-base"
            >
              Essayer 7 jours gratuitement
            </Link>
          </div>
        </section>

        {/* SOCIAL PROOF */}
        <section className="bg-white py-6 sm:py-8">
  <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between space-y-3 sm:space-y-4 md:space-y-0">
    {/* Note moyenne + avis */}
    <div className="flex items-center space-x-2 sm:space-x-3">
      <span className="text-2xl sm:text-3xl font-extrabold">4.9/5</span>
      <div className="flex space-x-1">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.966a1 1 0 00.95.69h4.17c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.967c.3.921-.755 1.688-1.538 1.118l-3.38-2.454a1 1 0 00-1.175 0l-3.38 2.454c-.783.57-1.838-.197-1.538-1.118l1.286-3.967a1 1 0 00-.364-1.118L2.055 9.393c-.783-.57-.38-1.81.588-1.81h4.17a1 1 0 00.95-.69l1.286-3.966z" />
          </svg>
        ))}
      </div>
      <span className="text-sm sm:text-base text-gray-600">97 avis vérifiés</span>
    </div>
    {/* Taille de la communauté */}
    <div className="text-base sm:text-lg font-medium">
      Une communauté de <span className="font-bold">{usersCount.toLocaleString()}</span> membres
    </div>
  </div>
</section>

        {/* CE QUE TU TROUVERAS ICI */}
       {/* CE QUE TU TROUVERAS ICI */}
<section className="py-20 bg-white text-center px-6">
  <h2 className="text-3xl font-bold mb-12">Ce que tu trouveras ici</h2>
  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
    {features.map((item) => (
      <div
        key={item.title}
        className="bg-[#FE8C15] p-6 rounded-lg shadow text-white"
      >
        <img
          src={item.img}
          alt={item.title}
          className="mx-auto mb-4 w-[160px] h-[160px] md:w-[240px] md:h-[240px] object-contain"          width="112"
          height="112"
          loading="lazy"
        />
        <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
        <p>{item.desc}</p>
      </div>
    ))}
  </div>
</section>

        {/* TÉMOIGNAGES */}
        <section className="py-20 bg-gray-50 text-center px-6">
          <h2 className="text-3xl font-bold mb-10">Elles en parlent mieux que nous</h2>
          <div className="max-w-3xl mx-auto space-y-8 text-gray-700 italic text-lg">
            <p>
              “J’ai perdu 6 kg sans frustration ni régime extrême. Les menus sont clairs, et je me sens enfin accompagnée.”<br />
              <span className="not-italic font-medium text-sm text-orange-500">
                – Nathalie, 48 ans
              </span>
            </p>
            <p>
              “Je me sens mieux, j’ai repris le contrôle sur mon alimentation et mon énergie. J’adore ce suivi personnalisé.”<br />
              <span className="not-italic font-medium text-sm text-orange-500">
                – Julie, 42 ans
              </span>
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="py-20 bg-white px-6">
          <h2 className="text-3xl font-bold text-center mb-12">On répond à tes <span className="text-orange-500">questions les plus fréquentes</span>.</h2>
          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((item, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div key={idx} className="bg-white rounded-lg shadow transition">
                  <button
                    className="w-full flex items-center justify-between p-4"
                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                  >
                    <span className={`text-left text-lg font-medium transition ${
                      isOpen ? "text-orange-500" : "text-blue-900"
                    }`}>{item.question}</span>
                    <svg
                      className={`h-5 w-5 transform transition-transform ${
                        isOpen ? "rotate-180 text-orange-500" : "text-gray-400"
                      }`}
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                  {isOpen && <div className="border-t px-4 pb-4 text-gray-700"><p className="whitespace-pre-line">{item.answer}</p></div>}
                </div>
              );
            })}
          </div>

          <div className="mt-12 text-center">
            <p className="mb-4 text-gray-700">Une question ? Écris-nous à <a href="mailto:contact@matransformation.fr" className="text-orange-500 hover:underline">contact@matransformation.fr</a>.</p>
            <Link href="/register" className="inline-block bg-orange-500 text-white font-semibold py-3 px-6 rounded hover:bg-orange-600 transition">Commencer l’essai gratuit</Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

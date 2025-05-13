import { useState } from "react";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function Home() {
  const [openIndex, setOpenIndex] = useState(null);

  const features = [
    {
      img: "/recette-matransformation.png",
      title: "Recettes simples et équilibrées",
      desc: "Des idées de repas sains, adaptés à tes objectifs et faciles à suivre au quotidien.",
    },
    {
      img: "/menu-matransformation.png",
      title: "Menus personnalisés",
      desc: "Des plans alimentaires sur-mesure selon ton métabolisme, ton poids et ton objectif.",
    },
    {
      img: "/suivi-matransformation.png",
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
        <section className="relative flex items-center justify-center text-white bg-orange-500 h-[70vh]">
          <img
            src="/hero.jpg"
            alt="Bannière"
            className="absolute inset-0 w-full h-full object-cover opacity-50"
          />
          <div className="relative z-10 text-center px-4 max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-extrabold mb-4">
              Perdre du poids n’a jamais été aussi simple.
            </h1>
            <p className="text-lg md:text-2xl mb-6">
              Un accompagnement nutritionnel intelligent, des menus adaptés à ton corps, et un vrai suivi.
            </p>
            <Link
              href="/register"
              className="bg-white text-orange-500 font-semibold py-3 px-6 rounded-full hover:bg-gray-100 transition"
            >
              Essayer 7 jours gratuitement
            </Link>
          </div>
        </section>

        {/* CE QUE TU TROUVERAS ICI */}
        <section className="py-20 bg-white text-center">
          <h2 className="text-3xl font-bold mb-12">Ce que tu trouveras ici</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto px-4">
            {features.map((item) => (
              <div
                key={item.title}
                className="bg-[#FE8C15] p-6 rounded-lg shadow text-white"
              >
                <img
                  src={item.img}
                  alt={item.title}
                  className="mx-auto mb-4 w-30 h-30 object-contain"
                />
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* TÉMOIGNAGES */}
        <section className="py-20 bg-gray-50 text-center">
          <h2 className="text-3xl font-bold mb-10">Elles en parlent mieux que nous</h2>
          <div className="max-w-3xl mx-auto space-y-8 text-gray-700 italic text-lg">
            <p>
              “J’ai perdu 6 kg sans frustration ni régime extrême. Les menus sont clairs, et je me sens enfin accompagnée.”
              <br />
              <span className="not-italic font-medium text-sm text-orange-500">
                – Nathalie, 48 ans
              </span>
            </p>
            <p>
              “Je me sens mieux, j’ai repris le contrôle sur mon alimentation et mon énergie. J’adore ce suivi personnalisé.”
              <br />
              <span className="not-italic font-medium text-sm text-orange-500">
                – Julie, 42 ans
              </span>
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="py-20 bg-white">
          <h2 className="text-3xl font-bold text-center mb-12">
            On répond à tes{" "}
            <span className="text-orange-500">questions les plus fréquentes</span>.
          </h2>
          <div className="max-w-3xl mx-auto space-y-4 px-4">
            {faqs.map((item, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div key={idx} className="bg-white rounded-lg shadow transition">
                  <button
                    className="w-full flex items-center justify-between p-4"
                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                  >
                    <span
                      className={`text-left text-lg font-medium transition ${
                        isOpen ? "text-orange-500" : "text-blue-900"
                      }`}
                    >
                      {item.question}
                    </span>
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
                  {isOpen && (
                    <div className="border-t px-4 pb-4 text-gray-700">
                      <p className="whitespace-pre-line">{item.answer}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-12 text-center">
            <p className="mb-4 text-gray-700">
              Une question ? Écris-nous à{" "}
              <a
                href="mailto:contact@matransformation.fr"
                className="text-orange-500 hover:underline"
              >
                contact@matransformation.fr
              </a>
              .
            </p>
            <Link
              href="/register"
              className="inline-block bg-orange-500 text-white font-semibold py-3 px-6 rounded hover:bg-orange-600 transition"
            >
              Commencer l’essai gratuit
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

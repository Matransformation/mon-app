import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Link from 'next/link';

export default function PricingPage() {
  const featuresFull = [
    'Menus personnalisés adaptés à vos objectifs',
    'Suivi hebdomadaire et ajustements illimités',
    'Accès à la bibliothèque de recettes exclusives',
    'Conseils nutritionnels et astuces fitness',
  ];

  const featuresRecipesOnly = [
    'Accès illimité à toutes les recettes',
    'Calcul automatique des calories et macros',
    'Ajout aux menus si abonnement complet',
  ];

  return (
    <div className="flex flex-col min-h-screen font-sans text-gray-900">
      <Header />

      <main className="container mx-auto px-6 py-16 flex-1">
        <h1 className="text-4xl font-extrabold text-center mb-12">Nos Tarifs</h1>
        <div className="grid gap-8 md:grid-cols-3">
          {/* Recettes uniquement */}
          <div className="border rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-200 text-center">
            <h2 className="text-2xl font-semibold mb-2">Recettes uniquement</h2>
            <p className="text-3xl font-bold mb-4">3,99 € / mois</p>
            <ul className="list-disc list-inside mb-6 space-y-2 text-left">
              {featuresRecipesOnly.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
            <Link href="/register">
              <button className="w-full py-3 rounded-xl font-medium bg-orange-500 text-white hover:bg-orange-600 transition-colors duration-200">
                Commencer l’essai gratuit
              </button>
            </Link>
          </div>

          {/* Abonnement Mensuel avec badge */}
          <div className="relative border rounded-2xl shadow-lg p-6 pt-10 hover:shadow-xl transition-shadow duration-200 text-center">
            <span className="absolute top-2 right-2 bg-yellow-400 text-xs font-semibold text-white px-2 py-1 rounded-full shadow">
              ⭐ Meilleure vente
            </span>
            <h2 className="text-2xl font-semibold mb-2">Abonnement Mensuel</h2>
            <p className="text-3xl font-bold mb-4">14,99 € / mois</p>
            <ul className="list-disc list-inside mb-4 space-y-2 text-left">
              {featuresFull.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
            <p className="text-sm text-gray-600 mb-6">
              👉 Abonnement sans engagement. Résiliable en un clic depuis ton espace personnel.
            </p>
            <Link href="/register">
              <button className="w-full py-3 rounded-xl font-medium bg-orange-500 text-white hover:bg-orange-600 transition-colors duration-200">
                Essayer MaTransformation pendant 7 jours
              </button>
            </Link>
          </div>

          {/* Abonnement Annuel */}
          <div className="border rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-200 text-center">
            <h2 className="text-2xl font-semibold mb-2">Abonnement Annuel</h2>
            <p className="text-3xl font-bold mb-4">
              89,90 € / an{' '}
              <span className="text-sm font-medium text-green-600">(50 % d’économie)</span>
            </p>
            <ul className="list-disc list-inside mb-4 space-y-2 text-left">
              {featuresFull.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
            <p className="text-sm text-gray-600 mb-6">
              👉 Annulable facilement à tout moment depuis votre espace personnel.
            </p>
            <Link href="/register">
              <button className="w-full py-3 rounded-xl font-medium bg-orange-500 text-white hover:bg-orange-600 transition-colors duration-200">
                Essayer MaTransformation pendant 7 jours
              </button>
            </Link>
          </div>
        </div>

        <section className="mt-16 text-center">
          <h2 className="text-3xl font-semibold mb-4">Pourquoi choisir MaTransformation ?</h2>
          <p className="max-w-2xl mx-auto text-lg">
            Que vous soyez débutant ou confirmé, nos programmes sont conçus pour vous offrir un
            accompagnement durable, sans frustration. Rejoignez notre plateforme et démarrez votre transformation dès aujourd’hui.
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}

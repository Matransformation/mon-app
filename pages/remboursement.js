import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function Remboursement() {
  return (
    <div className="flex flex-col min-h-screen font-sans text-gray-900">
      <Header />

      <main className="flex-1 container mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold mb-6 text-center">Politique de Remboursement</h1>

        <div className="prose max-w-3xl mx-auto text-justify">
          <p>
            En vous abonnant à MaTransformation, vous bénéficiez d’un essai gratuit de 7 jours sans
            engagement. Pendant cette période, vous pouvez explorer librement toutes les
            fonctionnalités.
          </p>

          <h2>Abonnements payants</h2>
          <p>
            Une fois l’abonnement activé (mensuel, annuel ou recettes), aucun remboursement ne
            sera effectué pour la période en cours, même en cas d’annulation anticipée.
          </p>

          <h2>Résiliation</h2>
          <p>
            Vous pouvez résilier à tout moment depuis votre espace personnel. L’abonnement restera
            actif jusqu’à la fin de la période déjà réglée.
          </p>

          <h2>Contact</h2>
          <p>
            Pour toute demande particulière, contactez-nous à :{" "}
            <a href="mailto:contact@matransformation.fr" className="text-orange-500">
              contact@matransformation.fr
            </a>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}

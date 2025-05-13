import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function Confidentialite() {
  return (
    <div className="flex flex-col min-h-screen font-sans text-gray-900">
      <Header />

      <main className="flex-1 container mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Politique de Confidentialité
        </h1>

        <div className="prose max-w-3xl mx-auto text-justify">
          <p>
            MaTransformation accorde une grande importance à la protection de vos données
            personnelles et au respect de votre vie privée, conformément au Règlement Général sur
            la Protection des Données (RGPD).
          </p>

          <h2>1. Données collectées</h2>
          <p>
            Lors de votre inscription ou de l’utilisation de la plateforme, nous collectons les
            données suivantes : nom, prénom, adresse e-mail, informations de suivi nutritionnel,
            données d’abonnement et historique d’utilisation.
          </p>

          <h2>2. Finalités du traitement</h2>
          <p>Les données collectées sont utilisées pour :</p>
          <ul>
            <li>Créer et gérer votre compte utilisateur</li>
            <li>Générer des menus et recettes personnalisés</li>
            <li>Assurer le suivi de votre progression</li>
            <li>Gérer la facturation et les paiements</li>
            <li>Vous contacter en cas de besoin (support, notifications, mises à jour)</li>
          </ul>

          <h2>3. Hébergement et sécurité</h2>
          <p>
            Vos données sont hébergées en Europe chez un prestataire sécurisé. Toutes les données
            sensibles (mot de passe, paiement) sont chiffrées et protégées.
          </p>

          <h2>4. Partage des données</h2>
          <p>
            Vos données ne sont jamais revendues. Elles peuvent être partagées uniquement avec des
            prestataires de services techniques (Stripe pour les paiements, par exemple), dans le
            respect strict du RGPD.
          </p>

          <h2>5. Cookies</h2>
          <p>
            Des cookies sont utilisés pour améliorer l’expérience utilisateur, mesurer la fréquentation
            et assurer le bon fonctionnement du site. Vous pouvez les gérer via les paramètres de
            votre navigateur.
          </p>

          <h2>6. Durée de conservation</h2>
          <p>
            Vos données sont conservées tant que votre compte est actif, et jusqu’à 3 ans après
            inactivité ou résiliation, sauf obligations légales contraires.
          </p>

          <h2>7. Vos droits</h2>
          <p>
            Conformément au RGPD, vous disposez d’un droit d’accès, de rectification, de
            suppression, d’opposition et de portabilité. Pour exercer ces droits, contactez-nous à
            l’adresse ci-dessous.
          </p>

          <h2>8. Contact</h2>
          <p>
            Pour toute demande concernant vos données personnelles, contactez-nous par e-mail à :{" "}
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

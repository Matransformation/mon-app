import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function CGU() {
  return (
    <div className="flex flex-col min-h-screen font-sans text-gray-900">
      <Header />

      <main className="flex-1 container mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Conditions Générales d’Utilisation (CGU)
        </h1>

        <div className="prose max-w-3xl mx-auto text-justify">
          <p>
            Les présentes Conditions Générales d’Utilisation (ci-après « CGU ») ont pour objet de
            définir les modalités et conditions d’utilisation du site <strong>MaTransformation</strong>,
            accessible à l’adresse <a href="https://matransformation.fr">matransformation.fr</a>.
          </p>

          <h2>1. Acceptation des conditions</h2>
          <p>
            En accédant et en utilisant ce site, l’utilisateur reconnaît avoir lu, compris et accepté
            sans réserve les présentes CGU.
          </p>

          <h2>2. Description du service</h2>
          <p>
            MaTransformation est une plateforme permettant aux utilisateurs de générer des menus
            personnalisés, de suivre leurs objectifs nutritionnels et d’accéder à une base de
            recettes équilibrées.
          </p>

          <h2>3. Accès au service</h2>
          <p>
            L’accès à certaines fonctionnalités nécessite la création d’un compte utilisateur et
            l’adhésion à un abonnement. L’utilisateur est responsable de la confidentialité de ses
            identifiants.
          </p>

          <h2>4. Propriété intellectuelle</h2>
          <p>
            Tous les contenus présents sur le site (textes, images, logos, recettes, etc.) sont la
            propriété exclusive de MaTransformation. Toute reproduction ou diffusion est interdite
            sans autorisation écrite.
          </p>

          <h2>5. Responsabilités</h2>
          <p>
            L’utilisateur est seul responsable de l’utilisation qu’il fait du service. MaTransformation
            ne saurait être tenue responsable d’éventuels dommages directs ou indirects liés à
            l’utilisation de la plateforme.
          </p>

          <h2>6. Résiliation</h2>
          <p>
            L’utilisateur peut résilier son abonnement à tout moment via son espace personnel. La
            résiliation prend effet à la fin de la période en cours.
          </p>

          <h2>7. Données personnelles</h2>
          <p>
            MaTransformation s’engage à respecter la confidentialité des données collectées. Pour
            plus d’informations, consultez notre politique de confidentialité.
          </p>

          <h2>8. Modification des CGU</h2>
          <p>
            MaTransformation se réserve le droit de modifier les présentes CGU à tout moment. En
            cas de modification, la nouvelle version sera publiée sur le site et l’utilisateur en sera
            informé.
          </p>

          <h2>9. Contact</h2>
          <p>
            Pour toute question relative aux CGU, vous pouvez nous contacter à l’adresse suivante :{" "}
            <a href="mailto:contact@matransformation.fr" className="text-orange-500">contact@matransformation.fr</a>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}

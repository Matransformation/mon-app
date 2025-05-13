import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function MentionsLegales() {
  return (
    <div className="flex flex-col min-h-screen font-sans text-gray-900">
      <Header />

      <main className="flex-1 container mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold mb-6 text-center">Mentions Légales</h1>

        <div className="prose max-w-3xl mx-auto text-justify">
          <h2>Éditeur du site</h2>
          <p>
            Le site <strong>MaTransformation</strong> est édité par :<br />
            <strong>Clémence et Romain</strong><br />
            10 rue Jules Védrines, 64600 ANGLET<br />
            SIRET : 887 580 074 00029<br />
            Téléphone : 06 58 88 15 60<br />
            Email : <a href="mailto:contact@matransformation.fr" className="text-orange-500">contact@matransformation.fr</a>
          </p>

          <h2>Hébergement</h2>
          <p>
            Le site est hébergé par :<br />
            <strong>Vercel Inc.</strong><br />
            340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis<br />
            Site web : <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-orange-500">vercel.com</a>
          </p>

          <h2>Propriété intellectuelle</h2>
          <p>
            L’ensemble des contenus présents sur le site (textes, images, logos, recettes, interfaces)
            est la propriété exclusive de MaTransformation, sauf mentions contraires. Toute
            reproduction, représentation ou diffusion, même partielle, est interdite sans autorisation
            écrite préalable.
          </p>

          <h2>Responsabilité</h2>
          <p>
            L’éditeur ne saurait être tenu responsable des erreurs, d’une absence de disponibilité
            des informations ou de la présence de virus sur le site. L’utilisateur est seul responsable
            de l’utilisation qu’il fait du contenu proposé.
          </p>

          <h2>Protection des données personnelles</h2>
          <p>
            Pour connaître notre politique de confidentialité et vos droits concernant vos données
            personnelles, veuillez consulter la page :{" "}
            <a href="/confidentialite" className="text-orange-500">Politique de confidentialité</a>.
          </p>

          <h2>Contact</h2>
          <p>
            Pour toute question ou réclamation, vous pouvez nous contacter à :{" "}
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

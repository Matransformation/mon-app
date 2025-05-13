import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function Cookies() {
  return (
    <div className="flex flex-col min-h-screen font-sans text-gray-900">
      <Header />

      <main className="flex-1 container mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold mb-6 text-center">Politique de Cookies</h1>

        <div className="prose max-w-3xl mx-auto text-justify">
          <p>
            Le site <strong>MaTransformation</strong> utilise des cookies afin de garantir son bon
            fonctionnement, améliorer votre navigation, mesurer l’audience et proposer des contenus
            adaptés.
          </p>

          <h2>1. Qu’est-ce qu’un cookie ?</h2>
          <p>
            Un cookie est un petit fichier texte enregistré sur votre terminal (ordinateur, mobile)
            lors de votre visite sur un site. Il permet notamment de vous reconnaître, de mémoriser
            vos préférences ou de suivre votre navigation à des fins statistiques ou marketing.
          </p>

          <h2>2. Types de cookies utilisés</h2>
          <ul>
            <li><strong>Cookies nécessaires</strong> : assurent le bon fonctionnement du site.</li>
            <li><strong>Cookies de performance</strong> : recueillent des données anonymes sur la fréquentation (ex : Google Analytics).</li>
            <li><strong>Cookies de marketing</strong> : utilisés pour diffuser des publicités ciblées (ex : Facebook Pixel).</li>
          </ul>

          <h2>3. Consentement</h2>
          <p>
            Lors de votre première visite, un bandeau s’affiche pour vous permettre d’accepter ou de
            refuser les cookies non essentiels. Vous pouvez modifier votre consentement à tout moment
            en configurant votre navigateur ou en utilisant les liens proposés ci-dessous.
          </p>

          <h2>4. Gérer les cookies</h2>
          <p>
            Vous pouvez à tout moment désactiver les cookies via les réglages de votre navigateur.
            Voici comment faire :
          </p>
          <ul>
            <li>
              <a
                href="https://support.google.com/chrome/answer/95647"
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-500"
              >
                Google Chrome
              </a>
            </li>
            <li>
              <a
                href="https://support.mozilla.org/fr/kb/activer-desactiver-cookies"
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-500"
              >
                Mozilla Firefox
              </a>
            </li>
            <li>
              <a
                href="https://support.apple.com/fr-fr/guide/safari/sfri11471/mac"
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-500"
              >
                Safari
              </a>
            </li>
            <li>
              <a
                href="https://support.microsoft.com/fr-fr/help/17442/windows-internet-explorer-delete-manage-cookies"
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-500"
              >
                Internet Explorer / Edge
              </a>
            </li>
          </ul>

          <h2>5. Contact</h2>
          <p>
            Pour toute question relative à cette politique, vous pouvez nous écrire à :{" "}
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

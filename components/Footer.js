import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white py-10 mt-12">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Logo + description */}
        <div>
          <img src="/matransformation.png" alt="Logo" className="h-12 mb-4" />
          <p className="text-sm text-gray-400">
            MaTransformation est une plateforme dédiée à la transformation physique durable.
          </p>
        </div>

        {/* Navigation */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Navigation</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li><Link href="/tarifs" className="hover:underline">Tarifs</Link></li>
            <li><Link href="/cgu" className="hover:underline">Conditions d’utilisation</Link></li>
            <li><Link href="/confidentialite" className="hover:underline">Politique de confidentialité</Link></li>
            <li><Link href="/mentions-legales" className="hover:underline">Mentions légales</Link></li>
            <li><Link href="/cookies" className="hover:underline">Politique de cookies</Link></li>
            <li><Link href="/remboursement" className="hover:underline">Politique de remboursement</Link></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Contact</h3>
          <p className="text-sm text-gray-300">
            Clémence et Romain<br />
            10 rue Jules Védrines, 64600 ANGLET<br />
            SIRET : 887 580 074 00029<br />
            Tél : <a href="tel:+33658881560" className="hover:underline text-orange-400">06 58 88 15 60</a><br />
            Mail : <a href="mailto:contact@matransformation.fr" className="hover:underline text-orange-400">contact@matransformation.fr</a>
          </p>
        </div>
      </div>

      {/* Bas de page */}
      <div className="mt-8 border-t border-gray-700 pt-4 text-center text-sm text-gray-500">
        © {currentYear} MaTransformation. Tous droits réservés.
      </div>
    </footer>
  );
}

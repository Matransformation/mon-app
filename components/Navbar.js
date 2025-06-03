import { useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { useSession } from "next-auth/react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { data: session } = useSession();

  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <>
      {/* Barre de navigation principale */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm px-4 md:px-8 py-3 mb-0 w-full">
      <div className="flex justify-between items-center w-full">
          {/* Logo + menu desktop */}
          <div className="flex items-center gap-6">
            <Link href="/">
              <Image
                src="/matransformation.png"
                alt="Logo"
                width={160}
                height={40}
                className="h-auto w-auto"
              />
            </Link>

            {/* Menu desktop seulement si connecté */}
            {session && (
              <div className="hidden md:flex gap-6">
                <Link href="/dashboard" className="text-sm text-gray-700 hover:text-green-700 font-medium">Dashboard</Link>
                <Link href="/recettes" className="text-sm text-gray-700 hover:text-green-700 font-medium">Recettes</Link>
                <Link href="/menu" className="text-sm text-gray-700 hover:text-green-700 font-medium">Menus</Link>
                <Link href="/liste-courses" className="text-sm text-gray-700 hover:text-green-700 font-medium">Liste de courses</Link>
                <Link href="/mes-favoris" className="text-sm text-gray-700 hover:text-green-700 font-medium">Mes favoris</Link>
                <Link href="/mon-compte" className="text-sm text-gray-700 hover:text-green-700 font-medium">Mon compte</Link>
                <Link href="/social" className="text-sm text-gray-700 hover:text-green-700 font-medium">Communauté</Link>
                <Link href="/videos" className="bg-orange-500 hover:bg-orange-600 text-white text-sm px-3 py-1 rounded">Tutoriels vidéos</Link>
              </div>
            )}
          </div>

          {/* Zone droite : se connecter / se déconnecter */}
          <div className="hidden md:flex items-center gap-3">
            {session ? (
              <button
                onClick={() => signOut()}
                className="text-sm bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
              >
                Se déconnecter
              </button>
            ) : (
              <>
                <button
                  onClick={() => window.location.href = "/login"}
                  className="text-sm bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
                >
                  Se connecter
                </button>
                <button
                  onClick={() => window.location.href = "/register"}
                  className="text-sm bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded"
                >
                  Créer un compte
                </button>
              </>
            )}
          </div>

          {/* Mobile : soit menu burger soit bouton se connecter */}
          <div className="md:hidden flex items-center gap-2">
            {session ? (
              <>
                <span className="text-sm font-medium text-gray-700">Menu</span>
                <button onClick={toggleMenu}>
                  {menuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              </>
            ) : (
              <button
                onClick={() => window.location.href = "/login"}
                className="text-sm bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
              >
                Se connecter
              </button>
            )}
          </div>
        </div>

        {/* Menu mobile déroulant (si connecté) */}
        {menuOpen && session && (
          <div className="mt-3 flex flex-col gap-3 md:hidden">
            <Link href="/dashboard" className="text-sm text-gray-700 hover:text-green-700 font-medium">Dashboard</Link>
            <Link href="/recettes" className="text-sm text-gray-700 hover:text-green-700 font-medium">Recettes</Link>
            <Link href="/menu" className="text-sm text-gray-700 hover:text-green-700 font-medium">Menus</Link>
            <Link href="/liste-courses" className="text-sm text-gray-700 hover:text-green-700 font-medium">Liste de courses</Link>
            <Link href="/mes-favoris" className="text-sm text-gray-700 hover:text-green-700 font-medium">Mes favoris</Link>
            <Link href="/mon-compte" className="text-sm text-gray-700 hover:text-green-700 font-medium">Mon compte</Link>
            <Link href="/social" className="text-sm text-gray-700 hover:text-green-700 font-medium">Communauté</Link>
            <Link href="/videos" className="bg-orange-500 hover:bg-orange-600 text-white text-sm px-3 py-1 rounded">Tutoriels vidéos</Link>
            <button
              onClick={() => signOut()}
              className="text-sm bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded w-fit"
            >
              Se déconnecter
            </button>
          </div>
        )}
      </nav>

      {/* Liens rapides orange (mobile uniquement) */}
      {session && (
        <div className="bg-white border-b border-gray-100 px-4 py-5 md:hidden flex justify-center gap-3">
          <Link href="/recettes" className="bg-orange-500 hover:bg-orange-600 text-white text-sm px-3 py-1 rounded">Recettes</Link>
          <Link href="/menu" className="bg-orange-500 hover:bg-orange-600 text-white text-sm px-3 py-1 rounded">Menu</Link>
          <Link href="/liste-courses" className="bg-orange-500 hover:bg-orange-600 text-white text-sm px-3 py-1 rounded">Liste de courses</Link>
          <Link href="/videos" className="bg-orange-500 hover:bg-orange-600 text-white text-sm px-3 py-1 rounded">Tutoriels vidéos</Link>
        </div>
      )}
    </>
  );
}

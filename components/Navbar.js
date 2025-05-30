import { useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import Image from "next/image";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <>
      {/* Barre de navigation principale */}
      <nav className="bg-white border-b border-gray-200 shadow-sm px-4 md:px-8 py-3 mb-0 w-full">
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

            <div className="hidden md:flex gap-6">
              <Link href="/dashboard" className="text-sm text-gray-700 hover:text-green-700 font-medium">
                Dashboard
              </Link>
              <Link href="/recettes" className="text-sm text-gray-700 hover:text-green-700 font-medium">
                Recettes
              </Link>
              <Link href="/menu" className="text-sm text-gray-700 hover:text-green-700 font-medium">
                Menus
              </Link>
              <Link href="/liste-courses" className="text-sm text-gray-700 hover:text-green-700 font-medium">
                Liste de courses
              </Link>
              <Link href="/mes-favoris" className="text-sm text-gray-700 hover:text-green-700 font-medium">
                Mes favoris
              </Link>
              <Link href="/mon-compte" className="text-sm text-gray-700 hover:text-green-700 font-medium">
                Mon compte
              </Link>
              <Link href="/social" className="text-sm text-gray-700 hover:text-green-700 font-medium">
                Communauté
              </Link>
            </div>
          </div>

          {/* Déconnexion (desktop) */}
          <div className="hidden md:block">
            <button
              onClick={() => signOut()}
              className="text-sm bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
            >
              Se déconnecter
            </button>
          </div>

          {/* Menu burger (mobile) */}
          <div className="md:hidden flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Menu</span>
            <button onClick={toggleMenu}>
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Menu mobile déroulant */}
        {menuOpen && (
          <div className="mt-3 flex flex-col gap-3 md:hidden">
            <Link href="/dashboard" className="text-sm text-gray-700 hover:text-green-700 font-medium">
              Dashboard
            </Link>
            <Link href="/recettes" className="text-sm text-gray-700 hover:text-green-700 font-medium">
              Recettes
            </Link>
            <Link href="/menu" className="text-sm text-gray-700 hover:text-green-700 font-medium">
              Menus
            </Link>
            <Link href="/liste-courses" className="text-sm text-gray-700 hover:text-green-700 font-medium">
              Liste de courses
            </Link>
            <Link href="/mes-favoris" className="text-sm text-gray-700 hover:text-green-700 font-medium">
              Mes favoris
            </Link>
            <Link href="/mon-compte" className="text-sm text-gray-700 hover:text-green-700 font-medium">
              Mon compte
            </Link>
            <Link href="/social" className="text-sm text-gray-700 hover:text-green-700 font-medium">
              Communauté
            </Link>
            <button
              onClick={() => signOut()}
              className="text-sm bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded w-fit"
            >
              Se déconnecter
            </button>
          </div>
        )}
      </nav>

      {/* Bloc de liens rapides sous forme de boutons (mobile uniquement) */}
      <div className="bg-white border-b border-gray-100 px-4 py-5 md:hidden flex justify-center gap-3">
      <Link
          href="/recettes"
          className="bg-orange-500 hover:bg-orange-600 text-white text-sm px-3 py-1 rounded"
        >
          Recettes
        </Link>
        <Link
          href="/menu"
          className="bg-orange-500 hover:bg-orange-600 text-white text-sm px-3 py-1 rounded"
        >
          Menu
        </Link>
        <Link
          href="/liste-courses"
          className="bg-orange-500 hover:bg-orange-600 text-white text-sm px-3 py-1 rounded"
        >
          Liste de courses
        </Link>
      </div>
    </>
  );
}

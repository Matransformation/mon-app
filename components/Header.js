// File: components/Header.js
import React, { useState } from 'react';
import Link from 'next/link';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="bg-white shadow">
      <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex-shrink-0">
          <img
            src="/matransformation.png"
            alt="MaTransformation"
            className="h-12"
          />
        </Link>

        {/* Desktop navigation */}
        <ul className="hidden md:flex items-center space-x-8 text-gray-800">
          <li>
            <Link href="/" className="hover:text-[#fb8905]">
              Accueil
            </Link>
          </li>
          <li>
            <Link href="/recettes" className="hover:text-[#fb8905]">
              Recettes
            </Link>
          </li>
          <li>
            <Link href="/tarifs" className="hover:text-[#fb8905]">
              Tarifs
            </Link>
          </li>
          <li>
            <Link href="/login" className="hover:text-[#fb8905]">
              Se connecter
            </Link>
          </li>
          <li>
            <Link
              href="/register"
              className="bg-[#fb8905] text-white py-2 px-4 rounded hover:bg-[#e07c04] transition"
            >
              Essayer 7 jours
            </Link>
          </li>
        </ul>

        {/* Mobile actions: connexion + menu */}
        <div className="md:hidden flex items-center space-x-4">
          {/* Bouton Se connecter (mobile) en #fb8905 */}
          <Link
            href="/login"
            className="bg-[#fb8905] text-white text-sm py-2 px-4 rounded hover:bg-[#e07c04] transition"
          >
            Se connecter
          </Link>

          {/* Bouton Menu */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center text-gray-800 focus:outline-none"
            aria-label="Menu"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
            <span className="ml-1 text-gray-800">Menu</span>
          </button>
        </div>
      </nav>

      {/* Mobile menu déroulant */}
      {isOpen && (
        <div className="md:hidden px-4 pb-4 space-y-2">
          <Link href="/" className="block text-gray-700 hover:text-[#fb8905]">
            Accueil
          </Link>
          <Link href="/recettes" className="block text-gray-700 hover:text-[#fb8905]">
            Recettes
          </Link>
          <Link href="/tarifs" className="block text-gray-700 hover:text-[#fb8905]">
            Tarifs
          </Link>
          <Link href="/login" className="block text-gray-700 hover:text-[#fb8905]">
            Se connecter
          </Link>
          <Link
            href="/register"
            className="block text-center bg-[#fb8905] text-white py-2 px-4 rounded hover:bg-[#e07c04] transition"
          >
            Essayer 7 jours
          </Link>
        </div>
      )}
    </header>
  );
}

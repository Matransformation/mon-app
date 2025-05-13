import React, { useState } from 'react';
import Link from 'next/link';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="bg-white shadow">
      <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
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
            <Link href="/" className="hover:text-orange-500">
              Accueil
            </Link>
          </li>
          <li>
            <Link href="/tarifs" className="hover:text-orange-500">
              Tarifs
            </Link>
          </li>
          <li>
            <Link href="/login" className="hover:text-orange-500">
              Se connecter
            </Link>
          </li>
          <li>
            <Link
              href="/register"
              className="bg-orange-500 text-white py-2 px-4 rounded hover:bg-orange-600 transition"
            >
              Essayer 7 jours
            </Link>
          </li>
        </ul>

        {/* Mobile menu button */}
        <button
          className="md:hidden text-gray-800 focus:outline-none"
          onClick={() => setIsOpen(!isOpen)}
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
        </button>
      </nav>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden px-4 pb-4 space-y-2">
          <Link href="/" className="block text-gray-700 hover:text-orange-500">
            Accueil
          </Link>
          <Link href="/tarifs" className="block text-gray-700 hover:text-orange-500">
            Tarifs
          </Link>
          <Link href="/login" className="block text-gray-700 hover:text-orange-500">
            Se connecter
          </Link>
          <Link
            href="/register"
            className="block text-center bg-orange-500 text-white py-2 px-4 rounded hover:bg-orange-600 transition"
          >
            Essayer 7 jours
          </Link>
        </div>
      )}
    </header>
  );
}

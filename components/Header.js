// components/Header.js
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { User, Menu as MenuIcon, X } from "lucide-react";
import { Manrope } from "next/font/google";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export default function Header() {
  const [open, setOpen] = useState(false);

  const LeftLinks = () => (
    <nav className="hidden md:flex items-center gap-6 text-[15px]">
      {/* Badge “Nos recettes” style étiquette inclinée */}
      <Link href="/recettes" className="relative inline-block group">
        {/* fond incliné */}
        <span className="absolute inset-0 -rotate-2 rounded-md bg-orange-200/80 transition-transform group-hover:-rotate-3" />
        {/* texte */}
        <span className="relative block px-3 py-1 font-semibold text-gray-900">
          Nos recettes
        </span>
      </Link>
    </nav>
  );

  const RightLinks = () => (
    <nav className="hidden md:flex items-center gap-6 text-[15px]">
      <Link
        href="/login"
        className="inline-flex items-center gap-2 text-gray-900 hover:text-gray-700"
        aria-label="Se connecter"
        title="Se connecter"
      >
        <User className="h-5 w-5" />
      </Link>
      <Link
        href="/register"
        className="rounded-full bg-[#fb8905] text-white font-semibold px-4 py-2 hover:bg-[#e07c04] transition"
      >
        Essayer 7 jours
      </Link>
    </nav>
  );

  return (
    <header
      className={`${manrope.className} sticky top-0 z-40 border-b border-orange-100 bg-[#FFFBF7]`}
    >
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="grid grid-cols-3 items-center py-3">
          <div className="justify-self-start">
            <LeftLinks />
          </div>

          <div className="justify-self-center">
            <Link href="/" className="inline-block">
              {/* 🔎 logo un peu plus grand */}
              <Image
                src="/matransformation.png"
                alt="MaTransformation"
                width={190}
                height={54}
                className="h-10 w-auto md:h-12"
                priority
              />
            </Link>
          </div>

          <div className="justify-self-end">
            <RightLinks />
          </div>

          {/* Mobile (logo + boutons) */}
          <div className="md:hidden col-span-3 -mt-10">
            <div className="flex items-center justify-between">
              <Link href="/" className="inline-flex items-center gap-2">
                <Image
                  src="/matransformation.png"
                  alt="MaTransformation"
                  width={170}
                  height={48}
                  className="h-10 w-auto"
                  priority
                />
              </Link>

              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1 text-gray-900"
                  aria-label="Se connecter"
                  title="Se connecter"
                >
                  <User className="h-6 w-6" />
                </Link>
                <button
                  onClick={() => setOpen(true)}
                  className="p-2 rounded-md border border-gray-200"
                  aria-label="Ouvrir le menu"
                >
                  <MenuIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Drawer mobile */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="absolute right-0 top-0 h-full w-[85%] max-w-sm bg-white shadow-xl p-5 flex flex-col">
            <div className="flex items-center justify-between">
              <Image
                src="/matransformation.png"
                alt="MaTransformation"
                width={170}
                height={48}
                className="h-10 w-auto"
                priority
              />
              <button
                onClick={() => setOpen(false)}
                className="p-2 rounded-md border border-gray-200"
                aria-label="Fermer le menu"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <nav className="mt-6 space-y-2 text-lg">
              {/* badge mobile (on simplifie sans rotation pour lisibilité) */}
              <Link
                href="/recettes"
                className="block px-3 py-2 text-gray-900 hover:bg-gray-50 rounded-md"
                onClick={() => setOpen(false)}
              >
                Nos recettes
              </Link>
              <Link
                href="/login"
                className="block px-3 py-2 text-gray-900 hover:bg-gray-50 rounded-md"
                onClick={() => setOpen(false)}
              >
                Se connecter
              </Link>
              <Link
                href="/register"
                className="mt-2 inline-flex w-full items-center justify-center rounded-full bg-[#fb8905] text-white font-semibold px-4 py-3 hover:bg-[#e07c04] transition"
                onClick={() => setOpen(false)}
              >
                Essayer 7 jours
              </Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { User, Menu as MenuIcon, X, ChevronRight } from "lucide-react";

export default function Header() {
  const [open, setOpen] = useState(false);

  const LeftLinks = () => (
    <nav className="hidden md:flex items-center gap-6 text-[15px]">
      <Link
        href="/recettes"
        aria-label="Voir nos recettes"
        className="inline-flex items-center rounded-full bg-[#fb8905] px-4 py-2 font-semibold text-white transition hover:bg-[#e07c04]"
      >
        Nos recettes
      </Link>

      {/* Nouveau lien Coaching sport */}
      <Link
        href="/coaching-sport"
        aria-label="Voir l’offre de coaching sportif"
        className="inline-flex items-center rounded-full border border-gray-200 bg-white px-4 py-2 font-semibold text-gray-900 transition hover:bg-gray-50"
      >
        Coaching sport
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
    <header className="sticky top-0 z-40 border-b border-orange-100 bg-[#FFFBF7]">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        {/* Barre unique responsive */}
        <div className="py-3 md:grid md:grid-cols-3 md:items-center flex items-center justify-between">
          <div className="hidden md:block justify-self-start">
            <LeftLinks />
          </div>

          <div className="flex justify-start md:justify-center">
            <Link href="/" className="inline-block" aria-label="Aller à l’accueil">
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

          <div className="hidden md:block justify-self-end">
            <RightLinks />
          </div>

          {/* Actions (mobile) */}
          <div className="md:hidden flex items-center gap-3">
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

      {/* === MOBILE DRAWER === */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop avec blur pour adoucir */}
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          {/* Pane */}
          <div className="absolute right-0 top-0 h-full w-[85%] max-w-sm bg-white shadow-xl p-5 flex flex-col rounded-l-2xl">
            <div className="flex items-center justify-end">
              <button
                onClick={() => setOpen(false)}
                className="p-2 rounded-md border border-gray-200"
                aria-label="Fermer le menu"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Liens plus fins */}
            <nav className="mt-4 space-y-2 text-base">
              {/* Nos recettes */}
              <Link
                href="/recettes"
                onClick={() => setOpen(false)}
                className="group flex items-center justify-between rounded-xl border border-orange-100 bg-white px-3 py-3"
                aria-label="Voir nos recettes"
              >
                <span className="relative font-medium text-gray-900">
                  <span
                    aria-hidden
                    className="absolute -left-1 -right-1 bottom-1 -z-10 h-2 -skew-x-6 rounded bg-[#fb8905]/30 transition-all group-hover:bg-[#fb8905]/40"
                  />
                  Nos recettes
                </span>
                <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-700" />
              </Link>

              {/* Nouveau : Coaching sport */}
              <Link
                href="/coaching-sport"
                onClick={() => setOpen(false)}
                className="group flex items-center justify-between rounded-xl border border-gray-100 bg-white px-3 py-3"
                aria-label="Voir l’offre de coaching sportif"
              >
                <span className="font-medium text-gray-900">Coaching sport</span>
                <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-700" />
              </Link>

              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="flex items-center justify-between rounded-xl border border-gray-100 bg-white px-3 py-3"
                aria-label="Se connecter"
              >
                <span className="font-medium text-gray-900">Se connecter</span>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </Link>

              {/* CTA principal isolé en bas du tiroir */}
              <div className="mt-4 border-t border-gray-100 pt-4 mb-safe">
                <Link
                  href="/register"
                  onClick={() => setOpen(false)}
                  className="inline-flex w-full items-center justify-center rounded-full bg-[#fb8905] px-4 py-3 font-semibold text-white transition hover:bg-[#e07c04]"
                >
                  Essayer 7 jours
                </Link>
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

/**
 * Bulle cadeau (mobile) — bas gauche
 * - Ouverture/fermeture fiable (pointerdown)
 * - Texte sur 2 lignes max (wrap) pour limiter la largeur
 * - max-w ~60vw pour éviter toute superposition avec WhatsApp (bas droite)
 * - Petite croix pour fermer + clic extérieur
 */
export default function StickyCTA({
  label = "Essai gratuit 7 jours",
  href = "/register",
  maxWidthVw = 60, // ajuste à 55 ou 50 si besoin
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Ferme si clic/touch à l'extérieur
  useEffect(() => {
    function onPointerDown(e) {
      if (!open) return;
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  const toggle = () => setOpen((v) => !v);

  return (
    <div
      ref={ref}
      className="fixed left-0 bottom-0 z-50 md:hidden"
      style={{
        paddingLeft: 16,
        paddingBottom: "calc(16px + env(safe-area-inset-bottom, 0px))",
      }}
    >
      {!open ? (
        // Bulle fermée
        <button
          type="button"
          onClick={toggle}
          onTouchStart={toggle}
          aria-expanded={open}
          aria-label={label}
          className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[#fb8905] text-white shadow-lg transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#fb8905] focus:ring-offset-2"
        >
          <GiftIcon className="h-7 w-7" />
          {/* petit ping */}
          <span className="absolute -right-1 -top-1 inline-flex h-3 w-3 animate-ping rounded-full bg-white/80" />
          <span className="absolute -right-1 -top-1 inline-flex h-3 w-3 rounded-full bg-white" />
        </button>
      ) : (
        // Bulle ouverte (pilule) — largeur limitée + texte wrap
        <div
          className="group relative inline-flex items-center gap-2 rounded-full bg-[#fb8905] px-3 py-3 pr-9 text-white shadow-lg"
          style={{ maxWidth: `min(${maxWidthVw}vw, 420px)` }}
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20">
            <GiftIcon className="h-6 w-6" />
          </span>

          {/* Bloc texte : wrap sur 2 lignes max */}
          <div className="min-w-0 flex-1">
            <Link href={href} className="block focus:outline-none">
              <span className="block text-left text-sm font-semibold leading-snug break-words">
                {label}
              </span>
            </Link>
            <span className="mt-1 inline-block rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-medium">
              Offert
            </span>
          </div>

          {/* Bouton fermer (croix) */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setOpen(false);
            }}
            aria-label="Fermer"
            className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-white/20 text-white hover:bg-white/30"
          >
            <CloseIcon className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

function GiftIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M20 7h-2.18A3 3 0 0015 3a3 3 0 00-3 3 3 3 0 00-3-3 3 3 0 00-2.82 4H4a1 1 0 00-1 1v3h18V8a1 1 0 00-1-1zM9 5a1 1 0 110 2H7a1 1 0 110-2h2zm8 0a1 1 0 110 2h-2a1 1 0 110-2h2zM3 13v7a1 1 0 001 1h7v-8H3zm10 0v8h7a1 1 0 001-1v-7h-8z" />
    </svg>
  );
}

function CloseIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" aria-hidden="true">
      <path d="M6 6l12 12M18 6l-12 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

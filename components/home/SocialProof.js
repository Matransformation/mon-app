import Image from "next/image";

/**
 * Ruban de logos "vu dans" qui défile en continu sous le Hero.
 * - Répète automatiquement les logos pour couvrir toutes les largeurs.
 * - Tu peux régler la vitesse via la prop `speed` (en secondes).
 *
 * Usage (déjà en place dans pages/index.js) :
 *   <SocialProof logos={LOGOS} />
 */
export default function SocialProof({
  logos = [],
  // nombre de répétitions du set de logos à l’intérieur d’un "tour"
  repeat = 4,
  // durée d’un tour complet
  speed = 40,
}) {
  const base = logos.length
    ? logos
    : [{ src: "/logos/exemple.svg", alt: "Exemple", w: 160, h: 60 }];

  // construit une rangée assez longue (ex: 4× la liste)
  const row = Array.from({ length: repeat }).flatMap(() => base);

  return (
    <section className="bg-white">
      <div className="relative mx-auto max-w-7xl overflow-hidden px-4 py-6 sm:px-6 lg:px-8">
        {/* bords fondus */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-white to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-white to-transparent" />

        {/* piste animée : 2 rangées identiques collées -> boucle parfaite */}
        <div className="flex w-max animate-marquee items-center" style={{ ["--speed"]: `${speed}s` }}>
          {/* première copie */}
          <div className="flex items-center gap-12">
            {row.map((logo, i) => (
              <Logo key={`a-${logo.alt}-${i}`} {...logo} priority={i < 6} />
            ))}
          </div>
          {/* seconde copie (identique) */}
          <div className="flex items-center gap-12" aria-hidden="true">
            {row.map((logo, i) => (
              <Logo key={`b-${logo.alt}-${i}`} {...logo} />
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .animate-marquee {
          animation: marquee var(--speed) linear infinite;
        }
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </section>
  );
}

function Logo({ src, alt, w = 160, h = 60, priority = false }) {
  return (
    <div className="shrink-0 opacity-80 transition hover:opacity-100" title={alt} aria-label={alt}>
      <Image
        src={src}
        alt={alt}
        width={w}
        height={h}
        className="h-7 w-auto object-contain sm:h-9"
        priority={priority}
      />
    </div>
  );
}

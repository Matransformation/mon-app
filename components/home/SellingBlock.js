// components/home/SellingBlock.js
import Image from "next/image";
import { ShoppingBag, MessageSquare, TrendingUp } from "lucide-react";

export default function SellingBlock({
  desktopImageSrc = "/images/hero-desktop.jpg",
  mobileImageSrc = "/images/hero-mobile.jpg",
  title = (
    <>
      Mangez tout ce que vous voulez{" "}
      <span className="underline decoration-8 decoration-[#fb8905] underline-offset-4">
        et perdez du poids
      </span>
    </>
  ),
  bullets = [
    "Faites-vous plaisir avec des recettes saines et gourmandes",
    "Des recettes facile à réaliser sans passer 1 heure en cuisine",
    "Des résultats visibles en seulement 30 jours",
  ],
  ctaLabel = "Je commence maintenant",
  onCtaClick,
}) {
  return (
    <section className="bg-[#F7EBDD]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        <div className="grid md:grid-cols-2 gap-10 md:gap-12 items-center">
          {/* Image (à gauche sur desktop, en bas sur mobile) */}
          <div className="order-2 md:order-1">
            {/* Desktop */}
            <div className="relative hidden md:block -rotate-2 rounded-3xl overflow-hidden shadow-2xl ring-1 ring-black/10">
              {/* ratio 4/3 */}
              <div className="w-full" style={{ aspectRatio: "4 / 3" }}>
                <Image
                  src={desktopImageSrc}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 640px, 100vw"
                  className="object-cover"
                  priority
                />
              </div>
            </div>
            {/* Mobile */}
            <div className="relative md:hidden -rotate-2 rounded-2xl overflow-hidden shadow-xl ring-1 ring-black/10 mt-4">
              <div className="w-full" style={{ aspectRatio: "4 / 3" }}>
                <Image
                  src={mobileImageSrc || desktopImageSrc}
                  alt=""
                  fill
                  sizes="100vw"
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </div>

          {/* Texte + bénéfices + CTA */}
          <div className="order-1 md:order-2">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[#201A16]">
              {title}
            </h2>

            <ul className="mt-6 space-y-5 text-lg text-[#3C342E]">
              <li className="flex items-start gap-3">
                <span className="mt-1 shrink-0">
                  <ShoppingBag className="h-6 w-6" />
                </span>
                <span>{bullets[0]}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 shrink-0">
                  <MessageSquare className="h-6 w-6" />
                </span>
                <span>{bullets[1]}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 shrink-0">
                  <TrendingUp className="h-6 w-6" />
                </span>
                <span>{bullets[2]}</span>
              </li>
            </ul>

            <button
              onClick={onCtaClick}
              className="mt-7 inline-flex items-center justify-center rounded-full px-6 py-3 text-base font-semibold text-white bg-[#1D1A18] hover:bg-black transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
            >
              {ctaLabel}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

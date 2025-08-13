// components/home/Hero.js
import Link from "next/link";
import Image from "next/image";

export default function Hero({
  desktopSrc,
  mobileSrc,
  href,
  alt = "MaTransformation",
  desktopRatio = 2000 / 736,  // 2.717...
  mobileRatio = 1080 / 1350,  // 0.8
  priority = true,
}) {
  const Wrapper = href ? Link : "div";
  const wrapperProps = href ? { href, "aria-label": alt } : {};

  if (!desktopSrc && !mobileSrc) return null;

  return (
    <section className="w-full bg-white">
      <Wrapper {...wrapperProps} className="block">
        {/* L'outline transparent supprime l'artefact sans impacter la mise en page */}
        <div
          className="relative w-full overflow-hidden"
          style={{ outline: "1px solid transparent" }}
        >
          {/* Desktop */}
          {desktopSrc && (
            <div
              className="relative hidden md:block"
              style={{ aspectRatio: `${desktopRatio}` }}
            >
              <Image
                src={desktopSrc}
                alt={alt}
                fill
                sizes="(min-width: 768px) 100vw"
                className="object-cover block select-none"
                priority={priority}
              />
            </div>
          )}

          {/* Mobile */}
          {mobileSrc && (
            <div
              className="relative md:hidden"
              style={{ aspectRatio: `${mobileRatio}` }}
            >
              <Image
                src={mobileSrc}
                alt={alt}
                fill
                sizes="100vw"
                className="object-cover block select-none"
                priority={priority}
              />
            </div>
          )}
        </div>
      </Wrapper>

      <style jsx>{`
        /* Sécurité : pas de bordure/ombre sur les images qui pourraient réapparaître */
        section :global(img) {
          border: 0;
          outline: 0;
        }
      `}</style>
    </section>
  );
}

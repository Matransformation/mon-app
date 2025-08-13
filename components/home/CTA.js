import Link from "next/link";

export default function CTA({ title, subtitle, ctaHref = "/register", ctaText = "Essayer 7 jours gratuitement" }) {
  return (
    <section className="relative isolate">
      {/* Fond en dégradé doux */}
      <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-orange-50 via-white to-orange-50" />
      <div className="relative mx-auto max-w-5xl px-6 py-16 text-center">
        <h3 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">{title}</h3>
        {subtitle && <p className="mt-3 text-gray-600">{subtitle}</p>}
        <div className="mt-6">
          <Link
            href={ctaHref}
            className="inline-flex items-center justify-center rounded-full bg-[#fb8905] px-6 py-3 font-semibold text-white transition hover:brightness-95"
          >
            {ctaText}
          </Link>
        </div>
      </div>
    </section>
  );
}

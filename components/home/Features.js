export default function Features({
    items = [],
    usersCount,
    testimonials,
    rating = 4.9,
  }) {
    const formatCount = (n) =>
      !n || typeof n !== "number"
        ? "787"
        : n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  
    const quotes =
      testimonials?.length
        ? testimonials
        : [
            { name: "Mélissa, maman active", text: "« Les menus me sauvent les soirs de semaine : rapide, bon, sans prise de tête. »" },
            { name: "Julien, 32 ans", text: "« Je mange mieux et je garde de l’énergie pour le sport. »" },
            { name: "Sophie, 54 ans", text: "« Enfin des recettes simples qui me conviennent et que je refais. »" },
            { name: "Amine, 27 ans", text: "« La liste de courses automatique m’a fait gagner du temps et du budget. »" },
            { name: "Clara, 31 ans", text: "« Je me sens plus légère et surtout mieux organisée dans mes repas. »" },
            { name: "Lucie, 40 ans", text: "« Le suivi me motive à tenir mes nouvelles habitudes sans stress. »" },
          ];
  
    const features = Array.isArray(items) ? items : [];
  
    return (
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          {/* --- Intro alignée + trait orangé derrière le nombre --- */}
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
              <span className="align-baseline">+ de </span>
  
              {/* Nombre avec trait orangé centré et incliné */}
              <span className="relative inline-block align-baseline">
                <span
                  aria-hidden="true"
                  className="absolute left-[-0.1em] right-[-0.1em] top-1/2 h-[0.55em] -translate-y-1/2 -skew-x-6 rounded-sm bg-[#fb8905]"
                />
                <span className="relative z-10">{formatCount(usersCount)}</span>
              </span>
  
              <span className="align-baseline"> personnes </span>
              <span className="align-baseline text-[#fb8905]">l'utilisent ❤️</span>
            </h2>
  
            <div className="mt-4 flex items-center justify-center gap-3 text-sm sm:text-base">
              <span className="font-semibold">Excellent</span>
              <span>{rating.toFixed(1)}/5</span>
              {/* 5 cases étoilées (aucune marque) */}
              <span className="inline-flex items-center gap-1">
                {[0, 1, 2, 3, 4].map((i) => (
                  <span
                    key={i}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-sm bg-emerald-500"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4 text-white" fill="currentColor">
                      <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27z" />
                    </svg>
                  </span>
                ))}
              </span>
            </div>
          </div>
  
          {/* --- Avis texte --- */}
          <div className="mb-12">
            <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {quotes.map((q, i) => (
                <li key={`${q.name}-${i}`} className="rounded-2xl border border-gray-200 p-6 shadow-sm">
                  <p className="text-gray-900">{q.text}</p>
                  <p className="mt-3 text-sm font-medium text-gray-600">— {q.name}</p>
                </li>
              ))}
            </ul>
          </div>
  
          {/* --- Grille de fonctionnalités (fond type SellingBlock) --- */}
        <div className="relative overflow-hidden rounded-3xl bg-orange-50 ring-1 ring-black/5">
          {/* petites touches décoratives douces (comme SellingBlock) */}
          <div className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-orange-100 opacity-50 blur-2xl" />
          <div className="pointer-events-none absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-orange-100 opacity-50 blur-2xl" />

          <div className="px-6 py-12 sm:px-10 md:px-12">
            <h3 className="text-center text-2xl font-bold sm:text-3xl">
              Pourquoi ça marche
            </h3>

            <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
              {features.map((f, i) => (
                <div
                  key={`${f.title}-${i}`}
                  className="rounded-2xl border border-orange-100 bg-white p-6 shadow-sm"
                >
                  {f.img ? (
                    <img
                      src={f.img}
                      alt={f.title || "Illustration"}
                      className="mb-4 h-28 w-full object-contain"
                      loading="lazy"
                    />
                  ) : null}
                  <h4 className="text-lg font-semibold">{f.title}</h4>
                  <p className="mt-2 text-gray-600">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
// pages/coaching-sport.js
import Head from "next/head";
import Script from "next/script";
import Image from "next/image";
import Navbar from "../components/Navbar";

const CALENDLY_URL = "https://calendly.com/contact-romain-fitness/premier-rendez-vous";

export default function CoachingSport() {
  return (
    <>
      <Head>
        <title>Coaching Sportif à Distance – Bilan initial & Programme personnalisé</title>
        <meta
          name="description"
          content="Un programme sportif simple et efficace, 100% adapté à tes objectifs. Bilan initial en visio et plan sur 4 semaines. Réserve ton bilan maintenant."
        />
        <meta property="og:title" content="Ton programme sportif personnalisé à la maison (ou en salle)" />
        <meta
          property="og:description"
          content="Un plan simple et adapté à tes objectifs, depuis chez toi, sans matériel compliqué."
        />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/coaching-sport" />
      </Head>

      <Navbar />

      <main className="bg-white">
        {/* Hero */}
        <section className="mx-auto max-w-7xl px-4 pt-10 sm:pt-14">
          <div className="grid items-center gap-8 md:grid-cols-2">
            <div className="order-2 md:order-1">
              <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                Ton programme sportif personnalisé à la maison (ou en salle)
              </h1>
              <p className="mt-3 text-lg text-gray-700">
                Un plan simple et adapté à tes objectifs, depuis chez toi, sans matériel compliqué.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href="#reserver"
                  className="inline-flex items-center justify-center rounded-full bg-[#fb8905] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#e07c04]"
                >
                  👉 Réserve ton bilan sportif maintenant
                </a>
                <a
                  href={CALENDLY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50"
                  title="Ouvrir Calendly dans un nouvel onglet"
                >
                  Ou ouvrir Calendly dans un onglet
                </a>
              </div>
            </div>

            <div className="order-1 md:order-2">
              {/* Remplace /images/romain-coach.jpg par ton vrai portrait dans /public/images */}
              <div className="overflow-hidden rounded-2xl border border-orange-100 shadow-sm">
                <Image
                  src="https://res.cloudinary.com/diccvjf98/image/upload/v1757017398/IMG_3199_u9qpbm.jpg"
                  alt="Romain, coach sportif à distance"
                  width={900}
                  height={900}
                  className="h-auto w-full object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        {/* Présentation du coach */}
        <section className="mx-auto mt-14 max-w-7xl px-4">
          <div className="rounded-2xl border border-orange-100 bg-[#FFFBF7] p-6 shadow-sm sm:p-8">
            <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
              <div className="h-20 w-20 overflow-hidden rounded-full border border-orange-100 shadow-sm sm:h-24 sm:w-24">
                {/* Remplace /images/romain-avatar.jpg par ton avatar */}
                <Image
                  src="https://res.cloudinary.com/diccvjf98/image/upload/v1757017398/IMG_3202_rq7t1b.jpg"
                  alt="Romain – Coach"
                  width={96}
                  height={96}
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-gray-900">
                  Je suis Romain, ton coach sportif à distance
                </h2>
                <p className="mt-2 max-w-3xl text-gray-700">
                  Spécialiste de la remise en forme pour les femmes 35+, j’aide à retrouver énergie, confiance et silhouette
                  grâce à des entraînements simples, réalisables à la maison ou en salle.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Offre */}
        <section className="mx-auto mt-12 max-w-7xl px-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
            <h3 className="text-xl font-extrabold text-gray-900">Comment ça marche ?</h3>

            <div className="mt-4 grid gap-6 md:grid-cols-2">
              {/* Bilan initial */}
              <div className="rounded-2xl border border-orange-100 bg-[#FFFBF7] p-6">
                <div className="flex items-baseline justify-between">
                  <h4 className="text-lg font-bold text-gray-900">Bilan initial</h4>
                  <span className="text-2xl font-extrabold text-gray-900">60 €</span>
                </div>

                <ul className="mt-4 space-y-2 text-gray-800">
                  <li>• 45 min en visio</li>
                  <li>• Bilan complet (niveau, objectifs, contraintes)</li>
                  <li>• Programme sportif personnalisé pour 4 semaines</li>
                </ul>

                <div className="mt-6">
                  <a
                    href="#reserver"
                    className="inline-flex w-full items-center justify-center rounded-full bg-[#fb8905] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#e07c04]"
                  >
                    👉 Réserver mon bilan sportif
                  </a>
                </div>
              </div>

              {/* Suivi */}
              <div className="rounded-2xl border border-gray-200 bg-white p-6">
                <div className="flex items-baseline justify-between">
                  <h4 className="text-lg font-bold text-gray-900">Suivi</h4>
                  <span className="text-2xl font-extrabold text-gray-900">35 €</span>
                </div>

                <ul className="mt-4 space-y-2 text-gray-800">
                  <li>• 20 minutes en visio</li>
                  <li>• Point d’avancement & ajustements du programme</li>
                  <li>• Questions/réponses, motivation et corrections</li>
                </ul>

                <div className="mt-6">
                  <a
                    href="#reserver"
                    className="inline-flex w-full items-center justify-center rounded-full border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-900 transition hover:bg-gray-50"
                  >
                    👉 Réserver un suivi 20 min
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Témoignages (3 simulés) */}
        <section className="mx-auto mt-12 max-w-7xl px-4">
          <h3 className="text-xl font-extrabold text-gray-900">Elles m’ont fait confiance</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                name: "Sophie, 42 ans",
                text:
                  "En 6 semaines, j’ai repris le sport sans me blesser. Les séances sont simples et efficaces, parfaites entre le travail et les enfants.",
              },
              {
                name: "Nadia, 38 ans",
                text:
                  "J’avais peur de débuter… Romain m’a mise en confiance. J’ai plus d’énergie et je me sens enfin régulière dans mes entraînements.",
              },
              {
                name: "Camille, 47 ans",
                text:
                  "Programmes clairs, adaptés à mon niveau et à mon emploi du temps. Je recommande à 100% pour reprendre en douceur et progresser.",
              },
            ].map((t, i) => (
              <div
                key={i}
                className="rounded-2xl border border-gray-200 p-6 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-orange-100 font-bold text-gray-900">
                    {t.name.slice(0,1)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                    <p className="text-xs text-gray-500">★★★★★</p>
                  </div>
                </div>
                <p className="mt-3 text-gray-700">{t.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="mx-auto mt-12 max-w-7xl px-4">
          <h3 className="text-xl font-extrabold text-gray-900">FAQ</h3>
          <div className="mt-4 divide-y divide-gray-200 rounded-2xl border border-gray-200">
            <div className="p-5">
              <p className="font-semibold text-gray-900">Où se déroule la séance ?</p>
              <p className="mt-1 text-gray-700">En visio (Zoom/Google Meet).</p>
            </div>
            <div className="p-5">
              <p className="font-semibold text-gray-900">Ai-je besoin de matériel ?</p>
              <p className="mt-1 text-gray-700">Non, tout est faisable sans matériel.</p>
            </div>
            <div className="p-5">
              <p className="font-semibold text-gray-900">Et si je débute complètement ?</p>
              <p className="mt-1 text-gray-700">Le programme sera adapté à ton niveau.</p>
            </div>
          </div>
        </section>

        {/* CTA final */}
        <section className="mx-auto mt-12 max-w-7xl px-4">
          <div className="rounded-2xl border border-orange-100 bg-[#FFFBF7] p-6 text-center shadow-sm sm:p-8">
            <p className="text-lg font-semibold text-gray-900">
              Prête à démarrer ta remise en forme ? Ton premier pas commence ici 👇
            </p>
            <div className="mt-4">
              <a
                href="#reserver"
                className="inline-flex items-center justify-center rounded-full bg-[#fb8905] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#e07c04]"
              >
                👉 Réserver mon bilan sportif
              </a>
            </div>
          </div>
        </section>

        {/* Section réservation (Calendly inline) */}
        <section id="reserver" className="mx-auto mt-12 max-w-5xl px-4 pb-16">
          <h3 className="mb-4 text-center text-xl font-extrabold text-gray-900">
            Réserve ton créneau en quelques secondes
          </h3>

          {/* Widget inline Calendly */}
          <div
            className="calendly-inline-widget rounded-2xl border border-gray-200 shadow-sm"
            data-url={CALENDLY_URL}
            style={{ minWidth: "320px", height: "740px" }}
          />
          <Script src="https://assets.calendly.com/assets/external/widget.js" strategy="lazyOnload" />
        </section>
      </main>

      <footer className="border-t border-gray-100 py-8 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Romain – Coaching sportif à distance
      </footer>
    </>
  );
}

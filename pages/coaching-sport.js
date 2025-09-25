// pages/coaching-sport.js
import Head from "next/head";
import Script from "next/script";
import Image from "next/image";
import Navbar from "../components/Navbar";

const PROGRAM_NAME = "Méthode Vitalité 35+";
const CALENDLY_URL =
  "https://calendly.com/contact-romain-fitness/premier-rendez-vous?hide_gdpr_banner=1&utm_source=site&utm_medium=coaching_sport";

export default function CoachingSport() {
  return (
    <>
      <Head>
        <title>{PROGRAM_NAME} — Bilan découverte offert (15 min)</title>
        <meta
          name="description"
          content="Bilan découverte gratuit (15 min) pour clarifier tes objectifs et ton niveau. Je te montre par où commencer et comment progresser simplement, à la maison ou en salle."
        />
        <meta property="og:title" content={`${PROGRAM_NAME} — Bilan 15 min offert`} />
        <meta
          property="og:description"
          content="Un premier échange gratuit pour clarifier tes objectifs et te proposer la meilleure stratégie d'entraînement, sans matériel compliqué."
        />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/coaching-sport" />
      </Head>

      <Navbar />

      <main className="bg-white">
        {/* HERO */}
        <section className="mx-auto max-w-7xl px-4 pt-10 sm:pt-14">
          <div className="grid items-center gap-10 md:grid-cols-2">
            <div className="order-2 md:order-1">
              <span className="inline-flex items-center rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-[#fb8905]">
                {PROGRAM_NAME}
              </span>
              <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                Bilan Sportif Offert — 15 min en visio
              </h1>
              <p className="mt-3 text-lg text-gray-700">
                Fais le point gratuitement sur tes objectifs, ton niveau et tes contraintes. À la fin de l’appel, tu sauras
                par où commencer et je te dirai comment je peux t’aider à progresser.
              </p>
              <ul className="mt-4 space-y-2 text-gray-800">
                <li>• Adapté aux femmes 35+ (débutantes bienvenues)</li>
                <li>• Maison 🏠 ou salle 🏋️‍♀️ selon tes préférences</li>
                <li>• Sans matériel compliqué, variantes facile/avancé</li>
              </ul>
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href="#reserver"
                  className="inline-flex items-center justify-center rounded-full bg-[#fb8905] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#e07c04]"
                >
                  👉 Réserver mon bilan offert
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

        {/* PRÉSENTATION COACH */}
        <section className="mx-auto mt-14 max-w-7xl px-4">
          <div className="rounded-2xl border border-orange-100 bg-[#FFFBF7] p-6 shadow-sm sm:p-8">
            <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
              <div className="h-20 w-20 overflow-hidden rounded-full border border-orange-100 shadow-sm sm:h-24 sm:w-24">
                <Image
                  src="https://res.cloudinary.com/diccvjf98/image/upload/v1757017398/IMG_3202_rq7t1b.jpg"
                  alt="Romain – Coach"
                  width={96}
                  height={96}
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-gray-900">Je suis Romain, ton coach sportif à distance</h2>
                <p className="mt-2 max-w-3xl text-gray-700">
                  J’accompagne les femmes de 35+ ans à retrouver énergie, confiance et silhouette grâce à des entraînements
                  simples, réalisables à la maison ou en salle, avec toujours une variante facile et une avancée.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* COMMENT ÇA MARCHE */}
        <section className="mx-auto mt-12 max-w-7xl px-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
            <h3 className="text-xl font-extrabold text-gray-900">Comment ça marche ?</h3>
            <div className="mt-6 grid gap-6 md:grid-cols-3">
              <div className="rounded-2xl border border-gray-200 p-5">
                <p className="text-sm font-semibold text-gray-900">Étape 1 — Bilan découverte (15 min, gratuit)</p>
                <p className="mt-2 text-gray-700">
                  On clarifie ton objectif, ton niveau et tes contraintes. Tu repars déjà avec 1–2 actions concrètes.
                </p>
              </div>
              <div className="rounded-2xl border border-gray-200 p-5">
                <p className="text-sm font-semibold text-gray-900">Étape 2 — Ta stratégie</p>
                <p className="mt-2 text-gray-700">
                  Je te présente la meilleure approche (maison ou salle, fréquence, variantes) pour atteindre ton objectif.
                </p>
              </div>
              <div className="rounded-2xl border border-gray-200 p-5">
                <p className="text-sm font-semibold text-gray-900">Étape 3 — Si tu le souhaites</p>
                <p className="mt-2 text-gray-700">
                  Je te propose un accompagnement complet (bilan + programme + suivis). Tu décides ensuite, sans pression.
                </p>
              </div>
            </div>
            <div className="mt-6">
              <a
                href="#reserver"
                className="inline-flex items-center justify-center rounded-full bg-[#fb8905] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#e07c04]"
              >
                👉 Réserver mon bilan offert
              </a>
            </div>
          </div>
        </section>

        {/* TÉMOIGNAGES */}
        <section className="mx-auto mt-12 max-w-7xl px-4">
          <h3 className="text-xl font-extrabold text-gray-900">Elles m’ont fait confiance</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { name: "Sophie, 42 ans", text: "En 4 semaines, j’ai repris le sport sans me blesser. Les séances sont simples et efficaces entre travail et enfants." },
              { name: "Karine, 38 ans", text: "Zéro salle, zéro matériel. 3 séances à la maison et déjà + d’énergie au quotidien. J’ai perdu 2 kg sans m’arracher." },
              { name: "Hélène, 53 ans", text: "Je pensais que c’était trop tard. Variantes faciles, progrès visibles, moins de douleurs au dos en 6 semaines." },
              { name: "Julie, 36 ans", text: "Le format visio m’a mise en confiance. Programme clair semaine par semaine. Je sais quoi faire et je m’y tiens." },
              { name: "Nadia, 47 ans", text: "Rythme réaliste, adapté à mon emploi du temps. Les options débutant/avancé m’ont permis de progresser sans me cramer." },
              { name: "Agnès, 58 ans", text: "J’avais peur de démarrer. Romain m’a rassurée et guidée. Je me sens plus légère, et surtout fière d’être régulière." },
            ].map((t, i) => (
              <div key={i} className="rounded-2xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-orange-100 font-bold text-gray-900">
                    {t.name.slice(0, 1)}
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
              <p className="font-semibold text-gray-900">Est-ce vraiment gratuit ?</p>
              <p className="mt-1 text-gray-700">
                Oui. Le bilan découverte dure 15 minutes, sans engagement. À la fin, je te présente les options si tu veux continuer.
              </p>
            </div>
            <div className="p-5">
              <p className="font-semibold text-gray-900">Où se déroule la séance ?</p>
              <p className="mt-1 text-gray-700">En visio (Zoom/Google Meet).</p>
            </div>
            <div className="p-5">
              <p className="font-semibold text-gray-900">Ai-je besoin de matériel ?</p>
              <p className="mt-1 text-gray-700">Non, tout est faisable sans matériel, avec variantes faciles et avancées.</p>
            </div>
            <div className="p-5">
              <p className="font-semibold text-gray-900">Et si je débute complètement ?</p>
              <p className="mt-1 text-gray-700">Bienvenue ! Tout est adapté à ton niveau et à ton rythme.</p>
            </div>
          </div>
        </section>

        {/* CTA FINAL */}
        <section className="mx-auto mt-12 max-w-7xl px-4">
          <div className="rounded-2xl border border-orange-100 bg-[#FFFBF7] p-6 text-center shadow-sm sm:p-8">
            <p className="text-lg font-semibold text-gray-900">
              Prête à faire le premier pas ? Réserve ton bilan offert 👇
            </p>
            <div className="mt-4">
              <a
                href="#reserver"
                className="inline-flex items-center justify-center rounded-full bg-[#fb8905] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#e07c04]"
              >
                👉 Réserver mon bilan offert (15 min)
              </a>
            </div>
          </div>
        </section>

        {/* WIDGET CALENDLY INLINE */}
        <section id="reserver" className="mx-auto mt-12 max-w-5xl px-4 pb-16">
          <h3 className="mb-4 text-center text-xl font-extrabold text-gray-900">
            Réserve ton créneau en quelques secondes
          </h3>

          <div
            className="calendly-inline-widget rounded-2xl border border-gray-200 shadow-sm"
            data-url={CALENDLY_URL}
            style={{ minWidth: "320px", height: "700px" }}
          />
          <Script src="https://assets.calendly.com/assets/external/widget.js" strategy="lazyOnload" />
        </section>
      </main>

      <footer className="border-t border-gray-100 py-8 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Romain — {PROGRAM_NAME}
      </footer>
    </>
  );
}

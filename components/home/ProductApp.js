// components/home/ProductApp.js
import Image from "next/image";
import Link from "next/link";

export default function ProductApp({ imageLeft, imageRight }) {
  return (
    <section className="py-16">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 grid md:grid-cols-2 gap-10 items-center">
        <div className="relative">
          <div className="aspect-[4/3] bg-white rounded-3xl shadow-sm ring-1 ring-gray-100 overflow-hidden">
            <Image
              src={imageLeft || "/images/placeholder.png"}
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, 500px"
              className="object-contain"
            />
          </div>
        </div>
        <div>
          <h2 className="text-3xl font-bold">Un programme + des recettes</h2>
          <p className="text-gray-700 mt-3">
            Des menus variés, une liste de courses prête en 1 clic, et un suivi qui s’ajuste automatiquement à ton évolution.
          </p>
          <ul className="mt-4 space-y-2 text-gray-700">
            <li>• Quantités adaptées à tes besoins</li>
            <li>• Recettes gourmandes, rapides et équilibrées</li>
            <li>• Suivi simple, sans comptage ni pesée</li>
          </ul>
          <Link
            href="/register"
            className="inline-flex mt-6 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-full transition"
          >
            Essayer 7 jours gratuitement
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 sm:px-8 mt-10">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div className="order-2 md:order-1">
            <h3 className="text-2xl font-bold">Sans charge mentale</h3>
            <p className="text-gray-700 mt-3">
              On te guide sur le quoi et le combien. Toi, tu profites juste de tes repas.
            </p>
          </div>
          <div className="order-1 md:order-2">
            <div className="aspect-[4/3] bg-white rounded-3xl shadow-sm ring-1 ring-gray-100 overflow-hidden">
              <Image
                src={imageRight || "/images/placeholder.png"}
                alt=""
                fill
                sizes="(max-width: 768px) 100vw, 500px"
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
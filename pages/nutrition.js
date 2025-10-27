import Image from "next/image";
import Link from "next/link";
import Navbar from "../components/Navbar";
import { Utensils, List, Heart, BookOpen } from "lucide-react";

export default function Nutrition() {
  const sections = [
    {
      href: "/menu",
      title: "Menus",
      desc: "Consultez vos menus personnalisés et vos repas équilibrés.",
      icon: <Utensils className="h-6 w-6 text-orange-500" />,
      img: "https://res.cloudinary.com/diccvjf98/image/upload/v1761576282/3_bgawwn.jpg",
    },
    {
      href: "/liste-courses",
      title: "Liste de courses",
      desc: "Générez automatiquement votre liste à partir de vos menus.",
      icon: <List className="h-6 w-6 text-orange-500" />,
      img: "https://res.cloudinary.com/diccvjf98/image/upload/v1761576282/2_jygovm.jpg",
    },
    {
      href: "/mes-favoris",
      title: "Mes favoris",
      desc: "Retrouvez vos recettes et menus préférés en un clic.",
      icon: <Heart className="h-6 w-6 text-orange-500" />,
      img: "https://res.cloudinary.com/diccvjf98/image/upload/v1761576281/4_ql9dz7.jpg",
    },
    {
      href: "/recettes",
      title: "Recettes",
      desc: "Découvrez toutes nos recettes saines et gourmandes.",
      icon: <BookOpen className="h-6 w-6 text-orange-500" />,
      img: "https://res.cloudinary.com/diccvjf98/image/upload/v1761576282/1_nostge.jpg",
    },
  ];

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gradient-to-b from-orange-50/50 via-white to-white pt-6 pb-28 px-6">
        {/* Header visuel */}
        <div className="max-w-4xl mx-auto text-center mb-10 bg-gradient-to-r from-orange-100 to-orange-50 rounded-3xl p-8 shadow-sm">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-orange-600 mb-2 flex justify-center items-center gap-2">
            Espace Nutrition 🥕
          </h1>
          <p className="text-gray-700 max-w-2xl mx-auto">
            Retrouvez ici tous vos outils pour bien manger, planifier vos repas et
            découvrir de nouvelles idées gourmandes adaptées à vos objectifs.
          </p>
        </div>

        {/* Cartes */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
          {sections.map(({ href, title, desc, icon, img }) => (
            <Link
              key={href}
              href={href}
              className="group rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-all hover:-translate-y-1"
            >
              <div className="relative h-40 w-full overflow-hidden">
                <Image
                  src={img}
                  alt={title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  priority={false}
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition"></div>
              </div>

              <div className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  {icon}
                  <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
                </div>
                <p className="text-gray-600 text-sm">{desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}

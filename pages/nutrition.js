import Navbar from "../components/Navbar";
import Link from "next/link";
import { Utensils, List, Heart, BookOpen } from "lucide-react";

export default function Nutrition() {
  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gray-50 pt-6 pb-28 px-6">
        {/* En-tête */}
        <div className="max-w-4xl mx-auto mb-10">
          <h1 className="text-3xl font-bold text-orange-600 mb-2 flex items-center gap-2">
            Espace Nutrition <span className="text-2xl">🥕</span>
          </h1>
          <p className="text-gray-600 max-w-2xl">
            Retrouvez ici tous vos outils pour bien manger, planifier vos repas
            et découvrir de nouvelles idées recettes adaptées à vos objectifs.
          </p>
        </div>

        {/* Cartes de navigation */}
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-5">
          <Link href="/menu" className="nutrition-card">
            <Utensils className="h-8 w-8 text-orange-500" />
            <div>
              <h3 className="font-semibold text-lg text-gray-800">Menus</h3>
              <p className="text-gray-500 text-sm">
                Consultez vos menus personnalisés et vos repas équilibrés.
              </p>
            </div>
          </Link>

          <Link href="/liste-courses" className="nutrition-card">
            <List className="h-8 w-8 text-orange-500" />
            <div>
              <h3 className="font-semibold text-lg text-gray-800">Liste de courses</h3>
              <p className="text-gray-500 text-sm">
                Générez automatiquement votre liste à partir de vos menus.
              </p>
            </div>
          </Link>

          <Link href="/mes-favoris" className="nutrition-card">
            <Heart className="h-8 w-8 text-orange-500" />
            <div>
              <h3 className="font-semibold text-lg text-gray-800">Mes favoris</h3>
              <p className="text-gray-500 text-sm">
                Retrouvez vos recettes et menus préférés en un clic.
              </p>
            </div>
          </Link>

          <Link href="/recettes" className="nutrition-card">
            <BookOpen className="h-8 w-8 text-orange-500" />
            <div>
              <h3 className="font-semibold text-lg text-gray-800">Recettes</h3>
              <p className="text-gray-500 text-sm">
                Découvrez toutes nos recettes saines et gourmandes.
              </p>
            </div>
          </Link>
        </div>
      </main>

      <style jsx>{`
        .nutrition-card {
          background: white;
          border-radius: 0.75rem;
          padding: 1rem 1.25rem;
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          transition: all 0.2s ease;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }
        .nutrition-card:hover {
          background: #fff7ed; /* léger fond orange clair */
          box-shadow: 0 4px 10px rgba(249, 115, 22, 0.15);
          transform: translateY(-2px);
        }
      `}</style>
    </>
  );
}

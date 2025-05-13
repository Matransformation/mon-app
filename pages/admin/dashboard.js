import Link from "next/link";

export default function Dashboard() {
  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Tableau de Bord Admin</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {/* Raccourci vers l'ajout de recette */}
        <div className="border p-4 rounded shadow-lg text-center bg-white hover:bg-gray-50">
          <Link href="/admin/ajouter-recette">
            <div className="text-xl font-semibold text-orange-600 hover:text-orange-800">
              ➕ Ajouter une Recette
            </div>
          </Link>
          <p className="mt-2 text-gray-600">Créez de nouvelles recettes en quelques clics.</p>
        </div>

        {/* Raccourci vers la gestion des recettes */}
        <div className="border p-4 rounded shadow-lg text-center bg-white hover:bg-gray-50">
          <Link href="/admin/recettes">
            <div className="text-xl font-semibold text-green-600 hover:text-green-800">
              🥘 Gérer les Recettes
            </div>
          </Link>
          <p className="mt-2 text-gray-600">Ajoutez, modifiez ou supprimez des recettes.</p>
        </div>

        {/* Raccourci vers la gestion des ingrédients */}
        <div className="border p-4 rounded shadow-lg text-center bg-white hover:bg-gray-50">
          <Link href="/admin/ingredients">
            <div className="text-xl font-semibold text-blue-600 hover:text-blue-800">
              🍴 Gérer les Ingrédients
            </div>
          </Link>
          <p className="mt-2 text-gray-600">Créez, modifiez ou supprimez des ingrédients.</p>
        </div>

        {/* Raccourci vers la gestion des utilisateurs (si tu en as besoin) */}
        <div className="border p-4 rounded shadow-lg text-center bg-white hover:bg-gray-50">
          <Link href="/admin/utilisateurs">
            <div className="text-xl font-semibold text-purple-600 hover:text-purple-800">
              👤 Gérer les Utilisateurs
            </div>
          </Link>
          <p className="mt-2 text-gray-600">Consultez et gérez les utilisateurs de l'application.</p>
        </div>

        {/* Raccourci vers la gestion des catégories de recettes (si applicable) */}
        <div className="border p-4 rounded shadow-lg text-center bg-white hover:bg-gray-50">
          <Link href="/admin/categories">
            <div className="text-xl font-semibold text-yellow-600 hover:text-yellow-800">
              📚 Gérer les Catégories
            </div>
          </Link>
          <p className="mt-2 text-gray-600">Ajoutez, modifiez ou supprimez des catégories de recettes.</p>
        </div>

        {/* Raccourci vers les statistiques */}
        <div className="border p-4 rounded shadow-lg text-center bg-white hover:bg-gray-50">
          <Link href="/admin/statistiques">
            <div className="text-xl font-semibold text-teal-600 hover:text-teal-800">
              📊 Statistiques
            </div>
          </Link>
          <p className="mt-2 text-gray-600">Consultez les statistiques et les performances de l'application.</p>
        </div>
      </div>
    </div>
  );
}

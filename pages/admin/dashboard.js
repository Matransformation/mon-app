// pages/admin/dashboard.js
import withAuthProtection from "../../lib/withAuthProtection";
import Navbar from "../../components/Navbar";

function AdminDashboard() {
  return (
    <>
      <Navbar />
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6 text-center">Tableau de Bord Admin</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <div className="border p-4 rounded shadow-lg text-center bg-white hover:bg-gray-50">
            <a href="/admin/ajouter-recette">
              <div className="text-xl font-semibold text-orange-600 hover:text-orange-800">
                ➕ Ajouter une Recette
              </div>
            </a>
            <p className="mt-2 text-gray-600">Créez de nouvelles recettes en quelques clics.</p>
          </div>

          <div className="border p-4 rounded shadow-lg text-center bg-white hover:bg-gray-50">
            <a href="/admin/recettes">
              <div className="text-xl font-semibold text-green-600 hover:text-green-800">
                🥘 Gérer les Recettes
              </div>
            </a>
            <p className="mt-2 text-gray-600">Ajoutez, modifiez ou supprimez des recettes.</p>
          </div>

          <div className="border p-4 rounded shadow-lg text-center bg-white hover:bg-gray-50">
            <a href="/admin/ingredients">
              <div className="text-xl font-semibold text-blue-600 hover:text-blue-800">
                🍴 Gérer les Ingrédients
              </div>
            </a>
            <p className="mt-2 text-gray-600">Créez, modifiez ou supprimez des ingrédients.</p>
          </div>

          <div className="border p-4 rounded shadow-lg text-center bg-white hover:bg-gray-50">
            <a href="/admin/utilisateurs">
              <div className="text-xl font-semibold text-purple-600 hover:text-purple-800">
                👤 Gérer les Utilisateurs
              </div>
            </a>
            <p className="mt-2 text-gray-600">Consultez et gérez les utilisateurs de l'application.</p>
          </div>

          <div className="border p-4 rounded shadow-lg text-center bg-white hover:bg-gray-50">
            <a href="/admin/categories">
              <div className="text-xl font-semibold text-yellow-600 hover:text-yellow-800">
                📚 Gérer les Catégories
              </div>
            </a>
            <p className="mt-2 text-gray-600">Ajoutez, modifiez ou supprimez des catégories de recettes.</p>
          </div>

          <div className="border p-4 rounded shadow-lg text-center bg-white hover:bg-gray-50">
            <a href="/admin/statistiques">
              <div className="text-xl font-semibold text-teal-600 hover:text-teal-800">
                📊 Statistiques
              </div>
            </a>
            <p className="mt-2 text-gray-600">Consultez les statistiques et les performances de l'application.</p>
          </div>

          <div className="border p-4 rounded shadow-lg text-center bg-white hover:bg-gray-50">
            <a href="/admin/acces">
              <div className="text-xl font-semibold text-red-600 hover:text-red-800">
                🔐 Gérer les Accès
              </div>
            </a>
            <p className="mt-2 text-gray-600">Contrôlez les droits d'accès à chaque page.</p>
          </div>

          <div className="border p-4 rounded shadow-lg text-center bg-white hover:bg-gray-50">
            <a href="/admin/notifications">
              <div className="text-xl font-semibold text-pink-600 hover:text-pink-800">
                🔔 Gérer les Notifications
              </div>
            </a>
            <p className="mt-2 text-gray-600">Créez et gérez les notifications globales.</p>
          </div>
        </div>
      </div>
    </>
  );
}

export default withAuthProtection(AdminDashboard);

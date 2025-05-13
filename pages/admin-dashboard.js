import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { getSession } from "next-auth/react";  // Import de getSession

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const [recettes, setRecettes] = useState([]);
  const [confirmMessage, setConfirmMessage] = useState("");

  // Vérifie que l'utilisateur est un administrateur
  useEffect(() => {
    if (status === "loading") return;

    if (!session || session.user.role !== "admin") {
      // Si l'utilisateur n'est pas admin, redirige vers la page de connexion
      window.location.href = "/auth/signin";  // Redirection manuelle vers signin
    } else {
      fetchRecettes();
    }
  }, [session, status]);

  // Fonction pour récupérer les recettes
  const fetchRecettes = async () => {
    const res = await fetch("/api/recettes");
    const data = await res.json();
    setRecettes(data.recettes);
  };

  // Fonction pour ajouter une recette (exemple)
  const handleAddRecette = async (e) => {
    e.preventDefault();
    // Utilise un formulaire ici pour ajouter des recettes
    setConfirmMessage("✅ Recette ajoutée !");
  };

  // Fonction pour supprimer une recette
  const handleDeleteRecette = async (id) => {
    const res = await fetch(`/api/recettes/${id}`, { method: "DELETE" });
    if (res.ok) {
      setConfirmMessage("✅ Recette supprimée !");
      fetchRecettes();  // Recharger les recettes après suppression
    } else {
      setConfirmMessage("❌ Erreur lors de la suppression.");
    }
  };

  if (status === "loading") return <p>Chargement…</p>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Navbar />
      <h1 className="text-2xl font-bold mb-4">Espace Administrateur</h1>

      {/* Ajouter des recettes */}
      <form onSubmit={handleAddRecette} className="bg-white shadow p-4 rounded mb-6">
        <h2 className="font-semibold mb-2">Ajouter une recette</h2>
        <input type="text" placeholder="Nom de la recette" className="border p-2 rounded" />
        <button className="bg-blue-600 text-white py-2 px-4 rounded">Ajouter</button>
      </form>

      {/* Confirmation du message */}
      {confirmMessage && <p className="text-green-600">{confirmMessage}</p>}

      {/* Liste des recettes */}
      <h2 className="font-semibold mb-2">Liste des recettes</h2>
      <table className="min-w-full border text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2 py-1">Nom</th>
            <th className="border px-2 py-1">Actions</th>
          </tr>
        </thead>
        <tbody>
          {recettes.map((recette) => (
            <tr key={recette.id}>
              <td className="border px-2 py-1">{recette.nom}</td>
              <td className="border px-2 py-1">
                <button
                  onClick={() => handleDeleteRecette(recette.id)}
                  className="bg-red-600 text-white px-4 py-1 rounded"
                >
                  Supprimer
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Fonction pour sécuriser l'accès à la page, uniquement les admins
export async function getServerSideProps(context) {
  const session = await getSession(context);  // Obtenir la session
  if (!session || session.user.role !== "admin") {
    return {
      redirect: { destination: "/auth/signin", permanent: false },
    };
  }
  return { props: {} };
}

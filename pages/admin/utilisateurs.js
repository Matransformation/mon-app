import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";

export default function Utilisateurs() {
  const [utilisateurs, setUtilisateurs] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchUtilisateurs = async () => {
      try {
        const res = await axios.get("/api/utilisateur"); // Modification ici pour pointer vers /api/utilisateur
        setUtilisateurs(res.data);
      } catch (error) {
        console.error("Erreur lors du chargement des utilisateurs :", error);
      }
    };

    fetchUtilisateurs();
  }, []);

  const handleDelete = async (id) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) {
      try {
        await axios.delete(`/api/utilisateur/${id}`);
        setUtilisateurs(utilisateurs.filter((user) => user.id !== id)); // Mise à jour de la liste après suppression
      } catch (error) {
        console.error("Erreur lors de la suppression de l'utilisateur :", error);
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Gestion des Utilisateurs</h1>

      <table className="min-w-full table-auto">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-4 py-2 text-left">Nom</th>
            <th className="px-4 py-2 text-left">Email</th>
            <th className="px-4 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {utilisateurs.map((utilisateur) => (
            <tr key={utilisateur.id} className="border-b">
              <td className="px-4 py-2">{utilisateur.name}</td>
              <td className="px-4 py-2">{utilisateur.email}</td>
              <td className="px-4 py-2">
                <button
                  onClick={() => router.push(`/admin/utilisateurs/${utilisateur.id}`)}
                  className="text-blue-600 hover:underline"
                >
                  Modifier
                </button>
                <button
                  onClick={() => handleDelete(utilisateur.id)}
                  className="text-red-600 hover:underline ml-4"
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

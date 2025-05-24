import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import withAuthProtection from "../../../lib/withAuthProtection";


function ModifierUtilisateur() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("user"); // Valeur par défaut "user"
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (id) {
      const fetchUser = async () => {
        try {
          const res = await axios.get(`/api/utilisateur/${id}`); // Utilisation de l'API pour récupérer l'utilisateur par ID
          setName(res.data.name); // Mise à jour du nom
          setEmail(res.data.email); // Mise à jour de l'email
          setRole(res.data.role || "user"); // Assurez-vous de récupérer et d'afficher le rôle actuel
        } catch (error) {
          console.error("Erreur lors de la récupération de l'utilisateur :", error);
        }
      };

      fetchUser();
    }
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/utilisateur/${id}`, { name, email, role }); // Ajout du rôle à la requête PUT
      router.push("/admin/utilisateurs"); // Redirige vers la page des utilisateurs
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'utilisateur :", error);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Modifier l'utilisateur</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label>Nom</label>
          <input
            className="border p-2 w-full rounded"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Email</label>
          <input
            type="email"
            className="border p-2 w-full rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Rôle</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="border p-2 w-full rounded"
          >
            <option value="user">Utilisateur</option>
            <option value="admin">Administrateur</option>
          </select>
        </div>

        <button type="submit" className="w-full bg-green-600 text-white p-3 rounded">
          Mettre à jour
        </button>
      </form>
    </div>
  );
}
export default withAuthProtection(ModifierUtilisateur);

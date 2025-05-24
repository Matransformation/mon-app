// pages/admin/utilisateurs.js
import { useEffect, useState } from "react";
import axios from "axios";
import withAuthProtection from "../../lib/withAuthProtection";

function AdminUtilisateurs() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ total: 0, abonnes: 0, essais: 0, parType: {} });
  const [selectedIds, setSelectedIds] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    axios.get("/api/admin/utilisateurs").then((res) => {
      setUsers(res.data.users);
      setStats(res.data.stats);
    });
  }, []);

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedIds.length === users.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(users.map((u) => u.id));
    }
  };

  const handleDeleteMany = async () => {
    if (!selectedIds.length) return;
    if (!confirm("Confirmer la suppression de plusieurs utilisateurs ?")) return;

    try {
      await axios.post("/api/admin/utilisateurs/delete-many", { ids: selectedIds });
      setUsers(users.filter((u) => !selectedIds.includes(u.id)));
      setSelectedIds([]);
    } catch (error) {
      console.error("Erreur suppression multiple:", error);
    }
  };

  const handleRoleChange = async (id, newRole) => {
    try {
      await axios.put(`/api/utilisateur/${id}`, { role: newRole });
      setUsers(users.map((u) => (u.id === id ? { ...u, role: newRole } : u)));
      setSuccessMessage("Rôle mis à jour ✔️");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Erreur mise à jour du rôle:", error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Utilisateurs inscrits</h1>

      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-800 rounded">
          {successMessage}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white shadow p-4 rounded">
          <p className="text-gray-500">Total inscrits</p>
          <p className="text-xl font-semibold">{stats.total}</p>
        </div>
        <div className="bg-white shadow p-4 rounded">
          <p className="text-gray-500">Abonnés actifs</p>
          <p className="text-xl font-semibold">{stats.abonnes}</p>
        </div>
        <div className="bg-white shadow p-4 rounded">
          <p className="text-gray-500">En période d’essai</p>
          <p className="text-xl font-semibold">{stats.essais}</p>
        </div>
        {Object.entries(stats.parType).map(([type, count]) => (
          <div key={type} className="bg-white shadow p-4 rounded">
            <p className="text-gray-500">{type}</p>
            <p className="text-xl font-semibold">{count}</p>
          </div>
        ))}
      </div>

      {selectedIds.length > 0 && (
        <div className="mb-4">
          <button
            onClick={handleDeleteMany}
            className="bg-red-600 text-white px-4 py-2 rounded shadow hover:bg-red-700"
          >
            Supprimer la sélection ({selectedIds.length})
          </button>
        </div>
      )}

      <table className="w-full table-auto border-collapse">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-2 border">
              <input
                type="checkbox"
                checked={selectedIds.length === users.length}
                onChange={toggleAll}
              />
            </th>
            <th className="p-2 border">Nom</th>
            <th className="p-2 border">Email</th>
            <th className="p-2 border">Rôle</th>
            <th className="p-2 border">Abonnement</th>
            <th className="p-2 border">Prochain prélèvement</th>
            <th className="p-2 border">Inscription</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-t">
              <td className="p-2 border">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(u.id)}
                  onChange={() => toggleSelect(u.id)}
                />
              </td>
              <td className="p-2 border">{u.name || u.nom || "-"}</td>
              <td className="p-2 border">{u.email}</td>
              <td className="p-2 border">
                <select
                  value={u.role || "user"}
                  onChange={(e) => handleRoleChange(u.id, e.target.value)}
                  className="border px-2 py-1 rounded"
                >
                  <option value="user">user</option>
                  <option value="admin">admin</option>
                </select>
              </td>
              <td className="p-2 border">{u.subscriptionType || u.stripePriceId || "-"}</td>
              <td className="p-2 border">
                {u.stripeCurrentPeriodEnd
                  ? new Date(u.stripeCurrentPeriodEnd).toLocaleDateString()
                  : "-"}
              </td>
              <td className="p-2 border">
                {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export default withAuthProtection(AdminUtilisateurs);

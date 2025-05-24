// pages/admin/statistiques.js
import { useEffect, useState } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import withAuthProtection from "../../lib/withAuthProtection";

function StatistiquesAdmin() {
  const [stats, setStats] = useState(null);
  const [periode, setPeriode] = useState("3mois");

  useEffect(() => {
    axios.get(`/api/admin/statistiques?periode=${periode}`).then((res) => setStats(res.data));
  }, [periode]);

  if (!stats) return <p className="p-6 text-center">Chargement des statistiques…</p>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Statistiques globales</h1>

      <div className="flex justify-end mb-4">
        <select
          value={periode}
          onChange={(e) => setPeriode(e.target.value)}
          className="border border-gray-300 px-3 py-1 rounded"
        >
          <option value="3mois">3 derniers mois</option>
          <option value="6mois">6 derniers mois</option>
          <option value="1an">12 derniers mois</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-4 rounded shadow">
          <p className="text-gray-500">Utilisateurs inscrits</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <p className="text-gray-500">Abonnés actifs</p>
          <p className="text-2xl font-bold">{stats.abonnes}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <p className="text-gray-500">Essais actifs</p>
          <p className="text-2xl font-bold">{stats.essais}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <p className="text-gray-500">Revenu estimé</p>
          <p className="text-2xl font-bold">{stats.revenuEstime.toFixed(2)} €</p>
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-2">Abonnements par mois</h2>
      <div className="bg-white p-4 rounded shadow mb-8">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={stats.abonnementsParMois}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mois" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <h2 className="text-xl font-semibold mb-2">Revenu estimé par mois</h2>
      <div className="bg-white p-4 rounded shadow">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={stats.revenusParMois}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mois" />
            <YAxis unit=" €" />
            <Tooltip formatter={(value) => `${value} €`} />
            <Bar dataKey="total" fill="#10b981" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
export default withAuthProtection(StatistiquesAdmin);

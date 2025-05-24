// pages/admin/acces.js
import { useEffect, useState } from "react";
import withAuthProtection from "../../lib/withAuthProtection";
import { accessRules } from "../../lib/accessRules";

function AdminAccessControl() {
  const [rules, setRules] = useState([]);

  useEffect(() => {
    const formatted = Object.entries(accessRules).map(([path, config]) => ({
      path,
      role: config.role || "-",
      plans: config.plans || [],
      allowTrial: config.allowTrial || false,
    }));
    setRules(formatted);
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Gestion des règles d’accès 🔐</h1>

      <table className="w-full table-auto border-collapse">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="border p-2">Page</th>
            <th className="border p-2">Rôle requis</th>
            <th className="border p-2">Abonnements acceptés</th>
            <th className="border p-2">Période d’essai</th>
          </tr>
        </thead>
        <tbody>
          {rules.map((rule) => (
            <tr key={rule.path}>
              <td className="border p-2 text-blue-600 font-medium">{rule.path}</td>
              <td className="border p-2">{rule.role}</td>
              <td className="border p-2">
                {rule.plans.length > 0
                  ? rule.plans.map((p) => <div key={p}>{p}</div>)
                  : "-"}
              </td>
              <td className="border p-2">{rule.allowTrial ? "✅" : "❌"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default withAuthProtection(AdminAccessControl);

// pages/dashboard.js
import { useSession, getSession } from "next-auth/react";
import dynamic from "next/dynamic";
import Navbar from "../components/Navbar";
import prisma from "../lib/prisma";
import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Pour gérer les droits d’accès (trial / abo / admin)
import { getAccessRights } from "../lib/access";

const Line = dynamic(() => import("react-chartjs-2").then((mod) => mod.Line), {
  ssr: false,
});

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function Dashboard() {
  const { data: session, status } = useSession();

  const [utilisateur, setUtilisateur] = useState(null);
  const [nouveauPoids, setNouveauPoids] = useState("");
  const [objectif, setObjectif] = useState("");
  const [confirmationMsg, setConfirmationMsg] = useState("");
  const [metabolismeForm, setMetabolismeForm] = useState({
    sexe: "",
    age: "",
    taille: "",
    activite: "",
  });
  const [mensurationsForm, setMensurationsForm] = useState({
    taille: "",
    hanches: "",
    cuisses: "",
    bras: "",
    poitrine: "",
    mollets: "",
    masseGrasse: "",
  });

  useEffect(() => {
    if (session?.user?.id) {
      fetchUtilisateur();
    }
  }, [session?.user?.id]);

  async function fetchUtilisateur() {
    const res = await fetch(`/api/dashboard?utilisateurId=${encodeURIComponent(session.user.id)}`);
    const { utilisateur } = await res.json();
    setUtilisateur(utilisateur);

    if (utilisateur) {
      setObjectif(utilisateur.objectifPoids || "");
      setMetabolismeForm({
        sexe: utilisateur.sexe || "",
        age: utilisateur.age || "",
        taille: utilisateur.taille || "",
        activite: utilisateur.activite || "",
      });
    }
  }

  async function handlePoids() {
    if (!nouveauPoids) return;
    await fetch("/api/utilisateur/poids", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ utilisateurId: session.user.id, poids: parseFloat(nouveauPoids) }),
    });
    setNouveauPoids("");
    fetchUtilisateur();
  }

  async function handleDeletePoids(id) {
    await fetch(`/api/utilisateur/poids/${id}`, { method: "DELETE" });
    fetchUtilisateur();
  }

  async function handleObjectif() {
    if (!objectif) return;
    await fetch("/api/utilisateur/objectif", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ utilisateurId: session.user.id, objectifPoids: parseFloat(objectif) }),
    });
    fetchUtilisateur();
  }

  async function handleMetabolisme(e) {
    e.preventDefault();
    if (!utilisateur?.poids) {
      alert("⚠️ Enregistre d'abord ton poids.");
      return;
    }
    await fetch("/api/utilisateur/metabolisme", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ utilisateurId: session.user.id, ...metabolismeForm }),
    });
    fetchUtilisateur();
  }

  async function handleMensurations(e) {
    e.preventDefault();
    await fetch("/api/utilisateur/mensurations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ utilisateurId: session.user.id, ...mensurationsForm }),
    });
    setConfirmationMsg("✅ Mensurations enregistrées !");
    fetchUtilisateur();
    setTimeout(() => setConfirmationMsg(""), 3000);
  }

  if (status === "loading") return <p>Chargement…</p>;
  if (!session) return <p>Non autorisé</p>;
  if (!utilisateur) return <p>Chargement du dashboard…</p>;

  const poidsActuel = utilisateur.poids || 0;
  const poidsInitial = utilisateur.historiquePoids?.[0]?.poids || 0;
  const poidsPerdu = (poidsInitial - poidsActuel).toFixed(1);
  const poidsRestant = objectif ? (poidsActuel - parseFloat(objectif)).toFixed(1) : null;

  const chartData = {
    labels: utilisateur.historiquePoids.map((i) =>
      new Date(i.date).toLocaleDateString("fr-FR")
    ),
    datasets: [
      {
        label: "Poids (kg)",
        data: utilisateur.historiquePoids.map((i) => i.poids),
        borderColor: "rgb(75,192,192)",
        backgroundColor: "rgba(75,192,192,0.2)",
        fill: true,
      },
    ],
  };

  const mensuHistos = (utilisateur.mensurations || []).sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );
  function getVariation(key, idx) {
    const next = mensuHistos[idx + 1];
    if (!next) return null;
    const diff = mensuHistos[idx][key] - next[key];
    return diff === 0 ? " (–)" : ` (${diff > 0 ? "+" : ""}${diff})`;
  }

  return (
<div className="w-full px-4 md:px-8 py-6">
<Navbar /> {/* ✅ ICI, le composant sera visible */}
      {/* Navbar de déconnexion */}
  

      <h1 className="text-3xl font-bold mb-2">Bienvenue, {utilisateur.nom || session.user.name} !</h1>
      <div className="text-gray-700 mb-6">
        <p>Âge : {utilisateur.age ?? "—"} ans</p>
        <p>Taille : {utilisateur.taille ?? "—"} cm</p>
        <p>Poids : {poidsActuel} kg</p>
      </div>

      {/* Objectif de poids */}
      <div className="bg-white shadow p-4 rounded mb-6">
        <h2 className="font-semibold text-lg mb-2">🎯 Objectif de poids</h2>
        <div className="flex gap-2 items-center mb-2">
          <input type="number" value={objectif} onChange={(e) => setObjectif(e.target.value)} className="border p-2 rounded w-24" />
          <button onClick={handleObjectif} className="bg-green-700 text-white px-4 py-2 rounded">Enregistrer</button>
        </div>
        {objectif && (
          <p className="text-sm text-gray-600">✅ Déjà perdu : <strong>{poidsPerdu} kg</strong> — Il reste : <strong>{poidsRestant} kg</strong>.</p>
        )}
      </div>

      {/* Formulaire métabolisme */}
      <div className="bg-white shadow p-4 rounded mb-6">
        <h2 className="text-lg font-semibold mb-2">Calcul de ton métabolisme</h2>
        {poidsActuel > 0 ? (
          <form onSubmit={handleMetabolisme} className="grid gap-2">
            <select value={metabolismeForm.sexe} onChange={(e) => setMetabolismeForm({ ...metabolismeForm, sexe: e.target.value })} className="border p-2 rounded">
              <option value="">Sexe</option>
              <option value="homme">Homme</option>
              <option value="femme">Femme</option>
            </select>
            <input type="number" placeholder="Âge" value={metabolismeForm.age} onChange={(e) => setMetabolismeForm({ ...metabolismeForm, age: e.target.value })} className="border p-2 rounded" />
            <input type="number" placeholder="Taille (cm)" value={metabolismeForm.taille} onChange={(e) => setMetabolismeForm({ ...metabolismeForm, taille: e.target.value })} className="border p-2 rounded" />
            <select value={metabolismeForm.activite} onChange={(e) => setMetabolismeForm({ ...metabolismeForm, activite: e.target.value })} className="border p-2 rounded">
              <option value="">Activité</option>
              <option value="sédentaire">0h</option>
              <option value="légèrement actif">1–2h/sem</option>
              <option value="modérément actif">3–4h/sem</option>
              <option value="très actif">5–6h/sem</option>
              <option value="extrêmement actif">7h+</option>
            </select>
            <button className="bg-green-600 text-white rounded py-2 mt-2">Enregistrer</button>
          </form>
        ) : (
          <p className="text-red-600">⚠️ Mets d’abord à jour ton poids pour activer ce calcul.</p>
        )}
        <p className="mt-4">Métabolisme cible : <strong>{utilisateur.metabolismeCible ?? "—"} kcal</strong></p>
      </div>

      {/* Mise à jour du poids */}
      <div className="bg-white shadow p-4 rounded mb-6">
        <h2 className="font-semibold text-lg mb-2">Mise à jour du poids</h2>
        <div className="flex items-center gap-2">
          <input type="number" placeholder="Poids (kg)" value={nouveauPoids} onChange={(e) => setNouveauPoids(e.target.value)} className="border p-2 rounded w-24" />
          <button onClick={handlePoids} className="bg-green-700 text-white px-4 py-2 rounded">Enregistrer</button>
        </div>
      </div>

      {/* Graphique */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="font-semibold text-lg mb-2">Évolution du poids</h2>
        <Line data={chartData} />
        <ul className="mt-2 space-y-1">
          {utilisateur.historiquePoids.map((i) => (
            <li key={i.id}>
              {new Date(i.date).toLocaleString("fr-FR")} — <strong className="text-green-700">{i.poids} kg</strong>
              <button onClick={() => handleDeletePoids(i.id)} className="ml-2 text-red-600">Supprimer</button>
            </li>
          ))}
        </ul>
      </div>

      {/* Mensurations */}
      {mensuHistos.length > 0 && (
        <div className="bg-white p-4 rounded shadow mb-6">
          <h2 className="text-lg font-semibold mb-2">Historique mensurations</h2>
          {mensuHistos.map((m, idx) => (
            <div key={m.id} className="border-b py-2 text-sm">
              <p className="font-semibold">{new Date(m.date).toLocaleDateString("fr-FR")}</p>
              {["taille", "hanches", "cuisses", "bras", "poitrine", "mollets", "masseGrasse"].map((key) =>
                m[key] != null && (
                  <p key={key}>
                    {key} : {m[key]}
                    <span className="text-gray-500">{getVariation(key, idx)}</span>
                  </p>
                )
              )}
            </div>
          ))}
        </div>
      )}

      {/* Ajout mensurations */}
      <div className="bg-white shadow p-4 rounded mb-6">
        <h2 className="text-lg font-semibold mb-2">Ajouter une mensuration</h2>
        <form onSubmit={handleMensurations} className="grid grid-cols-2 gap-3">
          {Object.keys(mensurationsForm).map((key) => (
            <input key={key} name={key} placeholder={key} value={mensurationsForm[key]} onChange={(e) => setMensurationsForm({ ...mensurationsForm, [key]: e.target.value })} className="border p-2 rounded" />
          ))}
          <button className="col-span-2 bg-blue-600 text-white rounded py-2">Enregistrer mes mensurations</button>
        </form>
        {confirmationMsg && <p className="text-green-600 mt-2">{confirmationMsg}</p>}
      </div>
    </div>
  );
  {mensuHistos.length > 1 && (
    <div className="mt-6">
      <h3 className="font-semibold text-md mb-2">Tableau récapitulatif des fluctuations</h3>
      <table className="min-w-full border text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2 py-1">Date</th>
            {["taille", "hanches", "cuisses", "bras", "poitrine", "mollets", "masseGrasse"].map((key) => (
              <th key={key} className="border px-2 py-1 capitalize">{key}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {mensuHistos.map((m, idx) => (
            <tr key={m.id}>
              <td className="border px-2 py-1">{new Date(m.date).toLocaleDateString("fr-FR")}</td>
              {["taille", "hanches", "cuisses", "bras", "poitrine", "mollets", "masseGrasse"].map((key) => {
                const current = m[key];
                const previous = mensuHistos[idx + 1]?.[key];
                const variation = previous != null && current != null ? (current - previous).toFixed(1) : null;
                return (
                  <td key={key} className="border px-2 py-1 text-center">
                    {current != null ? `${current}${variation && variation !== "0.0" ? ` (${variation > 0 ? "+" : ""}${variation})` : ""}` : "—"}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )}
  
}


export async function getServerSideProps(context) {
  const session = await getSession(context);
  if (!session) {
    return {
      redirect: { destination: "/auth/signin", permanent: false },
    };
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      trialEndsAt: true,
      isSubscribed: true,
      role: true,
    },
  });

  const now = new Date();
  const trialActive = user?.trialEndsAt && now <= user.trialEndsAt;
  const isAdmin = user?.role === "admin";
  const hasAccess = isAdmin || user.isSubscribed || trialActive;

  if (!hasAccess) {
    return {
      redirect: { destination: "/mon-compte", permanent: false },
    };
  }

  return { props: {} };
}

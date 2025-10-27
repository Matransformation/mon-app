// pages/dashboard.js
import React, { useState, useEffect } from "react";
import { useSession, getSession } from "next-auth/react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import Card from "../components/dashboard/Card";
import UserHeader from "../components/dashboard/UserHeader";
import WeightTracker from "../components/dashboard/WeightTracker";
import MetabolismForm from "../components/dashboard/MetabolismForm";
import WeightChart from "../components/dashboard/WeightChart";
import MeasurementsHistory from "../components/dashboard/MeasurementsHistory";
import MeasurementsForm from "../components/dashboard/MeasurementsForm";
import prisma from "../lib/prisma";
import withAuthProtection from "../lib/withAuthProtection";

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

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Line = dynamic(() => import("react-chartjs-2").then((m) => m.Line), { ssr: false });
const Confetti = dynamic(() => import("react-confetti"), { ssr: false });

function Dashboard({ utilisateur }) {
  const { data: session, status } = useSession();
  const [poidsList, setPoidsList] = useState(utilisateur.historiquePoids);
  const [metabolismeCible, setMetabolismeCible] = useState(utilisateur.metabolismeCible ?? "");
  const [mensuList, setMensuList] = useState(utilisateur.mensurations);
  const [showConfetti, setShowConfetti] = useState(false);
  const [openSections, setOpenSections] = useState({
    poids: true,
    metabolisme: true,
    graph: true,
    mensu: false,
    ajouter: false,
  });

  useEffect(() => {
    if (mensuList.length > utilisateur.mensurations.length) {
      setShowConfetti(true);
      const t = setTimeout(() => setShowConfetti(false), 1800);
      return () => clearTimeout(t);
    }
  }, [mensuList, utilisateur.mensurations.length]);

  if (status === "loading") return <p className="p-8">Chargement…</p>;
  if (!session) return <p className="p-8">Non autorisé</p>;

  // Poids le plus récent
  const dernierPoids = (() => {
    const valides = (poidsList || []).filter(
      (e) => e?.date && !isNaN(new Date(e.date)) && Number.isFinite(Number(e?.poids))
    );
    if (!valides.length) return null;
    const last = [...valides].sort((a, b) => new Date(b.date) - new Date(a.date))[0];
    return Number(last.poids);
  })();

  const derniereMensuDate = mensuList[0]?.date
    ? new Date(mensuList[0].date).toLocaleDateString("fr-FR")
    : "—";

  // Handlers
  const handleAddWeight = async (poids) => {
    const nPoids = Number(poids);
    if (!Number.isFinite(nPoids) || nPoids <= 0) return;

    const temp = { id: `tmp-${Date.now()}`, poids: nPoids, date: new Date().toISOString() };
    setPoidsList((p) => [...p, temp]);

    try {
      const res = await fetch("/api/utilisateur/poids", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ utilisateurId: session.user.id, poids: nPoids }),
      });
      const created = await res.json();
      const safe = {
        id: created?.id ?? temp.id,
        poids: Number(created?.poids),
        date: created?.date ? new Date(created.date).toISOString() : temp.date,
      };
      if (!Number.isFinite(safe.poids)) return temp;
      setPoidsList((p) => p.map((e) => (e.id === temp.id ? safe : e)));
      return safe;
    } catch (e) {
      setPoidsList((p) => p.filter((e) => e.id !== temp.id));
      console.error(e);
    }
  };

  const handleDeleteWeight = async (id) => {
    const backup = poidsList;
    setPoidsList((p) => p.filter((e) => e.id !== id));
    try {
      await fetch(`/api/utilisateur/poids/${id}`, { method: "DELETE" });
    } catch (e) {
      setPoidsList(backup);
      console.error(e);
    }
  };

  const handleSaveMetabo = async (formData) => {
    const res = await fetch("/api/utilisateur/metabolisme", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ utilisateurId: session.user.id, ...formData }),
    });
    const { metabolismeCible } = await res.json();
    setMetabolismeCible(metabolismeCible);
    return { metabolismeCible };
  };

  const handleAddMensu = async (data) => {
    const res = await fetch("/api/utilisateur/mensurations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ utilisateurId: session.user.id, ...data }),
    });
    const { mensurations: created } = await res.json();
    const safe = { ...created, date: new Date(created.date).toISOString() };
    setMensuList((m) => [safe, ...m]);
    return safe;
  };

  const handleDeleteMensu = async (id) => {
    const backup = mensuList;
    setMensuList((m) => m.filter((e) => e.id !== id));
    try {
      await fetch(`/api/utilisateur/mensurations/${id}`, { method: "DELETE" });
    } catch (e) {
      setMensuList(backup);
      console.error(e);
    }
  };

  const toggleSection = (key) => {
    setOpenSections((s) => ({ ...s, [key]: !s[key] }));
  };

  const container = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { staggerChildren: 0.05, duration: 0.35 } },
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-orange-50/70 via-white to-white">
      {showConfetti && <Confetti recycle={false} numberOfPieces={150} />}
      <Navbar />

      <motion.main
        variants={container}
        initial="hidden"
        animate="show"
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        {/* HEADER */}
        <motion.div className="bg-gradient-to-br from-orange-100 to-orange-50 rounded-3xl p-6 mb-8 shadow-sm">
          <h1 className="text-2xl font-extrabold text-gray-900 mb-2">
            Bonjour, {utilisateur.nom ?? "Coach"} 👋
          </h1>

          {dernierPoids ? (
            <p className="text-gray-700 mb-4">
              Continue sur ta lancée — ton poids actuel est de{" "}
              <span className="font-semibold text-orange-600">{dernierPoids} kg</span> ⚖️
            </p>
          ) : (
            <p className="text-gray-700 mb-4">
              Ajoute ton premier poids pour suivre ta progression 👇
            </p>
          )}

          <div className="mt-4 flex gap-3">
            <a
              href="/menu"
              className="flex-1 inline-flex justify-center rounded-xl bg-orange-500 text-white px-4 py-2 font-semibold hover:brightness-110 transition"
            >
              🍽️ Menu personnalisé
            </a>
            <a
              href="/recettes"
              className="flex-1 inline-flex justify-center rounded-xl border border-orange-200 bg-white text-gray-800 px-4 py-2 font-semibold hover:bg-orange-50 transition"
            >
              🎂 Recettes
            </a>
          </div>
        </motion.div>

        {/* STATS */}
        <motion.div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card title="Poids actuel" icon="⚖️" className="bg-white/90 shadow-sm">
            <p className="text-3xl font-extrabold text-slate-900">
              {dernierPoids ? `${dernierPoids} kg` : "—"}
            </p>
          </Card>
          <Card title="Métabolisme cible" icon="🔥" className="bg-white/90 shadow-sm">
            <p className="text-3xl font-extrabold text-slate-900">
              {metabolismeCible ? `${metabolismeCible} kcal/j` : "—"}
            </p>
          </Card>
          <Card title="Dernière mensuration" icon="📏" className="bg-white/90 shadow-sm">
            <p className="text-3xl font-extrabold text-slate-900">{derniereMensuDate}</p>
          </Card>
        </motion.div>

        {/* SECTIONS COLLAPSIBLES */}
        {[
          { key: "poids", title: "Mise à jour du poids", icon: "➕", content: (
              <WeightTracker historiquePoids={poidsList} onAdd={handleAddWeight} onDelete={handleDeleteWeight} />
            )
          },
          { key: "metabolisme", title: "Calcul de ton métabolisme", icon: "🧠", content: (
              <MetabolismForm utilisateur={utilisateur} poidsActuel={dernierPoids} metabolismeInit={metabolismeCible} onSave={handleSaveMetabo} />
            )
          },
          { key: "graph", title: "Évolution du poids", icon: "📈", content: (
              <WeightChart historiquePoids={poidsList} ChartComponent={Line} />
            )
          },
          { key: "mensu", title: "Historique mensurations", icon: "🗂️", content: (
              <MeasurementsHistory mensurations={mensuList} onDelete={handleDeleteMensu} />
            )
          },
          { key: "ajouter", title: "Ajouter une mensuration", icon: "✍️", content: (
              <MeasurementsForm onSave={handleAddMensu} />
            )
          },
        ].map(({ key, title, icon, content }) => (
          <motion.div key={key} className="mb-5">
            <button
              onClick={() => toggleSection(key)}
              className="w-full flex justify-between items-center text-left text-lg font-bold text-gray-800 bg-white rounded-2xl px-5 py-4 shadow-sm hover:bg-orange-50 transition"
            >
              <span>{icon} {title}</span>
              <span className="text-orange-500 text-xl">{openSections[key] ? "−" : "+"}</span>
            </button>
            <AnimatePresence>
              {openSections[key] && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.35 }}
                  className="overflow-hidden mt-3"
                >
                  <Card className="bg-white shadow-sm">{content}</Card>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}

        {/* CTA FINAL */}
        <motion.div className="mt-8 text-center">
          <h3 className="text-xl font-semibold text-orange-600 mb-2">Bravo ! 🎉</h3>
          <p className="text-gray-700 mb-4">Continue sur ta lancée — découvre ton menu ou tes recettes !</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a
              href="/recettes"
              className="bg-orange-500 text-white font-medium px-6 py-3 rounded-lg hover:bg-orange-600 transition"
            >
              🎂 Recettes
            </a>
            <a
              href="/menu"
              className="bg-gray-900 text-white font-medium px-6 py-3 rounded-lg hover:bg-black transition"
            >
              🍽️ Menu personnalisé
            </a>
          </div>
        </motion.div>
      </motion.main>
    </div>
  );
}

export async function getServerSideProps(context) {
  const session = await getSession(context);
  if (!session) return { redirect: { destination: "/login", permanent: false } };

  const raw = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { historiquePoids: true, mensurations: true },
  });
  if (!raw) return { notFound: true };

  const utilisateur = {
    id: raw.id,
    nom: raw.nom,
    age: raw.age,
    taille: raw.taille,
    poids: raw.poids,
    metabolismeCible: raw.metabolismeCible,
    sexe: raw.sexe,
    activite: raw.activite,
    objectif: raw.objectif || "perte",
    historiquePoids: raw.historiquePoids.map((h) => ({
      id: h.id,
      poids: h.poids,
      date: h.date.toISOString(),
    })),
    mensurations: raw.mensurations
      .sort((a, b) => b.date - a.date)
      .map((m) => ({
        id: m.id,
        date: m.date.toISOString(),
        taille: m.taille,
        hanches: m.hanches,
        cuisses: m.cuisses,
        bras: m.bras,
        poitrine: m.poitrine,
        mollets: m.mollets,
        masseGrasse: m.masseGrasse,
      })),
  };

  return { props: { utilisateur } };
}

export default withAuthProtection(Dashboard);

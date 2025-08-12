// pages/dashboard.js
import React, { useState, useEffect } from "react";
import { useSession, getSession } from "next-auth/react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
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
  const [metabolismeCible, setMetabolismeCible] = useState(
    utilisateur.metabolismeCible ?? ""
  );
  const [mensuList, setMensuList] = useState(utilisateur.mensurations);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (mensuList.length > utilisateur.mensurations.length) {
      setShowConfetti(true);
      const t = setTimeout(() => setShowConfetti(false), 1800);
      return () => clearTimeout(t);
    }
  }, [mensuList, utilisateur.mensurations.length]);

  if (status === "loading") return <p className="p-8">Chargement…</p>;
  if (!session) return <p className="p-8">Non autorisé</p>;

  // Poids le plus récent par date, en ignorant les entrées invalides
  const dernierPoids = (() => {
    const valides = (poidsList || []).filter(
      (e) => e?.date && !isNaN(new Date(e.date)) && Number.isFinite(Number(e?.poids))
    );
    if (!valides.length) return 0;
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

    // Ajout optimiste
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
      throw e;
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

  // Animations
  const container = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { staggerChildren: 0.06, duration: 0.35 } },
  };
  const item = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-orange-50/40 via-white to-white">
      {showConfetti && <Confetti recycle={false} numberOfPieces={150} />}

      <Navbar />

      <motion.main
        variants={container}
        initial="hidden"
        animate="show"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        {/* Header de page */}
        <motion.div variants={item} className="mb-6">
          <Card variant="glass" className="border-white/50">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                  Bonjour, {utilisateur.nom ?? ""} 👋
                </h1>
                <p className="text-slate-600 mt-1">
                  Continue sur ta lancée — mets à jour ton poids et suis tes progrès.
                </p>
              </div>
              <div className="flex gap-3">
                <a
                  href="/menu"
                  className="inline-flex items-center rounded-xl bg-orange-500 text-white px-4 py-2 font-semibold hover:brightness-110 transition"
                >
                  Menu personnalisé
                </a>
                <a
                  href="/recettes"
                  className="inline-flex items-center rounded-xl border border-gray-200 bg-white px-4 py-2 font-semibold hover:bg-gray-50 transition"
                >
                  Recettes
                </a>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Stat cards */}
        <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card title="Poids actuel" icon="⚖️" className="bg-white">
            <p className="text-3xl font-extrabold text-slate-900">{dernierPoids} kg</p>
          </Card>
          <Card title="Métabolisme cible" icon="🔥" className="bg-white">
            <p className="text-3xl font-extrabold text-slate-900">
              {metabolismeCible ? `${metabolismeCible} kcal/j` : "—"}
            </p>
          </Card>
          <Card title="Dernière mensuration" icon="📏" className="bg-white">
            <p className="text-3xl font-extrabold text-slate-900">{derniereMensuDate}</p>
          </Card>
        </motion.div>

        {/* Grille principale */}
        <motion.div variants={container} className="grid grid-cols-12 gap-6" initial="hidden" animate="show">
          {/* Profil (compact) */}
          <motion.div variants={item} className="col-span-12 lg:col-span-6">
            <Card title="Profil" icon="👤">
              <UserHeader utilisateur={utilisateur} variant="compact" />
            </Card>
          </motion.div>

          {/* Mise à jour du poids */}
          <motion.div variants={item} className="col-span-12 lg:col-span-6">
            <Card title="Mise à jour du poids" icon="➕">
              <WeightTracker
                historiquePoids={poidsList}
                onAdd={handleAddWeight}
                onDelete={handleDeleteWeight}
              />
            </Card>
          </motion.div>

          {/* Métabolisme */}
          <motion.div variants={item} className="col-span-12">
            <Card title="Calcul de ton métabolisme" icon="🧠" variant="subtle">
              <MetabolismForm
                utilisateur={utilisateur}
                poidsActuel={dernierPoids}
                metabolismeInit={metabolismeCible}
                onSave={handleSaveMetabo}
              />
            </Card>
          </motion.div>

          {/* Graphique */}
          <motion.div variants={item} className="col-span-12 lg:col-span-6">
            <Card title="Évolution du poids" icon="📈">
              <WeightChart historiquePoids={poidsList} ChartComponent={Line} />
            </Card>
          </motion.div>

          {/* Historique mensurations */}
          <motion.div variants={item} className="col-span-12 lg:col-span-6">
            <Card title="Historique mensurations" icon="🗂️">
              <MeasurementsHistory mensurations={mensuList} onDelete={handleDeleteMensu} />
            </Card>
          </motion.div>

          {/* Ajouter mensuration */}
          <motion.div variants={item} className="col-span-12">
            <Card title="Ajouter une mensuration" icon="✍️">
              <MeasurementsForm onSave={handleAddMensu} />
            </Card>
          </motion.div>

          {/* CTA */}
          <motion.div variants={item} className="col-span-12">
            <div className="rounded-2xl bg-orange-50 border border-orange-200 p-6 text-center shadow-sm">
              <h3 className="text-xl font-semibold text-orange-600 mb-2">Bravo ! 🎉</h3>
              <p className="text-gray-700 mb-4">
                Vous avez ajouté vos informations. Découvrez maintenant :
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <a
                  href="/recettes"
                  className="bg-orange-500 text-white font-medium px-6 py-3 rounded-lg hover:bg-orange-600 transition inline-block"
                >
                  🎂 Recettes
                </a>
                <a
                  href="/menu"
                  className="bg-gray-900 text-white font-medium px-6 py-3 rounded-lg hover:bg-black transition inline-block"
                >
                  🍽️ Menu personnalisé
                </a>
              </div>
            </div>
          </motion.div>
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
    objectifPoids: raw.objectifPoids,
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

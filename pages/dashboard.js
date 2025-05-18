import React, { useState } from "react";
import { useSession, getSession } from "next-auth/react";
import dynamic from "next/dynamic";
import Navbar from "../components/Navbar";
import Card from "../components/dashboard/Card";
import UserHeader from "../components/dashboard/UserHeader";
import WeightTracker from "../components/dashboard/WeightTracker";
import MetabolismForm from "../components/dashboard/MetabolismForm";
import WeightChart from "../components/dashboard/WeightChart";
import MeasurementsHistory from "../components/dashboard/MeasurementsHistory";
import MeasurementsForm from "../components/dashboard/MeasurementsForm";
import prisma from "../lib/prisma";

// Chart.js
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
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Line = dynamic(() => import("react-chartjs-2").then((mod) => mod.Line), {
  ssr: false,
});

export default function Dashboard({ utilisateur }) {
  const { data: session, status } = useSession();

  const [poidsList, setPoidsList] = useState(utilisateur.historiquePoids);
  const [metabolismeCible, setMetabolismeCible] = useState(
    utilisateur.metabolismeCible ?? ""
  );
  const [mensuList, setMensuList] = useState(utilisateur.mensurations);

  if (status === "loading") return <p>Chargement…</p>;
  if (!session) return <p>Non autorisé</p>;

  const dernierPoids = poidsList.at(-1)?.poids ?? 0;

  // Poids
  const handleAddWeight = async (poids) => {
    const res = await fetch("/api/utilisateur/poids", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ utilisateurId: session.user.id, poids }),
    });
    const data = await res.json();
    setPoidsList((p) => [...p, data]);
    return data;
  };
  const handleDeleteWeight = async (id) => {
    await fetch(`/api/utilisateur/poids/${id}`, { method: "DELETE" });
    setPoidsList((p) => p.filter((e) => e.id !== id));
  };

  // Métabo
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

  // Mensurations
  const handleAddMensu = async (data) => {
    const res = await fetch("/api/utilisateur/mensurations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ utilisateurId: session.user.id, ...data }),
    });
    const { mensurations: created } = await res.json();
    setMensuList((m) => [created, ...m]);
    return created;
  };
  const handleDeleteMensu = async (id) => {
    await fetch(`/api/utilisateur/mensurations/${id}`, {
      method: "DELETE",
    });
    setMensuList((m) => m.filter((e) => e.id !== id));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Navbar />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <UserHeader utilisateur={utilisateur} />
        </Card>

        <Card>
          <WeightTracker
            historiquePoids={poidsList}
            onAdd={handleAddWeight}
            onDelete={handleDeleteWeight}
          />
        </Card>

        <Card className="md:col-span-2">
          <MetabolismForm
            utilisateur={utilisateur}
            poidsActuel={dernierPoids}
            metabolismeInit={metabolismeCible}
            onSave={handleSaveMetabo}
          />
        </Card>

        <Card>
          <h2 className="text-lg font-semibold mb-4">Évolution du poids</h2>
          <WeightChart historiquePoids={poidsList} ChartComponent={Line} />
        </Card>

        <Card className="md:col-span-2">
          <MeasurementsHistory
            mensurations={mensuList}
            onDelete={handleDeleteMensu}
          />
        </Card>

        <Card className="md:col-span-2">
          <MeasurementsForm onSave={handleAddMensu} />
        </Card>
      </div>
    </div>
  );
}

export async function getServerSideProps(context) {
  const session = await getSession(context);
  if (!session) {
    return { redirect: { destination: "/auth/signin", permanent: false } };
  }

  // vérif droits…
  const userAccess = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { trialEndsAt: true, isSubscribed: true, role: true },
  });
  const now = new Date();
  const trialActive = userAccess?.trialEndsAt && now <= userAccess.trialEndsAt;
  const hasAccess =
    userAccess.role === "admin" || userAccess.isSubscribed || trialActive;
  if (!hasAccess) {
    return { redirect: { destination: "/mon-compte", permanent: false } };
  }

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
    historiquePoids: raw.historiquePoids.map((h) => ({
      id: h.id,
      poids: h.poids,
      date: h.date.toISOString(),
    })),
    mensurations: raw.mensurations.map((m) => ({
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

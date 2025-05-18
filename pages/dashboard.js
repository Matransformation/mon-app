// pages/dashboard.js
import React, { useState, useMemo } from "react"
import { useSession, getSession } from "next-auth/react"
import dynamic from "next/dynamic"
import Navbar from "../components/Navbar"
import Card from "../components/dashboard/Card"
import UserHeader from "../components/dashboard/UserHeader"
import WeightTracker from "../components/dashboard/WeightTracker"
import MetabolismForm from "../components/dashboard/MetabolismForm"
import WeightChart from "../components/dashboard/WeightChart"
import MeasurementsHistory from "../components/dashboard/MeasurementsHistory"
import MeasurementsForm from "../components/dashboard/MeasurementsForm"
import prisma from "../lib/prisma"

// Chart.js registration
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

const Line = dynamic(
  () => import("react-chartjs-2").then((mod) => mod.Line),
  { ssr: false }
)

export default function Dashboard({ utilisateur }) {
  const { data: session, status } = useSession()

  // 1) state “live” de la liste des poids
  const [poidsList, setPoidsList] = useState(utilisateur.historiquePoids)
  // 2) state du métabolisme pour mise à jour instantanée
  const [metabolismeCible, setMetabolismeCible] = useState(
    utilisateur.metabolismeCible ?? ""
  )

  if (status === "loading") return <p>Chargement…</p>
  if (!session) return <p>Non autorisé</p>

  // Toujours le dernier poids
  const dernierPoids = poidsList.at(-1)?.poids ?? 0

  // Tri et calculs intermédiaires
  const sorted = useMemo(
    () =>
      [...poidsList].sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      ),
    [poidsList]
  )
  const poidsInitial = sorted[0]?.poids ?? 0
  const perdu = (poidsInitial - dernierPoids).toFixed(1)

  // Handlers
  const handleAddWeight = async (poids) => {
    const res = await fetch("/api/utilisateur/poids", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ utilisateurId: session.user.id, poids }),
    })
    const data = await res.json()
    setPoidsList((prev) => [...prev, data])
    return data
  }

  const handleDeleteWeight = async (id) => {
    await fetch(`/api/utilisateur/poids/${id}`, { method: "DELETE" })
    setPoidsList((prev) => prev.filter((e) => e.id !== id))
  }

  const handleSaveMetabo = async (formData) => {
    const res = await fetch("/api/utilisateur/metabolisme", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ utilisateurId: session.user.id, ...formData }),
    })
    const { metabolismeCible } = await res.json()
    setMetabolismeCible(metabolismeCible)
    return { metabolismeCible }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Navbar />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1) En-tête utilisateur */}
        <Card>
          <UserHeader utilisateur={utilisateur} />
        </Card>

        {/* 2) Tracker du poids */}
        <Card>
          <WeightTracker
            historiquePoids={poidsList}
            onAdd={handleAddWeight}
            onDelete={handleDeleteWeight}
          />
          <p className="mt-4 text-sm text-gray-600">
            ✅ Déjà perdu : <strong>{perdu} kg</strong>
          </p>
        </Card>

        {/* 3) Métabolisme recalculé automatiquement */}
        <Card className="md:col-span-2">
          <MetabolismForm
            utilisateur={utilisateur}
            poidsActuel={dernierPoids}
            metabolismeInit={metabolismeCible}
            onSave={handleSaveMetabo}
          />
        </Card>

        {/* 4) Graphique d’évolution */}
        <Card>
          <h2 className="text-lg font-semibold mb-4">Évolution du poids</h2>
          <WeightChart historiquePoids={poidsList} ChartComponent={Line} />
        </Card>

        {/* 5) Historique des mensurations */}
        <Card className="md:col-span-2">
          <MeasurementsHistory mensurations={utilisateur.mensurations} />
        </Card>

        {/* 6) Formulaire d’ajout de mensurations */}
        <Card className="md:col-span-2">
          <MeasurementsForm
            onSave={(data) =>
              fetch("/api/utilisateur/mensurations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ utilisateurId: session.user.id, ...data }),
              })
            }
          />
        </Card>
      </div>
    </div>
  )
}

export async function getServerSideProps(context) {
  const session = await getSession(context)
  if (!session) {
    return {
      redirect: { destination: "/auth/signin", permanent: false },
    }
  }

  // Vérification des droits
  const userAccess = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { trialEndsAt: true, isSubscribed: true, role: true },
  })
  const now = new Date()
  const trialActive =
    userAccess?.trialEndsAt && now <= userAccess.trialEndsAt
  const hasAccess =
    userAccess.role === "admin" || userAccess.isSubscribed || trialActive
  if (!hasAccess) {
    return {
      redirect: { destination: "/mon-compte", permanent: false },
    }
  }

  // Récupération + sérialisation
  const raw = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { historiquePoids: true, mensurations: true },
  })
  if (!raw) {
    return { notFound: true }
  }

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
  }

  return { props: { utilisateur } }
}

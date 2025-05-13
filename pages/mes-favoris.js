import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import Navbar from "../components/Navbar";
import { useSession } from "next-auth/react";

export default function MesFavoris() {
  const { data: session, status } = useSession();
  const [favoris, setFavoris] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status !== "authenticated") return;

    const fetchFavoris = async () => {
      try {
        const res = await axios.get(`/api/utilisateur/${session.user.id}/favoris`, {
          withCredentials: true,
        });
        setFavoris(res.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des favoris :", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFavoris();
  }, [session, status]);

  const retirerFavori = async (recetteId) => {
    try {
      await axios.delete(`/api/utilisateur/${session.user.id}/favoris`, {
        data: { recetteId },
        withCredentials: true,
      });
      setFavoris((prev) => prev.filter((r) => r.id !== recetteId));
    } catch (error) {
      console.error("Erreur lors de la suppression du favori :", error);
    }
  };

  if (status === "loading" || loading) {
    return <div className="text-center mt-10">Chargement des favoris...</div>;
  }

  return (
    <div className="w-full px-4 sm:px-8 py-6">
      <Navbar />
      <h1 className="text-3xl font-bold mb-6">Mes recettes favorites</h1>

      {favoris.length === 0 ? (
        <p className="text-gray-500">Tu n’as encore ajouté aucune recette en favori.</p>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoris.map((recette) => (
            <li key={recette.id} className="bg-white shadow-md rounded-lg overflow-hidden relative">
              <img
                src={recette.photoUrl || "/images/placeholder.png"}
                alt={recette.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-2">{recette.name}</h2>
                <Link href={`/recettes/${recette.id}`} className="text-green-700 underline text-sm">
                  Voir la recette →
                </Link>
                <button
                  onClick={() => retirerFavori(recette.id)}
                  className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white text-xs px-2 py-1 rounded"
                >
                  Retirer
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

import { getServerSession } from "next-auth/next";
import prisma from "../lib/prisma"; // Assure-toi que le chemin est correct
import authOptions from "../pages/api/auth/[...nextauth]"; // Chemin vers ton fichier de config NextAuth

export async function getServerSideProps(context) {
  // 1) Vérifier la session NextAuth
  const session = await getServerSession(context.req, context.res, authOptions);
  console.log("Session:", session); // Ajoute un log pour vérifier la session

  // Si l'utilisateur n'est pas authentifié
  if (!session?.user?.email) {
    return {
      redirect: {
        destination: "/auth/signin", // Redirige vers la page de connexion
        permanent: false,
      },
    };
  }

  // 2) Récupérer l'utilisateur et vérifier sa période d'essai ou son abonnement
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      trialEndsAt: true,
      isSubscribed: true,
    },
  });

  // Vérifier la période d'essai
  const now = new Date();
  const trialActive = user?.trialEndsAt && now <= new Date(user.trialEndsAt);
  const hasAccess = user?.isSubscribed || trialActive;

  // Si l'utilisateur n'a pas accès, le rediriger vers la page "mon-compte"
  if (!hasAccess) {
    return {
      redirect: {
        destination: "/mon-compte", // Page où l'utilisateur peut gérer son abonnement
        permanent: false,
      },
    };
  }

  // 3) Si tout va bien, continuer à charger la page
  return {
    props: {},
  };
}

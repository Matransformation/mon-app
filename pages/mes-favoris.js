// pages/mes-favoris.js
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import axios from "axios";
import Navbar from "../components/Navbar";
import { useSession } from "next-auth/react";
import withAuthProtection from "../lib/withAuthProtection";
import Image from "next/image";
import {
  Heart,
  Trash2,
  Search,
  ChevronDown,
  Sparkles,
} from "lucide-react";

function MesFavoris() {
  const { data: session, status } = useSession();
  const [favoris, setFavoris] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent"); // 'recent' | 'name-asc' | 'name-desc'
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (status !== "authenticated") return;

    const fetchFavoris = async () => {
      try {
        const res = await axios.get(
          `/api/utilisateur/${session.user.id}/favoris`,
          { withCredentials: true }
        );
        // On trie par défaut du plus récent au plus ancien si createdAt existe
        const sorted = [...(res.data || [])].sort((a, b) => {
          const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return db - da;
        });
        setFavoris(sorted);
      } catch (error) {
        console.error("Erreur lors de la récupération des favoris :", error);
        setErrorMsg("Impossible de charger vos favoris pour le moment.");
      } finally {
        setLoading(false);
      }
    };

    fetchFavoris();
  }, [session, status]);

  const retirerFavori = async (recetteId) => {
    // Optimistic UI
    const prev = favoris;
    setFavoris((p) => p.filter((r) => r.id !== recetteId));
    try {
      await axios.delete(`/api/utilisateur/${session.user.id}/favoris`, {
        data: { recetteId },
        withCredentials: true,
      });
    } catch (error) {
      console.error("Erreur lors de la suppression du favori :", error);
      setErrorMsg("Suppression impossible. Réessaie.");
      // rollback
      setFavoris(prev);
    }
  };

  const filtered = useMemo(() => {
    let arr = [...favoris];
    if (query.trim()) {
      const q = query.toLowerCase();
      arr = arr.filter((r) => r.name?.toLowerCase().includes(q));
    }
    switch (sortBy) {
      case "name-asc":
        arr.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        arr.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "recent":
      default:
        arr.sort((a, b) => {
          const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return db - da;
        });
        break;
    }
    return arr;
  }, [favoris, query, sortBy]);

  const SkeletonCard = () => (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm ring-1 ring-gray-100 animate-pulse">
      <div className="relative w-full aspect-[16/10] bg-gray-200" />
      <div className="p-4">
        <div className="h-5 bg-gray-200 rounded w-2/3 mb-3" />
        <div className="h-4 bg-gray-200 rounded w-1/3" />
      </div>
    </div>
  );

  if (status === "loading") {
    return (
      <>
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-2">
              <Heart className="text-red-500" /> Mes recettes favorites
            </h1>
            <p className="text-gray-500 mt-1">
              {favoris.length > 0
                ? `${favoris.length} recette${favoris.length > 1 ? "s" : ""} sauvegardée${favoris.length > 1 ? "s" : ""}`
                : "Aucune recette en favori pour l’instant."}
            </p>
          </div>

          {/* Search + sort */}
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative flex-1 min-w-[240px]">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher une recette…"
                className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none pr-10 pl-3 py-2 rounded-lg border border-gray-300 shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-300"
                aria-label="Trier les favoris"
              >
                <option value="recent">Plus récents</option>
                <option value="name-asc">Nom (A → Z)</option>
                <option value="name-desc">Nom (Z → A)</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Message d'erreur éventuel */}
        {errorMsg && (
          <div
            role="alert"
            className="mb-6 rounded-lg border border-red-200 bg-red-50 text-red-800 px-4 py-3"
          >
            {errorMsg}
          </div>
        )}

        {/* Loading skeleton */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          // Empty state
          <div className="text-center bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-10">
            <div className="mx-auto w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mb-4">
              <Sparkles className="text-orange-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Rien pour l’instant…
            </h2>
            <p className="text-gray-600 mb-6">
              Enregistre tes recettes préférées pour les retrouver ici.
            </p>
            <Link
              href="/recettes"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-orange-500 text-white font-medium hover:bg-orange-600 transition"
            >
              Explorer les recettes
            </Link>
          </div>
        ) : (
          // Grid
          <ul
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            aria-live="polite"
          >
            {filtered.map((recette) => (
              <li
                key={recette.id}
                className="group bg-white rounded-xl overflow-hidden shadow-sm ring-1 ring-gray-100 hover:shadow-md transition"
              >
                {/* Image */}
                <div className="relative w-full aspect-[16/10]">
                  <Image
                    src={recette.photoUrl || "/images/placeholder.png"}
                    alt={recette.name}
                    fill
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    className="object-cover"
                    priority={false}
                  />
                  {/* Bouton retirer */}
                  <button
                    onClick={() => retirerFavori(recette.id)}
                    className="absolute top-3 right-3 inline-flex items-center gap-1 bg-white/90 backdrop-blur px-2.5 py-1.5 rounded-md text-red-600 hover:bg-white shadow"
                    aria-label={`Retirer ${recette.name} des favoris`}
                    title="Retirer des favoris"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="text-xs font-medium">Retirer</span>
                  </button>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h2 className="text-lg font-semibold text-gray-900 line-clamp-2 min-h-[2.75rem]">
                    {recette.name}
                  </h2>

                  <div className="mt-3 flex items-center justify-between">
                    <Link
                      href={`/recettes/${recette.id}`}
                      className="inline-flex items-center px-3 py-1.5 rounded-md bg-gray-900 text-white text-sm font-medium hover:bg-gray-800"
                    >
                      Voir la recette →
                    </Link>
                    <div className="text-sm text-gray-500">
                      {/* Si tu as un champ categories, affiche un tag */}
                      {recette.categories?.[0]?.category?.name && (
                        <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                          {recette.categories[0].category.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

export default withAuthProtection(MesFavoris);

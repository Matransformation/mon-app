// pages/recettes.js
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { Search, Filter, Sparkles, ChevronDown, Image as ImageIcon, Lock } from "lucide-react";
import Navbar from "../components/Navbar";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import clsx from "clsx";

export default function ListeRecettes() {
  const [recettes, setRecettes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [sortOption, setSortOption] = useState(null); // "calories-asc" | "calories-desc" | "price-asc" | "price-desc"
  const [searchQuery, setSearchQuery] = useState("");
  const [showOnlyPublic, setShowOnlyPublic] = useState(false);
  const [imageFit, setImageFit] = useState("cover"); // "cover" | "contain"
  const router = useRouter();
  const { data: session } = useSession();

  const isSubscribed = session?.user?.isSubscribed;
  const isOnTrial = session?.user?.isOnTrial;

  useEffect(() => {
    fetchRecettes();
    fetchCategories();
  }, []);

  async function fetchRecettes() {
    try {
      const res = await axios.get("/api/recettes");
      const sorted = res.data
        .slice()
        .sort((a, b) => (a?.name || "").localeCompare(b?.name || "", "fr", { sensitivity: "base" }));
      setRecettes(sorted);
    } catch (err) {
      console.error("Erreur chargement recettes :", err);
    }
  }
  

  async function fetchCategories() {
    try {
      const res = await axios.get("/api/categories");
      const sorted = res.data
        .slice()
        .sort((a, b) => a.name?.localeCompare(b.name, "fr", { sensitivity: "base" }));
      setCategories(sorted);
    } catch (err) {
      console.error("Erreur chargement catégories :", err);
    }
  }
  

  function calculerNutritionEtPrix(ingredients) {
    let totalCalories = 0,
      totalProtein = 0,
      totalFat = 0,
      totalCarbs = 0,
      totalPrice = 0;

    ingredients.forEach((ri) => {
      if (ri.ingredient) {
        const ratio = ri.quantity / 100;
        totalCalories += ri.ingredient.calories * ratio;
        totalProtein += ri.ingredient.protein * ratio;
        totalFat += ri.ingredient.fat * ratio;
        totalCarbs += ri.ingredient.carbs * ratio;
        totalPrice += (ri.ingredient.price * ri.quantity) / 1000;
      }
    });

    return {
      calories: Math.round(totalCalories),
      protein: Math.round(totalProtein),
      fat: Math.round(totalFat),
      carbs: Math.round(totalCarbs),
      price: parseFloat(totalPrice.toFixed(2)),
    };
  }

  function getFilteredAndSortedRecettes() {
    let filtered = [...recettes];

    if (showOnlyPublic) filtered = filtered.filter((r) => r.isPublic);

    if (selectedCategory) {
      filtered = filtered.filter((r) =>
        r.categories.some((c) => c.categoryId === selectedCategory)
      );
    }

    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((r) => {
        const matchName = (r?.name || "").toLowerCase().includes(q);
        const matchIng = (r?.ingredients || []).some(
          (ri) => (ri?.ingredient?.name || "").toLowerCase().includes(q)
        );
        return matchName || matchIng;
      });
    }
    

    if (!session) {
      filtered.sort((a, b) => {
        if (a.isPublic && !b.isPublic) return -1;
        if (!a.isPublic && b.isPublic) return 1;
        return 0;
      });
    }

    if (sortOption) {
      filtered.sort((a, b) => {
        const an = calculerNutritionEtPrix(a.ingredients);
        const bn = calculerNutritionEtPrix(b.ingredients);
        switch (sortOption) {
          case "calories-asc":
            return an.calories - bn.calories;
          case "calories-desc":
            return bn.calories - an.calories;
          case "price-asc":
            return an.price - bn.price;
          case "price-desc":
            return bn.price - an.price;
          default:
            return 0;
        }
      });
    }

    return filtered;
  }

  const filtered = getFilteredAndSortedRecettes();

  // ——— Petits composants UI ———
  const Chip = ({ active, children, onClick }) => (
    <button
      onClick={onClick}
      className={clsx(
        "px-3 py-1 rounded-full text-sm whitespace-nowrap transition",
        active
          ? "bg-green-600 text-white shadow"
          : "bg-gray-100 text-gray-800 hover:bg-gray-200"
      )}
    >
      {children}
    </button>
  );

  const Segmented = ({ value, onChange, options }) => (
    <div className="inline-flex rounded-xl bg-gray-100 p-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={clsx(
            "px-3 py-1.5 text-sm rounded-lg transition",
            value === opt.value ? "bg-white shadow text-gray-900" : "text-gray-600"
          )}
          aria-pressed={value === opt.value}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );

  const Switch = ({ checked, onChange, label }) => (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={clsx(
        "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition",
        checked ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-800"
      )}
    >
      <span
        className={clsx(
          "inline-block w-9 h-5 rounded-full relative transition",
          checked ? "bg-emerald-500" : "bg-gray-300"
        )}
      >
        <span
          className={clsx(
            "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition",
            checked ? "right-0.5" : "left-0.5"
          )}
        />
      </span>
      {label}
    </button>
  );

  return (
    <>
      <Navbar />

      {/* Banner top */}
      <div className="bg-gradient-to-r from-orange-400 to-rose-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 py-10 text-white">
          <div className="flex flex-col items-center text-center">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              🍴 Toutes nos Recettes
            </h1>
            <p className="mt-2 text-orange-50">
              Trouvez l’inspiration parfaite, adaptée à votre objectif.
            </p>

            {/* Search glass (texte forcé en noir) */}
            <div className="mt-6 w-full max-w-xl">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Rechercher une recette ou un ingrédient…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-2xl bg-white/90 backdrop-blur px-12 py-3 shadow
                             focus:outline-none focus:ring-2 focus:ring-white
                             text-gray-900 placeholder-gray-500 caret-gray-900"
                />
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400 pointer-events-none">
                  <Search size={20} />
                </div>
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/90"
                  title="Filtres"
                >
                  <Filter size={20} />
                </button>
              </div>
            </div>

            {/* CTA abo / trial */}
            {!session ? (
              <div className="mt-6">
                <button
                  onClick={() => router.push("/register")}
                  className="inline-flex items-center gap-2 bg-white text-orange-600 font-semibold px-5 py-2 rounded-xl hover:bg-orange-50 shadow"
                >
                  <Sparkles size={18} />
                  7 jours gratuits sans CB
                </button>
              </div>
            ) : (
              !isSubscribed &&
              !isOnTrial && (
                <div className="mt-6">
                  <button
                    onClick={() => router.push("/abonnement")}
                    className="inline-flex items-center gap-2 bg-white text-orange-600 font-semibold px-5 py-2 rounded-xl hover:bg-orange-50 shadow"
                  >
                    <Lock size={18} />
                    Je m’abonne
                  </button>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 py-8">
        {/* Toolbar: catégories + tris + toggles */}
        <div className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold mb-4">Toutes les recettes (ordre alphabétique)</h2>

{/* Liste de toutes les catégories */}
<div className="flex flex-wrap gap-2 mb-6">
  <button
    onClick={() => setSelectedCategory(null)}
    className={clsx(
      "px-3 py-1 rounded-full text-sm",
      selectedCategory === null
        ? "bg-green-600 text-white shadow"
        : "bg-gray-100 text-gray-800 hover:bg-gray-200"
    )}
  >
    Toutes
  </button>

  {categories.map((cat) => (
    <button
      key={cat.id}
      onClick={() => setSelectedCategory(cat.id)}
      className={clsx(
        "px-3 py-1 rounded-full text-sm",
        selectedCategory === cat.id
          ? "bg-green-600 text-white shadow"
          : "bg-gray-100 text-gray-800 hover:bg-gray-200"
      )}
    >
      {cat.name}
    </button>
  ))}
</div>


          {/* Ligne: tri + toggles */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Trier par</span>
              <Segmented
                value={sortOption ?? ""}
                onChange={(val) => setSortOption(val)}
                options={[
                  { value: "calories-asc", label: "🔥 Calories ↑" },
                  { value: "calories-desc", label: "🔥 Calories ↓" },
                  { value: "price-asc", label: "💶 Prix ↑" },
                  { value: "price-desc", label: "💶 Prix ↓" },
                ]}
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={showOnlyPublic}
                onChange={setShowOnlyPublic}
                label="Uniquement publics"
              />
              <Segmented
                value={imageFit}
                onChange={(v) => setImageFit(v)}
                options={[
                  { value: "cover", label: "🖼️ Plein cadre" },
                  { value: "contain", label: "🖼️ Photo entière" },
                ]}
              />
            </div>
          </div>
        </div>

        {/* Grille */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((recette) => {
            const nutrition = calculerNutritionEtPrix(recette.ingredients || []);
            const isAccessible = recette.isPublic || isSubscribed || isOnTrial;

            return (
              <div
                key={recette.id}
                className="group rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 hover:shadow-lg hover:-translate-y-0.5 transition-all overflow-hidden"
              >
                {/* Image */}
                <div className={clsx("relative w-full h-60", imageFit === "contain" ? "bg-white" : "bg-gray-50")}>
                  <Image
                    src={isAccessible ? recette.photoUrl : "/verrou.jpg"}
                    alt={recette.name}
                    fill
                    sizes="(min-width:1024px) 33vw, (min-width:768px) 50vw, 100vw"
                    className={clsx(
                      "rounded-t-2xl object-center transition-transform duration-300",
                      imageFit === "contain" ? "object-contain" : "object-cover group-hover:scale-[1.03]"
                    )}
                  />
                  {/* Badge coin */}
                  <div className="absolute top-3 left-3">
                    <span
                      className={clsx(
                        "px-2 py-1 text-xs rounded-full backdrop-blur bg-white/90",
                        recette.isPublic ? "text-emerald-700" : "text-orange-700"
                      )}
                    >
                      {recette.isPublic ? "Public" : "Premium"}
                    </span>
                  </div>
                  {/* Overlay si non accessible */}
                  {!isAccessible && (
                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white text-sm font-semibold px-3 text-center">
                      🔒 Réservé aux abonnés
                      <br />
                      {!session ? "Créez un compte pour 7 jours gratuits" : "Abonnez-vous pour y accéder"}
                    </div>
                  )}
                </div>

                {/* Contenu */}
                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="text-lg font-semibold line-clamp-1">{recette.name}</h2>
                    <button className="text-gray-400 hover:text-gray-600">
                      <ChevronDown size={18} />
                    </button>
                  </div>

                  <div className={clsx("text-sm grid grid-cols-2 gap-y-1", isAccessible ? "text-gray-700" : "text-gray-400")}>
                    <p>👥 {recette.servings} pers.</p>
                    <p>🔥 {isAccessible ? `${nutrition.calories} kcal` : "– kcal"}</p>
                    <p>🍗 {isAccessible ? `${nutrition.protein} g prot.` : "– g prot."}</p>
                    <p>🧈 {isAccessible ? `${nutrition.fat} g lip.` : "– g lip."}</p>
                    <p>🍞 {isAccessible ? `${nutrition.carbs} g gluc.` : "– g gluc."}</p>
                    <p>💶 {isAccessible ? `${nutrition.price} €` : "– €"}</p>
                  </div>

                  {(recette.categories || []).length > 0 && (
  <div className="flex flex-wrap gap-2">
    {recette.categories.map((rc, idx) => {
      const catName =
        rc.category?.name || rc.name || rc.categoryName || "Catégorie inconnue";
      const catId = rc.category?.id || rc.id || idx;
      return (
        <span
          key={catId}
          className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs"
        >
          {catName}
        </span>
      );
    })}
  </div>
)}


                  <div className="pt-1 flex justify-end">
                    {isAccessible ? (
                      <Link
                        href={`/recettes/${recette.id}`}
                        className="inline-flex items-center gap-2 bg-orange-500 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-orange-600 transition"
                      >
                        <ImageIcon size={16} />
                        Voir la recette
                      </Link>
                    ) : (
                      <button
                        disabled
                        className="inline-flex items-center gap-2 bg-gray-200 text-gray-500 text-sm font-medium px-4 py-2 rounded-lg cursor-not-allowed"
                      >
                        Voir la recette
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <p className="text-center text-gray-500 mt-10">Aucune recette ne correspond à vos filtres.</p>
        )}
      </div>
    </>
  );
}

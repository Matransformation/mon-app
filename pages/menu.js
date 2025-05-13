// pages/menu.js

import { useSession } from "next-auth/react"; // Ajoute cette ligne
import { useEffect, useState } from "react";
import axios from "axios";
import { addDays, endOfWeek, format, isSameDay } from "date-fns";
import { fr } from "date-fns/locale";
import ChangeRepasModal from "../components/ChangeRepasModal";
import useMenu from "../hooks/useMenu";
import useAccompagnements from "../hooks/useAccompagnements";
import { computeRecipeAndSide } from "../utils/macros";
import Navbar from "../components/Navbar";


export default function MenuPage() {
  const {
    menu,
    user,
    weekStart,
    prevWeek,
    nextWeek,
    reload: reloadMenu,
    loading,
  } = useMenu();

  const [allIngredients, setAllIngredients] = useState([]);
  const [proteinRichOptions, setProteinRichOptions] = useState([]);
  const [accompagnementsChoisis, setAccompagnementsChoisis] = useState({});
  const [selectedRepas, setSelectedRepas] = useState(null);

  useEffect(() => {
    axios
      .get("/api/ingredients")
      .then((res) => {
        setAllIngredients(res.data);
        setProteinRichOptions(res.data.filter((i) => i.protein >= 20));
      })
      .catch(console.error);
  }, []);

  const { applyAccompagnements, removeAccompagnements } = useAccompagnements({
    user,
    allIngredients,
    proteinRichOptions,
    reload: reloadMenu,
  });

  if (loading || !user) {
    return <div className="p-6">Chargement…</div>;
  }

  const daysOfWeek = [
    "LUNDI",
    "MARDI",
    "MERCREDI",
    "JEUDI",
    "VENDREDI",
    "SAMEDI",
    "DIMANCHE",
  ];
  const repartitionRepas = {
    "petit-dejeuner": 0.3,
    dejeuner: 0.4,
    collation: 0.05,
    diner: 0.25,
  };

  const filteredMenu = menu.filter((item) => {
    const d = new Date(item.date);
    return d >= weekStart && d <= endOfWeek(weekStart, { weekStartsOn: 1 });
  });

  const upperMetab = user.metabolismeCible;
  const lowerMetab = Math.round(upperMetab * 0.9);

  return (
    <>
    <Navbar /> {/* Ajoute la barre de navigation ici */}

    <div className="p-6">
      {/* En-tête */}
      <h1 className="text-2xl font-bold text-center mb-4">
        SEMAINE DU{" "}
        {format(weekStart, "d MMMM", { locale: fr }).toUpperCase()} AU{" "}
        {format(endOfWeek(weekStart, { weekStartsOn: 1 }), "d MMMM", {
          locale: fr,
        }).toUpperCase()}
      </h1>
      <p className="text-center mb-6 text-gray-700">
        Métabolisme cible :{" "}
        <span className="font-semibold">
          {lowerMetab} – {upperMetab} kcal/jour
        </span>
      </p>

      {/* Navigation de semaine et actions */}
      <div className="flex justify-center mb-6 space-x-4">
        <button
          onClick={prevWeek}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          ⬅️ Semaine précédente
        </button>
        <button
          onClick={nextWeek}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Semaine suivante ➡️
        </button>
        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          🖨️ Imprimer
        </button>
        <a
          href="/liste-courses"
          className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
        >
          🛒 Liste de courses
        </a>
        <button
          onClick={() => {
            if (
              confirm("Générer le menu pour cette semaine ? Cette action écrasera l'existant.")
            ) {
              axios
                .post("/api/menu/generer", {
                  userId: user.id,
                  weekStart: weekStart.toISOString(),
                })
                .then(() => reloadMenu())
                .catch((err) => alert(err.message));
            }
          }}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          ➕ Générer mon menu
        </button>
      </div>

      {/* Grille LUNDI→JEUDI */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        {daysOfWeek.slice(0, 4).map((day, idx) => (
          <DayCard
            key={day}
            day={day}
            dayMenu={filteredMenu.filter((item) =>
              isSameDay(new Date(item.date), addDays(weekStart, idx))
            )}
            allIngredients={allIngredients}
            proteinRichOptions={proteinRichOptions}
            repartitionRepas={repartitionRepas}
            accompagnementsChoisis={accompagnementsChoisis}
            setAccompagnementsChoisis={setAccompagnementsChoisis}
            applyAccompagnements={applyAccompagnements}
            removeAccompagnements={removeAccompagnements}
            openModal={setSelectedRepas}
            user={user}
          />
        ))}
      </div>

      {/* Grille VENDREDI→DIMANCHE */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {daysOfWeek.slice(4).map((day, idx) => (
          <DayCard
            key={day}
            day={day}
            dayMenu={filteredMenu.filter((item) =>
              isSameDay(new Date(item.date), addDays(weekStart, 4 + idx))
            )}
            allIngredients={allIngredients}
            proteinRichOptions={proteinRichOptions}
            repartitionRepas={repartitionRepas}
            accompagnementsChoisis={accompagnementsChoisis}
            setAccompagnementsChoisis={setAccompagnementsChoisis}
            applyAccompagnements={applyAccompagnements}
            removeAccompagnements={removeAccompagnements}
            openModal={setSelectedRepas}
            user={user}
          />
        ))}
      </div>

      {/* Modale de changement de recette */}
      {selectedRepas && (
        <ChangeRepasModal
          repas={selectedRepas}
          onClose={() => setSelectedRepas(null)}
          onUpdate={reloadMenu}
          />
        )}
      </div>
    </>
  );
}

function DayCard({
  day,
  dayMenu,
  allIngredients,
  proteinRichOptions,
  user,
  repartitionRepas,
  openModal,
  accompagnementsChoisis,
  setAccompagnementsChoisis,
  applyAccompagnements,
  removeAccompagnements,
}) {
  const repasTypes = ["petit-dejeuner", "dejeuner", "collation", "diner"];
  const [recipeRfMap, setRecipeRfMap] = useState({});

  // recalcul dynamique du scaling
  const recalcRecipeRf = (repas) => {
    const hasEgg = repas.recette?.ingredients?.some((ri) =>
      ri.ingredient.name.toLowerCase().includes("oeuf")
    );
    if (hasEgg) {
      setRecipeRfMap((prev) => ({ ...prev, [repas.id]: 1 }));
      return;
    }
    const raw = repas.recette.ingredients.reduce(
      (sum, ri) => ({
        p: sum.p + ri.ingredient.protein * (ri.quantity / 100),
        f: sum.f + ri.ingredient.fat * (ri.quantity / 100),
        g: sum.g + ri.ingredient.carbs * (ri.quantity / 100),
      }),
      { p: 0, f: 0, g: 0 }
    );
    const sideMacros = (repas.accompagnements || []).reduce((sum, a) => {
      const ing = allIngredients.find((i) => i.id === a.ingredient.id) || {};
      return {
        p: sum.p + (ing.protein || 0) * (a.quantity / 100),
        f: sum.f + (ing.fat     || 0) * (a.quantity / 100),
        g: sum.g + (ing.carbs   || 0) * (a.quantity / 100),
      };
    }, { p: 0, f: 0, g: 0 });
    const obj = {
      p: user.poids * 1.8 * repartitionRepas[repas.repasType],
      f: (user.metabolismeCible * 0.3 / 9) * repartitionRepas[repas.repasType],
      g:
        ((user.metabolismeCible -
          user.poids * 1.8 * 4 -
          user.metabolismeCible * 0.3) /
          4) *
        repartitionRepas[repas.repasType],
    };
    const { recipeFactor } = computeRecipeAndSide(
      raw,
      { p: obj.p - sideMacros.p, f: obj.f - sideMacros.f, g: obj.g - sideMacros.g },
      { protein: 0, fat: 0, carbs: 0 }
    );
    setRecipeRfMap((prev) => ({ ...prev, [repas.id]: recipeFactor }));
  };

  // totaux journaliers
  let totalCaloriesJour = 0,
    totalProtJour = 0,
    totalLipJour = 0,
    totalGlucJour = 0;

  dayMenu.forEach((repas) => {
    const rec = repas.recette;
    if (!rec) return;
    const raw = rec.ingredients.reduce(
      (s, ri) => ({
        p: s.p + ri.ingredient.protein * (ri.quantity / 100),
        f: s.f + ri.ingredient.fat * (ri.quantity / 100),
        g: s.g + ri.ingredient.carbs * (ri.quantity / 100),
        c: s.c + ri.ingredient.calories * (ri.quantity / 100),
      }),
      { p: 0, f: 0, g: 0, c: 0 }
    );
    const rf = recipeRfMap[repas.id] || 1;
    totalProtJour += raw.p * rf;
    totalLipJour += raw.f * rf;
    totalGlucJour += raw.g * rf;
    totalCaloriesJour += raw.c * rf;
    (repas.accompagnements || []).forEach((a) => {
      const q = a.quantity / 100;
      totalProtJour += a.ingredient.protein * q;
      totalLipJour += a.ingredient.fat * q;
      totalGlucJour += a.ingredient.carbs * q;
      totalCaloriesJour += a.ingredient.calories * q;
    });
  });

  totalCaloriesJour = Math.round(totalCaloriesJour);
  totalProtJour = Math.round(totalProtJour);
  totalLipJour = Math.round(totalLipJour);
  totalGlucJour = Math.round(totalGlucJour);

  const objCalories = user.metabolismeCible;
  const objProtein = Math.round(user.poids * 1.8);
  const objLipides = Math.round((user.metabolismeCible * 0.3) / 9);
  const objGlucides = Math.round(
    (user.metabolismeCible - objProtein * 4 - user.metabolismeCible * 0.3) / 4
  );

  return (
    <div className="bg-white p-4 rounded-lg shadow flex flex-col">
      {/* résumé journalier */}
      <div
        className={`text-sm font-semibold mb-1 text-center ${
          totalCaloriesJour > objCalories ? "text-red-500" : "text-green-500"
        }`}
      >
        🔥 {totalCaloriesJour} / {objCalories} kcal
      </div>
      <div
        className={`text-xs font-semibold mb-4 text-center ${
          totalProtJour > objProtein ||
          totalLipJour > objLipides ||
          totalGlucJour > objGlucides
            ? "text-red-500"
            : "text-green-500"
        }`}
      >
        🍗 {totalProtJour} / {objProtein}g P · 🧈 {totalLipJour} / {objLipides}g L · 🍞{" "}
        {totalGlucJour}g G
      </div>

      <h2 className="text-center font-bold mb-2">{day}</h2>

      {repasTypes.map((type) => {
  const repas = dayMenu.find((r) => r.repasType === type);
  const isCollation = type === "collation";

  // Si pas de repas du tout, on ne rend rien
  if (!repas) {
    return null;
  }

  // non prévu pour tout sauf collation
  if (!isCollation && !repas.recette) {
    return (
      <div key={type} className="mb-4 text-gray-400 text-center">
        <p className="text-xs font-semibold">{type.toUpperCase()}</p>
        <p>(non prévu)</p>
      </div>
    );
  }

  // collation sans recette …
  // …


        // collation sans recette
        if (isCollation && !repas?.recette) {
          const remainingAllowed = [
            "DAIRY",
            "BREAKFAST_PROTEIN",
            "FRUIT_SIDE",
            "FAT",
          ];
          const addedSides = repas?.accompagnements ?? [];
          const obj = {
            p: user.poids * 1.8 * repartitionRepas["collation"],
            f: (user.metabolismeCible * 0.3 / 9) * repartitionRepas["collation"],
            g:
              ((user.metabolismeCible -
                user.poids * 1.8 * 4 -
                user.metabolismeCible * 0.3) /
                4) *
              repartitionRepas["collation"],
          };
          const consumed = addedSides.reduce(
            (s, a) => ({
              p: s.p + a.ingredient.protein * (a.quantity / 100),
              f: s.f + a.ingredient.fat * (a.quantity / 100),
              g: s.g + a.ingredient.carbs * (a.quantity / 100),
              c: s.c + a.ingredient.calories * (a.quantity / 100),
            }),
            { p: 0, f: 0, g: 0, c: 0 }
          );

          return (
            <div key={type} className="mb-4">
              <p className="text-xs font-semibold text-gray-500">COLLATION</p>

              {/* dropdowns collation */}
              <div className="w-full bg-gray-50 p-3 rounded text-xs mb-2">
                {remainingAllowed.map((t) => {
                  const items = ["DAIRY", "FAT", "FRUIT_SIDE"].includes(t)
                    ? allIngredients
                    : proteinRichOptions;
                  return (
                    <div key={t} className="mb-2">
                      <label className="block mb-1 font-medium">
                        {t === "DAIRY"
                          ? "Produit laitier (100g)"
                          : t === "FAT"
                          ? "Source de lipide"
                          : t === "FRUIT_SIDE"
                          ? "Fruit (100g)"
                          : "Source de protéine"}
                      </label>
                      <select
                        className="w-full border rounded p-1"
                        value={accompagnementsChoisis[repas.id]?.[t] || ""}
                        onChange={(e) =>
                          setAccompagnementsChoisis((prev) => ({
                            ...prev,
                            [repas.id]: {
                              ...prev[repas.id],
                              [t]: e.target.value,
                            },
                          }))
                        }
                      >
                        <option value="">— Choisir —</option>
                        {items
                          .filter((i) =>
                            Array.isArray(i.sideTypes)
                              ? i.sideTypes.some((st) =>
                                  typeof st === "string"
                                    ? st === t
                                    : st.sideType === t
                                )
                              : false
                          )
                          .map((i) => (
                            <option key={i.id} value={i.id}>
                              {i.name} ({i.protein}g P/100g)
                            </option>
                          ))}
                      </select>
                    </div>
                  );
                })}

                <button
                  onClick={() => {
                    applyAccompagnements(
                      repas,
                      accompagnementsChoisis[repas.id] || {}
                    );
                    setAccompagnementsChoisis((prev) => ({
                      ...prev,
                      [repas.id]: {},
                    }));
                  }}
                  className="mt-2 w-full bg-green-500 text-white rounded py-1 text-sm"
                >
                  ➕ Ajouter à la collation
                </button>
              </div>

              {/* accompagnements existants collation */}
              {addedSides.length > 0 && (
                <div className="w-full mt-2 bg-gray-50 p-2 rounded text-xs">
                  {addedSides.map((a) => (
                    <div
                      key={a.id}
                      className="flex justify-between items-center mb-1"
                    >
                      <span>
                        {a.ingredient.name} — {a.quantity}g
                      </span>
                      <button
                        onClick={() => removeAccompagnements(repas)}
                        className="underline text-red-500 text-xs"
                      >
                        Annuler
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* objectifs & consommé collation */}
              <div className="text-xs text-gray-700 text-center mt-2">
                Objectif : {Math.round(obj.p)}g P · {Math.round(obj.f)}g L ·{" "}
                {Math.round(obj.g)}g G
                <br />
                Consommé : {Math.round(consumed.p)}g P ·{" "}
                {Math.round(consumed.f)}g L · {Math.round(consumed.g)}g G
                <br />
                ≃ {Math.round(consumed.c)} kcal
              </div>
            </div>
          );
        }

        // repas avec recette
        const recipe = repas.recette;
        const addedSides = repas?.accompagnements ?? [];
                const allowed = isCollation
          ? ["BREAKFAST_PROTEIN", "DAIRY", "FRUIT_SIDE", "FAT"]
          : (recipe.allowedSides || []).map((a) => a.sideType);
        const remainingAllowed = allowed.filter((t) =>
          !addedSides.some((a) =>
            (a.ingredient.sideTypes || [])
              .map((st) => (typeof st === "string" ? st : st.sideType))
              .includes(t)
          )
        );
        const rfType = recipeRfMap[repas.id] || 1;

        const ingredientsList = recipe.ingredients.map((ri) => {
          const baseQty = Math.round(ri.quantity * rfType);
          const isDairy = ri.ingredient.sideTypes
            .map((st) => (typeof st === "string" ? st : st.sideType))
            .includes("DAIRY");
          const displayQty = isDairy ? Math.min(baseQty, 150) : baseQty;
          return (
            <li key={ri.ingredient.id} className="mb-1">
              {ri.ingredient.name} — {displayQty}{ri.ingredient.unit}
            </li>
          );
        });

        const rawMeal = recipe.ingredients.reduce(
          (sum, ri) => ({
            p: sum.p + ri.ingredient.protein * (ri.quantity * rfType) / 100,
            f: sum.f + ri.ingredient.fat * (ri.quantity * rfType) / 100,
            g: sum.g + ri.ingredient.carbs * (ri.quantity * rfType) / 100,
            c: sum.c + ri.ingredient.calories * (ri.quantity * rfType) / 100,
          }),
          { p: 0, f: 0, g: 0, c: 0 }
        );
        const sideTotals = addedSides.reduce(
          (sum, a) => ({
            p: sum.p + a.ingredient.protein * (a.quantity / 100),
            f: sum.f + a.ingredient.fat * (a.quantity / 100),
            g: sum.g + a.ingredient.carbs * (a.quantity / 100),
            c: sum.c + a.ingredient.calories * (a.quantity / 100),
          }),
          { p: 0, f: 0, g: 0, c: 0 }
        );
        const consumedP = Math.round(rawMeal.p + sideTotals.p);
        const consumedF = Math.round(rawMeal.f + sideTotals.f);
        const consumedG = Math.round(rawMeal.g + sideTotals.g);
        const consumedC = Math.round(rawMeal.c + sideTotals.c);
        const objMeal = {
          p: user.poids * 1.8 * repartitionRepas[type],
          f: (user.metabolismeCible * 0.3 / 9) * repartitionRepas[type],
          g:
            ((user.metabolismeCible -
              user.poids * 1.8 * 4 -
              user.metabolismeCible * 0.3) /
              4) *
            repartitionRepas[type],
        };

        return (
          <div key={type} className="mb-4">
            <p className="text-xs font-semibold text-gray-500">
              {type.toUpperCase()}
            </p>
            {recipe.photoUrl && (
              <img
                src={recipe.photoUrl}
                alt={recipe.name}
                className="w-full h-24 object-cover rounded mb-1"
              />
            )}
            <p className="text-center text-sm font-medium mb-1">
              {recipe.name}
            </p>
            <button
              onClick={() => openModal(repas)}
              className="text-xs text-blue-500 hover:underline mr-4"
            >
              ✏️ Changer de recette
            </button>
            <button
              onClick={() => recalcRecipeRf(repas)}
              className="text-xs text-blue-500 hover:underline"
            >
              🔄 Ajuster les quantités de la recette
            </button>

            <ul className="list-disc ml-4 mt-2 text-xs text-gray-700">
              {ingredientsList}
            </ul>

            <div className="text-xs text-gray-700 mt-2 text-center">
              Objectif : {Math.round(objMeal.p)}g P / {Math.round(objMeal.f)}g L /{" "}
              {Math.round(objMeal.g)}g G
              <br />
              Consommé : {consumedP}g P / {consumedF}g L / {consumedG}g G
              <br />
              ≃ {consumedC} kcal
            </div>

            {addedSides.length > 0 && (
              <div className="w-full mt-2 bg-gray-50 p-2 rounded text-xs">
                {addedSides.map((a) => (
                  <div
                    key={a.id}
                    className="flex justify-between items-center mb-1"
                  >
                    <span>
                      {a.ingredient.name} — {a.quantity}g
                    </span>
                    <button
                      onClick={() => removeAccompagnements(repas)}
                      className="underline text-red-500 text-xs"
                    >
                      Annuler
                    </button>
                  </div>
                ))}
              </div>
            )}

            {remainingAllowed.length > 0 && (
              <div className="w-full mt-2 bg-gray-50 p-3 rounded text-xs">
                {remainingAllowed.map((t) => {
                  const items = ["DAIRY","VEGETABLE_SIDE","FRUIT_SIDE","BREAKFAST_PROTEIN"].includes(t)
                    ? allIngredients
                    : proteinRichOptions;
                  return (
                    <div key={t} className="mb-2">
                      <label className="block mb-1 font-medium">
                        {t === "DAIRY"
                          ? "Produit laitier (100g)"
                          : t === "BREAKFAST_PROTEIN"
                          ? "Source de protéine"
                          : t === "VEGETABLE_SIDE"
                          ? "Légume (150g)"
                          : t === "FRUIT_SIDE"
                          ? "Fruit (100g)"
                          : t === "FAT"
                          ? "Source de lipide"
                          : t}
                      </label>
                      <select
                        className="w-full border rounded p-1"
                        value={accompagnementsChoisis[repas.id]?.[t] || ""}
                        onChange={(e) =>
                          setAccompagnementsChoisis((prev) => ({
                            ...prev,
                            [repas.id]: {
                              ...prev[repas.id],
                              [t]: e.target.value,
                            },
                          }))
                        }
                      >
                        <option value="">— Choisir —</option>
                        {items
                          .filter((i) =>
                            Array.isArray(i.sideTypes)
                              ? i.sideTypes.some((st) =>
                                  typeof st === "string"
                                    ? st === t
                                    : st.sideType === t
                                )
                              : false
                          )
                          .map((i) => (
                            <option key={i.id} value={i.id}>
                              {i.name} ({i.protein}g P/100g)
                            </option>
                          ))}
                      </select>
                    </div>
                  );
                })}

                <button
                  onClick={() => {
                    applyAccompagnements(
                      repas,
                      accompagnementsChoisis[repas.id] || {}
                    );
                    setAccompagnementsChoisis((prev) => ({
                      ...prev,
                      [repas.id]: {},
                    }));
                  }}
                  className="mt-2 w-full bg-green-500 text-white rounded py-1 text-sm"
                >
                  ➕ Ajouter accompagnements
                </button>
              </div>
            )}
          </div>
        );
      })}
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

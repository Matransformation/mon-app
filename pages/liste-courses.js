import { useSession } from "next-auth/react"; // Ajoute cette ligne
import { useEffect, useState } from "react";
import Link from "next/link";
import { format, endOfWeek } from "date-fns";
import { fr } from "date-fns/locale";
import useMenu from "../hooks/useMenu";
import Navbar from "../components/Navbar"; // Assure-toi que le chemin est correct

export default function ListeCoursesPage() {
  const { menu, loading, weekStart, prevWeek, nextWeek } = useMenu();
  const [shoppingList, setShoppingList] = useState({});
  const [checkedItems, setCheckedItems] = useState({});

  // Charger les cases cochées depuis localStorage
  useEffect(() => {
    const saved = localStorage.getItem("shoppingListChecked");
    if (saved) {
      setCheckedItems(JSON.parse(saved));
    }
  }, []);

  // Sauvegarder à chaque changement
  useEffect(() => {
    localStorage.setItem(
      "shoppingListChecked",
      JSON.stringify(checkedItems)
    );
  }, [checkedItems]);

  // Filtrer & générer la liste de courses
  useEffect(() => {
    if (!loading) {
      const filtered = menu.filter((item) => {
        const d = new Date(item.date);
        return (
          d >= weekStart &&
          d <= endOfWeek(weekStart, { weekStartsOn: 1 })
        );
      });
      setShoppingList(generateShoppingList(filtered));
    }
  }, [loading, menu, weekStart]);

  function generateShoppingList(menuItems) {
    const mapByType = {};
    menuItems.forEach((item) => {
      if (item.recette) {
        item.recette.ingredients.forEach((ri) => {
          const ing = ri.ingredient;
          const qty = ri.quantity;
          const unit = ing.unit || "";
          const type =
            ing.type ||
            ing.category ||
            ing.sideTypes?.[0]?.sideType ||
            "Autre";
          mapByType[type] ??= {};
          mapByType[type][ing.id] ??= {
            id: ing.id,
            name: ing.name,
            quantity: 0,
            unit,
          };
          mapByType[type][ing.id].quantity += qty;
        });
      }
      (item.accompagnements || []).forEach((a) => {
        const ing = a.ingredient;
        const qty = a.quantity;
        const unit = ing.unit || "";
        const type =
          ing.type ||
          ing.category ||
          ing.sideTypes?.[0]?.sideType ||
          "Autre";
        mapByType[type] ??= {};
        mapByType[type][ing.id] ??= {
          id: ing.id,
          name: ing.name,
          quantity: 0,
          unit,
        };
        mapByType[type][ing.id].quantity += qty;
      });
    });

    const result = {};
    Object.entries(mapByType).forEach(([type, ingMap]) => {
      result[type] = Object.values(ingMap).map((i) => ({
        ...i,
        quantity: Math.round(i.quantity),
      }));
    });
    return result;
  }

  function slugify(str) {
    return str
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");
  }

  const typeLabels = {
    PROTEIN: "Protéines",
    CARB: "Glucides",
    FAT: "Lipides",
    DAIRY: "Produits laitiers",
    VEGETABLE_SIDE: "Légumes",
    FRUIT_SIDE: "Fruits",
    STARCH_SIDE: "Féculents",
    Autre: "Autre",
  };

  if (loading) {
    return <div className="p-6">Chargement de la liste…</div>;
  }

  return (
    <>
      <Navbar /> {/* Ajoute Navbar ici */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <Link href="/menu" legacyBehavior>
            <a className="text-blue-500">← Retour au menu</a>
          </Link>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            🖨️ Imprimer
          </button>
        </div>

        <h1 className="text-2xl font-bold mb-2">🛒 Ma liste de courses</h1>
        <div className="flex space-x-4 mb-4">
          <button
            onClick={prevWeek}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            ← Semaine précédente
          </button>
          <button
            onClick={nextWeek}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Semaine suivante →
          </button>
        </div>
        <p className="mb-6 text-gray-700">
          Semaine du{" "}
          <span className="font-semibold">
            {format(weekStart, "d MMMM yyyy", { locale: fr }).toUpperCase()}
          </span>{" "}
          au{" "}
          <span className="font-semibold">
            {format(endOfWeek(weekStart, { weekStartsOn: 1 }), "d MMMM yyyy", {
              locale: fr,
            }).toUpperCase()}
          </span>
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(shoppingList).map(([type, items]) => (
            <section key={type} className="bg-white p-4 rounded shadow">
              <h2 className="text-xl font-semibold mb-3">
                {typeLabels[type] || typeLabels.Autre}
              </h2>
              <ul className="space-y-2">
                {items.map((i) => {
                  const anchor = `ingredient-${slugify(i.name)}`;
                  return (
                    <li key={i.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={!!checkedItems[i.id]}
                        onChange={(e) =>
                          setCheckedItems((prev) => ({
                            ...prev,
                            [i.id]: e.target.checked,
                          }))
                        }
                        className="mr-2"
                      />
                      <a
                        href={`#${anchor}`}
                        className="text-blue-500 hover:underline flex-1"
                      >
                        {i.name}
                      </a>
                      <span className="ml-2 font-medium">
                        {i.quantity}
                        {i.unit}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </>
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

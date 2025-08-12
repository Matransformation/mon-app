// pages/liste-courses.js
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { format, endOfWeek } from "date-fns";
import { fr } from "date-fns/locale";
import { useSession } from "next-auth/react";
import useMenu from "../hooks/useMenu";
import Navbar from "../components/Navbar";
import withAuthProtection from "../lib/withAuthProtection";

function ListeCoursesPage() {
  const { menu, loading, weekStart, prevWeek, nextWeek } = useMenu();
  const { data: session } = useSession();

  const [shoppingList, setShoppingList] = useState({});
  const [checkedItems, setCheckedItems] = useState({});
  const [hideChecked, setHideChecked] = useState(false);
  const [query, setQuery] = useState("");
  const [collapsed, setCollapsed] = useState({});
  const [exporting, setExporting] = useState(false);
  const listRef = useRef(null);

  // ------- Storage key par utilisateur + semaine ----------
  const storageKey = useMemo(() => {
    const uid = session?.user?.id ?? "anon";
    const wk = format(weekStart, "yyyy-MM-dd");
    return `shoppingListChecked:${uid}:${wk}`;
  }, [session?.user?.id, weekStart]);

  // Charger les cases cochées pour CETTE semaine / CET utilisateur (avec reset préalable)
  useEffect(() => {
    if (typeof window === "undefined") return;
    setCheckedItems({});
    try {
      const saved =
        localStorage.getItem(storageKey) ??
        localStorage.getItem("shoppingListChecked"); // migration depuis ancienne clé
      setCheckedItems(saved ? JSON.parse(saved) : {});
    } catch {
      setCheckedItems({});
    }
  }, [storageKey]);

  // Sauvegarder à chaque changement sur la clé namespacée
  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(storageKey, JSON.stringify(checkedItems));
  }, [checkedItems, storageKey]);

  // Génère la liste (semaine visible)
  useEffect(() => {
    if (loading) return;
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
    const filtered = menu.filter((item) => {
      const d = new Date(item.date);
      return d >= weekStart && d <= weekEnd;
    });
    setShoppingList(generateShoppingList(filtered));
  }, [loading, menu, weekStart]);

  // ---------- Utils ----------
  function generateShoppingList(menuItems) {
    const mapByType = {};
    menuItems.forEach((item) => {
      if (item.recette) {
        (item.recette.ingredients || []).forEach((ri) => {
          if (!ri?.ingredient) return;
          const ing = ri.ingredient;
          const qty = ri.quantity || 0;
          const unit = ing.unit || "";
          const type =
            ing.type || ing.category || ing.sideTypes?.[0]?.sideType || "Autre";
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
        if (!a?.ingredient) return;
        const ing = a.ingredient;
        const qty = a.quantity || 0;
        const unit = ing.unit || "";
        const type =
          ing.type || ing.category || ing.sideTypes?.[0]?.sideType || "Autre";
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
    return str.toLowerCase().replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-");
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

  const typeOrder = [
    "VEGETABLE_SIDE",
    "FRUIT_SIDE",
    "PROTEIN",
    "DAIRY",
    "CARB",
    "STARCH_SIDE",
    "FAT",
    "Autre",
  ];

  // Filtrage par recherche + masquage cochés
  const filteredList = useMemo(() => {
    const q = query.trim().toLowerCase();
    const out = {};
    Object.entries(shoppingList).forEach(([type, items]) => {
      let arr = items;
      if (q) {
        arr = arr.filter(
          (i) =>
            i.name?.toLowerCase().includes(q) ||
            i.unit?.toLowerCase().includes(q)
        );
      }
      if (hideChecked) {
        arr = arr.filter((i) => !checkedItems[String(i.id)]);
      }
      if (arr.length) out[type] = arr;
    });
    return out;
  }, [shoppingList, query, hideChecked, checkedItems]);

  // Stats & progression
  const { totalCount, checkedCount } = useMemo(() => {
    let total = 0;
    let checked = 0;
    Object.values(filteredList).forEach((items) => {
      items.forEach((i) => {
        total += 1;
        if (checkedItems[String(i.id)]) checked += 1;
      });
    });
    return { totalCount: total, checkedCount: checked };
  }, [filteredList, checkedItems]);

  const progressPct = totalCount ? Math.round((checkedCount / totalCount) * 100) : 0;

  // Actions bulk
  const checkAllVisible = () => {
    const next = { ...checkedItems };
    Object.values(filteredList).forEach((items) => {
      items.forEach((i) => (next[String(i.id)] = true));
    });
    setCheckedItems(next);
  };

  const uncheckAllVisible = () => {
    const next = { ...checkedItems };
    Object.values(filteredList).forEach((items) => {
      items.forEach((i) => delete next[String(i.id)]);
    });
    setCheckedItems(next);
  };

  const toggleCollapse = (type) =>
    setCollapsed((c) => ({ ...c, [type]: !c[type] }));

  // ---- EXPORT PDF ----
  const exportPDF = async () => {
    if (!listRef.current) return;
    setExporting(true);
    try {
      const [{ jsPDF }, html2canvas] = await Promise.all([
        import("jspdf"),
        import("html2canvas").then((m) => m.default || m),
      ]);

      const node = listRef.current;
      const canvas = await html2canvas(node, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
        logging: false,
        windowWidth: document.documentElement.scrollWidth,
      });

      const pdf = new jsPDF("p", "mm", "a4");
      const margin = 10;
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const contentW = pageW - margin * 2;

      const scale = contentW / canvas.width;
      const pageContentHpx = Math.floor((pageH - margin * 2) / scale);

      const pageCanvas = document.createElement("canvas");
      pageCanvas.width = canvas.width;
      const pageCtx = pageCanvas.getContext("2d");

      let yPx = 0;
      let pageIndex = 0;
      while (yPx < canvas.height) {
        const slicePx = Math.min(pageContentHpx, canvas.height - yPx);
        pageCanvas.height = slicePx;
        pageCtx.clearRect(0, 0, pageCanvas.width, pageCanvas.height);
        pageCtx.drawImage(
          canvas,
          0,
          yPx,
          canvas.width,
          slicePx,
          0,
          0,
          pageCanvas.width,
          slicePx
        );
        const imgData = pageCanvas.toDataURL("image/png");
        if (pageIndex > 0) pdf.addPage();
        pdf.addImage(
          imgData,
          "PNG",
          margin,
          margin,
          contentW,
          slicePx * scale,
          undefined,
          "FAST"
        );
        yPx += slicePx;
        pageIndex++;
      }

      const start = format(weekStart, "yyyy-MM-dd");
      const end = format(endOfWeek(weekStart, { weekStartsOn: 1 }), "yyyy-MM-dd");
      pdf.save(`liste-courses_${start}_${end}.pdf`);
    } catch (e) {
      console.error("Export PDF échoué:", e);
      alert("Désolé, l’export PDF a échoué. Regarde la console pour le détail.");
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-8">Chargement de la liste…</div>
      </>
    );
  }

  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });

  return (
    <>
      <Navbar />
      {/* Header gradient ORANGE */}
      <div className="bg-gradient-to-r from-orange-400 to-rose-400">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold">🛒 Ma liste de courses</h1>
              <p className="text-white/90">
                Semaine du{" "}
                <span className="font-semibold">
                  {format(weekStart, "d MMMM yyyy", { locale: fr }).toUpperCase()}
                </span>{" "}
                au{" "}
                <span className="font-semibold">
                  {format(weekEnd, "d MMMM yyyy", { locale: fr }).toUpperCase()}
                </span>
              </p>
            </div>

            {/* Toolbar */}
            <div className="print:hidden flex flex-wrap items-center gap-2">
              <Link
                href="/menu"
                className="px-3 py-2 rounded-lg bg-white text-orange-700 shadow hover:shadow-md"
              >
                ← Retour au menu
              </Link>
              <button
                onClick={prevWeek}
                className="px-3 py-2 rounded-lg bg-white text-orange-700 shadow hover:shadow-md"
              >
                ← Semaine précédente
              </button>
              <button
                onClick={nextWeek}
                className="px-3 py-2 rounded-lg bg-white text-orange-700 shadow hover:shadow-md"
              >
                Semaine suivante →
              </button>

              <button
                onClick={exportPDF}
                disabled={exporting}
                className={`px-3 py-2 rounded-lg ${
                  exporting
                    ? "bg-orange-400 text-white opacity-80"
                    : "bg-orange-600 text-white hover:bg-orange-700"
                } shadow`}
                title="Exporter en PDF"
              >
                {exporting ? "Export…" : "📄 Export PDF"}
              </button>

              <button
                onClick={() => window.print()}
                className="px-3 py-2 rounded-lg bg-white text-orange-700 shadow hover:shadow-md"
              >
                🖨️ Imprimer
              </button>
            </div>
          </div>

          {/* Barre de progression */}
          <div className="mt-4 bg-white/60 rounded-xl p-3">
            <div className="flex justify-between text-sm mb-2 text-orange-900">
              <span>
                {checkedCount}/{totalCount} articles cochés
              </span>
              <span>{progressPct}%</span>
            </div>
            <div className="h-2 bg-orange-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-600"
                style={{ width: `${progressPct}%` }}
                aria-hidden
              />
            </div>
          </div>

          {/* Recherche + actions rapides */}
          <div className="mt-4 flex flex-col md:flex-row gap-3 print:hidden">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un ingrédient…"
              className="flex-1 rounded-xl px-4 py-2 bg-white shadow focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 placeholder-gray-500"
            />
            <div className="flex items-center gap-2">
              <button
                onClick={() => setHideChecked((v) => !v)}
                className={`px-3 py-2 rounded-xl shadow ${
                  hideChecked ? "bg-orange-600 text-white" : "bg-white text-orange-700"
                }`}
              >
                {hideChecked ? "Afficher cochés" : "Masquer cochés"}
              </button>
              <button
                onClick={checkAllVisible}
                className="px-3 py-2 rounded-xl bg-white text-orange-700 shadow hover:shadow-md"
              >
                Tout cocher
              </button>
              <button
                onClick={uncheckAllVisible}
                className="px-3 py-2 rounded-xl bg-white text-orange-700 shadow hover:shadow-md"
              >
                Tout décocher
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu exportable */}
      <div ref={listRef} className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            ...typeOrder.filter((t) => filteredList[t]),
            // ajoute types restants non prévus dans l'ordre
            ...Object.keys(filteredList).filter((t) => !typeOrder.includes(t)),
          ].map((type) => {
            const items = filteredList[type] || [];
            const remaining = items.filter((i) => !checkedItems[String(i.id)])
              .length;

            return (
              <section
                key={type}
                className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 overflow-hidden"
              >
                {/* Entête section */}
                <button
                  onClick={() => toggleCollapse(type)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-orange-50"
                >
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold">
                      {typeLabels[type] || type}
                    </h2>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white ring-1 ring-orange-200">
                      {remaining}/{items.length}
                    </span>
                  </div>
                  <span
                    className={`transition-transform ${
                      collapsed[type] ? "rotate-180" : ""
                    }`}
                    aria-hidden
                  >
                    ▾
                  </span>
                </button>

                {/* Liste d’items */}
                {!collapsed[type] && (
                  <ul className="divide-y divide-gray-100">
                    {items.map((i) => {
                      const anchor = `ingredient-${slugify(i.name)}`;
                      const idKey = String(i.id);
                      const checked = !!checkedItems[idKey];
                      return (
                        <li key={idKey} className="flex items-center gap-3 px-4 py-3">
                          <input
                            id={`chk-${idKey}`}
                            type="checkbox"
                            checked={checked}
                            onChange={(e) =>
                              setCheckedItems((prev) => ({
                                ...prev,
                                [idKey]: e.target.checked,
                              }))
                            }
                            className="h-5 w-5 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                          />
                          <label
                            htmlFor={`chk-${idKey}`}
                            className={`flex-1 cursor-pointer ${
                              checked ? "line-through text-gray-400" : "text-gray-800"
                            }`}
                          >
                            <a
                              href={`#${anchor}`}
                              className="hover:underline"
                              onClick={(e) => e.preventDefault()}
                              title={i.name}
                            >
                              {i.name}
                            </a>
                          </label>
                          <span className="ml-2 font-medium text-gray-700">
                            {i.quantity}
                            {i.unit}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>
            );
          })}
        </div>

        {/* Message vide */}
        {Object.keys(filteredList).length === 0 && (
          <p className="text-center text-gray-500 mt-10">
            Aucune entrée pour cette semaine (ou tous les items sont masqués).
          </p>
        )}
      </div>

      {/* Styles impression */}
      <style jsx global>{`
        @media print {
          nav,
          .print\\:hidden {
            display: none !important;
          }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          a[href]:after {
            content: "";
          }
        }
      `}</style>
    </>
  );
}

export default withAuthProtection(ListeCoursesPage);

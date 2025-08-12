// pages/recettes/[id].js
import { useRouter } from "next/router";
import { useState, useEffect, useMemo, useRef } from "react";
import axios from "axios";
import { Heart, Printer, Download, Share2, Users, Utensils } from "lucide-react";
import { useSession } from "next-auth/react";
import Navbar from "../../components/Navbar";
import withAuthProtection from "../../lib/withAuthProtection";
import Image from "next/image";
import Head from "next/head";

function RecetteDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { data: session } = useSession();

  const [recette, setRecette] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavori, setIsFavori] = useState(false);
  const [servings, setServings] = useState(null);
  const [exporting, setExporting] = useState(false);
  const pdfRef = useRef(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res = await axios.get(`/api/recettes/${id}`);
        setRecette(res.data);
      } catch (e) {
        console.error("Erreur chargement recette :", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  useEffect(() => {
    if (!session?.user?.id || !id) return;
    axios
      .get(`/api/utilisateur/${session.user.id}/favoris`)
      .then((res) => {
        const ids = (res.data || []).map((r) => String(r.id));
        setIsFavori(ids.includes(String(id)));
      })
      .catch((err) => console.error("Erreur favoris :", err));
  }, [session, id]);

  useEffect(() => {
    if (recette?.servings && servings == null) setServings(recette.servings);
  }, [recette, servings]);

  const handleAddToFavorites = async () => {
    if (!session?.user?.id) return alert("Connecte-toi pour enregistrer des favoris.");
    try {
      if (isFavori) {
        await axios.delete(`/api/utilisateur/${session.user.id}/favoris`, { data: { recetteId: id } });
        setIsFavori(false);
      } else {
        await axios.post(`/api/utilisateur/${session.user.id}/favoris`, { recetteId: id });
        setIsFavori(true);
      }
    } catch (err) {
      console.error("Erreur favoris :", err);
    }
  };

  const handlePrint = () => window.print();

  // Export PDF : 1 page. Affiche temporairement les blocs .pdf-only pour la capture.
  const exportPDF = async () => {
    if (!pdfRef.current || !recette) return;
    setExporting(true);
    const cover = document.getElementById("pdf-cover-image");
    const pdfHeader = document.getElementById("pdf-header");
    try {
      const [{ jsPDF }, html2canvas] = await Promise.all([
        import("jspdf"),
        import("html2canvas").then((m) => m.default || m),
      ]);

      // montrer les blocs pdf-only le temps de la capture
      if (cover) cover.style.display = "block";
      if (pdfHeader) pdfHeader.style.display = "block";
      await new Promise((r) => requestAnimationFrame(r));

      const node = pdfRef.current;
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
      const maxW = pageW - margin * 2;
      const maxH = pageH - margin * 2;

      const r = Math.min(maxW / canvas.width, maxH / canvas.height);
      const w = canvas.width * r;
      const h = canvas.height * r;
      const x = (pageW - w) / 2;
      const y = (pageH - h) / 2;

      pdf.addImage(canvas.toDataURL("image/png"), "PNG", x, y, w, h, undefined, "FAST");
      const safeName = (recette.name || "recette").replace(/[^\w\- ]+/g, "").replace(/\s+/g, "_");
      pdf.save(`${safeName}.pdf`);
    } catch (e) {
      console.error("Export PDF échoué:", e);
      alert("Désolé, l’export PDF a échoué.");
    } finally {
      // re-cacher les blocs pdf-only à l’écran
      if (cover) cover.style.display = "none";
      if (pdfHeader) pdfHeader.style.display = "none";
      setExporting(false);
    }
  };

  const handleShare = () => {
    if (!recette) return;
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      navigator.share({ title: recette.name, text: "Découvre cette super recette !", url });
    } else {
      navigator.clipboard.writeText(url);
      alert("Lien copié !");
    }
  };

  // Helpers
  const ratio = useMemo(() => {
    if (!recette?.servings || !servings) return 1;
    return (servings || 1) / recette.servings;
  }, [recette?.servings, servings]);

  const fmtQty = (q) => {
    const n = Number(q);
    if (Number.isNaN(n)) return q;
    if (n % 1 === 0) return String(n);
    return (Math.round(n * 10) / 10).toString().replace(".", ",");
  };

  const scaledIngredients = useMemo(() => {
    if (!recette?.ingredients) return [];
    return recette.ingredients.map((ri) => ({
      ...ri,
      quantity: ri.quantity ? ri.quantity * ratio : ri.quantity,
    }));
  }, [recette?.ingredients, ratio]);

  const macros = useMemo(() => {
    if (!recette?.ingredients) return { calories: 0, protein: 0, fat: 0, carbs: 0 };
    const sum = recette.ingredients.reduce(
      (acc, ri) => {
        const r100 = ((ri.quantity || 0) * ratio) / 100;
        const ing = ri.ingredient || {};
        acc.calories += (ing.calories || 0) * r100;
        acc.protein += (ing.protein || 0) * r100;
        acc.fat += (ing.fat || 0) * r100;
        acc.carbs += (ing.carbs || 0) * r100;
        return acc;
      },
      { calories: 0, protein: 0, fat: 0, carbs: 0 }
    );
    return {
      calories: Math.round(sum.calories),
      protein: Math.round(sum.protein),
      fat: Math.round(sum.fat),
      carbs: Math.round(sum.carbs),
    };
  }, [recette?.ingredients, ratio]);

  if (loading) return <div className="text-center mt-10">Chargement…</div>;
  if (!recette) return <div className="text-center mt-10">Recette introuvable.</div>;

  // JSON-LD Recipe
  const recipeLD = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: recette.name,
    image: recette.photoUrl || "/images/placeholder.png",
    description: recette.description || `Découvrez cette recette de ${recette.name}`,
    recipeYield: `${servings ?? recette.servings} portion${(servings ?? recette.servings) > 1 ? "s" : ""}`,
    prepTime: recette.prepTimeISO || "PT10M",
    cookTime: recette.cookTimeISO || "PT15M",
    totalTime: recette.totalTimeISO || undefined,
    recipeCategory: recette.categoryName || "Plat",
    recipeCuisine: recette.cuisine || "Française",
    author: { "@type": "Person", name: "Clémence et Romain" },
    keywords: (recette.categories || [])
      .map((c) => c.category?.name || c.name)
      .concat(["recette équilibrée", "MaTransformation"])
      .join(", "),
    recipeIngredient: scaledIngredients.map((ri) =>
      `${fmtQty(ri.quantity)} ${ri.unit || ""} ${ri.ingredient?.name || ""}`.trim()
    ),
    recipeInstructions: (recette.steps || []).map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      text: s.step,
    })),
    nutrition: {
      "@type": "NutritionInformation",
      calories: `${macros.calories} kcal`,
      proteinContent: `${macros.protein} g`,
      fatContent: `${macros.fat} g`,
      carbohydrateContent: `${macros.carbs} g`,
    },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>{recette.name} | MaTransformation</title>
        <meta name="description" content={`Découvrez cette recette de ${recette.name}`} />
        <meta property="og:title" content={`${recette.name} | MaTransformation`} />
        <meta property="og:description" content={`Découvrez cette recette de ${recette.name}`} />
        <meta property="og:image" content={recette.photoUrl || "/images/placeholder.png"} />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href={`https://matransformation.fr/recettes/${id}`} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(recipeLD) }} />
      </Head>

      <Navbar />

      {/* HEADER (écran) */}
      <header className="bg-white no-print">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">{recette.name}</h1>
            {recette.servings && (
              <p className="text-gray-500 mt-1 flex items-center gap-2">
                <Users size={18} /> Pour {servings ?? recette.servings} personne
                {(servings ?? recette.servings) > 1 ? "s" : ""}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={handleAddToFavorites} className="p-3 rounded-full bg-white border hover:bg-gray-50 shadow-sm" title={isFavori ? "Retirer des favoris" : "Ajouter aux favoris"} aria-label="Favori">
              <Heart className={isFavori ? "text-red-600 fill-red-600" : "text-red-500"} />
            </button>
            <button onClick={handlePrint} className="p-3 rounded-full bg-white border hover:bg-gray-50 shadow-sm" title="Imprimer">
              <Printer className="text-gray-800" />
            </button>
            <button onClick={exportPDF} disabled={exporting} className="p-3 rounded-full bg-white border hover:bg-gray-50 shadow-sm disabled:opacity-60" title="Télécharger en PDF">
              <Download className="text-gray-800" />
            </button>
            <button onClick={handleShare} className="p-3 rounded-full bg-white border hover:bg-gray-50 shadow-sm" title="Partager">
              <Share2 className="text-gray-800" />
            </button>
          </div>
        </div>
      </header>

      {/* HERO (écran, non imprimé) */}
      <div className="recipe-hero relative w-full h-[56vh] overflow-hidden no-print">
        <Image
          src={recette.photoUrl || "/images/placeholder.png"}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover scale-110 blur-xl opacity-60"
          aria-hidden
        />
        <div className="absolute inset-0 flex items-center justify-center px-4">
          <div className="relative w-full max-w-5xl aspect-[16/9] bg-white/10 rounded-2xl ring-1 ring-white/30 shadow-2xl overflow-hidden">
            <Image
              src={recette.photoUrl || "/images/placeholder.png"}
              alt={recette.name}
              fill
              sizes="(max-width: 1024px) 100vw, 1024px"
              className="object-contain"
              priority
            />
          </div>
        </div>
      </div>

      {/* BARRE STICKY (écran) */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-gray-100 no-print">
        <div className="max-w-5xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 text-sm font-medium text-gray-700">
              <Utensils size={16} />
              Portions
            </span>
            <div className="flex items-center border rounded-lg overflow-hidden">
              <button onClick={() => setServings((s) => Math.max(1, (s ?? recette.servings) - 1))} className="px-3 py-1.5 hover:bg-gray-50" aria-label="Diminuer">–</button>
              <input type="number" min={1} value={servings ?? recette.servings} onChange={(e) => setServings(Math.max(1, Number(e.target.value) || 1))} className="w-14 text-center outline-none py-1.5" />
              <button onClick={() => setServings((s) => (s ?? recette.servings) + 1)} className="px-3 py-1.5 hover:bg-gray-50" aria-label="Augmenter">+</button>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="px-3 py-1 rounded-full bg-orange-50 text-orange-700">🔥 {macros.calories} kcal</span>
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700">🍗 {macros.protein} g prot.</span>
            <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700">🧈 {macros.fat} g lip.</span>
            <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-700">🍞 {macros.carbs} g gluc.</span>
          </div>
        </div>
      </div>

      {/* CONTENU EXPORTABLE (sans image écran) */}
      <div ref={pdfRef} className="max-w-5xl mx-auto p-6">
        {/* Header compact + macros (PDF/print uniquement) */}
        <div id="pdf-header" className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-6 mb-6 pdf-only" style={{ display: "none" }}>
          <h2 className="text-2xl font-bold text-gray-900">{recette.name}</h2>
          {recette.servings && (
            <p className="text-gray-600 mt-1">
              Pour {servings ?? recette.servings} personne{(servings ?? recette.servings) > 1 ? "s" : ""}
            </p>
          )}
          <div className="flex flex-wrap gap-2 mt-3 text-sm">
            <span className="px-2.5 py-1 rounded-full bg-orange-50 text-orange-700">🔥 {macros.calories} kcal</span>
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">🍗 {macros.protein} g prot.</span>
            <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">🧈 {macros.fat} g lip.</span>
            <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-700">🍞 {macros.carbs} g gluc.</span>
          </div>
        </div>

        {/* Image pour PDF uniquement */}
        <div id="pdf-cover-image" style={{ display: "none", marginBottom: 24 }}>
          <div className="w-full" style={{ aspectRatio: "16/9", background: "#fafafa", borderRadius: 16, overflow: "hidden" }}>
            <img
              src={recette.photoUrl || "/images/placeholder.png"}
              alt={recette.name}
              style={{ objectFit: "contain", width: "100%", height: "100%", display: "block" }}
              crossOrigin="anonymous"
            />
          </div>
        </div>

        {recette.description && (
          <p className="text-gray-700 text-lg leading-relaxed text-center mb-8">{recette.description}</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <section className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-6">
            <h3 className="text-2xl font-bold mb-4">🛒 Ingrédients</h3>
            <ul className="space-y-2 text-gray-800 leading-relaxed">
              {scaledIngredients.map((ri, idx) => (
                <li key={idx} className="flex justify-between gap-3">
                  <span>{ri.ingredient?.name}</span>
                  <span className="font-medium text-gray-700">
                    {fmtQty(ri.quantity)} {ri.unit || ""}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-6">
            <h3 className="text-2xl font-bold mb-4">📜 Préparation</h3>
            <ol className="space-y-5">
              {(recette.steps || []).map((step, idx) => (
                <li key={idx} className="relative pl-10 leading-relaxed text-gray-800">
                  <div className="absolute left-0 top-0 w-7 h-7 rounded-full bg-orange-500 text-white text-sm font-semibold flex items-center justify-center shadow">
                    {idx + 1}
                  </div>
                  {step.step}
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>

      <div className="text-center mt-6 mb-10 no-print">
        <button onClick={() => router.push("/recettes")} className="bg-gray-900 text-white px-6 py-3 rounded-full hover:bg-gray-800 transition">
          ← Retour aux recettes
        </button>
      </div>

      {/* Règles d'impression locales (si tu n'as pas encore styles/print.css) */}
      <style jsx global>{`
        @page { size: A4 portrait; margin: 10mm; }
        .no-print { display: block; }     /* visible à l'écran */
        .pdf-only { display: none; }      /* caché à l'écran */

        @media print {
          nav, .sticky, .no-print,
          header, footer, .site-header, .site-footer,
          .recipe-hero,
          #wh-widget-send-button, .wh-widget-send-button, .wa-widget, .wa__btn_popup,
          .grecaptcha-badge, .Toastify, .chat-widget,
          a[href^="http"]:after { content: ""; }
          iframe { display: none !important; }

          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            background: #fff !important;
          }

          .pdf-only { display: block !important; } /* visible en print */
        }
      `}</style>
    </div>
  );
}

export default withAuthProtection(RecetteDetail);

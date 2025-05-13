import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import axios from "axios";
import { Heart, Printer, Download, Share2 } from "lucide-react";
import { useSession } from "next-auth/react";
import Navbar from "../../components/Navbar"; // ✅ import Navbar

export default function RecetteDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { data: session } = useSession();

  const [recette, setRecette] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavori, setIsFavori] = useState(false);

  useEffect(() => {
    if (id) fetchRecette();
  }, [id]);

  useEffect(() => {
    if (!session?.user?.id || !id) return;
    axios
      .get(`/api/utilisateur/${session.user.id}/favoris`)
      .then((res) => {
        const ids = res.data.map((r) => r.id);
        setIsFavori(ids.includes(id));
      })
      .catch((err) => console.error("Erreur favoris :", err));
  }, [session, id]);

  const fetchRecette = async () => {
    try {
      const res = await axios.get(`/api/recettes/${id}`);
      setRecette(res.data);
    } catch (error) {
      console.error("Erreur chargement recette :", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToFavorites = async () => {
    if (!session?.user?.id) return alert("Connecte-toi pour enregistrer des favoris.");
    try {
      if (isFavori) {
        await axios.delete(`/api/utilisateur/${session.user.id}/favoris`, {
          data: { recetteId: id },
        });
        setIsFavori(false);
        alert("Retiré des favoris ❌");
      } else {
        await axios.post(`/api/utilisateur/${session.user.id}/favoris`, { recetteId: id });
        setIsFavori(true);
        alert("Ajouté aux favoris ❤️");
      }
    } catch (err) {
      console.error("Erreur favoris :", err);
    }
  };

  const handlePrint = () => window.print();

  const handleDownloadPDF = () => {
    const element = document.getElementById("recette-pdf-content");
    html2pdf().from(element).save(`${recette.name}.pdf`);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: recette.name,
        text: "Découvre cette super recette !",
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Lien copié !");
    }
  };

  if (loading) return <div className="text-center mt-10">Chargement...</div>;
  if (!recette) return <div className="text-center mt-10">Recette introuvable.</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar /> {/* ✅ Navbar ici */}
      
      <div className="relative h-[60vh] w-full overflow-hidden">
        <img
          src={recette.photoUrl || "/images/placeholder.png"}
          alt={recette.name}
          className="object-cover w-full h-full"
        />
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white text-center">{recette.name}</h1>
        </div>
        <div className="absolute top-4 right-4 flex gap-3">
          <button onClick={handleAddToFavorites} className="p-3 rounded-full bg-white hover:bg-gray-200 shadow-md">
            <Heart className={isFavori ? "text-red-600 fill-red-600" : "text-red-500"} />
          </button>
          <button onClick={handlePrint} className="p-3 rounded-full bg-white hover:bg-gray-200 shadow-md">
            <Printer className="text-blue-600" />
          </button>
          <button onClick={handleDownloadPDF} className="p-3 rounded-full bg-white hover:bg-gray-200 shadow-md">
            <Download className="text-green-600" />
          </button>
          <button onClick={handleShare} className="p-3 rounded-full bg-white hover:bg-gray-200 shadow-md">
            <Share2 className="text-purple-600" />
          </button>
        </div>
      </div>

      <div id="recette-pdf-content" className="max-w-5xl mx-auto p-6">
        <div className="text-center mb-8">
          <p className="text-gray-500 text-lg mb-4">{recette.description}</p>
          {recette.categories.length > 0 && (
            <div className="flex justify-center flex-wrap gap-2 mt-4">
              {recette.categories.map((cat) => (
                <span key={cat.category.id} className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full">
                  {cat.category.name}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="mb-10">
          <h2 className="text-2xl font-bold mb-4">🛒 Ingrédients</h2>
          <ul className="list-disc list-inside space-y-2">
            {recette.ingredients.map((ri, idx) => (
              <li key={idx}>
                {ri.quantity} {ri.unit} {ri.ingredient.name}
              </li>
            ))}
          </ul>
        </div>

        <div className="mb-10">
          <h2 className="text-2xl font-bold mb-4">📜 Préparation</h2>
          <ol className="space-y-6 border-l-2 border-blue-400 pl-6">
            {recette.steps.map((step, idx) => (
              <li key={idx} className="relative pl-8">
                <div className="absolute left-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center">
                  {idx + 1}
                </div>
                <p className="text-gray-700 mt-2">{step.step}</p>
              </li>
            ))}
          </ol>
        </div>

        <div className="mb-10">
          <h2 className="text-2xl font-bold mb-4">🔥 Valeurs Nutritionnelles</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {["Calories", "Protéines", "Lipides", "Glucides"].map((item, idx) => (
              <div key={idx} className="bg-white p-4 rounded-lg shadow">
                <p className="text-sm text-gray-500">{item}</p>
                <p className="text-xl font-bold mt-1">
                  {item === "Calories"
                    ? recette.ingredients.reduce((sum, ri) => sum + (ri.ingredient.calories * ri.quantity) / 100, 0).toFixed(0) + " kcal"
                    : item === "Protéines"
                    ? recette.ingredients.reduce((sum, ri) => sum + (ri.ingredient.protein * ri.quantity) / 100, 0).toFixed(0) + " g"
                    : item === "Lipides"
                    ? recette.ingredients.reduce((sum, ri) => sum + (ri.ingredient.fat * ri.quantity) / 100, 0).toFixed(0) + " g"
                    : recette.ingredients.reduce((sum, ri) => sum + (ri.ingredient.carbs * ri.quantity) / 100, 0).toFixed(0) + " g"}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={() => router.push("/recettes")}
            className="bg-gray-800 text-white px-6 py-3 rounded-full hover:bg-gray-700 transition"
          >
            ← Retour aux recettes
          </button>
        </div>
      </div>
    </div>
  );
}

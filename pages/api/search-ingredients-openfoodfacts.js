import axios from "axios";

function normalize(str) {
  return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // enlève accents
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Méthode non autorisée" });
  }

  const { name } = req.query;

  if (!name) {
    return res.status(400).json({ message: "Nom manquant" });
  }

  try {
    const query = normalize(name.trim().replace(/\s+/g, "+"));
    const url = `https://world.openfoodfacts.org/cgi/search.pl?action=process&search_terms=${query}&json=1&page_size=20`;

    const { data } = await axios.get(url);

    const products = data.products || [];
    const searchTerm = normalize(name.trim());

    const forbiddenCategories = [
      "meals",
      "prepared-meals",
      "ready-meals",
      "dishes",
      "frozen-meals",
      "prepared-foods",
      "composite-foods",
      "snacks",
    ];

    const results = products
      .map((product) => {
        const nutriments = product.nutriments || {};
        return {
          name: product.product_name || "",
          calories: Math.round(nutriments["energy-kcal_100g"] || 0),
          protein: Math.round(nutriments["proteins_100g"] || 0),
          fat: Math.round(nutriments["fat_100g"] || 0),
          carbs: Math.round(nutriments["carbohydrates_100g"] || 0),
          categories_tags: product.categories_tags || [],
        };
      })
      .filter((p) => {
        const normalizedName = normalize(p.name);

        const isNameOk =
          normalizedName.includes(searchTerm) &&
          (p.calories > 0 || p.protein > 0 || p.carbs > 0);

        // Vérifier si le produit a une catégorie interdite
        const productCategories = (p.categories_tags || []).map((cat) =>
          normalize(cat)
        );
        const hasForbiddenCategory = productCategories.some((cat) =>
          forbiddenCategories.some((f) => cat.includes(f))
        );

        return isNameOk && !hasForbiddenCategory;
      });

    // Nettoyage : enlever le champ categories_tags pour l'affichage final
    const cleanedResults = results.map(({ categories_tags, ...rest }) => rest);

    res.status(200).json({ results: cleanedResults });
  } catch (error) {
    console.error("Erreur recherche:", error);
    res.status(500).json({ message: "Erreur serveur recherche" });
  }
}

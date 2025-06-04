// pages/api/klaviyo/subscribe.js

export default async function handler(req, res) {
    if (req.method !== "POST") {
      return res.status(405).json({ message: "Méthode non autorisée" });
    }
  
    const { email, firstName, lastName } = req.body;
    const klaviyoApiKey = process.env.KLAVIYO_PRIVATE_API_KEY;
    const klaviyoListId = "SSM6Ju"; // ← Ton ID de liste
  
    // Debug rapide pour vérifier que la clé est bien lue
    console.log("📩 Données reçues :", { email, firstName, lastName });
    console.log("🔑 Clé API Klaviyo présente :", klaviyoApiKey ? "OUI" : "NON");
  
    if (!klaviyoApiKey) {
      return res.status(500).json({ message: "Clé API Klaviyo introuvable." });
    }
  
    try {
      // 1) Créer ou mettre à jour le profil dans Klaviyo
      const profileRes = await fetch("https://a.klaviyo.com/api/profiles/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Klaviyo-API-Key": klaviyoApiKey,    // <--- Utilisation du header Klaviyo-API-Key
          revision: "2023-02-22",               // <--- Version de l’API
        },
        body: JSON.stringify({
          data: {
            type: "profile",
            attributes: {
              email: email,
              first_name: firstName,
              last_name: lastName,
            },
          },
        }),
      });
  
      if (!profileRes.ok) {
        const errorText = await profileRes.text();
        console.error("❌ Erreur création profil Klaviyo :", errorText);
        return res.status(500).json({ message: "Erreur lors de la création du profil Klaviyo." });
      }
  
      // 2) Ajouter ce profil à la liste SSM6Ju
      const listRes = await fetch(
        `https://a.klaviyo.com/api/lists/${klaviyoListId}/relationships/profiles/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Klaviyo-API-Key": klaviyoApiKey,  // <--- Même header ici
            revision: "2023-02-22",
          },
          body: JSON.stringify({
            data: [
              {
                type: "profile",
                attributes: {
                  email: email,
                },
              },
            ],
          }),
        }
      );
  
      if (!listRes.ok) {
        const errorText = await listRes.text();
        console.error("❌ Erreur ajout à la liste Klaviyo :", errorText);
        return res.status(500).json({ message: "Erreur lors de l’ajout à la liste Klaviyo." });
      }
  
      console.log("✅ Profil ajouté à Klaviyo et à la liste !");
      return res.status(200).json({ message: "Inscription dans Klaviyo réussie." });
    } catch (error) {
      console.error("🔥 Erreur interne Klaviyo :", error);
      return res.status(500).json({ message: "Erreur serveur Klaviyo." });
    }
  }
  
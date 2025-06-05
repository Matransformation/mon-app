// pages/api/klaviyo/subscribe.js

export default async function handler(req, res) {
    if (req.method !== "POST") {
      return res.status(405).json({ message: "Méthode non autorisée" });
    }
  
    const { email, firstName, lastName } = req.body;
    const klaviyoApiKey = process.env.KLAVIYO_PRIVATE_API_KEY;
  
    console.log("📩 Données reçues pour Klaviyo :", { email, firstName, lastName });
    console.log("🔑 Clé API Klaviyo présente :", klaviyoApiKey ? "OUI" : "NON");
  
    if (!klaviyoApiKey) {
      return res.status(500).json({ message: "Clé API Klaviyo introuvable." });
    }
  
    try {
      // 1) Créer ou mettre à jour le profil dans Klaviyo (sans liste)
      const profileRes = await fetch("https://a.klaviyo.com/api/profiles/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Klaviyo-API-Key ${klaviyoApiKey}`,
          revision: "2023-02-22",
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
  
      // Si Klaviyo renvoie une erreur, on lit le texte brut pour le renvoyer au client
      if (!profileRes.ok) {
        const errorText = await profileRes.text();
        console.error("❌ Klaviyo error (raw response):", errorText);
        // Renvoyer le status et le texte exact pour diagnostiquer
        return res
          .status(profileRes.status)
          .json({ message: "Erreur lors de la création du profil Klaviyo.", detail: errorText });
      }
  
      console.log("✅ Profil Klaviyo créé ou mis à jour :", email);
      return res.status(200).json({ message: "Profil Klaviyo créé/mis à jour." });
    } catch (error) {
      console.error("🔥 Erreur interne Klaviyo :", error);
      return res.status(500).json({ message: "Erreur serveur Klaviyo." });
    }
  }
  
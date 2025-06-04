export default async function handler(req, res) {
    if (req.method !== "POST") {
      return res.status(405).json({ message: "Méthode non autorisée" });
    }
  
    const { email, firstName, lastName } = req.body;
  
    const klaviyoApiKey = process.env.KLAVIYO_PRIVATE_API_KEY;
    const klaviyoListId = "SSM6Ju"; // Ton ID de liste Klaviyo
  
    // 🔍 Debug
    console.log("📩 Données reçues :", { email, firstName, lastName });
    console.log("🔑 Clé API Klaviyo présente :", klaviyoApiKey ? "OUI" : "NON");
  
    if (!klaviyoApiKey) {
      return res.status(500).json({ message: "Clé API manquante dans .env.local" });
    }
  
    try {
      // Étape 1 : Créer/MàJ le profil
      const profileRes = await fetch("https://a.klaviyo.com/api/profiles/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${klaviyoApiKey}`,
          "Content-Type": "application/json",
          revision: "2023-02-22",
        },
        body: JSON.stringify({
          data: {
            type: "profile",
            attributes: {
              email,
              first_name: firstName,
              last_name: lastName,
            },
          },
        }),
      });
  
      if (!profileRes.ok) {
        const errorText = await profileRes.text();
        console.error("❌ Erreur création profil Klaviyo :", errorText);
        return res.status(500).json({ message: "Erreur création profil Klaviyo" });
      }
  
      // Étape 2 : Ajouter à la liste
      const listRes = await fetch(`https://a.klaviyo.com/api/lists/${klaviyoListId}/relationships/profiles/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${klaviyoApiKey}`,
          "Content-Type": "application/json",
          revision: "2023-02-22",
        },
        body: JSON.stringify({
          data: [
            {
              type: "profile",
              attributes: {
                email,
              },
            },
          ],
        }),
      });
  
      if (!listRes.ok) {
        const errorText = await listRes.text();
        console.error("❌ Erreur ajout à la liste Klaviyo :", errorText);
        return res.status(500).json({ message: "Erreur ajout à la liste Klaviyo" });
      }
  
      console.log("✅ Profil ajouté à Klaviyo et à la liste !");
      return res.status(200).json({ message: "Ajouté à Klaviyo avec succès" });
    } catch (error) {
      console.error("🔥 Erreur interne serveur Klaviyo :", error);
      return res.status(500).json({ message: "Erreur serveur Klaviyo" });
    }
  }
  
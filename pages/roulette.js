// File: pages/roulette.js
"use client";

import Navbar from "../components/Navbar";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import axios from "axios";
import LuckyWheel from "../components/roulette/LuckyWheel";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";

export default function RoulettePage() {
  const { data: session, status } = useSession();
  const user = session?.user;

  const [lots, setLots]             = useState([]);
  const [canPlay, setCanPlay]       = useState(false);
  const [result, setResult]         = useState(null);

  const [phone, setPhone]               = useState("");
  const [phoneError, setPhoneError]     = useState("");
  const [phoneValidated, setPhoneValidated] = useState(false);
  const [validating, setValidating]     = useState(false);

  useEffect(() => {
    if (!user) return;

    // 1) Récupérer le profil à jour (notamment phone)
    axios.get("/api/user/me")
      .then(({ data }) => {
        if (data.phone) {
          setPhone(data.phone);
          setPhoneValidated(true);
        }
      })
      .catch(console.error);

    // 2) Charger les lots et le droit de jouer
    Promise.all([
      axios.get("/api/roulette/lots"),
      axios.get("/api/roulette/can-play"),
    ])
      .then(([lRes, pRes]) => {
        setLots(lRes.data);
        setCanPlay(pRes.data.canPlay);
      })
      .catch(console.error);
  }, [user]);

  // Valide le numéro et passe à l'affichage de la roue
  const handleValidatePhone = async () => {
    setPhoneError("");
    if (!phone) {
      setPhoneError("⚠️ Merci de renseigner votre numéro de téléphone.");
      return;
    }
    setValidating(true);
    try {
      await axios.post("/api/user/update-phone", { phone });
      setPhoneValidated(true);
    } catch (err) {
      console.error(err);
      setPhoneError("Impossible de sauvegarder votre numéro, réessayez.");
    } finally {
      setValidating(false);
    }
  };

  // Lance le spin et enregistre le tirage
  const handleSpinRequest = async (item) => {
    setResult(item);
    try {
      await axios.post("/api/roulette/spin");
      setCanPlay(false);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l’enregistrement du tirage.");
    }
  };

  if (status === "loading") return <p>Chargement…</p>;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="w-full max-w-3xl mx-auto px-4 py-16">
          {!user ? (
            <div className="text-center py-20">
              <h1 className="text-4xl font-bold mb-4">🎡 Roue des lots</h1>
              <p className="text-gray-600">Connecte-toi pour participer</p>
            </div>
          ) : (
            <Card className="shadow-lg rounded-2xl">
              <CardHeader className="text-center bg-white">
                <CardTitle className="text-2xl">🎡 Roue des lots</CardTitle>
                <p className="text-gray-500 text-sm">1 seul tirage par jour</p>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-6 py-8">

                {/* Étape 1 : saisie et validation du téléphone */}
                {!phoneValidated && (
                  <div className="w-full max-w-sm">
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Votre téléphone
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="06 12 34 56 78"
                      className="w-full rounded-md border-gray-300 shadow-sm px-3 py-2"
                    />
                    {phoneError && (
                      <p className="mt-1 text-red-600 text-sm">{phoneError}</p>
                    )}
                    <Button
                      onClick={handleValidatePhone}
                      disabled={validating}
                      className="mt-4 w-full bg-[#fe8802] hover:bg-[#e97600] text-white"
                    >
                      {validating ? "Validation…" : "Valider mon numéro"}
                    </Button>
                  </div>
                )}

                {/* Étape 2 : affichage de la roue */}
                {phoneValidated && !result && lots.length > 0 && (
                  <LuckyWheel
                    data={lots}
                    disabled={!canPlay}
                    onComplete={handleSpinRequest}
                  />
                )}

                {/* Étape 3 : affichage du résultat */}
                {result && (
                  <div className="w-full text-center space-y-4">
                    <p className="text-xl font-semibold text-green-600">
                      🎁 Tu as gagné : {result.label}
                      <br />
                      <a
                        href="https://www.santegourmet.fr"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        www.santegourmet.fr
                      </a>
                    </p>
                    {result.isSuperDraw && (
                      <p className="text-orange-600 text-sm">
                        📞 Prépare-toi à être appelé prochainement en direct si tu es tiré au sort !
                      </p>
                    )}
                    {!result.isSuperDraw && result.couponCode && (
                      <div className="space-y-2">
                        <p>Voici ton coupon :</p>
                        <code className="block bg-gray-100 py-2 px-4 rounded text-lg font-mono">
                          {result.couponCode}
                        </code>
                      </div>
                    )}
                    {!result.isSuperDraw && !result.couponCode && (
                      <p className="text-gray-600">Dommage, pas de réduction cette fois…</p>
                    )}
                    <Button
                      onClick={() => setResult(null)}
                      className="mt-6 bg-[#fe8802] hover:bg-[#e97600] text-white"
                    >
                      ↩️ Rejouer
                    </Button>
                  </div>
                )}

                {/* Message “déjà joué” */}
                {phoneValidated && !result && !canPlay && (
                  <p className="text-gray-500 text-sm">
                    Tu as déjà joué aujourd’hui. Reviens demain !
                  </p>
                )}

              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}

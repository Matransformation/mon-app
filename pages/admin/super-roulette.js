// File: pages/admin/super-roulette.js
"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../../components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";

export default function AdminSuperRoulettePage() {
  const { data: session, status } = useSession();
  const isAdmin = session?.user?.role === "admin";

  const [candidates, setCandidates]     = useState([]);
  const [loading, setLoading]           = useState(true);
  const [winner, setWinner]             = useState(null);
  const [drawing, setDrawing]           = useState(false);

  // 1) Charger la liste des candidats persistants (ceux qui ont eu isSuperDraw=true)
  useEffect(() => {
    if (!isAdmin) return;
    axios.get("/api/admin/super-draw-entries")
      .then(res => setCandidates(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isAdmin]);

  // 2) Tirage aléatoire d’un gagnant parmi ces candidats
  const handlePick = async () => {
    setDrawing(true);
    try {
      const { data } = await axios.post("/api/admin/super-draw-pick");
      setWinner(data.user);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Erreur lors du tirage");
    } finally {
      setDrawing(false);
    }
  };

  if (status === "loading") return <p>Chargement…</p>;
  if (!isAdmin) return <p className="p-4 text-red-600">Accès refusé</p>;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-3xl mx-auto px-4">

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Candidats Super-Roulette</CardTitle>
            </CardHeader>
            <CardContent>
              {loading
                ? <p>Chargement des candidats…</p>
                : candidates.length === 0
                  ? <p className="text-gray-500">Aucun candidat</p>
                  : (
                    <ul className="space-y-2">
                      {candidates.map(c => (
                        <li key={c.id} className="flex justify-between">
                          <span>{c.nom}</span>
                          <a
                            href={`tel:${c.phone}`}
                            className="text-blue-600 hover:underline"
                          >
                            {c.phone}
                          </a>
                        </li>
                      ))}
                    </ul>
                  )
              }
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tirage Final</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              {!winner ? (
                <Button
                  onClick={handlePick}
                  disabled={drawing || candidates.length === 0}
                >
                  {drawing ? "Tirage en cours…" : "Tirer un gagnant"}
                </Button>
              ) : (
                <div className="space-y-4">
                  <p className="text-xl font-semibold text-green-600">
                    🎉 Gagnant : {winner.nom}
                  </p>
                  <a
                    href={`tel:${winner.phone}`}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    📞 Appeler {winner.phone}
                  </a>
                  <Button onClick={() => setWinner(null)} className="mt-4">
                    ↩️ Nouveau tirage
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </div>
    </>
  );
}

// pages/mon-compte.js
import { getSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import prisma from "../lib/prisma";

export default function MonCompte({ user }) {
  const [email, setEmail] = useState("");
  const [prenom, setPrenom] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmMessage, setConfirmMessage] = useState("");
  const [trialEndsAt, setTrialEndsAt] = useState(null);
  const [renewalDate, setRenewalDate] = useState(null);
  const [subscriptionType, setSubscriptionType] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [stripeStatus, setStripeStatus] = useState("");
  const [cancelAtPeriodEnd, setCancelAtPeriodEnd] = useState(user.cancelAtPeriodEnd || false);
  
  useEffect(() => {
    if (!user) return;
    setEmail(user.email);
    setPrenom(user.nom || user.name || "");
    setTrialEndsAt(user.trialEndsAt);
    setRenewalDate(user.subscriptionEnd);
    setIsSubscribed(user.isSubscribed);
    setStripeStatus(user.stripeStatus);
    setCancelAtPeriodEnd(user.cancelAtPeriodEnd);

    // Libellé de l'abonnement
    const { stripePriceId } = user;
    if (stripePriceId === process.env.NEXT_PUBLIC_PRICE_MONTHLY) {
      setSubscriptionType("Abonnement Mensuel");
    } else if (stripePriceId === process.env.NEXT_PUBLIC_PRICE_ANNUAL) {
      setSubscriptionType("Abonnement Annuel");
    } else if (stripePriceId === process.env.NEXT_PUBLIC_PRICE_RECIPES) {
      setSubscriptionType("Accès Recettes");
    } else {
      setSubscriptionType(user.isSubscribed ? "Abonnement actif" : "Non abonné");
    }
  }, [user]);

  const formatDate = (iso) =>
    iso
      ? new Date(iso).toLocaleDateString("fr-FR", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        })
      : "—";

      const now = Date.now();
      const trialActive = trialEndsAt && new Date(trialEndsAt) > now;
      
      const cancelPending =
        cancelAtPeriodEnd &&
        renewalDate &&
        new Date(renewalDate) > now;
      
      const subscriptionActive =
        isSubscribed &&
        stripeStatus === "active" &&
        !cancelAtPeriodEnd &&
        renewalDate &&
        new Date(renewalDate) > now;
      

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/utilisateur/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: user.id, email, nom: prenom }),
    });
    setConfirmMessage(res.ok ? "✅ Infos mises à jour !" : "❌ Erreur.");
    setTimeout(() => setConfirmMessage(""), 3000);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!newPassword) return;
    const res = await fetch("/api/utilisateur/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ utilisateurId: user.id, newPassword }),
    });
    setConfirmMessage(res.ok ? "✅ Mot de passe mis à jour !" : "❌ Erreur.");
    setNewPassword("");
    setTimeout(() => setConfirmMessage(""), 3000);
  };

  const handleSubscribe = async (priceKey) => {
    const res = await fetch("/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priceId: priceKey }),
    });
    const data = await res.json();
    if (data.sessionUrl) window.location.href = data.sessionUrl;
    else alert("Erreur lors de l'abonnement, réessaie.");
  };

  const handleCancelRenewal = async () => {
    const res = await fetch("/api/subscription/cancel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id }),
    });
    const json = await res.json();
    if (res.ok) {
      setConfirmMessage(`✅ ${json.message}`);
      setStripeStatus("canceled");
      setCancelAtPeriodEnd(true); // 👈 ajoute ceci
    } else {
      setConfirmMessage("❌ Erreur lors de l’annulation.");
    }
    setTimeout(() => setConfirmMessage(""), 5000);
  };

  return (
    <>
      <Navbar />
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
        <h1 className="text-3xl font-bold mb-8">Mon compte</h1>

        {/* Infos personnelles */}
        <form
          onSubmit={handleUpdateUser}
          className="bg-white shadow rounded-lg p-6 mb-6 grid gap-4"
        >
          <h2 className="text-xl font-semibold border-b pb-2">
            Infos personnelles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              value={prenom}
              onChange={(e) => setPrenom(e.target.value)}
              className="border rounded p-2"
              placeholder="Prénom"
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border rounded p-2"
              placeholder="Email"
            />
          </div>
          <button
            type="submit"
            className="self-end bg-green-600 text-white px-6 py-2 rounded"
          >
            Sauvegarder
          </button>
          {confirmMessage && <p className="text-green-600">{confirmMessage}</p>}
        </form>

        {/* Offres d’abonnement */}
        {!subscriptionActive && !cancelPending && (
          <>
            <div className="bg-white shadow rounded-lg p-6 mb-6">
              <h2 className="text-lg font-semibold">Mensuel (€14,99/mois)</h2>
              <p className="text-sm text-gray-700 mb-4">
                Accès complet, sans engagement.
              </p>
              <button
                onClick={() => handleSubscribe("price_monthly")}
                className="bg-orange-500 text-white px-4 py-2 rounded"
              >
                S’abonner
              </button>
            </div>
            <div className="bg-white shadow rounded-lg p-6 mb-6">
              <h2 className="text-lg font-semibold">Annuel (€89,90/an)</h2>
              <p className="text-sm text-gray-700 mb-4">
                Économisez 50%, sans engagement.
              </p>
              <button
                onClick={() => handleSubscribe("price_annual")}
                className="bg-orange-500 text-white px-4 py-2 rounded"
              >
                S’abonner
              </button>
            </div>
            <div className="bg-white shadow rounded-lg p-6 mb-6">
              <h2 className="text-lg font-semibold">Recettes (€3,99/mois)</h2>
              <p className="text-sm text-gray-700 mb-4">
                Accès uniquement aux recettes.
              </p>
              <button
                onClick={() => handleSubscribe("price_recipes")}
                className="bg-orange-500 text-white px-4 py-2 rounded"
              >
                S’abonner
              </button>
            </div>
          </>
        )}

        {/* Période d’essai */}
        {trialActive && !subscriptionActive && !cancelPending && (
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold">Période d'essai</h2>
            <p>
              Fin de l’essai : <strong>{formatDate(trialEndsAt)}</strong>
            </p>
          </div>
        )}

        {/* Abonnement actif */}
        {subscriptionActive && (
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold">Votre abonnement</h2>
            <p>
              Type : <strong>{subscriptionType}</strong>
            </p>
            <p>
              Prochain renouvellement :{" "}
              <strong>{formatDate(renewalDate)}</strong>
            </p>
            <button
              onClick={handleCancelRenewal}
              className="mt-4 bg-red-500 text-white px-6 py-2 rounded"
            >
              Annuler le renouvellement
            </button>
          </div>
        )}

        {/* Annulation en cours */}
        {cancelPending && (
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-red-600">
              Abonnement annulé
            </h2>
            <p>
              Vous gardez l’accès jusqu’au{" "}
              <strong>{formatDate(renewalDate)}</strong>.
            </p>
          </div>
        )}

        {/* Changer mot de passe */}
        <form
          onSubmit={handleChangePassword}
          className="bg-white shadow rounded-lg p-6 grid gap-4"
        >
          <h3 className="text-lg font-semibold border-b pb-2">
            🔐 Changer le mot de passe
          </h3>
          <input
            type="password"
            placeholder="Nouveau mot de passe"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="border rounded p-2"
          />
          <button
            type="submit"
            className="self-end bg-blue-600 text-white px-6 py-2 rounded"
          >
            Mettre à jour
          </button>
        </form>
      </div>
    </>
  );
}

export async function getServerSideProps(context) {
  const session = await getSession(context);
  if (!session?.user?.email) {
    return {
      redirect: { destination: "/auth/signin", permanent: false },
    };
  }

  const u = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      email: true,
      name: true,
      nom: true,
      trialEndsAt: true,
      subscriptionEnd: true,
      stripePriceId: true,
      stripeStatus: true,
      isSubscribed: true,
      cancelAtPeriodEnd: true, // 👈 C'EST LUI
    },
    
  });

  return {
    props: {
      user: {
        ...u,
        trialEndsAt: u.trialEndsAt?.toISOString() ?? null,
        subscriptionEnd: u.subscriptionEnd?.toISOString() ?? null,
        cancelAtPeriodEnd: u.cancelAtPeriodEnd ?? false,

      },
    },
  };
}

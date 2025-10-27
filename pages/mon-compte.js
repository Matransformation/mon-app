import { getSession } from "next-auth/react";
import { useState, useEffect, useMemo } from "react";
import Navbar from "../components/Navbar";
import prisma from "../lib/prisma";
import { Crown, Settings } from "lucide-react";

export default function MonCompte({ user }) {
  // ----- State
  const [email, setEmail] = useState("");
  const [prenom, setPrenom] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmMessage, setConfirmMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [cancelBusy, setCancelBusy] = useState(false);

  // Abonnement
  const [trialEndsAt, setTrialEndsAt] = useState(null);
  const [renewalDate, setRenewalDate] = useState(null);
  const [subscriptionType, setSubscriptionType] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [stripeStatus, setStripeStatus] = useState("");
  const [cancelAtPeriodEnd, setCancelAtPeriodEnd] = useState(user.cancelAtPeriodEnd || false);

  // ----- Init depuis SSR
  useEffect(() => {
    if (!user) return;
    setEmail(user.email || "");
    setPrenom(user.nom || user.name || "");
    setTrialEndsAt(user.trialEndsAt);
    setRenewalDate(user.subscriptionEnd);
    setIsSubscribed(!!user.isSubscribed);
    setStripeStatus(user.stripeStatus || "");
    setCancelAtPeriodEnd(Boolean(user.cancelAtPeriodEnd));

    // Libellé abonnement
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

  // ----- Helpers
  const formatDate = (iso) =>
    iso
      ? new Date(iso).toLocaleDateString("fr-FR", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        })
      : "—";

  const nowTs = useMemo(() => Date.now(), []);
  const trialActive = trialEndsAt ? new Date(trialEndsAt).getTime() > nowTs : false;
  const renewalTs = renewalDate ? new Date(renewalDate).getTime() : 0;
  const cancelPending = cancelAtPeriodEnd && renewalTs > nowTs;
  const subscriptionActive =
    isSubscribed && stripeStatus === "active" && !cancelAtPeriodEnd && renewalTs > nowTs;

  // ----- Actions
  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch("/api/utilisateur/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.id, email, nom: prenom }),
      });
      setConfirmMessage(res.ok ? "✅ Infos mises à jour !" : "❌ Erreur lors de la mise à jour.");
    } catch {
      setConfirmMessage("❌ Erreur réseau.");
    } finally {
      setBusy(false);
      setTimeout(() => setConfirmMessage(""), 3500);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!newPassword) return;
    setBusy(true);
    try {
      const res = await fetch("/api/utilisateur/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ utilisateurId: user.id, newPassword }),
      });
      setConfirmMessage(res.ok ? "✅ Mot de passe mis à jour !" : "❌ Erreur lors de la mise à jour.");
      if (res.ok) setNewPassword("");
    } catch {
      setConfirmMessage("❌ Erreur réseau.");
    } finally {
      setBusy(false);
      setTimeout(() => setConfirmMessage(""), 3500);
    }
  };

  const handleSubscribe = async (priceKey) => {
    setBusy(true);
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId: priceKey }),
      });
      const data = await res.json();
      if (data.sessionUrl) window.location.href = data.sessionUrl;
      else setConfirmMessage("❌ Erreur lors de l’abonnement, réessaie.");
    } catch {
      setConfirmMessage("❌ Erreur réseau.");
    } finally {
      setBusy(false);
      setTimeout(() => setConfirmMessage(""), 3500);
    }
  };

  const handleCancelRenewal = async () => {
    setCancelBusy(true);
    try {
      const res = await fetch("/api/subscription/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });
      const json = await res.json();
      if (res.ok) {
        setConfirmMessage(`✅ ${json.message}`);
        setStripeStatus("canceled");
        setCancelAtPeriodEnd(true);
      } else {
        setConfirmMessage("❌ Erreur lors de l’annulation.");
      }
    } catch {
      setConfirmMessage("❌ Erreur réseau.");
    } finally {
      setCancelBusy(false);
      setTimeout(() => setConfirmMessage(""), 5000);
    }
  };

  return (
    <>
      <Navbar />
      <div className="pb-24 bg-gray-50 min-h-screen">
        {/* ----- HEADER PROFIL ----- */}
        <div className="bg-white border-b border-gray-100 py-8 px-6 text-center shadow-sm relative">
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-orange-500 text-white flex items-center justify-center text-2xl font-bold mb-3">
              {prenom?.[0]?.toUpperCase() || "U"}
            </div>
            <h1 className="text-xl font-bold text-gray-900">{prenom || "Utilisateur"}</h1>
            <p className="text-sm text-gray-600">{email}</p>

            {subscriptionActive ? (
              <span className="mt-3 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-sm font-medium">
                <Crown size={16} />
                Membre Premium
              </span>
            ) : (
              <span className="mt-3 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm font-medium">
                Compte gratuit
              </span>
            )}
          </div>

          <div className="absolute top-5 right-5 text-gray-400">
            <Settings size={22} />
          </div>
        </div>

        {/* ----- CONTENU ----- */}
        <div className="max-w-6xl mx-auto px-5 py-8 space-y-6">
          {/* Messages & Alertes */}
          {confirmMessage && (
            <div
              role="status"
              className={`rounded-xl border px-4 py-3 ${
                confirmMessage.startsWith("✅")
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-red-200 bg-red-50 text-red-800"
              }`}
            >
              {confirmMessage}
            </div>
          )}

          {trialActive && !subscriptionActive && !cancelPending && (
            <div className="rounded-xl border border-orange-200 bg-orange-50 text-orange-800 px-4 py-3">
              🎁 Période d’essai en cours — se termine le{" "}
              <strong>{formatDate(trialEndsAt)}</strong>.
            </div>
          )}

          {subscriptionActive && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 px-4 py-3">
              ✅ Abonnement actif — prochain renouvellement le{" "}
              <strong>{formatDate(renewalDate)}</strong>.
            </div>
          )}

          {cancelPending && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 text-rose-800 px-4 py-3">
              ⏳ Résiliation programmée — accès jusqu’au{" "}
              <strong>{formatDate(renewalDate)}</strong>.
            </div>
          )}

          {/* ----- Infos personnelles ----- */}
          <form
            onSubmit={handleUpdateUser}
            className="bg-white rounded-2xl shadow-sm p-5 ring-1 ring-gray-100"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Informations personnelles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex flex-col">
                <span className="text-sm text-gray-600 mb-1">Prénom</span>
                <input
                  type="text"
                  value={prenom}
                  onChange={(e) => setPrenom(e.target.value)}
                  className="border rounded-md p-2 text-sm focus:ring-2 focus:ring-orange-400 outline-none"
                />
              </label>
              <label className="flex flex-col">
                <span className="text-sm text-gray-600 mb-1">Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border rounded-md p-2 text-sm focus:ring-2 focus:ring-orange-400 outline-none"
                />
              </label>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                type="submit"
                disabled={busy}
                className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-lg text-sm font-medium transition disabled:opacity-60"
              >
                {busy ? "Enregistrement…" : "Sauvegarder"}
              </button>
            </div>
          </form>

          {/* ----- Mot de passe ----- */}
          <form
            onSubmit={handleChangePassword}
            className="bg-white rounded-2xl shadow-sm p-5 ring-1 ring-gray-100"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🔐 Changer le mot de passe</h3>
            <label className="flex flex-col">
              <span className="text-sm text-gray-600 mb-1">Nouveau mot de passe</span>
              <input
                type="password"
                placeholder="********"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="border rounded-md p-2 text-sm focus:ring-2 focus:ring-orange-400 outline-none"
              />
            </label>
            <div className="mt-4 flex justify-end">
              <button
                type="submit"
                disabled={busy || !newPassword}
                className="bg-gray-900 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition disabled:opacity-60"
              >
                {busy ? "Mise à jour…" : "Mettre à jour"}
              </button>
            </div>
          </form>

          {/* ----- Abonnement ----- */}
          <div className="bg-white rounded-2xl shadow-sm p-5 ring-1 ring-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Mon abonnement</h2>

            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="px-2.5 py-1 rounded-full text-sm bg-gray-100 text-gray-800">
                {subscriptionType}
              </span>
              <span
                className={`px-2.5 py-1 rounded-full text-sm ${
                  subscriptionActive
                    ? "bg-emerald-100 text-emerald-800"
                    : cancelPending
                    ? "bg-rose-100 text-rose-800"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {subscriptionActive
                  ? "Actif"
                  : cancelPending
                  ? "Résiliation en cours"
                  : "Inactif"}
              </span>
              {trialActive && (
                <span className="px-2.5 py-1 rounded-full text-sm bg-orange-100 text-orange-800">
                  Essai jusqu’au {formatDate(trialEndsAt)}
                </span>
              )}
            </div>

            <dl className="text-sm text-gray-700 space-y-1 mb-3">
              <div className="flex justify-between">
                <dt>Statut Stripe</dt>
                <dd className="font-medium">{stripeStatus || "—"}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Prochain renouvellement</dt>
                <dd className="font-medium">{formatDate(renewalDate)}</dd>
              </div>
            </dl>

            {/* Actions */}
            <div className="mt-4 space-y-2">
              {subscriptionActive ? (
                <button
                  onClick={handleCancelRenewal}
                  disabled={cancelBusy}
                  className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition disabled:opacity-60"
                >
                  {cancelBusy ? "Annulation…" : "Annuler le renouvellement"}
                </button>
              ) : cancelPending ? (
                <p className="text-sm text-gray-600">
                  Vous gardez l’accès jusqu’au <strong>{formatDate(renewalDate)}</strong>.
                </p>
              ) : (
                <p className="text-sm text-gray-600">
                  Choisissez une offre ci-dessous pour activer votre accès 👇
                </p>
              )}
            </div>

            {/* Offres */}
            {!subscriptionActive && !cancelPending && (
              <div className="grid sm:grid-cols-2 gap-4 mt-4">
                <OfferCard
                  title="Mensuel"
                  price="14,99 € / mois"
                  desc="Accès complet, sans engagement."
                  onClick={() => handleSubscribe("price_monthly")}
                  busy={busy}
                />
                <OfferCard
                  title="Annuel"
                  price="89,90 € / an"
                  desc="Économisez ~50%."
                  onClick={() => handleSubscribe("price_annual")}
                  busy={busy}
                  highlight
                />
                <OfferCard
                  title="Recettes"
                  price="3,99 € / mois"
                  desc="Accès uniquement aux recettes."
                  onClick={() => handleSubscribe("price_recipes")}
                  busy={busy}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function OfferCard({ title, price, desc, onClick, busy, highlight = false }) {
  return (
    <div
      className={`rounded-2xl shadow-sm ring-1 p-4 text-sm ${
        highlight ? "bg-orange-50 ring-orange-200" : "bg-white ring-gray-100"
      }`}
    >
      <h3 className="font-bold text-gray-900">{title}</h3>
      <p className="text-gray-600 mt-1">{desc}</p>
      <div className="text-lg font-bold mt-2">{price}</div>
      <button
        onClick={onClick}
        disabled={busy}
        className={`mt-3 w-full py-2 rounded-lg font-medium text-sm transition disabled:opacity-60 ${
          highlight
            ? "bg-orange-500 hover:bg-orange-600 text-white"
            : "bg-gray-900 hover:bg-gray-800 text-white"
        }`}
      >
        {busy ? "Redirection…" : "S’abonner"}
      </button>
    </div>
  );
}

export async function getServerSideProps(context) {
  const session = await getSession(context);
  if (!session?.user?.email) {
    return { redirect: { destination: "/auth/signin", permanent: false } };
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
      cancelAtPeriodEnd: true,
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

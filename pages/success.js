// pages/success.js
import { getSession } from "next-auth/react";
import Link from "next/link";
import Navbar from "../components/Navbar";
import prisma from "../lib/prisma";

export default function Success({ user }) {
  if (!user) {
    return (
      <div className="p-6 text-center">
        <p>Utilisateur non trouvé ou pas connecté.</p>
        <Link href="/auth/signin" className="text-blue-600 underline">
          Se connecter
        </Link>
      </div>
    );
  }

  const { subscriptionType, subscriptionEnd, email } = user;
  const nextDate = subscriptionEnd
    ? new Date(subscriptionEnd).toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
    : "—";

  const planLabel =
    subscriptionType === "mensuel"
      ? "Abonnement Mensuel"
      : subscriptionType === "annuel"
      ? "Abonnement Annuel"
      : "Accès Recettes";

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex flex-col items-center justify-center bg-green-50 p-6">
        <h1 className="text-3xl font-bold mb-4 text-green-700">
          Merci pour ton abonnement ! 🎉
        </h1>
        <div className="bg-white shadow rounded-lg p-6 max-w-md w-full text-center">
          <p className="mb-2">
            <span className="font-semibold">Plan :</span> {planLabel}
          </p>
          <p className="mb-2">
            <span className="font-semibold">Prochaine facturation :</span>{" "}
            {nextDate}
          </p>
          <p className="mb-4 text-gray-600">
            Un email de bienvenue a été envoyé à <strong>{email}</strong>.
          </p>
          <Link
            href="/dashboard"
            className="inline-block bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded transition"
          >
            Aller au dashboard
          </Link>
        </div>
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

  const userDb = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      subscriptionType: true,
      subscriptionEnd: true,
      email: true,
    },
  });

  if (!userDb) {
    return { notFound: true };
  }

  return {
    props: {
      user: {
        subscriptionType: userDb.subscriptionType,
        subscriptionEnd: userDb.subscriptionEnd
          ? userDb.subscriptionEnd.toISOString()
          : null,
        email: userDb.email,
      },
    },
  };
}

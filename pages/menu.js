// pages/menu/index.js
import React from "react";
import Navbar from "../components/Navbar";
import WeekMenu from "../components/Menu/WeekMenu";
import withAuthProtection from "../lib/withAuthProtection";
import { getServerSession } from "next-auth/next";
import authOptions from "./api/auth/[...nextauth]";
import prisma from "../lib/prisma";

function MenuPage({ user }) {
  return (
    <>
      <Navbar />
      <div className="bg-cream-50 min-h-screen py-8">
        {user?.id ? (
          <WeekMenu user={user} key={user.id} />
        ) : (
          <div className="text-center mt-10">Chargement…</div>
        )}
      </div>
    </>
  );
}

export const getServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session?.user?.email) {
    return {
      redirect: {
        destination: "/auth/signin",
        permanent: false,
      },
    };
  }

  // IDs d’abonnement autorisés pour la page Menu (mensuel/annuel)
  const PRICE_MONTHLY = process.env.NEXT_PUBLIC_PRICE_MONTHLY;
  const PRICE_ANNUAL = process.env.NEXT_PUBLIC_PRICE_ANNUAL;

  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      poids: true,
      metabolismeCible: true,
      stripePriceId: true,
      stripeCurrentPeriodEnd: true,
      trialEndsAt: true,
    },
  });

  if (!dbUser) {
    return {
      redirect: {
        destination: "/auth/signin",
        permanent: false,
      },
    };
  }

  const now = Date.now();
  const trialActive =
    dbUser.trialEndsAt && new Date(dbUser.trialEndsAt).getTime() > now;
  const subActive =
    dbUser.stripeCurrentPeriodEnd &&
    new Date(dbUser.stripeCurrentPeriodEnd).getTime() > now;

  // ✅ Accès uniquement si période d’essai OU abonnement actif sur un plan Menu
  const planAllowed = [PRICE_MONTHLY, PRICE_ANNUAL].includes(
    dbUser.stripePriceId
  );
  const hasAccess = trialActive || (subActive && planAllowed);

  if (!hasAccess) {
    return {
      redirect: {
        destination: "/mon-compte",
        permanent: false,
      },
    };
  }

  return {
    props: {
      user: {
        id: dbUser.id,
        poids: dbUser.poids,
        metabolismeCible: dbUser.metabolismeCible,
      },
    },
  };
};

export default withAuthProtection(MenuPage);

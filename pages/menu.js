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

  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      poids: true,
      metabolismeCible: true,
      isSubscribed: true,
      stripeCurrentPeriodEnd: true,
      trialEndsAt: true,
    },
  });

  const now = new Date();
  const trialActive = dbUser?.trialEndsAt && now <= new Date(dbUser.trialEndsAt);
  const stillActive = dbUser?.stripeCurrentPeriodEnd && new Date(dbUser.stripeCurrentPeriodEnd) > now;
  const hasAccess = dbUser?.isSubscribed || stillActive || trialActive;

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

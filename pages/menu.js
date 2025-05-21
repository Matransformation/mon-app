// pages/menu.js
import React from 'react';
import Navbar from '../components/Navbar';
import WeekMenu from '../components/Menu/WeekMenu';
import { getServerSession } from 'next-auth/next';
import prisma from '../lib/prisma';
import authOptions from './api/auth/[...nextauth]';

export default function MenuPage({ user }) {
  return (
    <>
      <Navbar />
      <div className="bg-cream-50 min-h-screen py-8">
        <WeekMenu user={user} />
      </div>
    </>
  );
}

// … getServerSideProps …


export async function getServerSideProps(context) {
  const session = await getServerSession(
    context.req,
    context.res,
    authOptions
  );

  if (!session?.user?.email) {
    return {
      redirect: { destination: '/auth/signin', permanent: false },
    };
  }

  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      poids: true,
      metabolismeCible: true,
      trialEndsAt: true,
      isSubscribed: true,
    },
  });

  const now = new Date();
  const trialActive =
    dbUser?.trialEndsAt && now <= new Date(dbUser.trialEndsAt);
  const hasAccess = dbUser?.isSubscribed || trialActive;

  if (!hasAccess) {
    return {
      redirect: { destination: '/mon-compte', permanent: false },
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
}

import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "../../../lib/prisma";
import { verifyPassword } from "../../../lib/auth";

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Identifiants",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        if (!user) {
          throw new Error("Aucun compte pour cet email");
        }
        const isValid = await verifyPassword(
          credentials.password,
          user.password
        );
        if (!isValid) {
          throw new Error("Mot de passe invalide");
        }
        return user;
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // On enrichit le token avec les infos d’abonnement à la connexion
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: {
            id: true,
            email: true,
            name: true,
            nom: true,
            stripeStatus: true,
            isSubscribed: true,
            stripePriceId: true,
            subscriptionEnd: true,
            trialEndsAt: true,
          },
        });

        token.id = dbUser.id;
        token.email = dbUser.email;
        token.name = dbUser.name;
        token.nom = dbUser.nom;
        token.stripeStatus = dbUser.stripeStatus;
        token.isSubscribed = dbUser.isSubscribed;
        token.stripePriceId = dbUser.stripePriceId;
        token.subscriptionEnd = dbUser.subscriptionEnd?.toISOString() ?? null;
        token.trialEndsAt = dbUser.trialEndsAt?.toISOString() ?? null;
      }
      return token;
    },

    async session({ session, token }) {
      // On passe tout depuis le token vers la session
      if (token?.id) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.nom = token.nom;
        session.user.stripeStatus = token.stripeStatus;
        session.user.isSubscribed = token.isSubscribed;
        session.user.stripePriceId = token.stripePriceId;
        session.user.subscriptionEnd = token.subscriptionEnd;
        session.user.trialEndsAt = token.trialEndsAt;
      }
      return session;
    },
  },
};

export default NextAuth(authOptions);

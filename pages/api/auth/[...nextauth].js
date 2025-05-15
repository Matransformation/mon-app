// pages/api/auth/[...nextauth].js

import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "../../../lib/prisma";
import { verifyPassword } from "../../../lib/auth";

export default NextAuth({
  adapter: PrismaAdapter(prisma),
  // Active le log en dev pour aider au debug si besoin
  logger: {
    error(code, metadata) {
      console.error("[next-auth][error]", code, metadata);
    },
    warn(code) {
      console.warn("[next-auth][warn]", code);
    },
    debug(code, metadata) {
      if (process.env.NODE_ENV === "development") {
        console.debug("[next-auth][debug]", code, metadata);
      }
    },
  },

  providers: [
    CredentialsProvider({
      name: "Identifiants",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "jsmith@acme.com" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        // 1) On récupère l'utilisateur
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        if (!user) {
          throw new Error("Aucun compte pour cet email");
        }
        // 2) On vérifie le mot de passe
        const isValid = await verifyPassword(credentials.password, user.password);
        if (!isValid) {
          throw new Error("Mot de passe invalide");
        }
        // 3) Si ok, on renvoie l'objet user (sera stocké dans le JWT)
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

  // important pour que NextAuth puisse signer/verifier les JWT en prod
  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    async jwt({ token, user }) {
      // Au moment de la connexion, on peut ajouter des infos dans le token
      if (user) {
        // On récupère quelques champs depuis la base
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
      // On expose ces mêmes infos dans session.user côté client
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
});

// lib/accessRules.js

/**
 * Règles d'accès définies pour chaque route.
 * - role: "admin" | "user"
 * - plans: liste de stripePriceId acceptés (mensuel, annuel, recettes)
 * - allowTrial: true permet aux utilisateurs en période d'essai
 */

export const accessRules = {
    // Pages publiques
    "/abonnement": {},
    "/cgu": {},
    "/confidentialite": {},
    "/cookies": {},
    "/forgot-password": {},
    "/index": {},
    "/login": {},
    "/mentions-legales": {},
    "/register": {},
    "/remboursement": {},
    "/tarifs": {},
    "/verify-email": {},
  
    // Pages utilisateur protégées
    "/dashboard": {
      plans: [process.env.NEXT_PUBLIC_PRICE_MONTHLY, process.env.NEXT_PUBLIC_PRICE_ANNUAL],
      allowTrial: true,
    },
    "/menu": {
      plans: [process.env.NEXT_PUBLIC_PRICE_MONTHLY, process.env.NEXT_PUBLIC_PRICE_ANNUAL],
      allowTrial: true,
    },
    "/liste-courses": {
      plans: [process.env.NEXT_PUBLIC_PRICE_MONTHLY, process.env.NEXT_PUBLIC_PRICE_ANNUAL],
      allowTrial: true,
    },
    "/mes-favoris": {
      plans: [
        process.env.NEXT_PUBLIC_PRICE_MONTHLY,
        process.env.NEXT_PUBLIC_PRICE_ANNUAL,
        process.env.NEXT_PUBLIC_PRICE_RECIPES,
      ],
      allowTrial: true,
    },
    "/recettes": {
      plans: [
        process.env.NEXT_PUBLIC_PRICE_MONTHLY,
        process.env.NEXT_PUBLIC_PRICE_ANNUAL,
        process.env.NEXT_PUBLIC_PRICE_RECIPES,
      ],
      allowTrial: true,
    },
    "/mon-compte": { role: "user" },
    "/success": { role: "user" },
  
    // Pages admin
    "/admin/dashboard": { role: "admin" },
    "/admin/acces": { role: "admin" },
    "/admin/ajouter-recette": { role: "admin" },
    "/admin/categories": { role: "admin" },
    "/admin/import-ingredient": { role: "admin" },
    "/admin/ingredients": { role: "admin" },
    "/admin/notif": { role: "admin" },
    "/admin/recettes": { role: "admin" },
    "/admin/statistiques": { role: "admin" },
    "/admin/utilisateurs": { role: "admin" },
    "/admin/recettes/[id]": { role: "admin" },
"/admin/utilisateurs/[id]": { role: "admin" },

  };
  
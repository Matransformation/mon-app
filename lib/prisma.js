// lib/prisma.js

import { PrismaClient } from "@prisma/client";

// ✅ Log utile au tout début pour debug
console.log("🚀 DATABASE_URL =", process.env.DATABASE_URL);

// ✅ Utilisation de globalThis (cross-environnement)
const globalForPrisma = globalThis;

// ✅ Cache Prisma en développement, nouvelle instance en production
const prisma = globalForPrisma.prisma || new PrismaClient();

// ✅ En dev, on évite les multiples instanciations
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;

// lib/prisma.js
import { PrismaClient } from "@prisma/client";

console.log("🚀 DATABASE_URL utilisé par Prisma :", process.env.DATABASE_URL);

const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;

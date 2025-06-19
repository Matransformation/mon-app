// scripts/seed.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  await prisma.rouletteItem.createMany({
    data: [
      { label: "10% de remise\nsur Santegourmet", probability: 0.35, isSuperDraw: false, couponCode: "SPIN10" },
      { label: "15% de remise\nsur Santegourmet", probability: 0.20, isSuperDraw: false, couponCode: "SPIN15" },
      { label: "30% de remise\nsur Santegourmet", probability: 0.10, isSuperDraw: false, couponCode: "SPIN30" },
      { label: "40% de remise\nsur Santegourmet", probability: 0.05, isSuperDraw: false, couponCode: "SPIN40" },
      { label: "Appel pour la\nsuper roue",          probability: 0.30, isSuperDraw: true,  couponCode: null },
    ],
    skipDuplicates: true,
  });
  console.log("✅ Lots seedés");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

  

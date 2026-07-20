const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.siteSetting.count();
  if (existing > 0) {
    console.log("Settings already exist, skipping seed.");
    return;
  }

  await prisma.siteSetting.create({ data: {} });
  console.log("Default settings seeded.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

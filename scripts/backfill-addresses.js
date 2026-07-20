const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: { address: null },
    include: {
      orders: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  let updated = 0;
  for (const user of users) {
    const order = user.orders[0];
    if (order) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          phone: order.phone || null,
          address: order.address || null,
          district: order.district || null,
          province: order.province || null,
          zipcode: order.zipcode || null,
        },
      });
      updated++;
      console.log(`Updated ${user.email} from order ${order.id.slice(0, 8)}`);
    }
  }

  if (updated === 0) {
    console.log("No users need backfill (all have address or no orders)");
  } else {
    console.log(`Backfilled ${updated} users`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
async function main() {
  const prods = await p.product.findMany({ orderBy: { category: 'asc' } });
  console.log('Total products:', prods.length);
  const byCat = {};
  for (const prod of prods) {
    if (!byCat[prod.category]) byCat[prod.category] = [];
    byCat[prod.category].push(prod.name + ' / ' + prod.nameEn + ' (' + prod.price + ')');
  }
  for (const [cat, items] of Object.entries(byCat)) {
    console.log('\n' + cat + ': ' + items.length + ' items');
    items.forEach(i => console.log('  - ' + i));
  }
}
main().catch(console.error).finally(() => p.$disconnect());

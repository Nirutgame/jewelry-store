const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
async function main() {
  const slugs = ['rings', 'necklaces', 'earrings', 'bracelets', 'watches'];
  const names = ['แหวน', 'สร้อยคอ', 'ต่างหู', 'กำไล', 'นาฬิกา'];
  const images = [
    'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&q=80',
    'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&q=80',
    'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=400&q=80',
    'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&q=80',
    'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&q=80',
  ];
  const descs = [
    'แหวนเพชร แหวนทอง แหวนเงิน หลากหลายดีไซน์',
    'สร้อยคอทองคำ เพชร มุก และอัญมณี',
    'ต่างหูเก๋ๆ สำหรับทุกสไตล์',
    'กำไลข้อมือ ข้อเท้า จากวัสดุชั้นดี',
    'นาฬิกาหรู จากแบรนด์ชั้นนำ',
  ];
  for (let i = 0; i < slugs.length; i++) {
    await p.categoryMeta.upsert({
      where: { slug: slugs[i] },
      update: { nameTh: names[i], image: images[i], description: descs[i], sortOrder: i },
      create: { slug: slugs[i], nameTh: names[i], image: images[i], description: descs[i], sortOrder: i },
    });
  }
  console.log('Seeded ' + slugs.length + ' categories');
}
main().catch(console.error).finally(() => p.$disconnect());

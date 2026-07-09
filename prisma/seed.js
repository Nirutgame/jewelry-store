const { PrismaClient } = require("@prisma/client");
const { hash } = require("bcryptjs");

const prisma = new PrismaClient();

const products = [
  {
    name: "Classic Diamond Ring",
    description: "แหวนเพชรแท้ดีไซน์คลาสสิก ตัวเรือนทำจากทองคำขาว 18K ประดับด้วยเพชรน้ำงามขนาด 1 กะรัต เงาสวยเป็นประกาย",
    price: 45000,
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=80",
      "https://images.unsplash.com/photo-1603561596112-0a132b757442?w=800&q=80",
      "https://images.unsplash.com/photo-1598563182586-90eacc0b2430?w=800&q=80",
    ]),
    category: "rings",
    material: "ทองคำขาว 18K / เพชร 1 กะรัต",
    stock: 5,
    featured: true,
  },
  {
    name: "Golden Elegance Necklace",
    description: "สร้อยคอทองคำแท้ 24K ดีไซน์เรียบหรู สวมใส่ได้ทุกโอกาส ตัวเรือนเงางามด้วยการขัดเงาแบบพิเศษ",
    price: 89000,
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80",
      "https://images.unsplash.com/photo-1515562141589-57e7e00d19e1?w=800&q=80",
    ]),
    category: "necklaces",
    material: "ทองคำแท้ 24K",
    stock: 3,
    featured: true,
  },
  {
    name: "Pearl Drop Earrings",
    description: "ต่างหูมุกน้ำจืดคุณภาพสูง ดีไซน์แบบห้อยระย้า ตัวเรือนเงินแท้ 925 ชุบทองคำขาว มุกน้ำจืดขนาด 10 มม.",
    price: 12500,
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800&q=80",
      "https://images.unsplash.com/photo-1589128777073-2636ae4f5c33?w=800&q=80",
    ]),
    category: "earrings",
    material: "เงินแท้ 925 / มุกน้ำจืด",
    stock: 8,
    featured: true,
  },
  {
    name: "Sapphire Halo Bracelet",
    description: "กำไลข้อมือประดับไพลินและเพชร ตัวเรือนทองคำขาว 18K ไพลินแท้จากศรีลังกา ดีไซน์สวยงาม",
    price: 65000,
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80",
      "https://images.unsplash.com/photo-1619119062232-cb086f5c0120?w=800&q=80",
    ]),
    category: "bracelets",
    material: "ทองคำขาว 18K / ไพลิน / เพชร",
    stock: 2,
    featured: true,
  },
  {
    name: "Rose Gold Watch",
    description: "นาฬิกาข้อมือทองชมพู 18K ดีไซน์หรูหรา หน้าปัดมุก กระจกแซฟไฟร์กันรอยขีดข่วน สายแท้จากอิตาลี",
    price: 195000,
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&q=80",
      "https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=800&q=80",
    ]),
    category: "watches",
    material: "ทองชมพู 18K / หน้าปัดมุก",
    stock: 1,
    featured: true,
  },
  {
    name: "Silver Infinity Ring",
    description: "แหวนเงินแท้ 925 ดีไซน์อินฟินิตี้สลักลายอย่างประณีต เรียบง่ายแต่แฝงความหมายลึกซึ้ง เหมาะเป็นของขวัญ",
    price: 3500,
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1602751584552-8ba73a1a10d0?w=800&q=80",
      "https://images.unsplash.com/photo-1608042314453-ae338d80c427?w=800&q=80",
    ]),
    category: "rings",
    material: "เงินแท้ 925",
    stock: 15,
    featured: false,
  },
  {
    name: "Emerald Pendant Necklace",
    description: "สร้อยคอจี้มรกตแท้จากโคลอมเบีย ตัวเรือนทองคำขาว 18K ประดับเพชรเม็ดเล็กโดยรอบ มรกตสีเขียวมรกตคุณภาพดี",
    price: 120000,
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1535632066927-ab7c8ab60908?w=800&q=80",
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80",
    ]),
    category: "necklaces",
    material: "ทองคำขาว 18K / มรกต / เพชร",
    stock: 1,
    featured: false,
  },
  {
    name: "Gold Hoop Earrings",
    description: "ต่างหูห่วงทองคำแท้ 24K ดีไซน์โมเดิร์น ขนาดเส้นผ่านศูนย์กลาง 2.5 ซม. ผิวเงากระจก เรียบหรูดูดี",
    price: 28000,
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1589128777073-2636ae4f5c33?w=800&q=80",
      "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800&q=80",
    ]),
    category: "earrings",
    material: "ทองคำแท้ 24K",
    stock: 6,
    featured: false,
  },
  {
    name: "Leather Wrap Bracelet",
    description: "กำไลข้อมือหนังแท้จากอิตาลี ประดับด้วยแผ่นเงินแท้ 925 สลักลายอย่างประณีต ดีไซน์เท่ๆ สไตล์โมเดิร์น",
    price: 4500,
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1619119062232-cb086f5c0120?w=800&q=80",
      "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80",
    ]),
    category: "bracelets",
    material: "หนังแท้ / เงินแท้ 925",
    stock: 20,
    featured: false,
  },
  {
    name: "Diamond Tennis Bracelet",
    description: "กำไลข้อมือเพชรแท้เต็มเส้น ตัวเรือนทองคำขาว 18K เจียระไนทรงกลมน้ำงาม ประกอบด้วยเพชรคุณภาพสูง",
    price: 250000,
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80",
    ]),
    category: "bracelets",
    material: "ทองคำขาว 18K / เพชร",
    stock: 1,
    featured: false,
  },
  {
    name: "Vintage Floral Ring",
    description: "แหวนทองคำ 18K ดีไซน์วินเทจลายดอกไม้ ประดับด้วยทับทิมแท้และเพชรเม็ดเล็ก งานฝีมือชั้นสูง",
    price: 78000,
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=80",
    ]),
    category: "rings",
    material: "ทองคำ 18K / ทับทิม / เพชร",
    stock: 2,
    featured: false,
  },
  {
    name: "Chronograph Sport Watch",
    description: "นาฬิกาข้อมือสปอร์ตโครโนกราฟ ตัวเรือนสเตนเลสสตีลชุบทอง หน้าปัดสีดำพร้อมฟังก์ชั่นจับเวลา กันน้ำลึก 100 เมตร",
    price: 85000,
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&q=80",
    ]),
    category: "watches",
    material: "สเตนเลสสตีลชุบทอง",
    stock: 4,
    featured: false,
  },
];

async function main() {
  console.log("Seeding database...");

  for (const product of products) {
    await prisma.product.create({ data: product });
  }

  const hashedPassword = await hash("password123", 12);

  await prisma.user.create({
    data: {
      name: "Test User",
      email: "test@example.com",
      password: hashedPassword,
      role: "customer",
    },
  });

  await prisma.user.create({
    data: {
      name: "Admin",
      email: "admin@lumiere.com",
      password: hashedPassword,
      role: "admin",
    },
  });

  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

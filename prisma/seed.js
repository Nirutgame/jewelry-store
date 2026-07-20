const { PrismaClient } = require("@prisma/client");
const { hash } = require("bcryptjs");

const prisma = new PrismaClient();

const P = "https://picsum.photos/seed";

const products = [
  {
    name: "Classic Diamond Ring",
    description: "แหวนเพชรแท้ดีไซน์คลาสสิก ตัวเรือนทำจากทองคำขาว 18K ประดับด้วยเพชรน้ำงามขนาด 1 กะรัต เงาสวยเป็นประกาย",
    price: 45000,
    images: JSON.stringify([
      `${P}/classic-ring-1/800/800`,
      `${P}/classic-ring-2/800/800`,
      `${P}/classic-ring-3/800/800`,
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
      `${P}/golden-necklace-1/800/800`,
      `${P}/golden-necklace-2/800/800`,
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
      `${P}/pearl-earring-1/800/800`,
      `${P}/pearl-earring-2/800/800`,
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
      `${P}/sapphire-bracelet-1/800/800`,
      `${P}/sapphire-bracelet-2/800/800`,
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
      `${P}/rosegold-watch-1/800/800`,
      `${P}/rosegold-watch-2/800/800`,
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
      `${P}/silver-ring-1/800/800`,
      `${P}/silver-ring-2/800/800`,
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
      `${P}/emerald-necklace-1/800/800`,
      `${P}/emerald-necklace-2/800/800`,
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
      `${P}/hoop-earring-1/800/800`,
      `${P}/hoop-earring-2/800/800`,
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
      `${P}/leather-bracelet-1/800/800`,
      `${P}/leather-bracelet-2/800/800`,
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
      `${P}/tennis-bracelet-1/800/800`,
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
      `${P}/floral-ring-1/800/800`,
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
      `${P}/sport-watch-1/800/800`,
    ]),
    category: "watches",
    material: "สเตนเลสสตีลชุบทอง",
    stock: 4,
    featured: false,
  },
];

async function main() {
  const userCount = await prisma.user.count();
  if (userCount > 0) {
    console.log("Users already exist, skipping seed.");
    return;
  }

  console.log("Seeding database...");

  // ⚠️ Dev-only password — change before production deployment
  const hashedPassword = await hash("Dev@123$Test#2026", 12);

  await prisma.user.upsert({
    where: { email: "test@example.com" },
    update: { password: hashedPassword, role: "customer", name: "Test User" },
    create: { name: "Test User", email: "test@example.com", password: hashedPassword, role: "customer" },
  });

  await prisma.user.upsert({
    where: { email: "admin@lumiere.com" },
    update: { password: hashedPassword, role: "admin", name: "Admin" },
    create: { name: "Admin", email: "admin@lumiere.com", password: hashedPassword, role: "admin" },
  });

  await prisma.user.upsert({
    where: { email: "nirut.rodngam1978@gmail.com" },
    update: { password: hashedPassword, role: "superadmin", name: "Super Admin" },
    create: { name: "Super Admin", email: "nirut.rodngam1978@gmail.com", password: hashedPassword, role: "superadmin" },
  });

  await prisma.user.upsert({
    where: { email: "user@user.com" },
    update: { password: hashedPassword, role: "customer", name: "User" },
    create: { name: "User", email: "user@user.com", password: hashedPassword, role: "customer" },
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

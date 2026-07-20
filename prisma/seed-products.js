const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

  const P = "https://picsum.photos/seed";
const V = "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4";

function imgs(seed, n = 6) {
  return JSON.stringify(
    Array.from({ length: n }, (_, i) => `${P}/${seed}-${i + 1}/800/800`)
  );
}

const products = [
  {
    name: "แหวนเพชรคลาสสิก",
    nameEn: "Classic Diamond Ring",
    description: "แหวนเพชรแท้ดีไซน์คลาสสิก ตัวเรือนทำจากทองคำขาว 18K ประดับด้วยเพชรน้ำงามขนาด 1 กะรัต เงาสวยเป็นประกาย",
    descriptionEn: "A classic diamond ring crafted in 18K white gold, featuring a stunning 1-carat diamond with brilliant sparkle.",
    price: 45000,
    images: imgs("ring-classic"),
    video: V,
    category: "rings",
    material: "ทองคำขาว 18K / เพชร 1 กะรัต",
    materialEn: "18K White Gold / 1ct Diamond",
    stock: 5,
    featured: true,
  },
  {
    name: "แหวนเงินอินฟินิตี้",
    nameEn: "Silver Infinity Ring",
    description: "แหวนเงินแท้ 925 ดีไซน์อินฟินิตี้สลักลายอย่างประณีต เรียบง่ายแต่แฝงความหมายลึกซึ้ง เหมาะเป็นของขวัญ",
    descriptionEn: "A sterling silver 925 infinity ring with intricate engraving. Simple yet meaningful, perfect as a gift.",
    price: 3500,
    video: V,
    images: imgs("ring-silver"),
    category: "rings",
    material: "เงินแท้ 925",
    materialEn: "Sterling Silver 925",
    stock: 15,
    featured: false,
  },
  {
    name: "แหวนทองวินเทจ",
    nameEn: "Vintage Gold Ring",
    description: "แหวนทองคำ 18K ดีไซน์วินเทจลายดอกไม้ ประดับด้วยทับทิมแท้และเพชรเม็ดเล็ก งานฝีมือชั้นสูง",
    descriptionEn: "An 18K gold vintage floral ring adorned with genuine ruby and small diamonds. Exquisite craftsmanship.",
    price: 78000,
    video: V,
    images: imgs("ring-vintage"),
    category: "rings",
    material: "ทองคำ 18K / ทับทิม / เพชร",
    materialEn: "18K Gold / Ruby / Diamond",
    stock: 2,
    featured: false,
  },
  {
    name: "สร้อยคอทองคำ",
    nameEn: "Golden Necklace",
    description: "สร้อยคอทองคำแท้ 24K ดีไซน์เรียบหรู สวมใส่ได้ทุกโอกาส ตัวเรือนเงางามด้วยการขัดเงาแบบพิเศษ",
    descriptionEn: "A 24K pure gold necklace with an elegant, minimalist design suitable for any occasion. Special mirror polish finish.",
    price: 89000,
    video: V,
    images: imgs("necklace-gold"),
    category: "necklaces",
    material: "ทองคำแท้ 24K",
    materialEn: "24K Pure Gold",
    stock: 3,
    featured: true,
  },
  {
    name: "จี้มรกต",
    nameEn: "Emerald Pendant",
    description: "สร้อยคอจี้มรกตแท้จากโคลอมเบีย ตัวเรือนทองคำขาว 18K ประดับเพชรเม็ดเล็กโดยรอบ มรกตสีเขียวมรกตคุณภาพดี",
    descriptionEn: "A genuine Colombian emerald pendant necklace set in 18K white gold with small diamonds surrounding the emerald.",
    price: 120000,
    video: V,
    images: imgs("necklace-emerald"),
    category: "necklaces",
    material: "ทองคำขาว 18K / มรกต / เพชร",
    materialEn: "18K White Gold / Emerald / Diamond",
    stock: 1,
    featured: false,
  },
  {
    name: "ไข่มุกสายเดี่ยว",
    nameEn: "Pearl Necklace",
    description: "สร้อยไข่มุกน้ำจืดคุณภาพสูง เม็ดกลมเงาวาว ขนาด 8-9 มม. เรียงร้อยด้วยไหมแท้ หรูหราสง่างาม",
    descriptionEn: "A high-quality freshwater pearl necklace with lustrous 8-9mm round pearls, strung with genuine silk. Elegant and timeless.",
    price: 25000,
    video: V,
    images: imgs("necklace-pearl"),
    category: "necklaces",
    material: "ไข่มุกน้ำจืด / ไหมแท้",
    materialEn: "Freshwater Pearl / Pure Silk",
    stock: 7,
    featured: false,
  },
  {
    name: "ต่างหูมุกห้อย",
    nameEn: "Pearl Drop Earrings",
    description: "ต่างหูมุกน้ำจืดคุณภาพสูง ดีไซน์แบบห้อยระย้า ตัวเรือนเงินแท้ 925 ชุบทองคำขาว มุกน้ำจืดขนาด 10 มม.",
    descriptionEn: "Pearl drop earrings made with high-quality freshwater pearls. Sterling silver 925 with white gold plating. 10mm pearls.",
    price: 12500,
    video: V,
    images: imgs("earring-pearl"),
    category: "earrings",
    material: "เงินแท้ 925 / มุกน้ำจืด",
    materialEn: "Sterling Silver 925 / Freshwater Pearl",
    stock: 8,
    featured: true,
  },
  {
    name: "ต่างหูห่วงทอง",
    nameEn: "Gold Hoop Earrings",
    description: "ต่างหูห่วงทองคำแท้ 24K ดีไซน์โมเดิร์น ขนาดเส้นผ่านศูนย์กลาง 2.5 ซม. ผิวเงากระจก เรียบหรูดูดี",
    descriptionEn: "24K pure gold hoop earrings with a modern design. 2.5 cm diameter, mirror-polished finish. Sleek and sophisticated.",
    price: 28000,
    video: V,
    images: imgs("earring-hoop"),
    category: "earrings",
    material: "ทองคำแท้ 24K",
    materialEn: "24K Pure Gold",
    stock: 6,
    featured: false,
  },
  {
    name: "ต่างหูเพชรสตั๊ด",
    nameEn: "Diamond Stud Earrings",
    description: "ต่างหูเพชรแท้สตั๊ด ตัวเรือนทองคำขาว 18K เพชรน้ำงามเจียระไนทรงกลมขนาด 0.5 กะรัตคู่ เงาสวยคลาสสิก",
    descriptionEn: "Genuine diamond stud earrings set in 18K white gold. Brilliant round-cut 0.5-carat diamonds per pair. Classic elegance.",
    price: 35000,
    video: V,
    images: imgs("earring-stud"),
    category: "earrings",
    material: "ทองคำขาว 18K / เพชร 0.5 กะรัต",
    materialEn: "18K White Gold / 0.5ct Diamond",
    stock: 4,
    featured: false,
  },
  {
    name: "กำไลไพลิน",
    nameEn: "Sapphire Bracelet",
    description: "กำไลข้อมือประดับไพลินและเพชร ตัวเรือนทองคำขาว 18K ไพลินแท้จากศรีลังกา ดีไซน์สวยงาม",
    descriptionEn: "A sapphire and diamond bracelet crafted in 18K white gold. Genuine Ceylon sapphires with a beautiful design.",
    price: 65000,
    video: V,
    images: imgs("bracelet-sapphire"),
    category: "bracelets",
    material: "ทองคำขาว 18K / ไพลิน / เพชร",
    materialEn: "18K White Gold / Sapphire / Diamond",
    stock: 2,
    featured: true,
  },
  {
    name: "กำไลหนังแท้",
    nameEn: "Leather Bracelet",
    description: "กำไลข้อมือหนังแท้จากอิตาลี ประดับด้วยแผ่นเงินแท้ 925 สลักลายอย่างประณีต ดีไซน์เท่ๆ สไตล์โมเดิร์น",
    descriptionEn: "An Italian genuine leather bracelet with engraved sterling silver 925 plates. Cool modern design.",
    price: 4500,
    video: V,
    images: imgs("bracelet-leather"),
    category: "bracelets",
    material: "หนังแท้ / เงินแท้ 925",
    materialEn: "Genuine Leather / Sterling Silver 925",
    stock: 20,
    featured: false,
  },
  {
    name: "กำไลเพชรเทนนิส",
    nameEn: "Diamond Tennis Bracelet",
    description: "กำไลข้อมือเพชรแท้เต็มเส้น ตัวเรือนทองคำขาว 18K เจียระไนทรงกลมน้ำงาม ประกอบด้วยเพชรคุณภาพสูง",
    descriptionEn: "A full diamond tennis bracelet in 18K white gold. Brilliant round-cut diamonds set throughout. Premium quality.",
    price: 250000,
    video: V,
    images: imgs("bracelet-tennis"),
    category: "bracelets",
    material: "ทองคำขาว 18K / เพชร",
    materialEn: "18K White Gold / Diamond",
    stock: 1,
    featured: false,
  },
  {
    name: "นาฬิกาทองชมพู",
    nameEn: "Rose Gold Watch",
    description: "นาฬิกาข้อมือทองชมพู 18K ดีไซน์หรูหรา หน้าปัดมุก กระจกแซฟไฟร์กันรอยขีดข่วน สายแท้จากอิตาลี",
    descriptionEn: "An 18K rose gold luxury watch with a mother-of-pearl dial, scratch-resistant sapphire crystal, and Italian leather strap.",
    price: 195000,
    video: V,
    images: imgs("watch-rosegold"),
    category: "watches",
    material: "ทองชมพู 18K / หน้าปัดมุก",
    materialEn: "18K Rose Gold / Mother-of-Pearl Dial",
    stock: 1,
    featured: true,
  },
  {
    name: "นาฬิกาสปอร์ต",
    nameEn: "Sport Chronograph",
    description: "นาฬิกาข้อมือสปอร์ตโครโนกราฟ ตัวเรือนสเตนเลสสตีลชุบทอง หน้าปัดสีดำพร้อมฟังก์ชั่นจับเวลา กันน้ำลึก 100 เมตร",
    descriptionEn: "A sport chronograph watch with gold-plated stainless steel case, black dial with stopwatch function, water-resistant to 100m.",
    price: 85000,
    video: V,
    images: imgs("watch-sport"),
    category: "watches",
    material: "สเตนเลสสตีลชุบทอง",
    materialEn: "Gold-Plated Stainless Steel",
    stock: 4,
    featured: false,
  },
  {
    name: "นาฬิกาคลาสสิก",
    nameEn: "Classic Leather Watch",
    description: "นาฬิกาข้อมือคลาสสิกดีไซน์เรียบหรู ตัวเรือนสเตนเลสสตีล หน้าปัดสีขาวสายหนังแท้ ใส่ได้ทุกโอกาส",
    descriptionEn: "A classic leather watch with a minimalist stainless steel case, white dial, and genuine leather strap. Suitable for any occasion.",
    price: 45000,
    video: V,
    images: imgs("watch-classic"),
    category: "watches",
    material: "สเตนเลสสตีล / หนังแท้",
    materialEn: "Stainless Steel / Genuine Leather",
    stock: 6,
    featured: false,
  },
];

async function main() {
  const existing = await prisma.product.count();
  if (existing > 0) {
    console.log("Products already exist, skipping seed.");
    return;
  }

  console.log("Inserting 15 products...");

  for (const product of products) {
    await prisma.product.create({ data: product });
  }

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

"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import ProductGrid from "@/components/ProductGrid";
import { ProductType } from "@/types";
import { HiOutlineArrowRight } from "react-icons/hi";
import { useLanguage } from "@/context/LanguageContext";

interface HeroSlide {
  title: string;
  subtitle: string;
  image: string;
}

const defaultHeroSlides: HeroSlide[] = [
  { title: "Elegance Redefined", subtitle: "เครื่องประดับที่สะท้อนตัวตนของคุณ", image: "https://images.unsplash.com/photo-1515562141589-57e7e00d19e1?w=1600&q=80" },
  { title: "Timeless Beauty", subtitle: "ทุกชิ้นงานถูกสร้างด้วยความประณีต", image: "https://images.unsplash.com/photo-1603561596112-0a132b757442?w=1600&q=80" },
  { title: "Shine Bright", subtitle: "เพชรแท้คุณภาพสูง รับประกันความพึงพอใจ", image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1600&q=80" },
];

export default function Home() {
  const [categories, setCategories] = useState<{ name: string; nameEn: string; slug: string; image: string }[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [featuredProducts, setFeaturedProducts] = useState<ProductType[]>([]);
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>(defaultHeroSlides);
  const { data: session } = useSession();
  const { t, locale } = useLanguage();

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data?.heroSlides) {
          try {
            const parsed = JSON.parse(data.heroSlides);
            if (Array.isArray(parsed) && parsed.length > 0) setHeroSlides(parsed);
          } catch {}
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (heroSlides.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => setCategories(data.filter((c: { slug: string }) => c.slug !== "all")))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/products?featured=true")
      .then((res) => res.json())
      .then((data) => setFeaturedProducts(data.products || data))
      .catch(console.error);
  }, []);

  return (
    <div>
      <section className="relative h-[70vh] min-h-[500px] overflow-hidden">
        {heroSlides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
          </div>
        ))}

        <div className="absolute inset-0 flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="max-w-xl">
              <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-4">
                {heroSlides[currentSlide].title}
              </h1>
              <p className="text-xl text-gray-200 mb-8">
                {heroSlides[currentSlide].subtitle}
              </p>
              <Link href="/products" className="btn-primary inline-flex items-center gap-2 text-lg">
                {t("home.shopNow")}
                <HiOutlineArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentSlide
                  ? "bg-gold-500 w-8"
                  : "bg-white/50 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      </section>

      <section className="py-12 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-gray-800 dark:text-gray-100 mb-2 sm:mb-4">
              {t("home.categories")}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto text-sm sm:text-base">
              {t("home.categoriesDesc")}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/products?category=${cat.slug}`}
                className="group relative aspect-square rounded-xl overflow-hidden"
              >
                <img
                  src={cat.image}
                  alt={locale === "en" && cat.nameEn ? cat.nameEn : cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
                  <h3 className="text-white font-serif text-lg sm:text-xl font-semibold">
                    {locale === "en" && cat.nameEn ? cat.nameEn : cat.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white dark:bg-gray-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-4xl font-serif font-bold text-gray-800 dark:text-gray-100 mb-4">
                {t("home.featuredProducts")}
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                {t("home.featuredDesc")}
              </p>
            </div>
            <Link
              href="/products"
              className="btn-secondary text-sm hidden sm:inline-flex items-center gap-2"
            >
              {t("home.viewAll")}
              <HiOutlineArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <ProductGrid products={featuredProducts} />
        </div>
      </section>

      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-serif font-bold mb-6">
            {t("home.followUs")}
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto mb-8">
            {t("home.followUsDesc")}
          </p>
          <Link href="/products" className="btn-primary inline-flex items-center gap-2 text-lg">
            {t("home.latestCollection")}
            <HiOutlineArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}

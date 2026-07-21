"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

export default function PrivacyPage() {
  const { locale } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-serif font-bold text-gray-800 dark:text-gray-100 mb-8">
        {locale === "en" ? "Privacy Policy" : "นโยบายความเป็นส่วนตัว"}
      </h1>

      <div className="prose prose-gray dark:prose-invert max-w-none space-y-8">
        <section>
          <h2 className="text-xl font-serif font-bold text-gray-800 dark:text-gray-100 mb-3">
            {locale === "en" ? "1. Information We Collect" : "1. ข้อมูลที่เราเก็บรวบรวม"}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            {locale === "en"
              ? "We collect the following personal information when you use our services: name, email address, phone number, shipping address, and order history. We also collect browsing data through cookies and similar technologies."
              : "เราทำการเก็บรวบรวมข้อมูลส่วนบุคคลดังต่อไปนี้เมื่อคุณใช้บริการของเรา: ชื่อ, ที่อยู่อีเมล, เบอร์โทรศัพท์, ที่อยู่จัดส่ง, และประวัติการสั่งซื้อ นอกจากนี้เรายังเก็บข้อมูลการท่องเว็บผ่านคุกกี้และเทคโนโลยีที่คล้ายคลึงกัน"}
          </p>
        </section>

        <section>
          <h2 className="text-xl font-serif font-bold text-gray-800 dark:text-gray-100 mb-3">
            {locale === "en" ? "2. How We Use Your Information" : "2. วัตถุประสงค์ในการใช้ข้อมูล"}
          </h2>
          <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
            {(
              locale === "en"
                ? [
                    "To process and deliver your orders",
                    "To communicate with you about your orders and our services",
                    "To improve our products and services",
                    "To comply with legal obligations",
                    "To send marketing communications (with your consent)",
                  ]
                : [
                    "เพื่อดำเนินการและจัดส่งคำสั่งซื้อของคุณ",
                    "เพื่อติดต่อสื่อสารเกี่ยวกับคำสั่งซื้อและบริการของเรา",
                    "เพื่อปรับปรุงสินค้าและบริการของเรา",
                    "เพื่อปฏิบัติตามข้อกำหนดทางกฎหมาย",
                    "เพื่อส่งข้อมูลทางการตลาด (โดยได้รับความยินยอมจากคุณ)",
                  ]
            ).map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-serif font-bold text-gray-800 dark:text-gray-100 mb-3">
            {locale === "en" ? "3. Data Retention" : "3. ระยะเวลาในการเก็บรักษาข้อมูล"}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            {locale === "en"
              ? "We retain your personal information for as long as necessary to fulfill the purposes outlined in this policy, or as required by law. Order data is retained for accounting purposes for 5 years."
              : "เราจะเก็บรักษาข้อมูลส่วนบุคคลของคุณไว้ตราบเท่าที่จำเป็นเพื่อวัตถุประสงค์ที่ระบุไว้ในนโยบายนี้ หรือตามที่กฎหมายกำหนด ข้อมูลคำสั่งซื้อจะถูกเก็บไว้เป็นระยะเวลา 5 ปีเพื่อวัตถุประสงค์ทางบัญชี"}
          </p>
        </section>

        <section>
          <h2 className="text-xl font-serif font-bold text-gray-800 dark:text-gray-100 mb-3">
            {locale === "en" ? "4. Your Rights" : "4. สิทธิของคุณ"}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-3">
            {locale === "en" ? "Under the Personal Data Protection Act (PDPA), you have the following rights:" : "ภายใต้พระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล (PDPA) คุณมีสิทธิดังต่อไปนี้:"}
          </p>
          <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
            {(
              locale === "en"
                ? [
                    "Right to access — request a copy of your data",
                    "Right to rectification — correct inaccurate data",
                    "Right to erasure — request deletion of your data",
                    "Right to restrict processing",
                    "Right to data portability",
                    "Right to object to processing",
                  ]
                : [
                    "สิทธิในการเข้าถึง — ขอสำเนาข้อมูลของคุณ",
                    "สิทธิในการแก้ไข — แก้ไขข้อมูลที่ไม่ถูกต้อง",
                    "สิทธิในการลบ — ขอลบข้อมูลของคุณ",
                    "สิทธิในการระงับการใช้ข้อมูล",
                    "สิทธิในการเคลื่อนย้ายข้อมูล",
                    "สิทธิในการคัดค้านการประมวลผลข้อมูล",
                  ]
            ).map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-serif font-bold text-gray-800 dark:text-gray-100 mb-3">
            {locale === "en" ? "5. Contact Us" : "5. ช่องทางติดต่อ"}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            {locale === "en"
              ? "If you have any questions about this privacy policy or wish to exercise your rights, please contact us at:"
              : "หากคุณมีคำถามเกี่ยวกับนโยบายความเป็นส่วนตัวนี้ หรือประสงค์จะใช้สิทธิของคุณ กรุณาติดต่อเราที่:"}
          </p>
          <div className="mt-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-gray-800 dark:text-gray-100 font-medium">Email: contact@lumiere-jewelry.com</p>
            <p className="text-gray-800 dark:text-gray-100 font-medium">Phone: 02-123-4567</p>
          </div>
        </section>
      </div>

      <div className="mt-12 text-center">
        <Link href="/auth/register" className="btn-primary inline-block">
          {locale === "en" ? "Back to Registration" : "กลับไปหน้าสมัครสมาชิก"}
        </Link>
      </div>
    </div>
  );
}

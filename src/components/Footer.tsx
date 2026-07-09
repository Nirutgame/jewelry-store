import Link from "next/link";
import { HiOutlineMail, HiOutlinePhone, HiOutlineLocationMarker } from "react-icons/hi";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-3xl font-serif font-bold text-gold-500 mb-4">
              Lumière
            </h3>
            <p className="text-gray-400 max-w-md">
              ร้านจิวเวลรี่ชั้นนำ ที่คัดสรรเครื่องประดับคุณภาพสูงจากวัสดุชั้นดี
              เพื่อให้คุณเปล่งประกายในทุกโอกาส
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 uppercase tracking-wider text-sm">
              หมวดหมู่
            </h4>
            <ul className="space-y-3">
              <li>
                <Link href="/products?category=rings" className="hover:text-gold-500 transition-colors">
                  แหวน
                </Link>
              </li>
              <li>
                <Link href="/products?category=necklaces" className="hover:text-gold-500 transition-colors">
                  สร้อยคอ
                </Link>
              </li>
              <li>
                <Link href="/products?category=earrings" className="hover:text-gold-500 transition-colors">
                  ต่างหู
                </Link>
              </li>
              <li>
                <Link href="/products?category=bracelets" className="hover:text-gold-500 transition-colors">
                  กำไล
                </Link>
              </li>
              <li>
                <Link href="/products?category=watches" className="hover:text-gold-500 transition-colors">
                  นาฬิกา
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 uppercase tracking-wider text-sm">
              ลิงก์
            </h4>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="hover:text-gold-500 transition-colors">
                  เกี่ยวกับเรา
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-gold-500 transition-colors">
                  ติดต่อเรา
                </Link>
              </li>
              <li>
                <Link href="/wishlist" className="hover:text-gold-500 transition-colors">
                  รายการที่ชอบ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 uppercase tracking-wider text-sm">
              ติดต่อเรา
            </h4>
            <ul className="space-y-3">
              <li className="flex items-center space-x-2">
                <HiOutlineLocationMarker className="w-5 h-5 text-gold-500" />
                <span>กรุงเทพฯ, ประเทศไทย</span>
              </li>
              <li className="flex items-center space-x-2">
                <HiOutlinePhone className="w-5 h-5 text-gold-500" />
                <span>02-123-4567</span>
              </li>
              <li className="flex items-center space-x-2">
                <HiOutlineMail className="w-5 h-5 text-gold-500" />
                <span>contact@lumiere-jewelry.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} Lumière Jewelry. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

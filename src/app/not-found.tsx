import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-8xl font-serif font-bold text-gold-600 mb-4">
          404
        </h1>
        <h2 className="text-2xl font-serif font-bold text-gray-800 mb-4">
          ไม่พบหน้าที่คุณค้นหา
        </h2>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          หน้าที่คุณกำลังมองหาอาจถูกลบ เปลี่ยนชื่อ หรือไม่มีอยู่ในระบบ
        </p>
        <Link href="/" className="btn-primary">
          กลับหน้าแรก
        </Link>
      </div>
    </div>
  );
}

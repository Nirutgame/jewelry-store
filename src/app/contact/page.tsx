"use client";

import { useState } from "react";
import { HiOutlineMail, HiOutlinePhone, HiOutlineLocationMarker, HiOutlineClock } from "react-icons/hi";
import { useToast } from "@/components/Toast";

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { addToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setSent(true);
        addToast("ส่งข้อความสำเร็จ! ทีมงานจะตอบกลับโดยเร็วที่สุด", "success");
        setForm({ name: "", email: "", subject: "", message: "" });
      } else {
        const data = await res.json();
        setError(data.message || "เกิดข้อผิดพลาด");
        addToast(data.message || "เกิดข้อผิดพลาด", "error");
      }
    } catch {
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
      addToast("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-serif font-bold text-gray-800 mb-4 text-center">
          ติดต่อเรา
        </h1>
        <p className="text-gray-500 text-center mb-12 max-w-xl mx-auto">
          เรายินดีให้คำปรึกษาและตอบทุกคำถามของคุณ ทีมงานของเราพร้อมให้บริการ
        </p>

        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gold-50 rounded-lg">
                  <HiOutlineLocationMarker className="w-6 h-6 text-gold-700" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-gray-800 mb-1">
                    ที่อยู่
                  </h3>
                  <p className="text-gray-500 text-sm">
                    123 ถนนทองคำ แขวงจิวเวลรี่<br />
                    เขตประกายเพชร กรุงเทพฯ 10100
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-gold-50 rounded-lg">
                  <HiOutlinePhone className="w-6 h-6 text-gold-700" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-gray-800 mb-1">
                    โทรศัพท์
                  </h3>
                  <p className="text-gray-500 text-sm">
                    02-123-4567<br />
                    08x-xxx-xxxx
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-gold-50 rounded-lg">
                  <HiOutlineMail className="w-6 h-6 text-gold-700" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-gray-800 mb-1">
                    อีเมล
                  </h3>
                  <p className="text-gray-500 text-sm">
                    info@lumierejewelry.com
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-gold-50 rounded-lg">
                  <HiOutlineClock className="w-6 h-6 text-gold-700" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-gray-800 mb-1">
                    เวลาให้บริการ
                  </h3>
                  <p className="text-gray-500 text-sm">
                    จันทร์ - ศุกร์: 09:00 - 18:00 น.<br />
                    เสาร์ - อาทิตย์: 10:00 - 17:00 น.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-serif font-bold text-gray-800 mb-6">
                ส่งข้อความถึงเรา
              </h2>

              {sent ? (
                <div className="bg-green-50 text-green-700 px-4 py-6 rounded-lg text-center">
                  <p className="font-medium">ส่งข้อความเรียบร้อย!</p>
                  <p className="text-sm mt-1">ทีมงานจะตอบกลับโดยเร็วที่สุด</p>
                  <button
                    onClick={() => setSent(false)}
                    className="mt-4 text-sm text-gold-600 hover:underline"
                  >
                    ส่งข้อความใหม่
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="bg-rose-50 text-rose-700 px-4 py-3 rounded-lg text-sm">
                      {error}
                    </div>
                  )}
                  <div>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="ชื่อของคุณ"
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="อีเมลของคุณ"
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      placeholder="หัวข้อ"
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <textarea
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="ข้อความ..."
                      className="input-field min-h-[120px]"
                      required
                    />
                  </div>
                  <button type="submit" disabled={loading} className="btn-primary w-full">
                    {loading ? "กำลังส่ง..." : "ส่งข้อความ"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

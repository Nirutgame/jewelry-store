"use client";

import { useState } from "react";
import { HiOutlineMail, HiOutlinePhone, HiOutlineLocationMarker, HiOutlineClock } from "react-icons/hi";
import { useToast } from "@/components/Toast";
import { useLanguage } from "@/context/LanguageContext";

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
  const { t } = useLanguage();

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
        addToast(t("contact.sent"), "success");
        setForm({ name: "", email: "", subject: "", message: "" });
      } else {
        const data = await res.json();
        setError(data.message || t("checkout.total"));
        addToast(data.message || t("checkout.total"), "error");
      }
    } catch {
      setError(t("checkout.total"));
      addToast(t("checkout.total"), "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-serif font-bold text-gray-800 dark:text-gray-100 mb-4 text-center">
          {t("contact.title")}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-center mb-12 max-w-xl mx-auto">
          {t("contact.description")}
        </p>

        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gold-50 dark:bg-gold-900/30 rounded-lg">
                  <HiOutlineLocationMarker className="w-6 h-6 text-gold-700 dark:text-gold-400" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-gray-800 dark:text-gray-100 mb-1">
                    {t("checkout.address")}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    {t("contact.address")}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-gold-50 dark:bg-gold-900/30 rounded-lg">
                  <HiOutlinePhone className="w-6 h-6 text-gold-700 dark:text-gold-400" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-gray-800 mb-1">
                    {t("checkout.phone")}
                  </h3>
                  <p className="text-gray-500 text-sm">
                    {t("contact.phone")}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-gold-50 dark:bg-gold-900/30 rounded-lg">
                  <HiOutlineMail className="w-6 h-6 text-gold-700 dark:text-gold-400" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-gray-800 mb-1">
                    {t("checkout.email")}
                  </h3>
                  <p className="text-gray-500 text-sm">
                    {t("contact.emailAddr")}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-gold-50 dark:bg-gold-900/30 rounded-lg">
                  <HiOutlineClock className="w-6 h-6 text-gold-700 dark:text-gold-400" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-gray-800 mb-1">
                    {t("contact.workingHours")}
                  </h3>
                  <p className="text-gray-500 text-sm">
                    {t("contact.workingHours")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-serif font-bold text-gray-800 dark:text-gray-100 mb-6">
                {t("contact.send")}
              </h2>
              {sent ? (
                <div className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-4 py-6 rounded-lg text-center">
                  <p className="font-medium">{t("contact.sent")}</p>
                  <p className="text-sm mt-1">{t("contact.sentDesc")}</p>
                  <button
                    onClick={() => setSent(false)}
                    className="mt-4 text-sm text-gold-600 dark:text-gold-400 hover:underline"
                  >
                    {t("contact.send")}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 px-4 py-3 rounded-lg text-sm">
                      {error}
                    </div>
                  )}
                  <div>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder={t("contact.name")}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder={t("contact.email")}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      placeholder={t("contact.subject")}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <textarea
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder={t("contact.message")}
                      className="input-field min-h-[120px]"
                      required
                    />
                  </div>
                  <button type="submit" disabled={loading} className="btn-primary w-full">
                    {loading ? t("common.loading") : t("contact.send")}
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

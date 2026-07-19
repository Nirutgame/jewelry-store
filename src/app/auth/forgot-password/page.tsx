"use client";

import { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setSent(true);
        setMessage(data.message);
      } else {
        setError(data.message || t("checkout.total"));
      }
    } catch {
      setError(t("checkout.total"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif font-bold text-gray-800 dark:text-gray-100 mb-2">
            {t("auth.forgotPasswordTitle")}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {t("auth.forgotPasswordDesc")}
          </p>
        </div>

        {sent ? (
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-serif font-semibold text-gray-800 dark:text-gray-100 mb-2">
              {t("auth.checkEmail")}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">{message}</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              {t("auth.checkEmail")}
            </p>
            <Link
              href="/auth/login"
              className="btn-primary inline-block mt-6"
            >
              {t("auth.login")}
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm space-y-6">
            {error && (
              <div className="bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                {t("auth.email")}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="your@email.com"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? t("common.loading") : t("auth.sendResetLink")}
            </button>

            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              <Link href="/auth/login" className="text-gold-700 dark:text-gold-400 hover:underline font-medium">
                {t("auth.login")}
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

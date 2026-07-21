"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { HiOutlineEye, HiOutlineEyeOff } from "react-icons/hi";
import { useLanguage } from "@/context/LanguageContext";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { t, locale } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError(t("auth.confirmPassword"));
      return;
    }

    if (password.length < 6) {
      setError(t("auth.confirmPassword"));
      return;
    }

    if (!consent) {
      setError(locale === "en" ? "Please accept the privacy policy" : "กรุณายอมรับนโยบายความเป็นส่วนตัว");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || t("checkout.total"));
      } else {
        router.push("/auth/login");
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
            {t("auth.register")}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {t("auth.joinUs")}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm space-y-6">
          {error && (
            <div className="bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              {t("auth.name")}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
              placeholder={t("auth.name")}
            />
          </div>

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

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              {t("auth.password")}
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field pr-10"
                placeholder={t("auth.password")}
                required
              />
              <button type="button" tabIndex={-1} onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                {showPassword ? <HiOutlineEyeOff className="w-5 h-5" /> : <HiOutlineEye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              {t("auth.confirmPassword")}
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-field pr-10"
                placeholder={t("auth.confirmPassword")}
                required
              />
              <button type="button" tabIndex={-1} onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                {showConfirmPassword ? <HiOutlineEyeOff className="w-5 h-5" /> : <HiOutlineEye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              id="consent"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-1 accent-gold-600 w-4 h-4 shrink-0"
              required
            />
            <label htmlFor="consent" className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              {locale === "en" ? "I have read and agree to the " : "ฉันได้อ่านและยอมรับ "}
              <Link href="/privacy" className="text-gold-700 dark:text-gold-400 hover:underline font-medium" target="_blank">
                {locale === "en" ? "Privacy Policy" : "นโยบายความเป็นส่วนตัว"}
              </Link>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? t("common.loading") : t("auth.register")}
          </button>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            {t("auth.hasAccount")}{" "}
            <Link href="/auth/login" className="text-gold-700 dark:text-gold-400 hover:underline font-medium">
              {t("auth.login")}
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

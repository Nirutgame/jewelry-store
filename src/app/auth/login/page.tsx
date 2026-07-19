"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(t("auth.loginError"));
      } else {
        window.location.href = "/";
      }
    } catch {
      setError(t("auth.loginError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif font-bold text-gray-800 dark:text-gray-100 mb-2">
            {t("auth.login")}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {t("auth.welcomeBack")}
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
            <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              {t("auth.password")}
            </label>
            <Link href="/auth/forgot-password" className="text-sm text-gold-700 dark:text-gold-400 hover:underline">
              {t("auth.forgotPassword")}
            </Link>
          </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder="********"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? t("common.loading") : t("auth.login")}
          </button>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            {t("auth.noAccount")}{" "}
            <Link href="/auth/register" className="text-gold-700 dark:text-gold-400 hover:underline font-medium">
              {t("auth.register")}
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

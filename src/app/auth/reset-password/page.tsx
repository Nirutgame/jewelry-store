"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");
  const { t } = useLanguage();

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

    if (!token) {
      setError(t("auth.forgotPasswordTitle"));
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
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

  if (!token) {
    return (
      <div className="text-center">
        <h2 className="text-xl font-serif font-semibold text-gray-800 dark:text-gray-100 mb-4">
          {t("auth.forgotPasswordTitle")}
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">{t("auth.forgotPasswordTitle")}</p>
        <Link href="/auth/forgot-password" className="btn-primary inline-block">
          {t("auth.sendResetLink")}
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-serif font-semibold text-gray-800 dark:text-gray-100 mb-2">
          {t("auth.resetSuccess")}
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">{message}</p>
        <Link href="/auth/login" className="btn-primary inline-block">
          {t("auth.login")}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm space-y-6">
      {error && (
        <div className="bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
          {t("auth.newPassword")}
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input-field"
          placeholder={t("auth.newPassword")}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
          {t("auth.confirmPassword")}
        </label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="input-field"
          placeholder={t("auth.confirmPassword")}
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full"
      >
        {loading ? t("common.loading") : t("auth.resetPassword")}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  const { t } = useLanguage();
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
      <h1 className="text-3xl font-serif font-bold text-gray-800 dark:text-gray-100 mb-2">
        {t("auth.resetPassword")}
      </h1>
      <p className="text-gray-500 dark:text-gray-400">
        {t("auth.newPassword")}
      </p>
        </div>

        <Suspense fallback={
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm animate-pulse">
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4" />
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4" />
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          </div>
        }>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}

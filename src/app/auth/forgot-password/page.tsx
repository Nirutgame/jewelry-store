"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { HiOutlineEye, HiOutlineEyeOff } from "react-icons/hi";
import { useLanguage } from "@/context/LanguageContext";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<"email" | "otp" | "password" | "done">("email");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { t, locale } = useLanguage();

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpExpiry, setOtpExpiry] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [newPassword, setNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (otpExpiry > 0) {
      const timer = setTimeout(() => setOtpExpiry(otpExpiry - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpExpiry]);

  const handleSendOtp = async () => {
    if (!email) { setError("กรุณากรอกอีเมล"); return; }
    setSendingOtp(true);
    setError("");
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, locale }),
      });
      const data = await res.json();
      if (res.ok) {
        setStep("otp");
        setOtp(["", "", "", "", "", ""]);
        setOtpExpiry(600);
        setTimeout(() => otpRefs.current[0]?.focus(), 100);
      } else {
        setError(data.message || "ไม่สามารถส่ง OTP ได้");
      }
    } catch {
      setError("เกิดข้อผิดพลาด");
    } finally {
      setSendingOtp(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = () => {
    if (otp.join("").length !== 6) { setError("กรุณากรอกรหัส OTP ให้ครบ"); return; }
    setError("");
    setStep("password");
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setError("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("รหัสผ่านไม่ตรงกัน");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/reset-password-by-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otp.join(""), password: newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setStep("done");
        setMessage(data.message);
      } else {
        setError(data.message || "เกิดข้อผิดพลาด");
      }
    } catch {
      setError("เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };

  const stepIndicator = (s: string, label: string) => (
    <div className={`flex items-center gap-2 ${step === s ? "text-gold-700 dark:text-gold-400 font-semibold" : "text-gray-400"}`}>
      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
        step === s ? "border-gold-700 dark:border-gold-400 bg-gold-50 dark:bg-gold-900/30 text-gold-700 dark:text-gold-400" : "border-gray-300 dark:border-gray-600"
      }`}>
        {["email", "otp", "password"].indexOf(s) + 1}
      </div>
      <span className="text-sm">{label}</span>
    </div>
  );

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif font-bold text-gray-800 dark:text-gray-100 mb-2">
            {step === "done" ? (locale === "en" ? "Password Reset" : "เปลี่ยนรหัสผ่าน") : t("auth.forgotPasswordTitle")}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {step === "email" ? t("auth.forgotPasswordDesc")
            : step === "otp" ? (locale === "en" ? "Enter the 6-digit code sent to your email" : "กรอกรหัส 6 หลักที่ส่งไปยังอีเมลของคุณ")
            : step === "password" ? (locale === "en" ? "Choose a new password" : "ตั้งรหัสผ่านใหม่")
            : ""}
          </p>
        </div>

        {step !== "done" && (
          <div className="flex items-center justify-center gap-4 mb-6">
            {stepIndicator("email", locale === "en" ? "Email" : "อีเมล")}
            <div className="w-8 h-px bg-gray-300 dark:bg-gray-600" />
            {stepIndicator("otp", "OTP")}
            <div className="w-8 h-px bg-gray-300 dark:bg-gray-600" />
            {stepIndicator("password", locale === "en" ? "Password" : "รหัสผ่าน")}
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm">
          {error && (
            <div className="bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 px-4 py-3 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          {step === "email" && (
            <div className="space-y-6">
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
              <button onClick={handleSendOtp} disabled={sendingOtp} className="btn-primary w-full">
                {sendingOtp ? t("common.loading") : (locale === "en" ? "Send OTP" : "ส่งรหัส OTP")}
              </button>
              <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                <Link href="/auth/login" className="text-gold-700 dark:text-gold-400 hover:underline font-medium">
                  {t("auth.login")}
                </Link>
              </p>
            </div>
          )}

          {step === "otp" && (
            <div className="space-y-6">
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                {locale === "en"
                  ? `Enter the 6-digit code sent to ${email}`
                  : `กรอกรหัส 6 หลักที่ส่งไปยัง ${email}`}
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-400 text-center -mt-2">
                {locale === "en" ? "(Check spam folder if not received)" : "(หากไม่ได้รับ เช็คในอีเมลขยะ/Spam)"}
              </p>
              <div className="flex justify-center gap-2">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { otpRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    className="w-12 h-14 text-center text-2xl font-bold input-field rounded-xl"
                  />
                ))}
              </div>
              <button onClick={handleVerifyOtp} disabled={otp.join("").length !== 6} className="btn-primary w-full">
                {locale === "en" ? "Next" : "ถัดไป"}
              </button>
              <div className="text-center space-y-1">
                <p className="text-sm text-gray-400">
                  {locale === "en"
                    ? `Code expires in ${Math.floor(otpExpiry / 60)}:${String(otpExpiry % 60).padStart(2, "0")}`
                    : `รหัสหมดอายุใน ${Math.floor(otpExpiry / 60)}:${String(otpExpiry % 60).padStart(2, "0")} นาที`}
                </p>
                <button onClick={handleSendOtp} disabled={sendingOtp} className="text-sm text-gold-700 dark:text-gold-400 hover:underline">
                  {locale === "en" ? "Resend OTP" : "ส่ง OTP อีกครั้ง"}
                </button>
              </div>
              <button onClick={() => { setStep("email"); setError(""); }} className="text-sm text-gray-500 dark:text-gray-400 hover:underline block mx-auto">
                {locale === "en" ? "Change email" : "เปลี่ยนอีเมล"}
              </button>
            </div>
          )}

          {step === "password" && (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  {locale === "en" ? "New Password" : "รหัสผ่านใหม่"}
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="input-field pr-10"
                    placeholder={locale === "en" ? "At least 6 characters" : "อย่างน้อย 6 ตัวอักษร"}
                    minLength={6}
                    required
                  />
                  <button type="button" tabIndex={-1} onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    {showNewPassword ? <HiOutlineEyeOff className="w-5 h-5" /> : <HiOutlineEye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  {locale === "en" ? "Confirm Password" : "ยืนยันรหัสผ่าน"}
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input-field pr-10"
                    placeholder="********"
                    required
                  />
                  <button type="button" tabIndex={-1} onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    {showConfirmPassword ? <HiOutlineEyeOff className="w-5 h-5" /> : <HiOutlineEye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? t("common.loading") : (locale === "en" ? "Reset Password" : "เปลี่ยนรหัสผ่าน")}
              </button>
            </form>
          )}

          {step === "done" && (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-serif font-semibold text-gray-800 dark:text-gray-100 mb-2">
                {locale === "en" ? "Password Changed" : "เปลี่ยนรหัสผ่านสำเร็จ"}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6">{message}</p>
              <Link href="/auth/login" className="btn-primary inline-block">
                {t("auth.login")}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

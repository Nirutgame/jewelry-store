"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-3xl font-serif font-bold text-gray-800 mb-4">
          เกิดข้อผิดพลาด
        </h2>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          ขออภัย เกิดข้อผิดพลาดบางอย่าง กรุณาลองใหม่อีกครั้ง
        </p>
        <button onClick={reset} className="btn-primary">
          ลองอีกครั้ง
        </button>
      </div>
    </div>
  );
}

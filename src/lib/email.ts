import { sendMail } from "./mail";

export async function sendOrderConfirmationEmail(
  email: string,
  order: {
    id: string;
    firstName: string;
    lastName: string;
    total: number;
    items: { product: { name: string }; quantity: number; price: number }[];
  }
) {
  const itemsHtml = order.items
    .map(
      (item) =>
        `<tr>
          <td style="padding: 12px 16px; border-bottom: 1px solid #f0f0f0;">${item.product.name}</td>
          <td style="padding: 12px 16px; border-bottom: 1px solid #f0f0f0; text-align: center;">${item.quantity}</td>
          <td style="padding: 12px 16px; border-bottom: 1px solid #f0f0f0; text-align: right;">${new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", minimumFractionDigits: 0 }).format(item.price * item.quantity)}</td>
        </tr>`
    )
    .join("");

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9f7f2;">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background: white;">
        <tr>
          <td style="background: linear-gradient(135deg, #b8860b, #daa520); padding: 32px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-family: Georgia, serif;">Lumière Jewelry</h1>
          </td>
        </tr>
        <tr>
          <td style="padding: 32px;">
            <h2 style="color: #1f2937; margin: 0 0 8px;">ขอบคุณสำหรับคำสั่งซื้อ!</h2>
            <p style="color: #6b7280; margin: 0 0 24px;">สวัสดี คุณ${order.firstName} ${order.lastName}</p>
            
            <div style="background: #f9f7f2; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
              <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px;">หมายเลขคำสั่งซื้อ</p>
              <p style="margin: 0; font-size: 18px; font-weight: bold; color: #b8860b;">#${order.id.slice(0, 8).toUpperCase()}</p>
            </div>

            <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #f0f0f0; border-radius: 8px; overflow: hidden; margin-bottom: 24px;">
              <thead>
                <tr style="background: #f9f7f2;">
                  <th style="padding: 12px 16px; text-align: left; font-size: 13px; color: #6b7280;">สินค้า</th>
                  <th style="padding: 12px 16px; text-align: center; font-size: 13px; color: #6b7280;">จำนวน</th>
                  <th style="padding: 12px 16px; text-align: right; font-size: 13px; color: #6b7280;">ราคา</th>
                </tr>
              </thead>
              <tbody>${itemsHtml}</tbody>
            </table>

            <div style="text-align: right; padding: 16px 0; border-top: 2px solid #b8860b;">
              <span style="font-size: 20px; font-weight: bold; color: #b8860b;">
                รวม: ${new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", minimumFractionDigits: 0 }).format(order.total)}
              </span>
            </div>

            <div style="text-align: center; margin-top: 32px;">
              <a href="${process.env.NEXTAUTH_URL}/orders/${order.id}" style="display: inline-block; background: #b8860b; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
                ดูรายละเอียดคำสั่งซื้อ
              </a>
            </div>
          </td>
        </tr>
        <tr>
          <td style="background: #1f2937; padding: 24px; text-align: center;">
            <p style="color: #9ca3af; margin: 0; font-size: 13px;">&copy; ${new Date().getFullYear()} Lumière Jewelry. All rights reserved.</p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  try {
    await sendMail({ to: email, subject: `ยืนยันคำสั่งซื้อ #${order.id.slice(0, 8).toUpperCase()} - Lumière Jewelry`, html });
  } catch (error) {
    console.error("Failed to send order confirmation email:", error);
  }
}

export async function sendPasswordResetEmail(
  email: string,
  resetToken: string
) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9f7f2;">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background: white;">
        <tr>
          <td style="background: linear-gradient(135deg, #b8860b, #daa520); padding: 32px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-family: Georgia, serif;">Lumière Jewelry</h1>
          </td>
        </tr>
        <tr>
          <td style="padding: 32px;">
            <h2 style="color: #1f2937; margin: 0 0 16px;">รีเซ็ตรหัสผ่าน</h2>
            <p style="color: #6b7280; margin: 0 0 24px;">
              คุณได้รับคำขอรีเซ็ตรหัสผ่านสำหรับบัญชี Lumière Jewelry ของคุณ
              คลิกปุ่มด้านล่างเพื่อดำเนินการ
            </p>

            <div style="text-align: center; margin: 32px 0;">
              <a href="${resetUrl}" style="display: inline-block; background: #b8860b; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
                รีเซ็ตรหัสผ่าน
              </a>
            </div>

            <p style="color: #9ca3af; font-size: 13px; margin: 0;">
              ลิงก์นี้จะหมดอายุภายใน 1 ชั่วโมง<br>
              หากคุณไม่ได้เป็นผู้ขอรีเซ็ตรหัสผ่าน คุณสามารถเพิกเฉยต่ออีเมลนี้ได้
            </p>
          </td>
        </tr>
        <tr>
          <td style="background: #1f2937; padding: 24px; text-align: center;">
            <p style="color: #9ca3af; margin: 0; font-size: 13px;">&copy; ${new Date().getFullYear()} Lumière Jewelry. All rights reserved.</p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  try {
    await sendMail({ to: email, subject: "รีเซ็ตรหัสผ่าน - Lumière Jewelry", html });
  } catch (error) {
    console.error("Failed to send password reset email:", error);
  }
}

export async function sendOrderStatusEmail(
  email: string,
  orderId: string,
  status: string
) {
  const statusLabels: Record<string, string> = {
    confirmed: "ยืนยันคำสั่งซื้อ",
    processing: "กำลังเตรียมสินค้า",
    shipped: "จัดส่งแล้ว",
    delivered: "จัดส่งสำเร็จ",
    cancelled: "ยกเลิกคำสั่งซื้อ",
  };

  const statusColors: Record<string, string> = {
    confirmed: "#3b82f6",
    processing: "#f59e0b",
    shipped: "#8b5cf6",
    delivered: "#10b981",
    cancelled: "#ef4444",
  };

  const label = statusLabels[status] || status;
  const color = statusColors[status] || "#6b7280";

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9f7f2;">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background: white;">
        <tr>
          <td style="background: linear-gradient(135deg, #b8860b, #daa520); padding: 32px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-family: Georgia, serif;">Lumière Jewelry</h1>
          </td>
        </tr>
        <tr>
          <td style="padding: 32px; text-align: center;">
            <div style="display: inline-block; padding: 8px 24px; border-radius: 24px; background: ${color}20; color: ${color}; font-weight: 600; font-size: 16px; margin-bottom: 16px;">
              ${label}
            </div>
            <h2 style="color: #1f2937; margin: 0 0 8px;">อัปเดตสถานะคำสั่งซื้อ</h2>
            <p style="color: #6b7280; margin: 0 0 24px;">
              คำสั่งซื้อ #${orderId.slice(0, 8).toUpperCase()} ของคุณมีสถานะเป็น <strong style="color: ${color};">${label}</strong>
            </p>
            <a href="${process.env.NEXTAUTH_URL}/orders/${orderId}" style="display: inline-block; background: #b8860b; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
              ดูรายละเอียด
            </a>
          </td>
        </tr>
        <tr>
          <td style="background: #1f2937; padding: 24px; text-align: center;">
            <p style="color: #9ca3af; margin: 0; font-size: 13px;">&copy; ${new Date().getFullYear()} Lumière Jewelry. All rights reserved.</p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  try {
    await sendMail({ to: email, subject: `อัปเดตคำสั่งซื้อ #${orderId.slice(0, 8).toUpperCase()} - ${label}`, html });
  } catch (error) {
    console.error("Failed to send order status email:", error);
  }
}

export async function sendOtpEmail(email: string, otp: string, locale: string) {
  const subject = locale === "en" ? "Your OTP code - Lumiere Jewelry" : "รหัส OTP ของคุณ - Lumiere Jewelry";
  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9f7f2;">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background: white;">
        <tr>
          <td style="background: linear-gradient(135deg, #b8860b, #daa520); padding: 32px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-family: Georgia, serif;">Lumiere Jewelry</h1>
          </td>
        </tr>
        <tr>
          <td style="padding: 32px; text-align: center;">
            <h2 style="color: #1f2937; margin: 0 0 16px;">${locale === "en" ? "Your OTP Code" : "รหัส OTP ของคุณ"}</h2>
            <p style="color: #6b7280; margin: 0 0 24px;">
              ${locale === "en" ? "Use the code below to sign in to your account. This code expires in 5 minutes." : "กรุณาใช้รหัสด้านล่างเพื่อเข้าสู่ระบบ รหัสนี้หมดอายุใน 5 นาที"}
            </p>
            <div style="background: #f9f7f2; border-radius: 12px; padding: 24px; margin: 0 auto; max-width: 200px;">
              <p style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #b8860b; margin: 0; font-family: monospace;">${otp}</p>
            </div>
            <p style="color: #9ca3af; font-size: 13px; margin-top: 24px;">
              ${locale === "en" ? "If you did not request this code, please ignore this email." : "หากคุณไม่ได้ขอรหัสนี้ กรุณาเพิกเฉยต่ออีเมลนี้"}
            </p>
          </td>
        </tr>
        <tr>
          <td style="background: #1f2937; padding: 24px; text-align: center;">
            <p style="color: #9ca3af; margin: 0; font-size: 13px;">&copy; ${new Date().getFullYear()} Lumiere Jewelry. All rights reserved.</p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
  try {
    await sendMail({ to: email, subject, html });
  } catch (error) {
    console.error("Failed to send OTP email:", error);
    throw error;
  }
}

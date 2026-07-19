const LINE_NOTIFY_URL = "https://notify-api.line.me/api/notify";

export async function sendLineNotify(message: string): Promise<void> {
  const token = process.env.LINE_NOTIFY_TOKEN;
  if (!token || token === "your_line_notify_token") return;

  try {
    await fetch(LINE_NOTIFY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Bearer ${token}`,
      },
      body: `message=${encodeURIComponent(message)}`,
    });
  } catch (error) {
    console.error("Failed to send LINE Notify:", error);
  }
}

export async function notifyNewOrder(order: {
  id: string;
  firstName: string;
  lastName: string;
  total: number;
  paymentMethod: string;
  itemCount: number;
}): Promise<void> {
  const paymentLabel = order.paymentMethod === "card" ? "บัตรเครดิต" : "โอนเงิน";
  const message =
    `🛍️ มีคำสั่งซื้อใหม่!\n` +
    `━━━━━━━━━━━━━━\n` +
    `📋 ออเดอร์: #${order.id.slice(0, 8).toUpperCase()}\n` +
    `👤 ลูกค้า: ${order.firstName} ${order.lastName}\n` +
    `📦 สินค้า: ${order.itemCount} ชิ้น\n` +
    `💰 ยอดรวม: ฿${order.total.toLocaleString("th-TH")}\n` +
    `💳 ชำระ: ${paymentLabel}\n` +
    `━━━━━━━━━━━━━━`;

  await sendLineNotify(message);
}

export async function notifyOrderStatusChange(
  orderId: string,
  oldStatus: string,
  newStatus: string
): Promise<void> {
  const statusLabels: Record<string, string> = {
    pending: "รอดำเนินการ",
    confirmed: "ยืนยันแล้ว",
    processing: "กำลังเตรียม",
    shipped: "จัดส่งแล้ว",
    delivered: "ส่งสำเร็จ",
    cancelled: "ยกเลิก",
  };

  const message =
    `📦 อัปเดตสถานะออเดอร์\n` +
    `━━━━━━━━━━━━━━\n` +
    `📋 ออเดอร์: #${orderId.slice(0, 8).toUpperCase()}\n` +
    `🔄 สถานะ: ${statusLabels[oldStatus] || oldStatus} → ${statusLabels[newStatus] || newStatus}\n` +
    `━━━━━━━━━━━━━━`;

  await sendLineNotify(message);
}

export async function notifySlipUpload(orderId: string): Promise<void> {
  const message =
    `🧾 มีสลิปโอนเงินใหม่!\n` +
    `━━━━━━━━━━━━━━\n` +
    `📋 ออเดอร์: #${orderId.slice(0, 8).toUpperCase()}\n` +
    `กรุณาตรวจสอบและยืนยันการชำระเงิน\n` +
    `━━━━━━━━━━━━━━`;

  await sendLineNotify(message);
}

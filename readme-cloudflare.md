# Cloudflare Integration — Neno Jewelry Store

## สรุปผลการทดสอบ (21 July 2026)

### 🔴 สรุป: Cloudflare Tunnel ใช้ไม่ได้จาก network นี้

| วิธี | ผลลัพธ์ | สาเหตุ |
|------|---------|--------|
| **Cloudflare Tunnel** (QUIC port 7844) | ❌ | UDP/QUIC ถูก ISP/Router block |
| **Cloudflare Tunnel** (HTTP/2 port 7844) | ❌ | TCP port 7844 ถูก ISP/Router block |
| **Cloudflare Tunnel** (HTTP/2 port 443) | ❌ | TLS handshake timeout — อาจถูก DPI filter |
| **Cloudflare Quick Tunnel** | ❌ | ได้ URL แต่ tunnel ไม่ connect (530 error) |
| **Cloudflare API** (`api.cloudflare.com:443`) | ✅ | ใช้งานได้ปกติ |
| **Internet ทั่วไป** (Google, DNS) | ✅ | ใช้งานได้ปกติ |

### อาการที่พบ

```
TCP handshake:        ✅ สำเร็จ (3-way handshake สมบูรณ์)
TLS handshake:        ❌ Timeout (server ไม่ตอบกลับหลัง ClientHello)
Cloudflare API:       ✅ 200 OK
Cloudflare edge IPs:  ❌ 100% packet loss (ping), curl 000
Port 7844:            ❌ เชื่อมต่อไม่ได้ทั้ง TCP และ UDP
Port 443 (edge):      ❌ curl timeout
Port 443 (API):       ✅ ใช้งานได้
```

### สรุปสาเหตุ

การเชื่อมต่อไปยัง Cloudflare edge IPs (`198.41.192.0/20`, `198.41.200.0/20`) **ถูกบล็อกที่ระดับโครงข่าย** — น่าจะเป็นที่ ISP หรือ Router เนื่องจาก:

1. `api.cloudflare.com` ใช้ CDN IPs ที่แตกต่างจาก tunnel edge IPs — จึงใช้งานได้
2. TCP three-way handshake ถึง edge IPs **สำเร็จ** (ไม่ใช่ firewall block)
3. แต่ TLS handshake **timeout** — server ไม่ตอบกลับ (อาจเป็น DPI หรือ asymmetric routing)
4. Windows Firewall, WSL network config **ไม่ใช่สาเหตุ** (ตรวจสอบแล้ว)
5. การ disable IPv6, เพิ่ม firewall rules **ไม่ได้ผล**

---

## Tunnel ที่สร้างไว้ (inactive)

```yaml
Name:       jewelry-tunnel
Tunnel ID:  6366f4e9-3270-451d-90dd-ce16e5fba74b
Account ID: 86b1597d9de007ad92ab2f776c24e13a
Status:     inactive
Token:      อยู่ใน .env (CLOUDFLARE_TUNNEL_TOKEN)
```

ถ้าต้องการลองอีกครั้งเมื่อ network เปลี่ยน:
```bash
cd E:\NIRUT-Storage\Neno-Jewelry\jewelry-store
wsl -d Ubuntu-22.04 bash -c "cd /mnt/e/NIRUT-Storage/Neno-Jewelry/jewelry-store && docker compose up -d"
```

---

## API Tokens

| Token | Status | Permission | หมายเหตุ |
|-------|--------|-----------|----------|
| `cfat_xxxxxxxx...` (token 1) | ✅ Active | Tunnel + DNS: Edit | ใช้สร้าง tunnel ได้ |
| `cfut_xxxxxxxx...` (token 2) | ✅ Active | Limited | Location-restricted |
| `misty-night-e8d0` | ✅ Expires 2027-05-01 | General | API Token name |

### Token Usage
```bash
TOKEN="<your-api-token>"
ACCOUNT="86b1597d9de007ad92ab2f776c24e13a"

# List tunnels
curl -H "Authorization: Bearer $TOKEN" \
  "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT/cfd_tunnel"

# Get tunnel token
TUNNEL_ID="6366f4e9-3270-451d-90dd-ce16e5fba74b"
curl -H "Authorization: Bearer $TOKEN" \
  "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT/cfd_tunnel/$TUNNEL_ID/token"

# Delete tunnel
curl -X DELETE -H "Authorization: Bearer $TOKEN" \
  "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT/cfd_tunnel/$TUNNEL_ID"
```

---

## ทางเลือก HTTPS

| วิธี | ข้อกำหนด | ค่าใช้จ่าย | ความยาก |
|------|---------|-----------|--------|
| **Caddy + Let's Encrypt** (ที่เครื่องนี้) | เปิด port 80/443 ที่ router | ฟรี | ง่าย |
| **Cloudflare Tunnel** (VPS) | VPS ที่ network ไม่ block | ~$8-12/เดือน | ง่าย |
| **Caddy + VPS** (Hetzner/DigitalOcean/Oracle) | VPS + domain | ~$0-12/เดือน | ง่าย |
| **Self-signed cert** (ที่เครื่องนี้) | ไม่มีข้อกำหนด | ฟรี | ง่ายมาก |

### คำแนะนำ

**Deploy ขึ้น VPS** เป็นทางออกที่ดีที่สุด เพราะ:
1. Network ไม่มีข้อจำกัด → Cloudflare Tunnel / Caddy ใช้ได้
2. ระบบ production-ready (uptime 99.9%)
3. ไม่ต้องเปิด port ที่ router บ้าน
4. ตัวเลือกถูกสุด: **Oracle Cloud Free Tier** (24GB RAM ฟรี) หรือ **Hetzner** (~$8/เดือน)

---

## สถานะปัจจุบัน

```
http://happyshome.3bbddns.com:34684
```

ยังใช้งาน HTTP ได้ตามปกติ — เฉพาะ HTTPS ที่ยังใช้ไม่ได้เนื่องจากข้อจำกัดของ network

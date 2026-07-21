# Cloudflare Tunnel Setup

## ขั้นตอน

### 1. ติดตั้ง cloudflared (Windows)

```powershell
# ดาวน์โหลด
curl -o cloudflared.exe https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe

# หรือใช้ winget
winget install cloudflare.cloudflared
```

### 2. Login Cloudflare

```powershell
cloudflared tunnel login
```
เปิด browser → login Cloudflare → เลือก domain

### 3. สร้าง Tunnel

```powershell
cloudflared tunnel create jewelry-tunnel
```
จะได้ Tunnel ID และ credentials file ที่ `~\.cloudflared\<ID>.json`

### 4. Route DNS

```powershell
cloudflared tunnel route dns jewelry-tunnel happyshome.3bbddns.com
```

### 5. เอา Token ใส่ .env

```powershell
cloudflared tunnel token jewelry-tunnel
```
Copy output → ใส่ใน `E:\NIRUT-Storage\Neno-Jewelry\jewelry-store\.env`
```
CLOUDFLARE_TUNNEL_TOKEN=<token>
```

### 6. Deploy Docker

```powershell
cd jewelry-store
wsl -d Ubuntu-22.04 bash -c "cd /mnt/e/NIRUT-Storage/Neno-Jewelry/jewelry-store && docker compose up --build -d"
```

### 7. เข้าผ่าน HTTPS

https://happyshome.3bbddns.com

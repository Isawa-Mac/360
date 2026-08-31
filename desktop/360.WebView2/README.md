# 360 Desktop (WebView2)

Windows desktop shell สำหรับเว็บ 360 สร้างด้วย WPF และ Microsoft Edge WebView2

## Run

```powershell
dotnet run --project desktop/360.WebView2/360.WebView2.csproj
```

ค่าเริ่มต้นเปิด `https://360.trirex.cloud` หากต้องการเปิด Next.js ในเครื่อง:

```powershell
npm run dev
dotnet run --project desktop/360.WebView2/360.WebView2.csproj -- --url=http://localhost:8112
```

สามารถตั้ง URL ผ่าน environment variable `TRIREX_360_URL` หรือแก้ `appsettings.json` ได้เช่นกัน

## Build และ publish

```powershell
dotnet build desktop/360.WebView2/360.WebView2.csproj -c Release
dotnet publish desktop/360.WebView2/360.WebView2.csproj -c Release -r win-x64 --self-contained true -p:PublishSingleFile=true
```

เครื่องปลายทางต้องมี Microsoft Edge WebView2 Runtime ซึ่งติดตั้งมากับ Windows 11 และ Windows 10 รุ่นปัจจุบันส่วนใหญ่

## Configuration

- `StartUrl`: URL หน้าแรก
- `AllowedHosts`: host ที่เปิดภายในแอปเมื่อเว็บไซต์ร้องขอหน้าต่างใหม่
- `ExternalBrowserHosts`: host ที่ต้องเปิดด้วยเบราว์เซอร์หลักของ Windows (ค่าเริ่มต้นเป็นรายการว่าง ระบบทั้งหมดจึงเปิดใน WebView2)
- `OpenExternalHostsInBrowser`: เปิด host ภายนอกด้วยเบราว์เซอร์หลักของ Windows
- `AllowDevTools`: เปิด DevTools และ context menu สำหรับการพัฒนา
- `UpdateManifestUrl`: URL ไฟล์ JSON สำหรับตรวจสอบเวอร์ชันใหม่ โดยต้องมี `version` และ `downloadUrl` เช่น `/desktop/update.json`

ข้อมูล cookie, SSO และ WebView2 profile ถูกเก็บแยกที่ `%LOCALAPPDATA%\TRIREX\360\WebView2-v2` โดย profile รุ่นเดิมยังถูกเก็บไว้และไม่ถูกลบ

## สร้างตัวติดตั้ง

ติดตั้ง Inno Setup 6 หนึ่งครั้ง แล้วรัน:

```powershell
powershell -ExecutionPolicy Bypass -File desktop/installer/build-installer.ps1
```

ตัวติดตั้งจะอยู่ที่ `desktop/installer/output/360-Setup-1.0.17-win-x64.exe` และติดตั้งแบบ per-user ที่ `%LOCALAPPDATA%\Programs\TRIREX\360` โดยสร้าง shortcut ใน Start Menu และ Desktop

เมื่อมีเวอร์ชันใหม่ ให้อัปโหลดไฟล์ setup ไปยัง URL ใน `downloadUrl` และแก้ `public/desktop/update.json` เป็นเวอร์ชันใหม่ ปุ่ม `UPDATE` สีส้มจะแสดงใน Header ของแอปโดยอัตโนมัติ แอปจะดาวน์โหลด setup แล้วเปิดตัวติดตั้งเมื่อกดปุ่ม

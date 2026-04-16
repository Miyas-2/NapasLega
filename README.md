# NapasLega - Sistem Pemantauan ISPA Geospasial & Rekam Medis 🌍🫁

**NapasLega** adalah aplikasi Full-Stack berbasis Web yang dikembangkan untuk memfasilitasi pencatatan riwayat medis (khususnya mitigasi kasus ISPA) sekaligus menyuguhkan konteks Pemantauan Kualitas Udara (AQI) secara *real-time* berbasis pemetaan geospasial. 

Proyek ini dibangun secara ekstensif sebagai bagian dari rancangan Ujian Tengah Semester (UTS) mata kuliah **Cloud Computing**.

---

## ✨ Fitur Unggulan

1. **Pemetaan Geospasial (Map Dashboard)**  
   Menerjemahkan data keluhan klinis warga ke sebaran titik koordinat di atas kanvas peta (`Leaflet.js`), memudahkan observasi sentra titik buta rawan ISPA (contoh *Dummy*: wilayah Dago dan Cikutra).
   
2. **Kesadaran Lingkungan Berbasis IoT/API (Auto-Geo Weather)**  
   Terintegrasi langsung dari server Node.js ke arsitektur *WeatherAPI*. Setiap form keluhan yang dikirimkan warga otomatis menangkap letak GPS, membedah molekul Partikulat Murni (PM2.5), dan memberi tempelan stempel Index US-EPA seberapa korup udara saat itu.

3. **Demografi Statistik Analitika (Recharts)**  
   Merekap seluruh riwayat database pasien di server menjadi **Bagan Batang Distribusi Udara**. Anda bisa langsung meraba simpulan: *"Dari semua penderita ISPA masuk, seberapa banyak yang menderita di area berawan ringan, vs area berpolutan beracun (AQI 5-6)?"*.

4. **Integrasi Mutlak AWS S3 Bucket (Cloud Storage)**  
   Berkas identitas (*KTP*) atau rekam diagnostik resep dokter pada antrean reservasi (Booking) diunggah murni melayang ke *Amazon S3 Bucket*. File langsung disulap agar bisa di-*preview* membentang elegan oleh peramban berkat mekanisme injeksi parameter MIME *inline*.

5. **Akses Data Cerdas: Paginasi Sejati**  
   Tabel-tabel _Log_ keluhan tak akan meremukkan RAM peladen di saat pengguna membengkak! Terdapat filter limit porsi dan offset yang secara efisien meminta _metadata JSON_ via *Sequelize Query* (FindAndCountAll).

---

## 🛠️ Susunan Teknologi (Tech Stack)

*   **Antarmuka/Frontend**: React.js (Vite), TailwindCSS v4, **Geist & Lexend** Typography WebFonts, Lucide-React.
*   **Peta Visual & Grafik**: React-Leaflet & Recharts.
*   **Peladen/Backend**: Node.js & Express.js.
*   **Basis Data**: Relational Database menggunakan **MySQL** dibentengi oleh *Sequelize ORM*.
*   **Infrastruktur Penunjang**: AWS S3 Bucket (via aws-sdk v3 & multer-s3).

---

## 🚀 Panduan Eksekusi di Perangkat Lokal

### 1. Inisialisasi Database (Backend)
Buka terminal dan masuk ke wilayah Backend:
```bash
cd backend
npm install
```
Jangan lupa mensuplai konfigurasi DB pada `backend/config/config.json`. Anda juga **Wajib** menitipkan *credentials* Cloud Storage Anda secara sembunyi-sembunyi pada `backend/.env`:
```env
# Contoh isi di backend/.env
DB_HOST=localhost
DB_USER=root
DB_PASS=...
DB_NAME=napaslega
JWT_SECRET=rahasia-kita

AWS_REGION=ap-southeast-1
AWS_ACCESS_KEY=...
AWS_SECRET_KEY=...
S3_BUCKET=...
```

Instruksikan database membangun strukturnya (*schema migrations*) dan menyepuh ratusan data acak ujicoba simulasi (*seeder*) menggunakan:
```bash
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
```
Muaranya, hidupkan server peladen dengan:
```bash
node server.js
```

### 2. Menjalankan Antarmuka UI (Frontend)
Pada _Terminal Tab_ baru Anda, pindah lalu jalankan reaktor komponen Vite:
```bash
cd fe
npm install
npm run dev
```
Akses hasil rakitannya pada laman lokal **http://localhost:5173**. 
Masuklah (*Login*) menggunakan salah satu akun pengguna area, misalnya `dago@napaslega.com` (Sandi: `password123`)!

---
🛡️ *All rights reserved, 2026.*

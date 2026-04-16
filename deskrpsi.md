# Project Blueprint: NapasLega (ISPA & Air Quality Monitoring)

## Context & Goal
Saya sedang membangun aplikasi web bernama "NapasLega" untuk memantau kualitas udara (AQI) dan keterkaitannya dengan kesehatan pernapasan (ISPA) di Bandung. Aplikasi ini adalah proyek UTS Cloud Computing yang akan dideploy menggunakan AWS (EC2, RDS, S3).

## Technical Stack
- **Frontend:** React.js (Folder: `fe/`)
- **Backend:** Node.js + Express (Folder: `be/`)
- **Database:** AWS RDS (Relational Database)
- **Storage:** AWS S3 (Untuk upload foto KTP/Resep)
- **DevOps:** Docker (Containerization), Nginx (Reverse Proxy), GitHub Actions (CI/CD)

---

## 1. Database Schema Specification (RDS)
Buatkan skema database SQL yang mencakup tabel-tabel berikut:
1. **users**: id, username, password (hashed), email.
2. **symptom_logs**: id, user_id, symptoms (text/json), log_date, notes.
3. **clinics**: id, name, address, location_lat, location_long.
4. **bookings**: id, user_id, clinic_id, booking_date, s3_photo_url, status.

---

## 2. Backend Requirements (Node.js)
Buatkan boilerplate Node.js dengan Express yang memiliki fitur:
- **Environment Variables:** Konfigurasi untuk `DB_HOST`, `DB_USER`, `DB_PASS`, `S3_BUCKET`, `AWS_ACCESS_KEY`, `AWS_SECRET_KEY`.
- **API Endpoints:**
    - `GET /api/aqi`: Mengambil data dari WAQI API (token: `demo`) untuk area Bandung.
    - `POST /api/symptoms`: Menyimpan data keluhan ke RDS.
    - `POST /api/bookings`: Menerima input form dan file gambar, mengunggahnya ke S3 menggunakan `@aws-sdk/client-s3`, lalu menyimpan URL-nya ke RDS.
- **Middleware:** Express-upload atau Multer untuk menangani file upload.

---

## 3. Frontend Requirements (React)
Buatkan struktur komponen React menggunakan Tailwind CSS:
- **Dashboard:** Menampilkan skor AQI Bandung dalam kartu visual (Hijau/Kuning/Merah) dan peta menggunakan `react-leaflet`.
- **Symptom Form:** Form checklist gejala kesehatan.
- **Booking Page:** List klinik dan form upload file gambar (KTP) yang mengirim data ke endpoint `/api/bookings`.

---

## 4. Docker & Infrastructure Configuration
Buatkan file konfigurasi berikut:
1. **Dockerfile (be/):** Menggunakan image `node:18-alpine`, instalasi dependencies, dan menjalankan server di port 5000.
2. **Nginx Configuration:** Sebagai reverse proxy yang mengarahkan trafik `/` ke frontend statis dan `/api` ke container backend.
3. **GitHub Actions Workflow:** `.github/workflows/deploy.yml` untuk build docker image, push ke registry, dan otomatis SSH ke EC2 untuk melakukan `docker pull` dan `docker run`.

---

## 5. Security & S3 Policy Notes
- Pastikan backend menggunakan AWS SDK V3.
- Gunakan IAM User dengan policy `AmazonS3FullAccess` yang sudah saya siapkan.
- Pastikan koneksi ke RDS menggunakan library `mysql2` atau `pg` sesuai jenis DB di RDS.

---
**Instruksi Akhir untuk AI:**
"Berdasarkan spesifikasi di atas, mari kita mulai dengan langkah pertama: Buatkan kode skema database SQL dan struktur folder dasar untuk `fe/` dan `be/`."
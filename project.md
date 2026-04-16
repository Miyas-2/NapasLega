# Dokumentasi Proyek UTS Cloud Computing

## Step 1: Skema Database RDS & Struktur Folder Backend

Berdasarkan struktur response dari API WeatherAPI, berikut adalah rancangan skema database relasional (secara logis cocok untuk MySQL/PostgreSQL di AWS RDS) dan struktur folder backend.

### 1. Skema Database (RDS - MySQL/PostgreSQL)

Karena datanya memiliki relasi antara `location` dan `current` weather beserta `air_quality`, maka kita dapat menormalisasi datanya menjadi beberapa tabel.

#### Tabel `locations`
Menyimpan informasi lokasi/kota.

| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | INT / BIGINT | PRIMARY KEY, AUTO_INCREMENT | ID unik lokasi |
| `name` | VARCHAR(100) | NOT NULL | Nama lokasi (contoh: Lembang) |
| `region` | VARCHAR(100) | | Nama region/provinsi |
| `country` | VARCHAR(100) | NOT NULL | Negara |
| `lat` | DECIMAL(10,8) | NOT NULL | Latitude |
| `lon` | DECIMAL(11,8) | NOT NULL | Longitude |
| `tz_id` | VARCHAR(50) | | Timezone (contoh: Asia/Jakarta) |

#### Tabel `weather_logs`
Menyimpan data historis/cuaca saat ini berdasarkan lokasi.

| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | INT / BIGINT | PRIMARY KEY, AUTO_INCREMENT | ID unik log cuaca |
| `location_id` | INT / BIGINT | FOREIGN KEY (`locations.id`) | Relasi ke tabel lokasi |
| `last_updated_epoch`| INT | NOT NULL | Waktu update (Unix timestamp) |
| `last_updated_time` | DATETIME | | Waktu update format lokal |
| `temp_c` | DECIMAL(5,2) | | Suhu dalam Celcius |
| `temp_f` | DECIMAL(5,2) | | Suhu dalam Fahrenheit |
| `is_day` | TINYINT(1) / BOOLEAN| | 1 = Siang, 0 = Malam |
| `condition_text` | VARCHAR(100) | | Deskripsi kondisi (contoh: Patchy rain nearby) |
| `condition_icon` | VARCHAR(255) | | URL ikon kondisi cuaca |
| `condition_code` | INT | | Kode kondisi cuaca API |
| `wind_kph` | DECIMAL(5,2) | | Kecepatan angin (km/h) |
| `wind_degree` | INT | | Arah angin (derajat) |
| `wind_dir` | VARCHAR(10) | | Arah angin (teks) |
| `pressure_mb` | DECIMAL(6,2) | | Tekanan udara (milibar) |
| `precip_mm` | DECIMAL(6,2) | | Curah hujan (mm) |
| `humidity` | INT | | Kelembapan (%) |
| `cloud` | INT | | Tutupan awan (%) |
| `feelslike_c` | DECIMAL(5,2) | | Terasa seperti (Celcius) |
| `vis_km` | DECIMAL(5,2) | | Jarak pandang (km) |
| `uv` | DECIMAL(4,1) | | Indeks UV |

#### Tabel `air_qualities`
Menyimpan informasi kualitas udara (berelasi 1:1 dengan log cuaca). Jika dirasa tidak perlu tabel terpisah, kolom-kolom ini juga dapat digabungkan ke `weather_logs`. Namun, untuk pemisahan domain (Data Cuaca vs Polusi), lebih baik dipisah.

| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | INT / BIGINT | PRIMARY KEY, AUTO_INCREMENT | ID unik entri kualitas udara |
| `weather_log_id` | INT / BIGINT | FOREIGN KEY (`weather_logs.id`), UNIQUE| Relasi ke log cuaca |
| `co` | DECIMAL(8,2) | | Carbon Monoxide (μg/m3) |
| `no2` | DECIMAL(8,2) | | Nitrogen dioxide (μg/m3) |
| `o3` | DECIMAL(8,2) | | Ozone (μg/m3) |
| `so2` | DECIMAL(8,2) | | Sulphur dioxide (μg/m3) |
| `pm2_5` | DECIMAL(8,2) | | PM2.5 (μg/m3) |
| `pm10` | DECIMAL(8,2) | | PM10 (μg/m3) |
| `us_epa_index` | INT | | US EPA AQI standard index |
| `gb_defra_index` | INT | | UK DEFRA AQI standard index |

---

### 2. Struktur Folder Backend

Berikut ini adalah struktur best-practice untuk backend yang modular dan mudah di-maintain (cocok diterapkan untuk Node.js Express, NestJS, atau Python FastAPI/Flask). Di sini saya berikan contoh struktur umum berbasis **Node.js/Express** (bisa menyesuaikan jika memakai bahasa lain).

```text
backend/
├── src/
│   ├── config/              # Konfigurasi aplikasi (Database, Environment, dll)
│   │   ├── database.js          # Koneksi ke RDS
│   │   └── env.js               # Load variable lingkungan dari .env
│   ├── controllers/         # Menangani request HTTP & response (req, res)
│   │   ├── weather.controller.js
│   │   └── location.controller.js
│   ├── models/              # Definisi model & schema database (misal via Sequelize/TypeORM)
│   │   ├── location.model.js
│   │   ├── weatherLog.model.js
│   │   └── airQuality.model.js
│   ├── routes/              # Definisi endpoint (Routes) API
│   │   ├── index.js
│   │   ├── weather.routes.js
│   │   └── location.routes.js
│   ├── services/            # Inti business logic 
│   │   ├── weatherApi.service.js  # Service khusus hit API Weather eksternal
│   │   ├── weatherDb.service.js   # Service operasi CRUD ke DB RDS lokal
│   │   └── cron.service.js        # Scheduler node-cron (Opsional, untuk sync otomatis)
│   ├── middlewares/         # Middleware seperti validasi request, global error handler
│   │   ├── errorHandler.js
│   │   └── validator.js
│   ├── utils/               # Helper atau utility functions
│   │   └── logger.js
│   └── app.js               # Konfigurasi/Inisialisasi core app Express
├── .env                     # Variabel Environment (DB credentials, API Keys)
├── .gitignore
├── package.json
└── server.js                # Entry point jalannya server (app.listen)
```

**Penjelasan Layered Architecture:**
1. **Routes**: Entry point awal dari URL, misal `/api/v1/weather/current`. Tugasnya menyalurkan request ke `controller` yang tepat.
2. **Controllers**: Mengekstraksi parameter atau input dari user (contoh user mengirim kota 'lembang'), lalu memanggil `service` terkait.
3. **Services**: Menjalankan logika bisnis seperti: "Cek DB apakah cuaca lembang update terakhirnya masih di bawah 1 jam yg lalu? Jika ya, kembalikan dari DB (RDS). Jika tidak, hit external WeatherAPI, update DB, lalu return ke user".
4. **Models**: Layer khusus ORM/Database yang merepresentasikan skema tabel MySQL/PostgreSQL untuk operasi dasar database.


## Step 2: Backend Node.js, S3 Integration, & API AQI

Sesuai deskripsi NapasLega, struktur folder untuk backend Node.js telah dibuat di dalam `UTS/backend`.

**Teknologi Utama yang Diimplementasikan:**
- **Express.js & Sequelize:** Digunakan sebagai core backend dan ORM.
- **AWS SDK V3 & Multer-S3:** Di-setup dalam `src/services/s3Upload.js` untuk otomatis mengupload file (foto KTP/Resep dsb) langsung ke S3 Bucket aws via endpoint `/api/bookings`.
- **Axios:** Mengambil data integrasi WAQI (AQI) dari public token pada endpoint `/api/aqi`.
- **File Migrasi Database:** File relasi antar entitas (users, symptom_logs, clinics, bookings) sudah digabungkan dalam `backend/migrations/20260416-create-napaslega-tables.js` yang siap di-eksekusi melalui perintah `npx sequelize-cli db:migrate`.

---

## Step 3: Frontend Requirements (React)

Tampilan antarmuka (User Interface) telah di-generate dalam folder `UTS/fe`. Framework visual menggunakan **React + Vite** yang dipadukan dengan **Tailwind CSS**.

**Fitur Utama yang Diimplementasikan:**
1. **Premium Aesthetic & Layout:** Menggunakan Glassmorphism transparan UI (`glass` class), animasi halus dengan `tailwindcss-animate`, serta tata letak Sidebar Navigation untuk kesan antarmuka kesehatan modern.
2. **Dashboard AQI (`Dashboard.jsx`):** Menampilkan metrik indeks kualitas udara secara dinamis, mengintegrasikan komponen peta interaktif menggunakan `react-leaflet`, dan memberikan info kesehatan ISPA dengan ikon `lucide-react`.
3. **Symptom Form (`SymptomForm.jsx`):** Melibatkan integrasi React state untuk multiple-selection form kondisi gejala keluhan pasien beserta animasi umpan balik (feedback animation) saat keluhan berhasil dikirim ke database backend.
4. **Booking Page & S3 Upload (`BookingPage.jsx`):** Form pemesanan RS/Klinik lengkap dengan fungsionalitas drag-and-drop file gambar dokumen (KTP/Resep) yang terhubung untuk dikirimkan melalui multipart/form-data ke endpoint `/api/bookings`.

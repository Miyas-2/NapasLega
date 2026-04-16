# Gunakan runtime resmi NodeJS berukuran minimal (Alpine OS)
FROM node:20-alpine

# Melabeli area kerja di dalam kontainer Linux
WORKDIR /usr/src/app

# Salin file manajemen paket terlebih dahulu untuk konfigurasi layer cache Docker
COPY package*.json ./

# Unduh module node_modules (production mode jika memungkinkan)
RUN npm install

# Salin seluruh berkas aplikasi sisanya (tidak termasuk node_modules/.env berkat .dockerignore)
COPY . .

# Mengekspos Port 5000 (Port Express kita) pada kontainer ini
EXPOSE 5000

# Sintaks eksekusi utama saat docker run dijalankan
CMD ["node", "server.js"]

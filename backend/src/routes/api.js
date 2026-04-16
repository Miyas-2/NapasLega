const express = require('express');
const router = express.Router();
const axios = require('axios');
const upload = require('../services/s3Upload');
const authMiddleware = require('../middlewares/authMiddleware');
const authController = require('../controllers/authController');

// Import Models
const SymptomLog = require('../models/SymptomLog');
const Booking = require('../models/Booking');
const Clinic = require('../models/Clinic');

/** 
 * AUTHENTICATION
 */
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);

/** 
 * GET /api/aqi (Public Data via WeatherAPI)
 * Menerima ?lat=xxx&lon=xxx
 */
router.get('/aqi', async (req, res) => {
    try {
        const lat = req.query.lat || -6.8117; // Default Lembang
        const lon = req.query.lon || 107.6175;
        const apiKey = '6ea19653e8744437bb5123133252305';
        const url = `http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${lat},${lon}&aqi=yes`;
        
        const response = await axios.get(url);
        res.json({ success: true, data: response.data });
    } catch (error) {
        console.error("AQI fetch error:", error.message);
        res.status(500).json({ success: false, message: 'Gagal mengambil data AQI dari WeatherAPI.' });
    }
});

/** 
 * GET /api/clinics (Public or Protected depending on use case)
 */
router.get('/clinics', async (req, res) => {
    try {
        const clinics = await Clinic.findAll();
        res.json({ success: true, count: clinics.length, data: clinics });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Gagal memuat klinik' });
    }
});

/** 
 * POST /api/symptoms (Protected Route)
 */
router.post('/symptoms', authMiddleware, async (req, res) => {
    try {
        const { symptoms, notes, log_date, location_lat, location_long, aqi_recorded, location_name } = req.body;
        // req.user.userId didapat dari authMiddleware hasil decode JWT
        const newLog = await SymptomLog.create({ 
           user_id: req.user.userId, 
           symptoms, 
           notes, 
           log_date: log_date || new Date(),
           location_lat,
           location_long,
           aqi_recorded,
           location_name
        });
        
        res.json({ success: true, message: 'Keluhan kesehatan berhasil dicatat di database RDS.', data: newLog });
    } catch (error) {
        console.error("Symptom save error:", error);
        res.status(500).json({ success: false, message: 'Gagal menyimpan data keluhan.' });
    }
});

/** 
 * POST /api/bookings (Protected Route)
 */
router.post('/bookings', authMiddleware, upload.single('ktpFile'), async (req, res) => {
    try {
        const { clinic_id, booking_date } = req.body;
        
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'File gambar KTP/Resep diwajibkan.' });
        }
        
        const fileUrl = req.file.location; // S3 public URL

        const newBooking = await Booking.create({ 
           user_id: req.user.userId, 
           clinic_id, 
           booking_date: booking_date || new Date(), 
           s3_photo_url: fileUrl, 
           status: 'PENDING' 
        });
        
        res.json({ 
            success: true, 
            message: 'Booking berhasil, file sukses tersimpan S3.', 
            data: newBooking
        });
    } catch (error) {
        console.error("Booking error:", error);
        res.status(500).json({ success: false, message: 'Gagal membuat booking atau upload file.' });
    }
});

/** 
 * GET /api/symptoms/history (Riwayat Pribadi - Protected)
 */
router.get('/symptoms/history', authMiddleware, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const offset = (page - 1) * limit;

        const { count, rows } = await SymptomLog.findAndCountAll({
            where: { user_id: req.user.userId },
            order: [['createdAt', 'DESC']],
            limit,
            offset
        });

        res.json({ 
            success: true, 
            data: rows, 
            meta: { total: count, page, limit, totalPages: Math.ceil(count / limit) } 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Gagal memuat histori keluhan' });
    }
});

/** 
 * GET /api/bookings/history (Riwayat Booking Pribadi - Protected)
 */
router.get('/bookings/history', authMiddleware, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const offset = (page - 1) * limit;

        const { count, rows } = await Booking.findAndCountAll({
            where: { user_id: req.user.userId },
            include: [{ model: Clinic, attributes: ['name', 'address'] }],
            order: [['createdAt', 'DESC']],
            limit,
            offset
        });
        res.json({ 
            success: true, 
            data: rows, 
            meta: { total: count, page, limit, totalPages: Math.ceil(count / limit) } 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Gagal memuat histori booking' });
    }
});

/** 
 * GET /api/symptoms/map (Data Spasial Public)
 */
router.get('/symptoms/map', async (req, res) => {
    try {
        // Ambil data keluhan yang ada koordinat geografisnya saja
        const logs = await SymptomLog.findAll({
            attributes: ['id', 'symptoms', 'location_lat', 'location_long', 'log_date']
        });
        // Filter out yang tidak punya koord (misal tester sebelumnya)
        const validGeoLogs = logs.filter(l => l.location_lat && l.location_long);
        res.json({ success: true, count: validGeoLogs.length, data: validGeoLogs });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Gagal memuat titik peta keluhan' });
    }
});

/** 
 * GET /api/symptoms/insights (Visualisasi Data Pelaporan)
 */
router.get('/symptoms/insights', async (req, res) => {
    try {
        const { Op } = require('sequelize');
        const totalLogs = await SymptomLog.count();
        const recentLogs = await SymptomLog.findAll({
            limit: 5,
            order: [['createdAt', 'DESC']],
            attributes: ['id', 'symptoms', 'location_lat', 'location_long', 'log_date', 'aqi_recorded']
        });
        
        // Kalkulasi Rata-rata AQI Warga
        const aqiEntries = await SymptomLog.findAll({
            where: { aqi_recorded: { [Op.not]: null } },
            attributes: ['aqi_recorded']
        });
        
        let avgAqi = 0;
        if (aqiEntries.length > 0) {
            const sum = aqiEntries.reduce((acc, curr) => acc + curr.aqi_recorded, 0);
            avgAqi = (sum / aqiEntries.length).toFixed(1);
        }
        
        res.json({ success: true, count: totalLogs, avgAqi, recent: recentLogs });
    } catch (error) {
        console.error("Insght Fetch Error:", error);
        res.status(500).json({ success: false, message: 'Gagal mereload insight data.' });
    }
});

/** 
 * GET /api/symptoms/stats (Recharts Histogram Data)
 */
router.get('/symptoms/stats', async (req, res) => {
    try {
        const { sequelize } = require('../models/SymptomLog'); // Or use direct DB connection if available
        const SymptomLog = require('../models/SymptomLog');
        
        // Count entries per aqi_recorded
        const stats = await SymptomLog.findAll({
            attributes: [
               'aqi_recorded',
               [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
            ],
            group: ['aqi_recorded'],
            where: { aqi_recorded: { [require('sequelize').Op.not]: null } },
            order: [['aqi_recorded', 'ASC']]
        });
        
        res.json({ success: true, data: stats });
    } catch (error) {
        console.error("Stats Error:", error);
        res.status(500).json({ success: false, message: 'Gagal memuat chart' });
    }
});

module.exports = router;

'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Buat Dummy User untuk dikaitkan dengan log
    const hashedPassword = await bcrypt.hash('password123', 10);
    await queryInterface.bulkInsert('users', [
      { username: 'pasien_dago', email: 'dago@napaslega.com', password: hashedPassword, createdAt: new Date(), updatedAt: new Date() },
      { username: 'pasien_cikutra', email: 'cikutra@napaslega.com', password: hashedPassword, createdAt: new Date(), updatedAt: new Date() }
    ]);

    const usersData = await queryInterface.sequelize.query(
      `SELECT id, email FROM users WHERE email IN ('dago@napaslega.com', 'cikutra@napaslega.com');`, 
      { type: Sequelize.QueryTypes.SELECT }
    );
    const dagoId = usersData.find(u => u.email === 'dago@napaslega.com')?.id || 1;
    const cikutraId = usersData.find(u => u.email === 'cikutra@napaslega.com')?.id || 2;
    
    const gejalas = [
        '["Batuk Kering"]', '["Sesak Napas"]', '["Batuk Berdahak", "Demam"]', 
        '["Hidung Meler", "Sakit Tenggorokan"]', '["Nyeri Dada"]'
    ];

    const dagos = [];
    const cikutras = [];

    // Bikin 50 titik di Dago
    for (let i = 0; i < 50; i++) {
        dagos.push({
            user_id: dagoId,
            symptoms: gejalas[Math.floor(Math.random() * gejalas.length)],
            notes: 'Data visualisasi dummy area Dago',
            log_date: new Date(),
            location_lat: -6.891 + ((Math.random() - 0.5) * 0.03), // Serak area radius
            location_long: 107.616 + ((Math.random() - 0.5) * 0.03),
            location_name: 'Dago, Jawa Barat',
            aqi_recorded: Math.floor(Math.random() * 6) + 1,
            createdAt: new Date(),
            updatedAt: new Date()
        });
    }

    // Bikin 50 titik di Makam Pahlawan Cikutra
    for (let i = 0; i < 50; i++) {
        cikutras.push({
            user_id: cikutraId,
            symptoms: gejalas[Math.floor(Math.random() * gejalas.length)],
            notes: 'Data visualisasi dummy area TMP Cikutra',
            log_date: new Date(),
            location_lat: -6.897 + ((Math.random() - 0.5) * 0.02),
            location_long: 107.635 + ((Math.random() - 0.5) * 0.02),
            location_name: 'TMP Cikutra, Jawa Barat',
            aqi_recorded: Math.floor(Math.random() * 6) + 1,
            createdAt: new Date(),
            updatedAt: new Date()
        });
    }

    await queryInterface.bulkInsert('symptom_logs', [...dagos, ...cikutras], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('symptom_logs', null, {});
    await queryInterface.bulkDelete('users', null, {});
  }
};

'use strict';
// File untuk seeding data dummy Klinik ke dalam DB.
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('clinics', [
      { name: 'Klinik Pramita Lembang', address: 'Jl. Raya Lembang No 102', location_lat: -6.81432, location_long: 107.61842, createdAt: new Date(), updatedAt: new Date() },
      { name: 'RSUD Lembang', address: 'Jl. Raya Tangkuban Perahu', location_lat: -6.80911, location_long: 107.62002, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Klinik Sehat Utama', address: 'Jl. Setiabudi No 301', location_lat: -6.83901, location_long: 107.59929, createdAt: new Date(), updatedAt: new Date() }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('clinics', null, {});
  }
};

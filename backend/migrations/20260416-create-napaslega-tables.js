'use strict';

// Gunakan command "npx sequelize-cli db:migrate" di terminal nantinya untuk run migrasi ini ke DB asli.

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Membangun Tabel "users"
    await queryInterface.createTable('users', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      username: { type: Sequelize.STRING, allowNull: false },
      password: { type: Sequelize.STRING, allowNull: false },
      email: { type: Sequelize.STRING, unique: true },
      createdAt: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updatedAt: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });

    // 2. Membangun Tabel "symptom_logs"
    await queryInterface.createTable('symptom_logs', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      user_id: { 
        type: Sequelize.INTEGER, 
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE', onDelete: 'CASCADE'
      },
      symptoms: { type: Sequelize.TEXT }, // Disimpan dalam format text/JSON
      log_date: { type: Sequelize.DATE },
      notes: { type: Sequelize.TEXT },
      location_lat: { type: Sequelize.DECIMAL(10, 8) },
      location_long: { type: Sequelize.DECIMAL(11, 8) },
      createdAt: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updatedAt: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });

    // 3. Membangun Tabel "clinics"
    await queryInterface.createTable('clinics', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: Sequelize.STRING, allowNull: false },
      address: { type: Sequelize.TEXT },
      location_lat: { type: Sequelize.DECIMAL(10, 8) },
      location_long: { type: Sequelize.DECIMAL(11, 8) },
      createdAt: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updatedAt: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });

    // 4. Membangun Tabel "bookings"
    await queryInterface.createTable('bookings', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      user_id: { 
        type: Sequelize.INTEGER, 
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE', onDelete: 'CASCADE'
      },
      clinic_id: { 
        type: Sequelize.INTEGER, 
        references: { model: 'clinics', key: 'id' },
        onUpdate: 'CASCADE', onDelete: 'CASCADE'
      },
      booking_date: { type: Sequelize.DATE },
      s3_photo_url: { type: Sequelize.STRING }, // Menyimpan URL gambar dari s3 bucket
      status: { type: Sequelize.STRING, defaultValue: 'PENDING' },
      createdAt: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updatedAt: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Digunakan saat proses rollback (mendrop DB dari yang paling terluar di relationtree-nya)
    await queryInterface.dropTable('bookings');
    await queryInterface.dropTable('clinics');
    await queryInterface.dropTable('symptom_logs');
    await queryInterface.dropTable('users');
  }
};

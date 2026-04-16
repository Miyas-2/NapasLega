const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Clinic = require('./Clinic');

const Booking = sequelize.define('Booking', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  booking_date: { type: DataTypes.DATE },
  s3_photo_url: { type: DataTypes.STRING }, 
  status: { type: DataTypes.STRING, defaultValue: 'PENDING' }
}, {
  tableName: 'bookings',
  timestamps: true
});

// Relationships
Booking.belongsTo(User, { foreignKey: 'user_id' });
Booking.belongsTo(Clinic, { foreignKey: 'clinic_id' });
User.hasMany(Booking, { foreignKey: 'user_id' });
Clinic.hasMany(Booking, { foreignKey: 'clinic_id' });

module.exports = Booking;

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Clinic = sequelize.define('Clinic', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  address: { type: DataTypes.TEXT },
  location_lat: { type: DataTypes.DECIMAL(10, 8) },
  location_long: { type: DataTypes.DECIMAL(11, 8) }
}, {
  tableName: 'clinics',
  timestamps: true
});

module.exports = Clinic;

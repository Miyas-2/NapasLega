const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User'); // Import relation target

const SymptomLog = sequelize.define('SymptomLog', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  symptoms: { 
    type: DataTypes.TEXT,
    get() {
      const rawValue = this.getDataValue('symptoms');
      return rawValue ? JSON.parse(rawValue) : [];
    },
    set(val) {
      this.setDataValue('symptoms', JSON.stringify(val));
    }
  }, 
  log_date: { type: DataTypes.DATE },
  notes: { type: DataTypes.TEXT },
  location_lat: { type: DataTypes.DECIMAL(10, 8) },
  location_long: { type: DataTypes.DECIMAL(11, 8) },
  aqi_recorded: { type: DataTypes.INTEGER },
  location_name: { type: DataTypes.STRING }
}, {
  tableName: 'symptom_logs',
  timestamps: true
});

SymptomLog.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(SymptomLog, { foreignKey: 'user_id' });

module.exports = SymptomLog;

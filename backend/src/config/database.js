const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql', // Gunakan 'postgres' jika AWS RDS yang digunakan DB nya PostgreSQL
    logging: false,
  }
);

module.exports = sequelize;

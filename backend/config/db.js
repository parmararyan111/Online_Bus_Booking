const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'bus_booking_db',
  port: parseInt(process.env.DB_PORT || '3306'),
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0,
  timezone: '+00:00'
});

// Test connection on startup
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log(`[DB] Successfully connected to MySQL database: ${process.env.DB_NAME || 'bus_booking_db'}`);
    connection.release();
  } catch (error) {
    console.error('[DB Error] Failed to connect to MySQL database:', error.message);
  }
})();

module.exports = pool;

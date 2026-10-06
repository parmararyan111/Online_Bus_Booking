const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

async function runSeed() {
  console.log('[Seed] Initializing Bus Booking Database seed...');
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      port: parseInt(process.env.DB_PORT || '3306'),
      multipleStatements: true
    });

    const sqlPath = path.join(__dirname, '..', 'database', 'bus_booking_db.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    console.log('[Seed] Executing bus_booking_db.sql file...');
    await connection.query(sqlContent);

    console.log('[Seed] Database successfully seeded with 10+ buses, 15+ routes, 30+ schedules, seats, users & admin accounts!');
    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error] Failed to seed database:', error);
    process.exit(1);
  }
}

runSeed();

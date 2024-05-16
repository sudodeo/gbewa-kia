const { Pool } = require('pg');
require('dotenv').config()
const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: "db",
  password: process.env.POSTGRES_PW,
  port: 5432,
});

async function createDatabase() {
  const client = await pool.connect();
  try { 
    const result = await client.query(`SELECT 1 FROM pg_database WHERE datname = 'gbewa_kia';`);
    if (result.rows.length === 0) {
      await client.query(`CREATE DATABASE gbewa_kia;`);
    }
  } finally {
    client.release();
  }
}

createDatabase()
  .then(() => console.log('Database created successfully'))
  .catch(err => console.error('Error creating database:', err))
  .finally(() => pool.end());

import pg from "pg";

import Config from "../config/config";

const pool = new pg.Pool({
  connectionString: Config.DATABASE_URL,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  max: 20,
  query_timeout: 2000
});

pool.on("error", (error: Error) => {
  console.error(`PostgreSQL connection pool error: ${error}`);
  pool.end();
});

export default pool;

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;

// For open-source/development: make database optional
let pool: Pool | null = null;
let db: any = null;

if (databaseUrl) {
  try {
    pool = new Pool({
      connectionString: databaseUrl,
      // Add timeout to fail faster if database isn't available
      connectionTimeoutMillis: 2000,
    });
    db = drizzle(pool);
  } catch (error) {
    console.warn("Database connection failed, running in mock mode");
  }
} else {
  console.warn("DATABASE_URL not configured, running in mock mode");
}

// Export db or a mock that will be handled by API routes
export { db, pool };
export const isDbAvailable = !!db;

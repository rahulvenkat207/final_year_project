import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// Use neon() function directly for serverless (recommended for Neon)
const sql = neon(connectionString);

// Export drizzle instance
export const db = drizzle(sql, {
  logger: false,
  schema,
});

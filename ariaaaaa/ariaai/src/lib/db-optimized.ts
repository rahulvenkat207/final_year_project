// Optimized database connection with better error handling and timeouts
import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool, neonConfig } from "@neondatabase/serverless";

// Only import ws in Node.js environment
let ws: any;
if (typeof window === "undefined") {
  try {
    ws = require("ws");
    neonConfig.webSocketConstructor = ws;
  } catch (e) {
    console.warn("ws package not found, using default WebSocket");
  }
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// Create optimized connection pool
const pool = new Pool({
  connectionString,
  max: 5,
  idleTimeoutMillis: 20000,
  connectionTimeoutMillis: 5000,
  allowExitOnIdle: true,
});

pool.on("error", (err) => {
  console.error("Database connection error:", err.message);
});

// Export optimized database instance
export const db = drizzle(pool, {
  logger: false, // Disable logging for performance
});


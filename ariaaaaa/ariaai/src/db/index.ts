import { drizzle } from "drizzle-orm/neon-serverless";
import { neon, neonConfig } from "@neondatabase/serverless";

// Only import ws in Node.js environment (server-side)
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

// Use neon() function directly for serverless (recommended for Neon)
const sql = neon(connectionString);

// Export drizzle instance
export const db = drizzle(sql, {
  logger: false,
});

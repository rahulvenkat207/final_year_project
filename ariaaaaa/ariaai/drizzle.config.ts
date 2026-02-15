import "dotenv/config";
import { defineConfig } from "drizzle-kit";

// For drizzle-kit push, use direct connection (not pooler) if available
// Pooler URLs don't work well with drizzle-kit migrations
const getDatabaseUrl = () => {
  const dbUrl = process.env.DATABASE_URL || "";
  
  // If using pooler URL, try to convert to direct connection
  if (dbUrl.includes("-pooler")) {
    // Replace -pooler with direct connection
    const directUrl = dbUrl.replace("-pooler", "");
    console.log("⚠️  Using direct connection for drizzle-kit (pooler not supported)");
    return directUrl;
  }
  
  return dbUrl;
};

export default defineConfig({
  out: "./drizzle",
  schema: "./src/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: getDatabaseUrl(),
  },
});

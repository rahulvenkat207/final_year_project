// Script to check database connection
require("dotenv/config");
const { neon } = require("@neondatabase/serverless");
const ws = require("ws");

// Configure WebSocket for Neon
const { neonConfig } = require("@neondatabase/serverless");
neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("❌ DATABASE_URL not found in environment variables");
  console.log("💡 Make sure you have a .env file with DATABASE_URL set");
  process.exit(1);
}

console.log("🔍 Testing database connection...");
console.log("📍 Connection string:", connectionString.replace(/:[^:@]+@/, ":****@")); // Hide password

// Try direct connection (without pooler)
const directUrl = connectionString.includes("-pooler") 
  ? connectionString.replace("-pooler", "")
  : connectionString;

console.log("\n📡 Testing direct connection:", directUrl.replace(/:[^:@]+@/, ":****@"));

const sql = neon(directUrl);

sql`SELECT 1 as test`
  .then((result) => {
    console.log("✅ Database connection successful!");
    console.log("📊 Test query result:", result);
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Database connection failed!");
    console.error("Error:", error.message);
    console.error("\n💡 Possible issues:");
    console.error("   1. Database instance might be paused or deleted");
    console.error("   2. Connection string might be incorrect");
    console.error("   3. Network/DNS issue");
    console.error("\n🔧 Try:");
    console.error("   1. Check your Neon dashboard to ensure database is active");
    console.error("   2. Get a fresh connection string from Neon");
    console.error("   3. Update DATABASE_URL in .env file");
    process.exit(1);
  });


import { NextResponse } from "next/server";
import { db } from "@/db";
import { user } from "@/db/schema";
import { sql } from "drizzle-orm";

// Test database connection and table existence
export async function GET() {
  try {
    // Test 1: Simple query to check connection using drizzle
    console.log("Testing database connection...");
    const testQuery = await db.execute(sql`SELECT 1 as test`);
    console.log("Connection test result:", testQuery);

    // Test 2: Check if user table exists
    try {
      const tableCheck = await db.execute(sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'user'
        );
      `);
      console.log("User table exists:", tableCheck);
    } catch (tableError: any) {
      console.error("Error checking table:", tableError.message);
    }

    // Test 3: Try to query user table
    try {
      const users = await db.select().from(user).limit(1);
      console.log("User table query successful, count:", users.length);
    } catch (queryError: any) {
      console.error("Error querying user table:", queryError.message);
      return NextResponse.json({
        success: false,
        error: "User table query failed",
        message: queryError.message,
        suggestion: "Run 'npm run db:push' to create tables",
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Database connection working",
      tablesExist: true,
    });
  } catch (error: any) {
    console.error("Database test error:", error);
    return NextResponse.json({
      success: false,
      error: "Database connection failed",
      message: error?.message || "Unknown error",
      stack: error?.stack,
      suggestion: "Check DATABASE_URL in .env file and ensure database is active",
    }, { status: 500 });
  }
}

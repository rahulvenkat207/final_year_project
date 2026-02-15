import { NextResponse } from "next/server";
import { db } from "@/db";

// Test route to check database connection
export async function GET() {
  try {
    // Simple database query to test connection
    const result = await db.execute("SELECT 1 as test");
    return NextResponse.json({ 
      success: true, 
      message: "Database connection working",
      result 
    });
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
}


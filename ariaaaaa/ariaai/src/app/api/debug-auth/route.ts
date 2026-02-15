import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001",
    nodeEnv: process.env.NODE_ENV,
    expectedOrigin: process.env.NEXT_PUBLIC_APP_URL || 
      (process.env.NODE_ENV === "development" ? "http://localhost:3001" : "http://localhost:3000"),
    message: "Check that your browser's origin matches the expectedOrigin above",
  });
}


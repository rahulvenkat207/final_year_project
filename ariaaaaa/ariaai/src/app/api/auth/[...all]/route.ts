import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
import { NextRequest, NextResponse } from "next/server";

// Export handlers with proper error handling
const handler = toNextJsHandler(auth);

// Helper to get origin from request
const getOriginFromRequest = (req: NextRequest): string => {
  const origin = req.headers.get("origin");
  if (origin) return origin;
  
  const referer = req.headers.get("referer");
  if (referer) {
    try {
      const url = new URL(referer);
      return url.origin;
    } catch {}
  }
  
  // Fallback to extracting from request URL
  try {
    const url = new URL(req.url);
    return url.origin;
  } catch {
    return "http://localhost:3001";
  }
};

// Wrap handlers with error logging
const wrappedPOST = async (req: NextRequest) => {
  try {
    const url = req.url;
    const origin = getOriginFromRequest(req);
    console.log("Auth API POST request received");
    console.log("Request URL:", url);
    console.log("Request Origin:", origin);
    console.log("Auth baseURL:", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001");
    
    // Create a new request with the correct origin header if missing
    const headers = new Headers(req.headers);
    if (!headers.get("origin")) {
      headers.set("origin", origin);
    }
    
    const modifiedReq = new NextRequest(req.url, {
      method: req.method,
      headers: headers,
      body: req.body,
    });
    
    const response = await handler.POST(modifiedReq);
    
    // Log response status
    console.log("Response status:", response.status);
    console.log("Response statusText:", response.statusText);
    
    // Clone response to log it without consuming it
    const clonedResponse = response.clone();
    
    // Check if response has content
    const contentType = response.headers.get("content-type");
    console.log("Response content-type:", contentType);
    console.log("Response headers:", Object.fromEntries(response.headers.entries()));
    
    if (contentType?.includes("application/json")) {
      try {
        const responseText = await clonedResponse.text();
        console.log("Response text length:", responseText.length);
        console.log("Response text (full):", responseText);
        
        if (responseText && responseText.trim()) {
          const responseData = JSON.parse(responseText);
          console.log("Auth API POST response (parsed):", JSON.stringify(responseData, null, 2));
          
          // Log error details if present
          if (responseData.error) {
            console.error("Response contains error:", JSON.stringify(responseData.error, null, 2));
            console.error("Error type:", typeof responseData.error);
            console.error("Error keys:", Object.keys(responseData.error || {}));
          }
        } else {
          console.warn("Empty JSON response from auth handler");
        }
      } catch (parseError: any) {
        console.error("Failed to parse response:", parseError.message);
        const text = await clonedResponse.text();
        console.error("Response text was:", text);
      }
    } else {
      const text = await clonedResponse.text();
      console.log("Non-JSON response:", text.substring(0, 500));
    }
    
    return response;
  } catch (error: any) {
    console.error("Auth API POST error:", error);
    console.error("Error name:", error?.name);
    console.error("Error message:", error?.message);
    console.error("Error stack:", error?.stack);
    
    // Return proper JSON error response
    return NextResponse.json(
      { 
        error: {
          message: error?.message || "Authentication error occurred",
          code: error?.code || "AUTH_ERROR",
          details: error?.toString() || "Unknown error",
        }
      },
      { status: 500 }
    );
  }
};

const wrappedGET = async (req: NextRequest) => {
  try {
    const response = await handler.GET(req);
    return response;
  } catch (error: any) {
    console.error("Auth API GET error:", error);
    return NextResponse.json(
      { 
        error: {
          message: error?.message || "Authentication error",
          code: error?.code || "AUTH_ERROR"
        }
      },
      { status: 500 }
    );
  }
};

export { wrappedPOST as POST, wrappedGET as GET };

// Add runtime config for better error handling
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

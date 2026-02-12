"use client";

import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  /** The base URL of the server - use current origin for client-side */
  baseURL: typeof window !== "undefined" 
    ? window.location.origin 
    : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
});

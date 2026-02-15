import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  // Use current origin dynamically to avoid port mismatch issues
  baseURL: typeof window !== "undefined" 
    ? window.location.origin 
    : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  basePath: "/api/auth",
  fetchOptions: {
    credentials: "include",
  },
});

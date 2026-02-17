import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import * as schema from "@/db/schema";

// Optimize auth configuration for performance

// Build social providers conditionally
const socialProviders: any = {};

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  socialProviders.google = {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  };
}

// Get base URL - prioritize env var, fallback to localhost:3001 for dev
// Better Auth validates Origin header against baseURL, so it must match exactly
const getBaseURL = () => {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    const url = process.env.NEXT_PUBLIC_APP_URL;
    console.log("[Auth Config] Using NEXT_PUBLIC_APP_URL:", url);
    return url;
  }
  // Default to 3000 as it's the standard Next.js dev port
  const defaultURL = "http://localhost:3000";
  console.log("[Auth Config] Using default baseURL:", defaultURL);
  return defaultURL;
};

const baseURL = getBaseURL();
console.log("[Auth Config] Final baseURL:", baseURL);

export const auth = betterAuth({
  baseURL: baseURL,
  basePath: "/api/auth",
  ...(Object.keys(socialProviders).length > 0 ? { socialProviders } : {}),
  emailAndPassword: {
    enabled: true,
  },
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      ...schema,
    },
  }),
});

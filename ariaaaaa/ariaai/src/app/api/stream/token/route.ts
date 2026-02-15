import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getStreamServerClient } from "@/lib/stream";

export async function POST(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { type } = await request.json(); // "video" or "chat"
        const streamClient = getStreamServerClient(type);
        
        let token;
        if (type === "video") {
            const expirationTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour
            const issuedAt = Math.floor(Date.now() / 1000) - 60;
            // The StreamClient (video) uses `generateUserToken` or `createToken` based on SDK version, but usually `createToken` or similar.
            // The @stream-io/node-sdk documentation says: client.generateUserToken({ user_id: userId, validity_in_seconds: ... }) or similar but 
            // actually for Stream Video it is often `createToken(userId, expiration, iaT)`.
            // Let's use the standard `createToken` if it exists, or check the docs which say `client.generateUserToken` in the prompt.
            // Prompt says: `client.generateUserToken({ user_id: userId, validity_in_seconds: validity });`
            token = streamClient.generateUserToken({ user_id: session.user.id });
        } else {
            token = streamClient.createToken(session.user.id);
        }

        return NextResponse.json({ token });
    } catch (error) {
        console.error("Error generating Stream token:", error);
        return NextResponse.json(
            { error: "Failed to generate token" },
            { status: 500 }
        );
    }
}





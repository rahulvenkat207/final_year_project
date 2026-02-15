import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { generateLiveKitToken, getLiveKitServerCredentials } from "@/lib/livekit";

export async function POST(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { roomName } = await request.json();
        const { apiKey, apiSecret } = getLiveKitServerCredentials();

        const token = generateLiveKitToken(
            session.user.id,
            roomName || `meeting-${Date.now()}`,
            apiKey,
            apiSecret
        );

        return NextResponse.json({ token });
    } catch (error) {
        console.error("Error generating LiveKit token:", error);
        return NextResponse.json(
            { error: "Failed to generate token" },
            { status: 500 }
        );
    }
}


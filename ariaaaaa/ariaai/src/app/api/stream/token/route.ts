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
        const streamClient = getStreamServerClient();
        
        const token = streamClient.createToken(session.user.id);

        return NextResponse.json({ token });
    } catch (error) {
        console.error("Error generating Stream token:", error);
        return NextResponse.json(
            { error: "Failed to generate token" },
            { status: 500 }
        );
    }
}




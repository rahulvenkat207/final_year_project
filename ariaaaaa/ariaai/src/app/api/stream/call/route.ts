import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getStreamServerClient } from "@/lib/stream";
import { db } from "@/db";
import { meetings } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { meetingId } = await request.json();
        
        // Verify meeting belongs to user
        const [meeting] = await db
            .select()
            .from(meetings)
            .where(eq(meetings.id, meetingId));

        if (!meeting || meeting.userId !== session.user.id) {
            return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
        }

        const streamClient = getStreamServerClient("video");
        
        // Create or get call
        const call = streamClient.video.call("default", meetingId);
        await call.getOrCreate({
            data: {
                created_by_id: session.user.id,
                custom: {
                    meetingId,
                    agentId: meeting.agentId,
                },
            },
        });

        // Create user tokens for user and agent
        // For Stream Video SDK (node), use generateUserToken or createToken depending on version. 
        // Based on previous step, we established generateUserToken might be the method or createToken. 
        // Let's use createToken if available or generateUserToken. 
        // Actually, StreamClient (video) usually uses createToken for simple user tokens.
        const userToken = streamClient.createToken(session.user.id);
        const agentToken = streamClient.createToken(`agent-${meeting.agentId}`);

        return NextResponse.json({
            callId: meetingId,
            userToken,
            agentToken,
        });
    } catch (error) {
        console.error("Error creating Stream call:", error);
        return NextResponse.json(
            { error: "Failed to create call" },
            { status: 500 }
        );
    }
}





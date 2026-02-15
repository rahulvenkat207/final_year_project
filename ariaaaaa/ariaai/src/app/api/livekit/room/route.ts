import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
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

        // LiveKit room name (use meeting ID)
        const roomName = `meeting-${meetingId}`;

        return NextResponse.json({ 
            roomName,
            meetingId,
            agentId: meeting.agentId,
        });
    } catch (error) {
        console.error("Error creating LiveKit room:", error);
        return NextResponse.json(
            { error: "Failed to create room" },
            { status: 500 }
        );
    }
}


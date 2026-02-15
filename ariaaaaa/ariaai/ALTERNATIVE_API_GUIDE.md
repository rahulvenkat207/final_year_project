# Alternative API Integration Guide

## 📋 Summary

- ✅ **Grok/Kimi K2**: YES for summarization, NO for voice
- ✅ **LiveKit**: YES, can replace Stream.io (requires code changes)

---

## 🔄 Option 1: Use Grok/Kimi K2 for Summarization

### Step 1: Install Required Packages

```bash
# For Grok (xAI)
npm install @xai/grok-sdk

# For Kimi (Moonshot AI)
npm install moonshot-ai
```

### Step 2: Update `src/lib/inngest/functions.ts`

**For Grok:**
```typescript
import { Grok } from "@xai/grok-sdk";

const grok = new Grok({
    apiKey: process.env.GROK_API_KEY,
});

// Replace OpenAI summarization with Grok
const summary = await step.run("generate-summary", async () => {
    const response = await grok.chat.completions.create({
        model: "grok-beta", // or "grok-2" if available
        messages: [
            {
                role: "system",
                content: "You are a helpful assistant that summarizes meeting transcripts. Provide a clear, organized summary with key points and action items.",
            },
            {
                role: "user",
                content: `Please summarize this meeting transcript:\n\n${transcript}`,
            },
        ],
    });

    return response.choices[0]?.message?.content || "";
});
```

**For Kimi K2:**
```typescript
import { MoonshotAI } from "moonshot-ai";

const moonshot = new MoonshotAI({
    apiKey: process.env.KIMI_API_KEY,
});

// Replace OpenAI summarization with Kimi
const summary = await step.run("generate-summary", async () => {
    const response = await moonshot.chat.completions.create({
        model: "moonshot-v1-8k", // or "k2" if available
        messages: [
            {
                role: "system",
                content: "You are a helpful assistant that summarizes meeting transcripts. Provide a clear, organized summary with key points and action items.",
            },
            {
                role: "user",
                content: `Please summarize this meeting transcript:\n\n${transcript}`,
            },
        ],
    });

    return response.choices[0]?.message?.content || "";
});
```

### Step 3: Update `.env` File

```env
# Remove or keep OpenAI for voice
OPENAI_API_KEY=""  # Still needed for realtime voice API

# Add one of these:
GROK_API_KEY="your-grok-api-key"
# OR
KIMI_API_KEY="your-kimi-api-key"
```

### ⚠️ Important Note
- **You still need OpenAI API key** for realtime voice (Grok/Kimi don't have voice APIs)
- Only summarization will use Grok/Kimi

---

## 🎥 Option 2: Replace Stream.io with LiveKit

### Step 1: Install LiveKit Packages

```bash
npm install livekit-client livekit-react-sdk @livekit/components-react
npm install livekit-server-sdk  # For server-side
```

### Step 2: Create New LiveKit Utility File

**Create `src/lib/livekit.ts`:**
```typescript
import { Room, RoomOptions } from "livekit-client";
import { LiveKitRoom } from "@livekit/components-react";
import { AccessToken } from "livekit-server-sdk";

// Generate LiveKit access token
export const generateLiveKitToken = (
    userId: string,
    roomName: string,
    apiKey: string,
    apiSecret: string
): string => {
    const token = new AccessToken(apiKey, apiSecret, {
        identity: userId,
    });

    token.addGrant({
        room: roomName,
        roomJoin: true,
        canPublish: true,
        canSubscribe: true,
    });

    return token.toJwt();
};

// Get LiveKit server client
export const getLiveKitServerClient = () => {
    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    
    if (!apiKey || !apiSecret) {
        throw new Error("LiveKit API credentials are not set");
    }

    return { apiKey, apiSecret };
};
```

### Step 3: Update API Routes

**Replace `src/app/api/stream/token/route.ts` with `src/app/api/livekit/token/route.ts`:**
```typescript
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { generateLiveKitToken, getLiveKitServerClient } from "@/lib/livekit";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { roomName } = await req.json();
        const { apiKey, apiSecret } = getLiveKitServerClient();

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
```

**Replace `src/app/api/stream/call/route.ts` with `src/app/api/livekit/room/route.ts`:**
```typescript
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { db } from "@/db";
import { meetings } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { meetingId } = await req.json();
        
        // Get meeting from database
        const meeting = await db.query.meetings.findFirst({
            where: eq(meetings.id, meetingId),
        });

        if (!meeting) {
            return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
        }

        // LiveKit room name (use meeting ID)
        const roomName = `meeting-${meetingId}`;

        return NextResponse.json({ roomName });
    } catch (error) {
        console.error("Error creating LiveKit room:", error);
        return NextResponse.json(
            { error: "Failed to create room" },
            { status: 500 }
        );
    }
}
```

### Step 4: Update Meeting Call View

**Replace `src/modules/meetings/ui/views/meeting-call-view.tsx`:**
```typescript
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LiveKitRoom, VideoTrack, useTracks, RoomAudioRenderer } from "@livekit/components-react";
import { Room, Track } from "livekit-client";
import { Button } from "@/components/ui/button";
import { PhoneOff, Video, VideoOff, Mic, MicOff } from "lucide-react";
import { toast } from "sonner";

interface Props {
    meetingId: string;
}

export const MeetingCallView = ({ meetingId }: Props) => {
    const router = useRouter();
    const [token, setToken] = useState<string | null>(null);
    const [roomName, setRoomName] = useState<string | null>(null);
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);
    const [room, setRoom] = useState<Room | null>(null);

    useEffect(() => {
        const initializeCall = async () => {
            try {
                // Get LiveKit token
                const tokenResponse = await fetch("/api/livekit/token", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ roomName: `meeting-${meetingId}` }),
                });

                if (!tokenResponse.ok) {
                    throw new Error("Failed to get LiveKit token");
                }

                const { token: livekitToken } = await tokenResponse.json();
                setToken(livekitToken);
                setRoomName(`meeting-${meetingId}`);
            } catch (error) {
                console.error("Error initializing call:", error);
                toast.error("Failed to initialize call");
            }
        };

        initializeCall();
    }, [meetingId]);

    if (!token || !roomName) {
        return <div>Loading...</div>;
    }

    const serverUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL || "wss://your-livekit-server.com";

    return (
        <LiveKitRoom
            video={isVideoEnabled}
            audio={isAudioEnabled}
            token={token}
            serverUrl={serverUrl}
            connect={true}
            onConnected={(room) => {
                setRoom(room);
            }}
            onDisconnected={() => {
                router.push(`/meetings/${meetingId}`);
            }}
        >
            <RoomAudioRenderer />
            <div className="flex flex-col h-screen">
                <div className="flex-1 flex items-center justify-center">
                    <VideoTracks />
                </div>
                <div className="flex justify-center gap-4 p-4">
                    <Button
                        onClick={() => {
                            setIsVideoEnabled(!isVideoEnabled);
                            room?.localParticipant.setCameraEnabled(!isVideoEnabled);
                        }}
                    >
                        {isVideoEnabled ? <VideoOff /> : <Video />}
                    </Button>
                    <Button
                        onClick={() => {
                            setIsAudioEnabled(!isAudioEnabled);
                            room?.localParticipant.setMicrophoneEnabled(!isAudioEnabled);
                        }}
                    >
                        {isAudioEnabled ? <MicOff /> : <Mic />}
                    </Button>
                    <Button
                        onClick={() => {
                            room?.disconnect();
                            router.push(`/meetings/${meetingId}`);
                        }}
                    >
                        <PhoneOff /> End Call
                    </Button>
                </div>
            </div>
        </LiveKitRoom>
    );
};

const VideoTracks = () => {
    const tracks = useTracks([Track.Source.Camera], { onlySubscribed: false });

    return (
        <div className="grid grid-cols-2 gap-4">
            {tracks.map((track) => (
                <VideoTrack key={track.participant.identity} trackRef={track} />
            ))}
        </div>
    );
};
```

### Step 5: Update Chat Component

**Replace `src/modules/meetings/ui/components/meeting-chat.tsx`:**
```typescript
// LiveKit doesn't have built-in chat like Stream.io
// You'll need to implement your own chat using:
// 1. WebSocket connection
// 2. Database storage
// 3. Or use a separate chat service

// Example: Simple WebSocket chat
"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const MeetingChat = ({ meetingId }: { meetingId: string }) => {
    const [messages, setMessages] = useState<Array<{ user: string; text: string }>>([]);
    const [message, setMessage] = useState("");
    const [ws, setWs] = useState<WebSocket | null>(null);

    useEffect(() => {
        // Connect to WebSocket for chat
        const websocket = new WebSocket(`wss://your-chat-server.com/chat/${meetingId}`);
        setWs(websocket);

        websocket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setMessages((prev) => [...prev, data]);
        };

        return () => {
            websocket.close();
        };
    }, [meetingId]);

    const sendMessage = () => {
        if (ws && message.trim()) {
            ws.send(JSON.stringify({ text: message }));
            setMessage("");
        }
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-4">
                {messages.map((msg, idx) => (
                    <div key={idx} className="mb-2">
                        <strong>{msg.user}:</strong> {msg.text}
                    </div>
                ))}
            </div>
            <div className="flex gap-2 p-4">
                <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                />
                <Button onClick={sendMessage}>Send</Button>
            </div>
        </div>
    );
};
```

### Step 6: Update Transcript Processing

**Update `src/lib/inngest/functions.ts`:**
```typescript
// LiveKit transcript fetching (if LiveKit provides transcripts)
// Otherwise, you'll need to implement your own transcription service

const transcript = await step.run("fetch-transcript", async () => {
    // Option 1: Use LiveKit's transcription (if available)
    // Option 2: Use a separate transcription service (e.g., Deepgram, AssemblyAI)
    // Option 3: Store transcript during call using WebSocket
    
    // Example: Using Deepgram for transcription
    const deepgramResponse = await fetch(
        `https://api.deepgram.com/v1/listen?model=nova-2&language=en`,
        {
            method: "POST",
            headers: {
                Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ url: recordingUrl }),
        }
    );
    
    const transcriptData = await deepgramResponse.json();
    return transcriptData.results?.channels?.[0]?.alternatives?.[0]?.transcript || "";
});
```

### Step 7: Update `.env` File

```env
# Remove Stream.io
# NEXT_PUBLIC_STREAM_API_KEY=""
# STREAM_API_SECRET=""

# Add LiveKit
LIVEKIT_API_KEY="your-livekit-api-key"
LIVEKIT_API_SECRET="your-livekit-api-secret"
NEXT_PUBLIC_LIVEKIT_URL="wss://your-livekit-server.com"

# Optional: For transcription (if not using LiveKit's)
DEEPGRAM_API_KEY="your-deepgram-key"
```

### Step 8: Update Package.json Scripts

Remove Stream.io packages and add LiveKit packages.

---

## 🎯 Recommended Approach

### Best Combination:
1. **LiveKit** for video calls (more flexible, self-hostable)
2. **Grok/Kimi K2** for summarization (cheaper/faster than GPT-4)
3. **OpenAI Realtime API** for voice (only option with realtime voice)

### Alternative if you want to avoid OpenAI:
- Use **LiveKit** for video
- Use **ElevenLabs** or **PlayHT** for AI voice (text-to-speech)
- Use **Grok/Kimi** for summarization
- But you'll lose realtime voice interaction (need pre-generated responses)

---

## 📝 Summary

| Feature | Current | Grok/Kimi | LiveKit |
|---------|---------|-----------|---------|
| Video Calls | ✅ Stream.io | ❌ No | ✅ Yes (needs code changes) |
| Chat | ✅ Stream.io | ❌ No | ⚠️ Need custom implementation |
| Summarization | ✅ OpenAI | ✅ Yes (easy) | ❌ No |
| Realtime Voice | ✅ OpenAI | ❌ No | ❌ No |
| Recording | ✅ Stream.io | ❌ No | ✅ Yes |
| Transcripts | ✅ Stream.io | ❌ No | ⚠️ Need separate service |

---

## 🚀 Quick Start

1. **For Grok/Kimi summarization**: Follow Option 1 (easy, ~30 minutes)
2. **For LiveKit video**: Follow Option 2 (moderate, ~2-3 hours)
3. **For both**: Do Option 1 + Option 2 (moderate, ~3-4 hours)


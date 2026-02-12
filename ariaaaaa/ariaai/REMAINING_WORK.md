# 🚧 Remaining Work Checklist

## 🔴 Priority 1: Setup & Configuration (Required to Run)

### 1. Install Required Packages
```bash
cd ariaaaaa/ariaai
npm install @stream-io/video-react-sdk @stream-io/chat-react stream-chat openai inngest --legacy-peer-deps
```

### 2. Create `.env` File
Create `.env` in the root directory (`ariaaaaa/ariaai/.env`) with:
```env
NEXT_PUBLIC_APP_URL="http://localhost:3000"
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
DATABASE_URL="postgresql://neondb_owner:npg_k3wXV2sljurb@ep-crimson-base-ad7tbf4q-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

# Stream Video & Chat (Get from https://getstream.io)
NEXT_PUBLIC_STREAM_API_KEY=""
STREAM_API_SECRET=""

# OpenAI (Get from https://platform.openai.com)
OPENAI_API_KEY=""

# Inngest (Get from https://inngest.com)
INNGEST_EVENT_KEY=""
INNGEST_SIGNING_KEY=""
```

### 3. Get API Keys
- **Stream.io**: Sign up at https://getstream.io → Create app → Get API Key & Secret
- **OpenAI**: Sign up at https://platform.openai.com → API Keys section
- **Inngest**: Sign up at https://inngest.com → Get event key and signing key

---

## 🟠 Priority 2: Stream Video Integration (Core Feature)

### File: `src/modules/meetings/ui/views/meeting-call-view.tsx`

**Tasks:**
1. ✅ **Import Stream Video SDK**
   ```typescript
   import { StreamVideo, StreamCall, useCallStateHooks } from "@stream-io/video-react-sdk";
   ```

2. ✅ **Initialize Stream Video Client**
   - Fetch token from `/api/stream/token`
   - Create StreamVideoClient instance
   - Wrap call UI with `<StreamVideo client={client}>`

3. ✅ **Join Call**
   - Call `/api/stream/call` to create/get call
   - Use `call.join()` to join the call
   - Handle camera/mic permissions

4. ✅ **Render Video Components**
   - Use `<StreamCall call={call}>` wrapper
   - Add `<ParticipantView />` for user and agent
   - Implement video grid layout

5. ✅ **Add Recording**
   - Enable recording when call starts
   - Store recording URL when call ends

**Reference:** Stream Video Docs: https://getstream.io/video/docs/react/

---

## 🟠 Priority 3: OpenAI Realtime API Integration (AI Agent)

### File: `src/modules/meetings/ui/views/meeting-call-view.tsx`

**Tasks:**
1. ✅ **Install OpenAI SDK** (if not already)
   ```bash
   npm install openai
   ```

2. ✅ **Create OpenAI Realtime Connection**
   - Connect to OpenAI Realtime API WebSocket
   - Use agent instructions from meeting.agentId
   - Handle audio streaming

3. ✅ **Bridge Audio Between Stream & OpenAI**
   - Capture audio from Stream call
   - Send to OpenAI Realtime API
   - Receive AI audio and play in Stream call
   - Handle real-time transcription

4. ✅ **Agent Participant**
   - Create agent user in Stream with ID `agent-${meeting.agentId}`
   - Join agent to call programmatically
   - Connect agent's audio to OpenAI Realtime API

**Reference:** OpenAI Realtime API Docs: https://platform.openai.com/docs/guides/realtime

---

## 🟡 Priority 4: Inngest Background Jobs

### File: `src/modules/meetings/server/procedures.tsx` (Line 164)

**Task 1: Uncomment Inngest Trigger**
```typescript
// Replace this:
// TODO: Trigger Inngest job to process transcript and summary

// With this:
import { inngest } from "@/lib/inngest";

await inngest.send({
    name: "meeting.ended",
    data: { meetingId: input.id },
});
```

### File: `src/lib/inngest/functions.ts`

**Task 2: Fetch Transcript from Stream**
```typescript
// Replace placeholder with actual Stream API call
const transcript = await step.run("fetch-transcript", async () => {
    const streamClient = getStreamServerClient();
    const call = streamClient.video.call("default", meetingId);
    
    // Fetch transcript from Stream
    const transcriptData = await call.getTranscription();
    return transcriptData.transcript;
});
```

**Task 3: Store Transcript URL**
```typescript
// Update meeting with transcript URL
await db.update(meetings)
    .set({
        summary,
        transcriptUrl: transcriptUrl, // Add actual URL
        status: "completed",
    })
    .where(eq(meetings.id, meetingId));
```

---

## 🟡 Priority 5: Stream Chat Integration

### File: `src/modules/meetings/ui/views/meeting-id-view.tsx` (Chat Tab)

**Tasks:**
1. ✅ **Initialize Stream Chat Client**
   ```typescript
   import { Chat, ChannelList, Channel, MessageList, MessageInput } from "stream-chat-react";
   ```

2. ✅ **Create Chat Channel**
   - Create channel for each meeting
   - Channel ID: `meeting-${meetingId}`

3. ✅ **Render Chat UI**
   - Add `<Chat client={chatClient}>` wrapper
   - Add `<Channel>` component
   - Add `<MessageList />` and `<MessageInput />`

4. ✅ **Handle Chat Messages**
   - Display chat history
   - Enable real-time messaging
   - Show user avatars

**Reference:** Stream Chat Docs: https://getstream.io/chat/docs/react/

---

## 🟢 Priority 6: Enhanced Features

### 1. Transcript Search & Highlighting
**File:** `src/modules/meetings/ui/views/meeting-id-view.tsx`

- Add search input in transcript tab
- Implement text highlighting for search terms
- Add scroll-to-result functionality

### 2. Video Recording Playback
**File:** `src/modules/meetings/ui/views/meeting-id-view.tsx`

- Enhance video player with controls
- Add playback speed controls
- Add timestamp navigation

### 3. Free Tier Usage Limits
**Files:** 
- `src/modules/meetings/ui/components/meeting-form.tsx` (Line 59)
- `src/modules/agents/ui/components/agent-form.tsx` (Line 47)

- Track meeting/agent creation count per user
- Check limits before allowing creation
- Redirect to upgrade page when limit reached

### 4. Payment Integration (Polar)
- Set up Polar account
- Create subscription plans
- Add payment checkout flow
- Handle subscription webhooks

---

## 📋 Quick Reference: Files to Modify

### High Priority
1. `src/modules/meetings/ui/views/meeting-call-view.tsx` - Stream Video + OpenAI
2. `src/modules/meetings/server/procedures.tsx` - Uncomment Inngest trigger
3. `src/lib/inngest/functions.ts` - Complete transcript fetching

### Medium Priority
4. `src/modules/meetings/ui/views/meeting-id-view.tsx` - Stream Chat integration
5. `src/lib/stream.ts` - Verify Stream client setup

### Low Priority
6. `src/modules/meetings/ui/components/meeting-form.tsx` - Free tier limits
7. `src/modules/agents/ui/components/agent-form.tsx` - Free tier limits

---

## 🎯 Estimated Time

- **Priority 1 (Setup)**: 30 minutes
- **Priority 2 (Stream Video)**: 4-6 hours
- **Priority 3 (OpenAI Realtime)**: 6-8 hours
- **Priority 4 (Inngest)**: 2-3 hours
- **Priority 5 (Stream Chat)**: 2-3 hours
- **Priority 6 (Enhancements)**: 4-6 hours

**Total**: ~18-26 hours of development work

---

## 🚀 Getting Started

1. Start with Priority 1 (Setup) - Get everything installed and configured
2. Then Priority 2 (Stream Video) - Get basic video calls working
3. Then Priority 3 (OpenAI) - Add AI agent functionality
4. Then Priority 4 (Inngest) - Enable automatic processing
5. Then Priority 5 (Chat) - Add chat interface
6. Finally Priority 6 (Enhancements) - Polish and add features

Good luck! 🎉




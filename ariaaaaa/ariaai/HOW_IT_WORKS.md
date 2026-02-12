# 🚀 Meet AI - How The Project Works

## 📋 Project Overview

**Meet AI** is a Next.js application that allows users to create AI-powered video meetings. Users can create AI agents with custom instructions, schedule meetings with those agents, and conduct video calls where the AI agent participates as a virtual participant.

---

## 🏗️ Architecture & Tech Stack

### **Frontend:**
- **Next.js 15** (App Router) - React framework
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI component library
- **tRPC** - Type-safe API layer
- **TanStack Query** - Data fetching & caching

### **Backend:**
- **tRPC** - Type-safe API endpoints
- **Drizzle ORM** - Database ORM
- **PostgreSQL (Neon)** - Database
- **Better Auth** - Authentication system

### **Integrations:**
- **Stream.io** - Video calling & chat (requires API keys)
- **OpenAI** - AI agent voice/realtime API (requires API key)
- **Inngest** - Background job processing (optional, for transcript processing)

---

## 🔄 How The Application Works

### **1. Authentication Flow**

```
User → Sign Up/Sign In → Better Auth → Database (user table)
```

- Users can sign up with **email/password** or **OAuth** (GitHub/Google)
- Sessions are stored in the `session` table
- Protected routes check authentication via `protectedProcedure` in tRPC

**Files:**
- `src/lib/auth.ts` - Auth configuration
- `src/app/(auth)/sign-in/page.tsx` - Sign in page
- `src/app/(auth)/sign-up/page.tsx` - Sign up page

---

### **2. Dashboard Layout**

```
Dashboard Layout → Sidebar + Navbar + Content Area
```

- **Sidebar** (`DashBoardSidebar`) - Navigation menu
- **Navbar** (`DashboardNavbar`) - Top bar with user menu
- **Content** - Page-specific content

**Files:**
- `src/app/(dashboard)/layout.tsx` - Dashboard layout wrapper
- `src/modules/dashboard/ui/components/` - Dashboard components

---

### **3. AI Agents Management**

#### **Creating an Agent:**
```
User fills form → tRPC mutation → Database (agents table)
```

- User creates an agent with:
  - **Name** - Agent identifier
  - **Instructions** - Custom behavior/personality
- Agents are stored in `agents` table
- Free tier limit: **3 agents** per user

#### **Agent Features:**
- ✅ Create, Read, Update, Delete agents
- ✅ Search & filter agents
- ✅ Pagination
- ✅ View agent details

**Files:**
- `src/modules/agents/server/procedures.ts` - Backend logic
- `src/modules/agents/ui/views/agents-view.tsx` - Agent list view
- `src/modules/agents/ui/components/agent-form.tsx` - Create/edit form

---

### **4. Meetings Management**

#### **Creating a Meeting:**
```
User selects agent → Fills meeting form → tRPC mutation → Database (meetings table)
```

- User creates a meeting with:
  - **Name** - Meeting title
  - **Agent** - Selected AI agent
- Meeting status starts as `"upcoming"`
- Free tier limit: **5 meetings** per user

#### **Meeting Status Flow:**
```
upcoming → active → processing → completed
                ↓
            cancelled (can happen anytime)
```

#### **Meeting Lifecycle:**

1. **Upcoming** - Meeting created, not started
2. **Active** - User clicks "Start Meeting" → Video call begins
3. **Processing** - Meeting ended → Transcript processing (requires Inngest)
4. **Completed** - Transcript processed → Summary available
5. **Cancelled** - User cancels meeting

**Files:**
- `src/modules/meetings/server/procedures.tsx` - Backend logic
- `src/modules/meetings/ui/views/meetings-view.tsx` - Meeting list
- `src/modules/meetings/ui/views/meeting-id-view.tsx` - Meeting details

---

### **5. Video Call Flow** (Requires Stream.io API Keys)

#### **Starting a Call:**
```
User clicks "Start Meeting" → 
  → tRPC mutation (status: upcoming → active) →
  → Redirect to /meetings/[id]/call →
  → MeetingCallView component loads →
  → Fetch Stream token from /api/stream/token →
  → Initialize StreamVideoClient →
  → Create/get Stream call →
  → Join call with camera/mic →
  → Render video UI
```

#### **During Call:**
- User can toggle **camera** and **microphone**
- User can see **participants** (including AI agent when connected)
- User can **end meeting** → Status changes to `processing`

#### **Ending a Call:**
```
User clicks "End Meeting" →
  → tRPC mutation (status: active → processing) →
  → Leave Stream call →
  → Redirect to meeting details →
  → Inngest job triggered (if configured) →
  → Process transcript →
  → Update meeting (status: processing → completed)
```

**Files:**
- `src/modules/meetings/ui/views/meeting-call-view.tsx` - Video call UI
- `src/app/api/stream/token/route.ts` - Stream token generation
- `src/app/api/stream/call/route.ts` - Stream call creation
- `src/lib/stream.ts` - Stream SDK utilities

---

### **6. AI Agent Integration** (Requires OpenAI API Key)

#### **Agent Voice Connection:**
```
During video call →
  → OpenAI Realtime API WebSocket connection →
  → Stream audio from meeting →
  → AI processes audio with agent instructions →
  → AI responds with voice →
  → Stream audio back to meeting
```

**Files:**
- `src/lib/openai-realtime.ts` - OpenAI Realtime client
- `src/modules/meetings/ui/views/meeting-call-view.tsx` - Integration point

---

### **7. Background Processing** (Requires Inngest API Keys)

#### **Transcript Processing:**
```
Meeting ends →
  → Inngest event triggered →
  → Background job processes transcript →
  → Generate summary →
  → Update meeting record →
  → Status: processing → completed
```

**Files:**
- `src/lib/inngest/functions.ts` - Background job functions
- `src/app/api/inngest/route.ts` - Inngest webhook endpoint
- `src/lib/inngest.ts` - Inngest client

---

### **8. Database Schema**

#### **Tables:**

1. **`user`** - User accounts
   - id, name, email, image, createdAt

2. **`session`** - User sessions
   - id, token, userId, expiresAt

3. **`account`** - OAuth accounts
   - id, providerId, userId, accessToken

4. **`agents`** - AI agents
   - id, name, userId, instructions, createdAt

5. **`meetings`** - Meetings
   - id, name, userId, agentId, status, startedAt, endedAt, transcriptUrl, recordUrl, summary

6. **`subscriptions`** - User subscription tiers
   - id, userId, tier (free/pro/enterprise)

**Files:**
- `src/db/schema.ts` - Database schema definition

---

## 🔐 API Routes

### **tRPC Routes** (`/api/trpc/[trpc]`)
- `agents.*` - Agent CRUD operations
- `meetings.*` - Meeting CRUD operations

### **Auth Routes** (`/api/auth/[...all]`)
- Handled by Better Auth
- Sign in, sign up, OAuth callbacks

### **Stream Routes**
- `/api/stream/token` - Generate Stream token for user
- `/api/stream/call` - Create/get Stream call

### **Inngest Routes** (`/api/inngest`)
- Webhook endpoint for background jobs

---

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth pages (sign-in, sign-up)
│   ├── (dashboard)/      # Dashboard pages
│   │   ├── agents/       # Agent management
│   │   ├── meetings/     # Meeting management
│   │   └── upgrade/      # Subscription upgrade
│   └── api/              # API routes
│       ├── auth/         # Auth endpoints
│       ├── stream/       # Stream.io endpoints
│       ├── inngest/      # Inngest webhook
│       └── trpc/         # tRPC endpoint
├── modules/              # Feature modules
│   ├── agents/          # Agent feature
│   ├── meetings/        # Meeting feature
│   ├── auth/            # Auth UI
│   ├── dashboard/       # Dashboard UI
│   └── upgrade/         # Upgrade UI
├── components/          # Shared components
├── lib/                # Utilities & integrations
│   ├── auth.ts         # Auth config
│   ├── stream.ts       # Stream SDK
│   ├── openai-realtime.ts  # OpenAI client
│   └── inngest.ts      # Inngest client
├── db/                 # Database
│   ├── schema.ts       # Schema definition
│   └── index.ts        # DB connection
└── trpc/               # tRPC setup
    ├── routers/        # API routers
    └── server.tsx      # Server setup
```

---

## ✅ What Works Without API Keys

Even without Stream/OpenAI/Inngest keys, you can:

1. ✅ **Sign up / Sign in** - Full authentication
2. ✅ **Create AI agents** - Store agent instructions
3. ✅ **Create meetings** - Schedule meetings with agents
4. ✅ **View meetings list** - See all your meetings
5. ✅ **View meeting details** - See meeting info, status
6. ✅ **Cancel meetings** - Cancel upcoming meetings
7. ✅ **Search & filter** - Search agents and meetings
8. ✅ **Pagination** - Navigate through lists

---

## ⚠️ What Requires API Keys

### **Stream.io Keys** (Required for video calls):
- ❌ Start video calls
- ❌ Join video meetings
- ❌ Chat during meetings
- ❌ See video participants

### **OpenAI API Key** (Required for AI agent voice):
- ❌ AI agent voice interaction
- ❌ Real-time AI responses
- ❌ Agent speaking in meetings

### **Inngest Keys** (Optional, for transcript processing):
- ❌ Automatic transcript processing
- ❌ Meeting summary generation
- ❌ Background job processing

---

## 🚀 Running The Project

### **Current Status:**
- ✅ Database configured (Neon PostgreSQL)
- ✅ Dependencies installed (except Stream/OpenAI packages)
- ✅ Development server running on `http://localhost:3000`

### **To Enable Full Features:**

1. **Install missing packages:**
   ```bash
   npm install @stream-io/video-react-sdk @stream-io/chat-react stream-chat openai --legacy-peer-deps
   ```

2. **Add API keys to `.env`:**
   - Get Stream.io keys from https://getstream.io
   - Get OpenAI key from https://platform.openai.com
   - (Optional) Get Inngest keys from https://inngest.com

3. **Restart dev server:**
   ```bash
   npm run dev
   ```

---

## 🎯 Key Features

1. **Multi-tier Subscriptions** - Free, Pro, Enterprise
2. **Free Tier Limits** - 3 agents, 5 meetings
3. **Real-time Video Calls** - Powered by Stream.io
4. **AI Agent Participation** - Agents join calls with custom instructions
5. **Meeting Transcripts** - Automatic processing and summaries
6. **Search & Filter** - Find agents and meetings quickly
7. **Responsive Design** - Works on mobile and desktop

---

## 🔍 Code Flow Example: Starting a Meeting

```
1. User clicks "Start Meeting" button
   → meeting-id-view.tsx: handleStart()

2. tRPC mutation called
   → trpc.meetings.start.mutate({ id: meetingId })
   → meetings/server/procedures.tsx: start mutation

3. Database updated
   → status: "upcoming" → "active"
   → startedAt: current timestamp

4. Redirect to call page
   → router.push(`/meetings/${meetingId}/call`)

5. MeetingCallView loads
   → Fetches meeting data
   → Initializes Stream client
   → Joins video call

6. User sees video UI
   → Can toggle camera/mic
   → Can see participants
   → Can end meeting
```

---

## 📝 Notes

- **Inngest is optional** - The app works without it, but transcript processing won't happen automatically
- **Stream.io is required** for video calls - Without it, you can create meetings but can't start calls
- **OpenAI is required** for AI agent voice - Without it, agents won't speak in meetings
- **Database is already configured** - Neon PostgreSQL connection is set up
- **Authentication works** - Email/password and OAuth (if keys provided)

---

## 🎉 Summary

This is a **full-stack Next.js application** for AI-powered video meetings. The core functionality (auth, agents, meetings) works without API keys, but video calls and AI features require Stream.io and OpenAI keys. The architecture is modular, type-safe (TypeScript + tRPC), and scalable.



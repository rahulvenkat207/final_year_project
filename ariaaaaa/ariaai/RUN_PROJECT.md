# 🚀 How to Run and Use the Project

## 📋 Prerequisites

- Node.js 18+ installed
- npm or yarn installed
- All API keys configured in `.env` file (✅ Already done!)

---

## 🏃 Step 1: Install Dependencies

Open terminal in the project directory:

```bash
cd ariaaaaa/ariaai
npm install
```

**Install LiveKit packages:**
```bash
npm install livekit-client livekit-react-sdk @livekit/components-react livekit-server-sdk
```

---

## 🗄️ Step 2: Setup Database

Push the database schema to your Neon database:

```bash
npm run db:push
```

This will create all necessary tables (users, agents, meetings, etc.)

---

## ▶️ Step 3: Start Development Server

```bash
npm run dev
```

The server will start on **http://localhost:3000**

You should see:
```
✓ Ready in X seconds
○ Local: http://localhost:3000
```

---

## 🌐 Step 4: Open in Browser

Open your browser and go to:
```
http://localhost:3000
```

---

## 📖 Step 5: How to Use the Project (Step-by-Step)

### **Step 5.1: Sign Up / Sign In**

1. When you first open the app, you'll see a **Sign In** page
2. Click **"Sign Up"** if you don't have an account
3. Fill in:
   - **Name**: Your name
   - **Email**: Your email address
   - **Password**: Create a password
4. Click **"Sign Up"**
5. You'll be automatically signed in and redirected to the dashboard

---

### **Step 5.2: Create Your First AI Agent**

1. In the dashboard, click on **"Agents"** in the sidebar (or go to `/agents`)
2. Click the **"New Agent"** button (usually top right)
3. Fill in the form:
   - **Name**: Give your agent a name (e.g., "Meeting Assistant")
   - **Instructions**: Describe how the agent should behave
     - Example: "You are a helpful meeting assistant. Be concise, professional, and focus on key points."
4. Click **"Create"** or **"Save"**
5. Your agent is now created! ✅

**Note**: Free tier allows **3 agents** maximum.

---

### **Step 5.3: Create a Meeting**

1. Click on **"Meetings"** in the sidebar (or go to `/meetings`)
2. Click **"New Meeting"** button
3. Fill in the form:
   - **Name**: Meeting title (e.g., "Project Discussion")
   - **Agent**: Select the agent you created from the dropdown
4. Click **"Create"** or **"Save"**
5. Your meeting is now created! ✅

**Note**: Free tier allows **5 meetings** maximum.

---

### **Step 5.4: Start a Video Call**

1. Go to your meetings list (`/meetings`)
2. Find the meeting you want to start
3. Click on the meeting to open details
4. Click the **"Start Meeting"** button
5. You'll be redirected to the call page (`/meetings/[id]/call`)

**What happens:**
- LiveKit connects to the video room
- Your camera and microphone are enabled
- The AI agent joins automatically
- You can see video participants

---

### **Step 5.5: Interact with AI Agent**

During the call:

1. **Speak normally** - The AI agent will hear you through:
   - **SST (Sarvam)**: Converts your speech to text
   - **LLM (Kimi K2)**: Processes your words with agent instructions
   - **TTS (Sarvam)**: Converts AI response to speech
   - **LiveKit**: Streams audio back to you

2. **Control your media:**
   - **Camera button**: Toggle video on/off
   - **Microphone button**: Mute/unmute audio
   - **End Call button**: End the meeting

3. **The AI agent will:**
   - Listen to what you say
   - Process it according to the agent's instructions
   - Respond with voice in real-time

---

### **Step 5.6: End the Meeting**

1. Click the **"End Call"** button (red button with phone icon)
2. You'll be redirected back to the meeting details page
3. The meeting status changes to **"processing"** then **"completed"**

**What happens:**
- Meeting ends
- Transcript is processed (if configured)
- Summary is generated using Kimi K2 LLM
- Meeting status updates

---

### **Step 5.7: View Meeting Details**

After ending a meeting:

1. Go to **"Meetings"** page
2. Click on the completed meeting
3. You'll see tabs:
   - **Summary**: AI-generated summary of the meeting
   - **Transcript**: Full transcript of the conversation
   - **Recording**: Video recording (if available)
   - **Chat**: Chat messages (if implemented)

---

### **Step 5.8: Manage Agents**

1. Go to **"Agents"** page
2. You can:
   - **View** all your agents
   - **Edit** an agent (click on agent name)
   - **Delete** an agent
   - **Search** agents by name
   - **Filter** agents

---

### **Step 5.9: Manage Meetings**

1. Go to **"Meetings"** page
2. You can:
   - **View** all meetings
   - **Start** upcoming meetings
   - **View** completed meeting details
   - **Cancel** upcoming meetings
   - **Search** meetings by name
   - **Filter** by status (upcoming, active, completed, cancelled)

---

## 🎯 Quick Navigation

- **Dashboard**: `/` or `/dashboard`
- **Agents**: `/agents`
- **Meetings**: `/meetings`
- **Meeting Details**: `/meetings/[meetingId]`
- **Call Page**: `/meetings/[meetingId]/call`
- **Upgrade**: `/upgrade` (for subscription plans)

---

## 🔧 Troubleshooting

### Issue: "LiveKit URL not configured"
- ✅ Already configured in `.env`
- Check if `NEXT_PUBLIC_LIVEKIT_URL` is set correctly

### Issue: "Failed to join call"
- Check browser console for errors
- Ensure LiveKit server is accessible
- Check camera/microphone permissions

### Issue: "AI agent not responding"
- Check browser console for errors
- Verify SST/LLM/TTS API keys are correct
- Check network tab for API calls

### Issue: "Database error"
- Run `npm run db:push` again
- Check `DATABASE_URL` in `.env`

### Issue: "Port 3000 already in use"
```bash
# Kill process on port 3000 (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or use different port
PORT=3001 npm run dev
```

---

## 📱 Features Available

✅ **Authentication** - Sign up, sign in, sessions  
✅ **AI Agents** - Create, edit, delete agents with custom instructions  
✅ **Meetings** - Create, start, end meetings  
✅ **Video Calls** - LiveKit-powered video calls  
✅ **AI Voice** - Real-time AI agent voice interaction  
✅ **Summarization** - AI-generated meeting summaries  
✅ **Search & Filter** - Find agents and meetings quickly  
✅ **Responsive Design** - Works on desktop and mobile  

---

## 🎉 You're Ready!

Your project is now running with:
- ✅ LiveKit for video calls
- ✅ Sarvam AI for SST (Speech-to-Speech)
- ✅ Kimi K2 for LLM (Language Model)
- ✅ Sarvam AI for TTS (Text-to-Speech)

**Start using it now!** 🚀

---

## 📞 Need Help?

- Check browser console (F12) for errors
- Check terminal for server errors
- Verify all API keys in `.env`
- See `SETUP_LIVEKIT_AND_AI.md` for detailed setup


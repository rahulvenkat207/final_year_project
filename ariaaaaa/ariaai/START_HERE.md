# 🚀 START HERE - Quick Setup Guide

## ✅ Your API Keys Are Configured!

I've created a setup script to configure your `.env` file automatically.

---

## 📝 Step 1: Create .env File

**Option A: Run the setup script (Easiest)**
```bash
cd ariaaaaa/ariaai
node setup-env.js
```

**Option B: Create manually**
Create a file named `.env` in `ariaaaaa/ariaai/` folder and paste this content:

```env
# Application URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Database
DATABASE_URL="postgresql://neondb_owner:npg_k3wXV2sljurb@ep-crimson-base-ad7tbf4q-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

# LiveKit Configuration
LIVEKIT_URL="wss://aria-loughypm.livekit.cloud"
LIVEKIT_API_KEY="APIjWsDB2gurZN6"
LIVEKIT_API_SECRET="dYofoQYYSjxgjItJkaIpOczdX4eIlkBoKYrkVWArnJW"
NEXT_PUBLIC_LIVEKIT_URL="wss://aria-loughypm.livekit.cloud"

# SST (Speech-to-Speech) - Sarvam AI
SST_PROVIDER="sarvam"
SST_API_KEY="sk_1d9fewe5_Ble4iIYrmZ6EUIXDfTdooxsJ"
NEXT_PUBLIC_SST_PROVIDER="sarvam"
NEXT_PUBLIC_SST_API_KEY="sk_1d9fewe5_Ble4iIYrmZ6EUIXDfTdooxsJ"

# LLM (Language Model) - Kimi K2
LLM_PROVIDER="kimi"
LLM_API_KEY="YOUR_KIMI_API_KEY_HERE"
NEXT_PUBLIC_LLM_PROVIDER="kimi"
NEXT_PUBLIC_LLM_API_KEY="YOUR_KIMI_API_KEY_HERE"

# TTS (Text-to-Speech) - Sarvam AI
TTS_PROVIDER="sarvam"
TTS_API_KEY="sk_ghmmew4g_m5z244P4yQbtUSpMbxgROx4R"
NEXT_PUBLIC_TTS_PROVIDER="sarvam"
NEXT_PUBLIC_TTS_API_KEY="sk_ghmmew4g_m5z244P4yQbtUSpMbxgROx4R"

# Optional: OAuth (GitHub/Google) - Leave empty if not using
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Optional: Inngest (for background jobs) - Leave empty if not using
INNGEST_EVENT_KEY=""
INNGEST_SIGNING_KEY=""
```

---

## 📦 Step 2: Install Dependencies

```bash
cd ariaaaaa/ariaai
npm install
```

**Install LiveKit packages:**
```bash
npm install livekit-client livekit-react-sdk @livekit/components-react livekit-server-sdk
```

---

## 🗄️ Step 3: Setup Database

```bash
npm run db:push
```

This creates all database tables.

---

## ▶️ Step 4: Start the Server

```bash
npm run dev
```

Wait for:
```
✓ Ready in X seconds
○ Local: http://localhost:3000
```

---

## 🌐 Step 5: Open in Browser

Open: **http://localhost:3000**

---

## 📖 Step 6: How to Use (Step-by-Step)

### **1. Sign Up**
- Click "Sign Up"
- Enter: Name, Email, Password
- Click "Sign Up"
- You'll be logged in automatically

### **2. Create an AI Agent**
- Click **"Agents"** in sidebar
- Click **"New Agent"** button
- Fill in:
  - **Name**: "My Assistant" (or any name)
  - **Instructions**: "You are a helpful meeting assistant. Be concise and professional."
- Click **"Create"**

### **3. Create a Meeting**
- Click **"Meetings"** in sidebar
- Click **"New Meeting"** button
- Fill in:
  - **Name**: "Test Meeting"
  - **Agent**: Select your agent from dropdown
- Click **"Create"**

### **4. Start Video Call**
- Click on your meeting
- Click **"Start Meeting"** button
- Allow camera/microphone permissions
- You're now in a video call!

### **5. Talk to AI Agent**
- **Speak normally** - The AI will hear you
- The AI agent will respond with voice
- Use buttons to toggle camera/mic

### **6. End Meeting**
- Click **"End Call"** button (red)
- You'll see meeting summary (after processing)

---

## 🎯 Quick Commands Summary

```bash
# 1. Create .env file
node setup-env.js

# 2. Install packages
npm install
npm install livekit-client livekit-react-sdk @livekit/components-react livekit-server-sdk

# 3. Setup database
npm run db:push

# 4. Start server
npm run dev

# 5. Open browser
# Go to: http://localhost:3000
```

---

## ✅ Your Configuration

- ✅ **LiveKit**: wss://aria-loughypm.livekit.cloud
- ✅ **SST**: Sarvam AI
- ✅ **LLM**: Kimi K2
- ✅ **TTS**: Sarvam AI

---

## 📚 More Details

- **Full Guide**: See `RUN_PROJECT.md`
- **Setup Details**: See `SETUP_LIVEKIT_AND_AI.md`

---

## 🎉 Ready to Go!

Run the commands above and start using your AI meeting app! 🚀


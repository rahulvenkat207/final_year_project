# 🚀 Complete Setup Guide: LiveKit + Alternative AI Services

This guide shows you how to replace Stream.io with LiveKit and OpenAI with alternative AI services.

---

## 📋 What You'll Need

### 1. LiveKit API Keys
- Get from: https://cloud.livekit.io/ (or self-host)
- You'll need: `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`, `LIVEKIT_URL`

### 2. SST (Speech-to-Speech) - Choose ONE:
- **Sarvam AI**: https://sarvam.ai/
- **AssemblyAI**: https://www.assemblyai.com/

### 3. LLM (Language Model) - Choose ONE:
- **Grok (xAI)**: https://x.ai/
- **Kimi (Moonshot AI)**: https://platform.moonshot.cn/
- **Gemini (Google)**: https://aistudio.google.com/

### 4. TTS (Text-to-Speech) - Choose ONE:
- **ElevenLabs**: https://elevenlabs.io/
- **Cartesian**: https://cartesian.ai/
- **Sarvam AI**: https://sarvam.ai/ (if using Sarvam for SST)

---

## 📦 Step 1: Install Required Packages

```bash
cd ariaaaaa/ariaai
npm install livekit-client livekit-react-sdk @livekit/components-react livekit-server-sdk
```

**Optional packages** (install based on your chosen providers):

```bash
# For AssemblyAI SST
npm install assemblyai

# For ElevenLabs TTS
npm install elevenlabs

# For Google Gemini
npm install @google/generative-ai
```

---

## 🔧 Step 2: Update Environment Variables

Create or update `.env` file in `ariaaaaa/ariaai/`:

```env
# LiveKit Configuration
LIVEKIT_API_KEY="your-livekit-api-key"
LIVEKIT_API_SECRET="your-livekit-api-secret"
LIVEKIT_URL="wss://your-livekit-server.com"
NEXT_PUBLIC_LIVEKIT_URL="wss://your-livekit-server.com"

# SST (Speech-to-Speech) - Choose ONE provider
SST_PROVIDER="assemblyai"  # or "sarvam"
SST_API_KEY="your-sst-api-key"
NEXT_PUBLIC_SST_PROVIDER="assemblyai"
NEXT_PUBLIC_SST_API_KEY="your-sst-api-key"

# LLM (Language Model) - Choose ONE provider
LLM_PROVIDER="grok"  # or "kimi" or "gemini"
LLM_API_KEY="your-llm-api-key"
NEXT_PUBLIC_LLM_PROVIDER="grok"
NEXT_PUBLIC_LLM_API_KEY="your-llm-api-key"

# TTS (Text-to-Speech) - Choose ONE provider
TTS_PROVIDER="elevenlabs"  # or "cartesian" or "sarvam"
TTS_API_KEY="your-tts-api-key"
TTS_VOICE_ID="your-voice-id"  # Optional, provider-specific
NEXT_PUBLIC_TTS_PROVIDER="elevenlabs"
NEXT_PUBLIC_TTS_API_KEY="your-tts-api-key"
NEXT_PUBLIC_TTS_VOICE_ID="your-voice-id"

# Database (keep existing)
DATABASE_URL="postgresql://neondb_owner:npg_k3wXV2sljurb@ep-crimson-base-ad7tbf4q-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

# Auth (keep existing)
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## 🔄 Step 3: Update Meeting Call View

Replace the Stream.io call view with LiveKit version:

**Option A: Update existing file**
- Rename `meeting-call-view.tsx` to `meeting-call-view-stream.tsx` (backup)
- Copy `meeting-call-view-livekit.tsx` to `meeting-call-view.tsx`

**Option B: Update route**
- Update `src/app/(dashboard)/meetings/[meetingId]/call/page.tsx` to import `MeetingCallViewLiveKit`

---

## 📝 Step 4: Update API Routes

The new API routes are already created:
- ✅ `src/app/api/livekit/token/route.ts` - LiveKit token generation
- ✅ `src/app/api/livekit/room/route.ts` - Room creation

Update the meeting call page to use these routes.

---

## 🤖 Step 5: Update Summarization

Replace `src/lib/inngest/functions.ts` with `src/lib/inngest/functions-new.ts`:

```bash
# Backup old file
mv src/lib/inngest/functions.ts src/lib/inngest/functions-openai.ts

# Use new file
mv src/lib/inngest/functions-new.ts src/lib/inngest/functions.ts
```

---

## 🎯 Step 6: How It Works

### Video Call Flow:
1. User clicks "Start Meeting"
2. Frontend calls `/api/livekit/room` → Gets room name
3. Frontend calls `/api/livekit/token` → Gets access token
4. Frontend connects to LiveKit room
5. User's video/audio streams to LiveKit

### AI Agent Voice Flow:
1. **SST (Speech-to-Speech)** captures user's audio
2. SST converts speech → text (transcript)
3. **LLM** processes transcript with agent instructions → generates response text
4. **TTS** converts response text → audio
5. Audio streams back to LiveKit room

### Summarization Flow:
1. Meeting ends
2. Inngest job triggered
3. Fetch transcript (from SST or stored during call)
4. **LLM** summarizes transcript
5. Save summary to database

---

## 🔍 Step 7: Provider-Specific Setup

### AssemblyAI SST:
```typescript
// Already implemented in src/lib/ai/sst.ts
// Just set SST_PROVIDER="assemblyai" and SST_API_KEY
```

### Sarvam AI SST:
```typescript
// Already implemented in src/lib/ai/sst.ts
// Just set SST_PROVIDER="sarvam" and SST_API_KEY
// Note: Check Sarvam API documentation for actual WebSocket endpoint
```

### Grok LLM:
```typescript
// Already implemented in src/lib/ai/llm.ts
// Set LLM_PROVIDER="grok" and LLM_API_KEY
// Get API key from: https://x.ai/
```

### Kimi LLM:
```typescript
// Already implemented in src/lib/ai/llm.ts
// Set LLM_PROVIDER="kimi" and LLM_API_KEY
// Get API key from: https://platform.moonshot.cn/
```

### Gemini LLM:
```typescript
// Already implemented in src/lib/ai/llm.ts
// Set LLM_PROVIDER="gemini" and LLM_API_KEY
// Get API key from: https://aistudio.google.com/
```

### ElevenLabs TTS:
```typescript
// Already implemented in src/lib/ai/tts.ts
// Set TTS_PROVIDER="elevenlabs" and TTS_API_KEY
// Get API key from: https://elevenlabs.io/
// Optional: Set TTS_VOICE_ID (default: "21m00Tcm4TlvDq8ikWAM")
```

### Cartesian TTS:
```typescript
// Already implemented in src/lib/ai/tts.ts
// Set TTS_PROVIDER="cartesian" and TTS_API_KEY
// Get API key from: https://cartesian.ai/
```

### Sarvam TTS:
```typescript
// Already implemented in src/lib/ai/tts.ts
// Set TTS_PROVIDER="sarvam" and TTS_API_KEY
// Get API key from: https://sarvam.ai/
```

---

## ⚠️ Important Notes

### 1. LiveKit Server
- You can use **LiveKit Cloud** (paid) or **self-host** (free)
- For self-hosting: https://docs.livekit.io/deploy/

### 2. Audio Format
- LiveKit uses **Opus** codec by default
- SST services may need **PCM16** format
- Conversion is handled in `agent-voice.ts`

### 3. Transcript Storage
- LiveKit doesn't provide transcripts automatically
- You need to:
  - Store transcripts during call (from SST)
  - Or use a transcription service after call
  - Or implement real-time transcript storage

### 4. Recording
- LiveKit can record calls
- Set up recording in LiveKit server configuration
- Recording URLs will be available via LiveKit API

### 5. Chat
- LiveKit doesn't have built-in chat like Stream.io
- You'll need to implement custom chat (WebSocket + database)
- Or use a separate chat service

---

## 🧪 Step 8: Testing

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Test video call:**
   - Create a meeting
   - Click "Start Meeting"
   - Should connect to LiveKit room
   - Video/audio should work

3. **Test AI agent:**
   - Agent should join call automatically
   - Speak to agent
   - Agent should respond with voice

4. **Test summarization:**
   - End meeting
   - Check meeting details
   - Summary should be generated

---

## 🐛 Troubleshooting

### Issue: "LiveKit URL not configured"
- Set `NEXT_PUBLIC_LIVEKIT_URL` in `.env`

### Issue: "Failed to get LiveKit token"
- Check `LIVEKIT_API_KEY` and `LIVEKIT_API_SECRET`
- Verify LiveKit server is running

### Issue: "SST not connecting"
- Check SST API key
- Verify WebSocket endpoint in `sst.ts`
- Check browser console for errors

### Issue: "LLM not responding"
- Check LLM API key
- Verify provider name matches exactly
- Check API rate limits

### Issue: "TTS not working"
- Check TTS API key
- Verify voice ID (if required)
- Check audio format compatibility

---

## 📚 Additional Resources

- **LiveKit Docs**: https://docs.livekit.io/
- **AssemblyAI Docs**: https://www.assemblyai.com/docs/
- **Sarvam AI Docs**: https://docs.sarvam.ai/
- **Grok API**: https://docs.x.ai/
- **Kimi API**: https://platform.moonshot.cn/docs
- **Gemini API**: https://ai.google.dev/docs
- **ElevenLabs API**: https://elevenlabs.io/docs

---

## ✅ Checklist

- [ ] Installed LiveKit packages
- [ ] Set up LiveKit server (cloud or self-hosted)
- [ ] Added all API keys to `.env`
- [ ] Updated meeting call view
- [ ] Updated summarization function
- [ ] Tested video calls
- [ ] Tested AI agent voice
- [ ] Tested summarization
- [ ] Implemented chat (if needed)
- [ ] Set up recording (if needed)

---

## 🎉 You're Done!

Your project now uses:
- ✅ **LiveKit** for video calls
- ✅ **SST** (Sarvam/AssemblyAI) for speech-to-speech
- ✅ **LLM** (Grok/Kimi/Gemini) for language processing
- ✅ **TTS** (Cartesian/ElevenLabs/Sarvam) for text-to-speech

No OpenAI or Stream.io required! 🚀


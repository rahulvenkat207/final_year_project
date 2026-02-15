# ⚡ Quick Start Guide

## 🎯 What You Have Now

✅ **LiveKit** integration for video calls  
✅ **SST** (Sarvam/AssemblyAI) for speech-to-speech  
✅ **LLM** (Grok/Kimi/Gemini) for language processing  
✅ **TTS** (Cartesian/ElevenLabs/Sarvam) for text-to-speech  

---

## 📝 Step-by-Step Setup

### 1. Install Packages

```bash
cd ariaaaaa/ariaai
npm install livekit-client livekit-react-sdk @livekit/components-react livekit-server-sdk
```

### 2. Get API Keys

**LiveKit:**
- Sign up: https://cloud.livekit.io/
- Or self-host: https://docs.livekit.io/deploy/

**Choose ONE from each category:**

**SST (Speech-to-Speech):**
- AssemblyAI: https://www.assemblyai.com/
- Sarvam AI: https://sarvam.ai/

**LLM (Language Model):**
- Grok: https://x.ai/
- Kimi: https://platform.moonshot.cn/
- Gemini: https://aistudio.google.com/

**TTS (Text-to-Speech):**
- ElevenLabs: https://elevenlabs.io/
- Cartesian: https://cartesian.ai/
- Sarvam AI: https://sarvam.ai/

### 3. Update `.env` File

```env
# LiveKit
LIVEKIT_API_KEY="your-key"
LIVEKIT_API_SECRET="your-secret"
LIVEKIT_URL="wss://your-server.com"
NEXT_PUBLIC_LIVEKIT_URL="wss://your-server.com"

# SST (choose one)
SST_PROVIDER="assemblyai"
SST_API_KEY="your-key"
NEXT_PUBLIC_SST_PROVIDER="assemblyai"
NEXT_PUBLIC_SST_API_KEY="your-key"

# LLM (choose one)
LLM_PROVIDER="grok"
LLM_API_KEY="your-key"
NEXT_PUBLIC_LLM_PROVIDER="grok"
NEXT_PUBLIC_LLM_API_KEY="your-key"

# TTS (choose one)
TTS_PROVIDER="elevenlabs"
TTS_API_KEY="your-key"
NEXT_PUBLIC_TTS_PROVIDER="elevenlabs"
NEXT_PUBLIC_TTS_API_KEY="your-key"
```

### 4. Update Meeting Call Page

**File:** `src/app/(dashboard)/meetings/[meetingId]/call/page.tsx`

Replace the import:
```typescript
// OLD:
import { MeetingCallView } from "@/modules/meetings/ui/views/meeting-call-view";

// NEW:
import { MeetingCallViewLiveKit as MeetingCallView } from "@/modules/meetings/ui/views/meeting-call-view-livekit";
```

### 5. Update Summarization

**File:** `src/lib/inngest/functions.ts`

Replace the OpenAI summarization with the new LLM version (see `functions-new.ts`).

### 6. Run Database Migration

```bash
npm run db:push
```

### 7. Start Dev Server

```bash
npm run dev
```

---

## 🧪 Test It

1. **Create an agent** with instructions
2. **Create a meeting** with that agent
3. **Start the meeting** → Should connect to LiveKit
4. **Speak** → Agent should respond with voice
5. **End meeting** → Summary should be generated

---

## 🔧 Configuration Examples

### Example 1: AssemblyAI + Grok + ElevenLabs

```env
SST_PROVIDER="assemblyai"
SST_API_KEY="your-assemblyai-key"

LLM_PROVIDER="grok"
LLM_API_KEY="your-grok-key"

TTS_PROVIDER="elevenlabs"
TTS_API_KEY="your-elevenlabs-key"
```

### Example 2: Sarvam (SST + TTS) + Kimi

```env
SST_PROVIDER="sarvam"
SST_API_KEY="your-sarvam-key"

LLM_PROVIDER="kimi"
LLM_API_KEY="your-kimi-key"

TTS_PROVIDER="sarvam"
TTS_API_KEY="your-sarvam-key"
```

### Example 3: AssemblyAI + Gemini + Cartesian

```env
SST_PROVIDER="assemblyai"
SST_API_KEY="your-assemblyai-key"

LLM_PROVIDER="gemini"
LLM_API_KEY="your-gemini-key"

TTS_PROVIDER="cartesian"
TTS_API_KEY="your-cartesian-key"
```

---

## 📚 Files Created

- ✅ `src/lib/livekit.ts` - LiveKit utilities
- ✅ `src/lib/ai/sst.ts` - SST integration
- ✅ `src/lib/ai/llm.ts` - LLM integration
- ✅ `src/lib/ai/tts.ts` - TTS integration
- ✅ `src/lib/ai/agent-voice.ts` - Combined AI agent handler
- ✅ `src/app/api/livekit/token/route.ts` - Token API
- ✅ `src/app/api/livekit/room/route.ts` - Room API
- ✅ `src/modules/meetings/ui/views/meeting-call-view-livekit.tsx` - LiveKit call view
- ✅ `src/lib/inngest/functions-new.ts` - New summarization

---

## ⚠️ Important Notes

1. **LiveKit Server**: You need a LiveKit server running (cloud or self-hosted)
2. **Transcript Storage**: Implement transcript storage during calls (SST provides this)
3. **Chat**: LiveKit doesn't have built-in chat - implement custom chat if needed
4. **Recording**: Set up LiveKit recording if you need meeting recordings

---

## 🆘 Need Help?

- Check `SETUP_LIVEKIT_AND_AI.md` for detailed guide
- Check provider documentation for API specifics
- Verify all API keys are correct
- Check browser console for errors

---

## ✅ Done!

Your project is now using LiveKit + Alternative AI services instead of Stream.io + OpenAI! 🎉


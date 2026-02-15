# 🔑 API Keys - Quick Generation Guide

## Stream.io API Keys

### Step-by-Step:
1. **Visit**: https://getstream.io
2. **Sign Up** → Create free account (or **Log In**)
3. **Dashboard** → Click **"Create App"** button
4. **Fill form**:
   - App Name: `Meet AI`
   - Region: `US East` (or closest)
   - Click **"Create App"**
5. **Copy Keys** (shown on dashboard):
   - **API Key** → Use for `NEXT_PUBLIC_STREAM_API_KEY`
   - **Secret** → Click "Show" → Use for `STREAM_API_SECRET`

### Where to find:
- Dashboard homepage after creating app
- Top section in a highlighted box
- If not visible: Go to **Settings** → **API Keys**

---

## Inngest API Keys

### Step-by-Step:
1. **Visit**: https://inngest.com
2. **Sign Up** → Create free account (or **Log In**)
3. **Dashboard** → Click **"Create App"** or **"New App"**
4. **Fill form**:
   - App Name: `Meet AI`
   - Click **"Create App"**
5. **Go to Keys**:
   - Click **"Settings"** in sidebar
   - Or click **"Keys"** / **"API Keys"** tab
6. **Copy Keys**:
   - **Event Key** (starts with `event_`) → Use for `INNGEST_EVENT_KEY`
   - **Signing Key** (starts with `signkey_`) → Use for `INNGEST_SIGNING_KEY`

### Where to find:
- **Settings** → **Keys** section
- Or **App Settings** → **API Keys** tab
- Both keys are shown together

---

## OpenAI API Key

### Step-by-Step:
1. **Visit**: https://platform.openai.com
2. **Sign Up** / **Log In**
3. Click your **profile icon** (top right)
4. Click **"API Keys"** or go to: https://platform.openai.com/api-keys
5. Click **"Create new secret key"**
6. **Name it**: `Meet AI` (optional)
7. Click **"Create secret key"**
8. **Copy immediately** → Use for `OPENAI_API_KEY`
   - ⚠️ **You won't see it again!** Save it now.

---

## Quick Checklist

- [ ] Stream.io API Key → `NEXT_PUBLIC_STREAM_API_KEY`
- [ ] Stream.io Secret → `STREAM_API_SECRET`
- [ ] Inngest Event Key → `INNGEST_EVENT_KEY`
- [ ] Inngest Signing Key → `INNGEST_SIGNING_KEY`
- [ ] OpenAI API Key → `OPENAI_API_KEY`

---

## After Getting Keys

1. Create `.env` file in `ariaaaaa/ariaai/` directory
2. Paste all keys into `.env` file
3. Run: `npm run db:push`
4. Run: `npm run dev`

Done! 🎉




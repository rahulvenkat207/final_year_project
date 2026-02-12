# Environment Variables Setup Guide

## Step 1: Create `.env` File

Create a file named `.env` in the root directory (`ariaaaaa/ariaai/.env`) with the following content:

```env
NEXT_PUBLIC_APP_URL="http://localhost:3000"
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
DATABASE_URL="postgresql://neondb_owner:npg_k3wXV2sljurb@ep-crimson-base-ad7tbf4q-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

# Stream Video & Chat
# Get these from https://getstream.io after creating an account
NEXT_PUBLIC_STREAM_API_KEY=""
STREAM_API_SECRET=""

# OpenAI
# Get this from https://platform.openai.com/api-keys
OPENAI_API_KEY=""

# Inngest
# Get these from https://inngest.com after creating an account
INNGEST_EVENT_KEY=""
INNGEST_SIGNING_KEY=""
```

## Step 2: Get API Keys

### Stream.io (Video & Chat)
1. Go to https://getstream.io
2. Click **"Sign Up"** → Create account (or **"Log In"** if you have one)
3. After login, you'll see **"Create App"** or **"Dashboard"**
4. Click **"Create App"** (or select existing app)
5. Fill in:
   - **App Name**: `Meet AI` (or any name)
   - **Region**: Choose closest (e.g., `US East`)
   - Click **"Create App"**
6. Once app is created, you'll see the **Dashboard**
7. On the dashboard, find:
   - **API Key** (visible immediately) → Copy this → `NEXT_PUBLIC_STREAM_API_KEY`
   - **Secret** (click **"Show"** or **"Reveal"** button) → Copy this → `STREAM_API_SECRET`
8. Both keys are usually shown in a box at the top of the dashboard

### OpenAI (AI Agent)
1. Go to https://platform.openai.com
2. Sign up or log in
3. Navigate to **API Keys** section
4. Create a new API key
5. Copy the key → `OPENAI_API_KEY`

### Inngest (Background Jobs)
1. Go to https://inngest.com
2. Click **"Sign Up"** → Create account (or **"Log In"** if you have one)
3. After login, you'll be in the **Dashboard**
4. Click **"Create App"** or **"New App"** button
5. Fill in:
   - **App Name**: `Meet AI` (or any name)
   - Click **"Create App"**
6. Once app is created, you'll see the **App Settings** page
7. Look for **"Keys"** or **"API Keys"** section (usually in sidebar or top menu)
8. You'll see two keys:
   - **Event Key** (starts with `event_` or similar) → Copy this → `INNGEST_EVENT_KEY`
   - **Signing Key** (starts with `signkey_` or similar) → Copy this → `INNGEST_SIGNING_KEY`
9. If you don't see keys immediately, go to: **Settings** → **Keys** or **API Keys** tab

### GitHub OAuth (Optional)
1. Go to https://github.com/settings/developers
2. Create a new OAuth App
3. Set Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
4. Copy **Client ID** → `GITHUB_CLIENT_ID`
5. Copy **Client Secret** → `GITHUB_CLIENT_SECRET`

### Google OAuth (Optional)
1. Go to https://console.cloud.google.com
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Set Authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy **Client ID** → `GOOGLE_CLIENT_ID`
7. Copy **Client Secret** → `GOOGLE_CLIENT_SECRET`

## Step 3: Verify Setup

After creating the `.env` file with all your keys, restart your development server:

```bash
npm run dev
```

## Important Notes

- ⚠️ **Never commit `.env` file to git** - it's already in `.gitignore`
- ⚠️ **Keep your API keys secret** - don't share them publicly
- ✅ The `.env` file should be in the root directory (`ariaaaaa/ariaai/.env`)
- ✅ All variables starting with `NEXT_PUBLIC_` are exposed to the browser
- ✅ Server-side variables (without `NEXT_PUBLIC_`) are only available on the server

## Quick Copy Template

Copy this and paste into your `.env` file, then fill in the empty values:

```env
NEXT_PUBLIC_APP_URL="http://localhost:3000"
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
DATABASE_URL="postgresql://neondb_owner:npg_k3wXV2sljurb@ep-crimson-base-ad7tbf4q-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
NEXT_PUBLIC_STREAM_API_KEY=""
STREAM_API_SECRET=""
OPENAI_API_KEY=""
INNGEST_EVENT_KEY=""
INNGEST_SIGNING_KEY=""
```



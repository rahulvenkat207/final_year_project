// Script to create .env file with API keys
const fs = require('fs');
const path = require('path');

const envContent = `# Application URL
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
`;

const envPath = path.join(__dirname, '.env');

try {
    fs.writeFileSync(envPath, envContent, 'utf8');
    console.log('✅ .env file created successfully!');
    console.log('📝 Location:', envPath);
} catch (error) {
    console.error('❌ Error creating .env file:', error.message);
    process.exit(1);
}


// Fix DATABASE_URL - remove line breaks
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');

try {
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Fix DATABASE_URL - remove line breaks and ensure it's on one line
    const fixedDbUrl = 'postgresql://neondb_owner:npg_tw08hbHORjsz@ep-lingering-night-aifu0u1u.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
    
    // Replace DATABASE_URL (handle multi-line)
    envContent = envContent.replace(
        /DATABASE_URL="[^"]*[\s\S]*?"/g,
        `DATABASE_URL="${fixedDbUrl}"`
    );
    
    // Also handle if it's split across lines
    envContent = envContent.replace(
        /DATABASE_URL="[^"]*\n[^"]*"/g,
        `DATABASE_URL="${fixedDbUrl}"`
    );
    
    fs.writeFileSync(envPath, envContent, 'utf8');
    console.log('✅ DATABASE_URL fixed (removed line breaks)!');
    console.log('📝 Fixed URL:', fixedDbUrl);
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}


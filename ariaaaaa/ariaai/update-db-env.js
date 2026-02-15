// Script to update DATABASE_URL in .env file
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const newDbUrl = 'postgresql://neondb_owner:npg_qTRp7wMhGni2@ep-bold-river-airb8cph-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

try {
    // Read existing .env file
    let envContent = '';
    if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf8');
        console.log('✅ Found existing .env file');
    } else {
        console.log('⚠️  .env file not found, creating new one...');
    }

    // Replace DATABASE_URL line (handle various formats)
    const lines = envContent.split('\n');
    let updated = false;
    const newLines = lines.map(line => {
        // Match DATABASE_URL with or without quotes, with or without pooler
        if (line.trim().startsWith('DATABASE_URL=') || line.trim().startsWith('DATABASE_URL =')) {
            updated = true;
            return `DATABASE_URL="${newDbUrl}"`;
        }
        return line;
    });

    // If DATABASE_URL wasn't found, add it
    if (!updated) {
        console.log('📝 Adding new DATABASE_URL to .env file');
        newLines.push(`DATABASE_URL="${newDbUrl}"`);
    } else {
        console.log('✅ Updated existing DATABASE_URL');
    }

    // Write back to file
    fs.writeFileSync(envPath, newLines.join('\n'), 'utf8');
    console.log('✅ DATABASE_URL updated successfully!');
    console.log('📝 New URL:', newDbUrl.replace(/:[^:@]+@/, ':****@'));
    console.log('\n🔍 Verifying update...');
    
    // Verify the update
    const verifyContent = fs.readFileSync(envPath, 'utf8');
    if (verifyContent.includes(newDbUrl)) {
        console.log('✅ Verification successful!');
    } else {
        console.log('⚠️  Warning: Could not verify update');
    }
} catch (error) {
    console.error('❌ Error updating .env file:', error.message);
    process.exit(1);
}


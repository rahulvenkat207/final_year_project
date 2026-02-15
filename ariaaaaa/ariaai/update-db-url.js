// Script to update DATABASE_URL in .env file
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const newDbUrl = 'postgresql://neondb_owner:npg_tw08hbHORjsz@ep-lingering-night-aifu0u1u.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

try {
    // Read existing .env file
    let envContent = '';
    if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf8');
    } else {
        console.log('Creating new .env file...');
    }

    // Replace DATABASE_URL line
    const lines = envContent.split('\n');
    let updated = false;
    const newLines = lines.map(line => {
        if (line.startsWith('DATABASE_URL=')) {
            updated = true;
            return `DATABASE_URL="${newDbUrl}"`;
        }
        return line;
    });

    // If DATABASE_URL wasn't found, add it
    if (!updated) {
        newLines.push(`DATABASE_URL="${newDbUrl}"`);
    }

    // Write back to file
    fs.writeFileSync(envPath, newLines.join('\n'), 'utf8');
    console.log('✅ DATABASE_URL updated successfully!');
    console.log('📝 New URL:', newDbUrl);
} catch (error) {
    console.error('❌ Error updating .env file:', error.message);
    process.exit(1);
}


// Script to update DATABASE_URL with pooler connection string
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const newDbUrl = 'postgresql://neondb_owner:npg_tw08hbHORjsz@ep-lingering-night-aifu0u1u-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

try {
    // Read existing .env file
    let envContent = '';
    if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf8');
    }

    // Replace DATABASE_URL line (handle multi-line)
    const lines = envContent.split('\n');
    let updated = false;
    const newLines = lines.map((line, index) => {
        if (line.startsWith('DATABASE_URL=')) {
            updated = true;
            // Check if next line continues the URL
            if (index + 1 < lines.length && lines[index + 1].trim().startsWith('?')) {
                // Skip next line as it's part of the URL
                return `DATABASE_URL="${newDbUrl}"`;
            }
            return `DATABASE_URL="${newDbUrl}"`;
        }
        // Skip lines that are continuation of DATABASE_URL
        if (index > 0 && lines[index - 1].startsWith('DATABASE_URL=') && line.trim().startsWith('?')) {
            return null; // Remove continuation line
        }
        return line;
    }).filter(line => line !== null);

    // If DATABASE_URL wasn't found, add it
    if (!updated) {
        newLines.push(`DATABASE_URL="${newDbUrl}"`);
    }

    // Write back to file
    fs.writeFileSync(envPath, newLines.join('\n'), 'utf8');
    console.log('✅ DATABASE_URL updated with pooler connection!');
    console.log('📝 New URL:', newDbUrl);
} catch (error) {
    console.error('❌ Error updating .env file:', error.message);
    process.exit(1);
}


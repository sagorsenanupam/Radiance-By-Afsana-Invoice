// Configuration Checker
// Run this to verify your setup: node check-config.js

require('dotenv').config();

console.log('\n🔍 Checking Radiance Invoice System Configuration...\n');

const checks = {
    'Node.js Version': process.version,
    'PORT': process.env.PORT || '3000 (default)',
    'EMAIL_USER': process.env.EMAIL_USER ? '✅ Set' : '❌ Missing',
    'EMAIL_APP_PASSWORD': process.env.EMAIL_APP_PASSWORD ? '✅ Set' : '❌ Missing',
    'GOOGLE_CLIENT_ID': process.env.GOOGLE_CLIENT_ID ? '✅ Set' : '❌ Missing',
    'GOOGLE_CLIENT_SECRET': process.env.GOOGLE_CLIENT_SECRET ? '✅ Set' : '❌ Missing',
    'GOOGLE_REDIRECT_URI': process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/oauth2callback (default)',
    'GOOGLE_SHEET_ID': process.env.GOOGLE_SHEET_ID ? '✅ Set' : '❌ Missing',
    'GOOGLE_CALENDAR_ID': process.env.GOOGLE_CALENDAR_ID || 'primary (default)',
    'GOOGLE_REFRESH_TOKEN': process.env.GOOGLE_REFRESH_TOKEN ? '✅ Set' : '⚠️  Not set (run authorization first)'
};

let hasErrors = false;

for (const [key, value] of Object.entries(checks)) {
    console.log(`${key}: ${value}`);
    if (typeof value === 'string' && value.includes('❌')) {
        hasErrors = true;
    }
}

console.log('\n');

if (hasErrors) {
    console.log('❌ Configuration incomplete. Please check your .env file.');
    console.log('📝 Copy .env.example to .env and fill in the required values.');
} else if (!process.env.GOOGLE_REFRESH_TOKEN) {
    console.log('⚠️  Almost ready! Please authorize Google APIs:');
    console.log('   1. Start the server: npm start');
    console.log('   2. Visit: http://localhost:3000/api/auth');
    console.log('   3. Follow the authorization steps');
    console.log('   4. Copy the refresh token to your .env file');
} else {
    console.log('✅ Configuration looks good! Ready to start.');
    console.log('🚀 Run: npm start');
}

console.log('\n');

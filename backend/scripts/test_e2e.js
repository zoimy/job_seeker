import axios from 'axios';

const BASE_URL = 'http://localhost:5001/api';
// Generate a random User ID for this test session
const TEST_USER_ID = `test-user-${Math.floor(Math.random() * 10000)}`;

const runE2E = async () => {
    console.log(`🚀 Starting E2E Test with User ID: ${TEST_USER_ID}`);

    try {
        // 1. Check Health
        console.log('\n🏥 Checking System Health...');
        const health = await axios.get('http://localhost:5001/health');
        console.log('✅ System is healthy:', health.data);

        // 2. Create Profile
        console.log('\n👤 Creating User Profile...');
        const profilePayload = {
            role: 'Javascript Developer',
            location: 'Chisinau',
            minSalary: 1000,
            notificationsEnabled: true,
            // For testing, we can put a dummy chat ID or the user's real one if they provided it
            // We'll leave it empty for now, so it runs the logic but skips actual Telegram send (unless configured)
            // or we use a "test" chat ID if known.
            telegramChatId: '123456789' 
        };

        const createRes = await axios.post(`${BASE_URL}/profile`, profilePayload, {
            headers: { 'x-user-id': TEST_USER_ID }
        });
        console.log('✅ Profile Created:', createRes.data.profile.role);

        // 3. Trigger Scan
        console.log('\n🔎 Triggering Manual Scan...');
        const scanRes = await axios.post(`${BASE_URL}/notifications/scan-now`, {}, {
            headers: { 'x-user-id': TEST_USER_ID }
        });
        console.log('✅ Scan Triggered:', scanRes.data.message);

        console.log('\n⏳ Check your server logs (terminal) to see the scraping progress.');
        console.log('   You should see logs like "Processing profile for User..." and "Scraped X vacancies"');

    } catch (error) {
        console.error('❌ Test Failed:', error.message);
        if (error.response) {
            console.error('   Data:', error.response.data);
        }
    }
};

runE2E();

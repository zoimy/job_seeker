import axios from 'axios';

const BASE_URL = 'http://localhost:5001/api';

const runTest = async () => {
  try {
    console.log('🧪 Starting Multi-User Auth Verification...');

    // User A
    const userA = {
      id: 'user-uuid-aaaa-1111',
      name: 'Alice',
      role: 'Frontend Developer'
    };

    // User B
    const userB = {
      id: 'user-uuid-bbbb-2222',
      name: 'Bob',
      role: 'Backend Developer'
    };

    // 1. Create Profile A
    console.log('\n📝 Creating Profile for User A...');
    await axios.post(`${BASE_URL}/profile`, {
      role: userA.role,
      location: 'Chisinau'
    }, {
      headers: { 'x-user-id': userA.id }
    });
    console.log('✅ User A Profile Created');

    // 2. Create Profile B
    console.log('\n📝 Creating Profile for User B...');
    await axios.post(`${BASE_URL}/profile`, {
      role: userB.role,
      location: 'Balti'
    }, {
      headers: { 'x-user-id': userB.id }
    });
    console.log('✅ User B Profile Created');

    // 3. Fetch Profile A
    console.log('\n🔍 Fetching User A Profile...');
    const resA = await axios.get(`${BASE_URL}/profile`, {
      headers: { 'x-user-id': userA.id }
    });
    
    if (resA.data.profile.role === userA.role) {
        console.log('✅ User A Profile Correct:', resA.data.profile.role);
    } else {
        console.error('❌ User A Profile Mismatch:', resA.data.profile);
    }

    // 4. Fetch Profile B
    console.log('\n🔍 Fetching User B Profile...');
    const resB = await axios.get(`${BASE_URL}/profile`, {
      headers: { 'x-user-id': userB.id }
    });

    if (resB.data.profile.role === userB.role) {
        console.log('✅ User B Profile Correct:', resB.data.profile.role);
    } else {
        console.error('❌ User B Profile Mismatch:', resB.data.profile);
    }

    // 5. Verify Isolation
    console.log('\n🔒 Verifying Isolation...');
    if (resA.data.profile._id !== resB.data.profile._id) {
        console.log('✅ Profiles have different IDs');
    } else {
        console.error('❌ CRITICAL: Profiles share the same ID!');
    }

    console.log('\n🎉 Verification Complete!');

  } catch (error) {
    console.error('❌ Test Failed:', error.message);
    if (error.response) {
        console.error('Response Status:', error.response.status);
        console.error('Response Data:', error.response.data);
    }
  }
};

runTest();

// Quick Profile Diagnostic Script
// Run this in your browser console on Vercel to debug profile loading issues

console.log('🔍 Job Tracker Profile Diagnostic\n');

// 1. Check User ID
const userId = localStorage.getItem('job_tracker_user_id');
console.log('1️⃣ User ID in localStorage:', userId);
console.log('   Expected MongoDB userId: 3383eb45-6c04-4181-9504-07c6018b0c6b');
console.log('   Match:', userId === '3383eb45-6c04-4181-9504-07c6018b0c6b' ? '✅ YES' : '❌ NO');

// 2. Check Backend URL
const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';
console.log('\n2️⃣ Backend URL:', backendUrl);
console.log('   Is production URL:', backendUrl.includes('https://') ? '✅ YES' : '⚠️ NO (using localhost)');

// 3. Test API Connection
console.log('\n3️⃣ Testing API connection...');
fetch(`${backendUrl}/health`)
  .then(r => {
    console.log('   Health check status:', r.status);
    return r.json();
  })
  .then(data => {
    console.log('   Backend health:', data);
  })
  .catch(err => {
    console.error('   ❌ Backend health check failed:', err.message);
  });

// 4. Test Profile API
console.log('\n4️⃣ Testing profile API...');
fetch(`${backendUrl}/api/profile`, {
  headers: {
    'x-user-id': userId
  }
})
  .then(async r => {
    console.log('   Profile API status:', r.status);
    const data = await r.json();
    
    if (data.profile) {
      console.log('   ✅ Profile loaded successfully!');
      console.log('   Profile name:', data.profile.name);
      console.log('   Profile role:', data.profile.role);
      console.log('   Skills:', data.profile.skills);
      console.log('\n📊 Full profile data:');
      console.table({
        Name: data.profile.name,
        Role: data.profile.role,
        Location: data.profile.location,
        Experience: data.profile.experienceLevel,
        'Min Salary': data.profile.minSalary,
        'Skills Count': data.profile.skills?.length || 0
      });
    } else {
      console.log('   ⚠️ Profile is null - no profile found for this user ID');
      console.log('   Possible reasons:');
      console.log('   - User ID mismatch');
      console.log('   - Profile not created yet');
    }
    
    return data;
  })
  .catch(err => {
    console.error('   ❌ Profile API failed:', err.message);
    if (err.message.includes('CORS')) {
      console.log('\n🚨 CORS Error Detected!');
      console.log('   Fix: Add your Vercel domain to backend FRONTEND_URL environment variable');
      console.log('   Backend needs: FRONTEND_URL=' + window.location.origin);
    } else if (err.message.includes('fetch')) {
      console.log('\n🚨 Network Error!');
      console.log('   Fix: Check if VITE_BACKEND_URL is set correctly in Vercel');
      console.log('   Current backend URL:', backendUrl);
    }
  });

// 5. Check all localStorage
console.log('\n5️⃣ All localStorage items:');
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  const value = localStorage.getItem(key);
  console.log(`   ${key}:`, value.substring(0, 100) + (value.length > 100 ? '...' : ''));
}

console.log('\n✅ Diagnostic complete! Check results above.');
console.log('If you need to sync User ID, run:');
console.log('localStorage.setItem("job_tracker_user_id", "3383eb45-6c04-4181-9504-07c6018b0c6b"); location.reload();');

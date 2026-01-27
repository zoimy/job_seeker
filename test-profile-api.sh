#!/bin/bash

# Profile API Test Script
# This script tests the profile API to diagnose why profile data appears empty

echo "🔍 Testing Job Seeker Profile API"
echo "=================================="
echo ""

BACKEND_URL="https://job-seeker-p8zi.onrender.com"

# Test 1: Health Check
echo "1️⃣ Testing Backend Health..."
HEALTH=$(curl -s "$BACKEND_URL/health")
echo "Response: $HEALTH"
echo ""

# Test 2: Get localStorage user ID from browser
echo "2️⃣ To test your profile, I need your User ID from localStorage"
echo "   Open https://job-seeker-dusky.vercel.app in browser"
echo "   Press F12 (DevTools) → Console tab"
echo "   Type: localStorage.getItem('job_tracker_user_id')"
echo "   Copy the UUID and paste it here:"
echo ""
read -p "Enter your User ID: " USER_ID

if [ -z "$USER_ID" ]; then
    echo "❌ No User ID provided. Exiting."
    exit 1
fi

echo ""
echo "3️⃣ Testing Profile API with User ID: $USER_ID"
echo "   GET $BACKEND_URL/api/profile"
echo ""

PROFILE_RESPONSE=$(curl -s -w "\n%{http_code}" -H "x-user-id: $USER_ID" "$BACKEND_URL/api/profile")
HTTP_CODE=$(echo "$PROFILE_RESPONSE" | tail -n1)
BODY=$(echo "$PROFILE_RESPONSE" | sed '$d')

echo "HTTP Status: $HTTP_CODE"
echo "Response Body:"
echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
echo ""

# Test 3: Analyze response
if [ "$HTTP_CODE" = "200" ]; then
    HAS_PROFILE=$(echo "$BODY" | jq -r '.profile != null')
    if [ "$HAS_PROFILE" = "true" ]; then
        echo "✅ Profile found in database!"
        NAME=$(echo "$BODY" | jq -r '.profile.name')
        ROLE=$(echo "$BODY" | jq -r '.profile.role')
        SKILLS=$(echo "$BODY" | jq -r '.profile.skills | length')
        echo "   Name: $NAME"
        echo "   Role: $ROLE"
        echo "   Skills: $SKILLS"
    else
        echo "⚠️  Profile is NULL - No profile created yet for this user"
        echo "   This means onboarding was not completed or profile was not saved"
    fi
else
    echo "❌ API Error: HTTP $HTTP_CODE"
fi

echo ""
echo "4️⃣ Testing CORS with Vercel origin..."
CORS_TEST=$(curl -s -H "Origin: https://job-seeker-dusky.vercel.app" -H "x-user-id: $USER_ID" "$BACKEND_URL/api/profile" -v 2>&1 | grep -i "access-control-allow-origin")
echo "$CORS_TEST"

if echo "$CORS_TEST" | grep -q "job-seeker-dusky.vercel.app"; then
    echo "✅ CORS is properly configured"
else
    echo "❌ CORS may be blocking requests"
fi

echo ""
echo "=================================="
echo "🏁 Test Complete"

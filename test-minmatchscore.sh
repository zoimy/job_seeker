#!/bin/bash

echo "🔍 Testing MinMatchScore Persistence"
echo "====================================="
echo ""

USER_ID="3383eb45-6c04-4181-9504-07c6018b0c6b"
BACKEND="http://localhost:5001"

echo "1️⃣ Current value in database:"
CURRENT=$(curl -s -H "x-user-id: $USER_ID" "$BACKEND/api/profile" | jq '.profile.minMatchScore')
echo "   minMatchScore from /api/profile: $CURRENT"
echo ""

echo "2️⃣ Sending UPDATE with minMatchScore = 25:"
echo "   PUT /api/notifications/preferences"
RESPONSE=$(curl -s -X PUT "$BACKEND/api/notifications/preferences" \
  -H "Content-Type: application/json" \
  -H "x-user-id: $USER_ID" \
  -d '{"telegramEnabled":true,"telegramChatId":"655209387","scanFrequency":"instant","minMatchScore":25}')

echo "   Response:"
echo "$RESPONSE" | jq '.'
echo ""

echo "3️⃣ Checking if saved in database:"
SAVED=$(curl -s -H "x-user-id: $USER_ID" "$BACKEND/api/profile" | jq '.profile.minMatchScore')
echo "   minMatchScore from /api/profile: $SAVED"

if [ "$SAVED" = "25" ]; then
  echo "   ✅ SAVED CORRECTLY!"
else
  echo "   ❌ NOT SAVED (expected 25, got $SAVED)"
fi
echo ""

echo "4️⃣ Checking GET /api/notifications/preferences:"
PREFS=$(curl -s -H "x-user-id: $USER_ID" "$BACKEND/api/notifications/preferences" | jq '.preferences.minMatchScore')
echo "   minMatchScore: $PREFS"

if [ "$PREFS" = "25" ]; then
  echo "   ✅ RETURNS CORRECTLY!"
else
  echo "   ❌ WRONG VALUE (expected 25, got $PREFS)"
fi

echo ""
echo "====================================="
echo "🏁 Test Complete"

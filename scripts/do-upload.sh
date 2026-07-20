#!/bin/sh
J=/tmp/jar3.txt
rm -f $J

curl -s -c $J http://localhost:3000/api/auth/csrf > /tmp/c3.json
CSRF=$(python3 -c "import json; print(json.load(open('/tmp/c3.json'))['csrfToken'])")
echo "CSRF: $CSRF"

curl -s -X POST http://localhost:3000/api/auth/callback/credentials -b $J -c $J \
  -d "email=nirut.rodngam1978@gmail.com&password=Neno2024!&csrfToken=$CSRF&callbackUrl=http://localhost:3000/admin&json=true" > /dev/null

SESS=$(curl -s -b $J http://localhost:3000/api/auth/session)
echo "Session: $SESS"

curl -s -X POST http://localhost:3000/api/upload/settings-logo -b $J \
  -F "file=@/mnt/c/NIRUT-Storage/PROJECT-AI/Neno-Jewelry/jewelry-store/public/logo.svg" > /tmp/up.json
URL=$(python3 -c "import json; print(json.load(open('/tmp/up.json'))['url'])")
echo "Logo URL: $URL"

curl -s -X PUT http://localhost:3000/api/settings -b $J \
  -H "Content-Type: application/json" \
  -d '{"logoUrl":"'"$URL"'"}'
echo ""

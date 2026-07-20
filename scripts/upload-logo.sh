#!/bin/sh
JAR=/tmp/cookie5.txt
BASE=http://localhost:3000
rm -f $JAR

echo "=== Login ==="
CSRF=$(curl -s -c $JAR "$BASE/api/auth/csrf" | sed 's/.*csrfToken":"//' | sed 's/".*//')
curl -s -X POST "$BASE/api/auth/callback/credentials" \
  -b $JAR -c $JAR \
  --data-urlencode "email=nirut.rodngam1978@gmail.com" \
  --data-urlencode "password=Neno2024!" \
  --data-urlencode "csrfToken=$CSRF" \
  --data-urlencode "callbackUrl=$BASE/admin" \
  --data-urlencode "json=true" > /dev/null

echo "=== Upload Logo ==="
SVG="/mnt/c/NIRUT-Storage/PROJECT-AI/Neno-Jewelry/jewelry-store/public/logo.svg"
UPLOAD=$(curl -s -X POST "$BASE/api/upload/settings-logo" -b $JAR -F "file=@$SVG")
URL=$(echo "$UPLOAD" | sed 's/.*"url":"//' | sed 's/".*//')
echo "URL: $URL"

echo "=== Update Settings ==="
RESULT=$(curl -s -X PUT "$BASE/api/settings" -b $JAR -H "Content-Type: application/json" -d '{"logoUrl":"'"$URL"'"}')
echo "Result logoUrl: $(echo $RESULT | sed 's/.*"logoUrl":"//' | sed 's/".*//')"

rm -f $JAR
echo "=== DONE ==="

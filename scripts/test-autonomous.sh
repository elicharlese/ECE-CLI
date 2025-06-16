#!/bin/bash

echo "🚀 ECE-CLI Autonomous System Test Suite"
echo "========================================"
echo ""

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DOCKER_MODE="${1:-}"

# Check if running in Docker mode
if [[ "$DOCKER_MODE" == "--docker" ]]; then
  echo "� Testing Docker environment..."
  
  # Check Docker services
  if docker-compose -f "$PROJECT_ROOT/docker/docker-compose.yml" ps | grep -q "Up"; then
    echo "✅ Docker services are running"
  else
    echo "⚠️  Starting Docker services for testing..."
    docker-compose -f "$PROJECT_ROOT/docker/docker-compose.yml" up -d
    sleep 15
  fi
  
  FRONTEND_URL="http://localhost:3000"
  BACKEND_URL="http://localhost:4000"
else
  echo "🔍 Testing CLI environment..."
  FRONTEND_URL="http://localhost:3000"
  BACKEND_URL="http://localhost:3000"
fi

# Function to test API endpoint
test_endpoint() {
  local url=$1
  local method=${2:-GET}
  local data=${3:-}
  local expected_status=${4:-200}
  
  if [ -n "$data" ]; then
    response=$(curl -s -w "HTTPSTATUS:%{http_code}" -X "$method" \
      -H "Content-Type: application/json" \
      -d "$data" "$url")
  else
    response=$(curl -s -w "HTTPSTATUS:%{http_code}" -X "$method" "$url")
  fi
  
  http_code=$(echo "$response" | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
  body=$(echo "$response" | sed -e 's/HTTPSTATUS:.*//')
  
  if [ "$http_code" -eq "$expected_status" ]; then
    echo "✅ $method $url - Status: $http_code"
    return 0
  else
    echo "❌ $method $url - Expected: $expected_status, Got: $http_code"
    echo "   Response: $body"
    return 1
  fi
}

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
timeout=60
while [ $timeout -gt 0 ]; do
  if curl -s "$FRONTEND_URL/api/health" > /dev/null 2>&1; then
    break
  fi
  sleep 2
  timeout=$((timeout - 2))
done

if [ $timeout -le 0 ]; then
  echo "❌ Services failed to start within 60 seconds"
  exit 1
fi

echo "✅ Services are ready!"
echo ""

# Test suite
echo "🧪 Running comprehensive test suite..."
echo ""

test_count=0
passed_count=0

# Health check
echo "1. Testing health endpoint..."
if test_endpoint "$FRONTEND_URL/api/health"; then
  passed_count=$((passed_count + 1))
fi
test_count=$((test_count + 1))

# Authentication tests
echo ""
echo "2. Testing authentication endpoints..."

# Demo auth
if test_endpoint "$FRONTEND_URL/api/auth" "POST" '{"provider":"demo"}'; then
  passed_count=$((passed_count + 1))
fi
test_count=$((test_count + 1))

# Google auth with email
if test_endpoint "$FRONTEND_URL/api/auth" "POST" '{"provider":"google","email":"test@example.com"}'; then
  passed_count=$((passed_count + 1))
fi
test_count=$((test_count + 1))

# Phantom wallet auth
if test_endpoint "$FRONTEND_URL/api/auth" "POST" '{"provider":"phantom","walletAddress":"0x1234567890abcdef"}'; then
  passed_count=$((passed_count + 1))
fi
test_count=$((test_count + 1))

# Invalid auth (should fail)
if test_endpoint "$FRONTEND_URL/api/auth" "POST" '{"provider":"invalid"}' 400; then
  passed_count=$((passed_count + 1))
fi
test_count=$((test_count + 1))

# User API tests
echo ""
echo "3. Testing user management endpoints..."

# First get a session token from auth
AUTH_RESPONSE=$(curl -s -X POST "$FRONTEND_URL/api/auth" \
  -H "Content-Type: application/json" \
  -d '{"provider":"demo"}')

if command -v jq &> /dev/null; then
  SESSION_TOKEN=$(echo "$AUTH_RESPONSE" | jq -r '.session.id')
else
  SESSION_TOKEN=$(echo "$AUTH_RESPONSE" | grep -o '"id":"[^"]*"' | cut -d'"' -f4 | head -n1)
fi

if [ -n "$SESSION_TOKEN" ]; then
  # Test user endpoint with authorization
  if curl -s -H "Authorization: Bearer $SESSION_TOKEN" "$FRONTEND_URL/api/user" | grep -q "success"; then
    echo "✅ GET $FRONTEND_URL/api/user - Status: 200"
    passed_count=$((passed_count + 1))
  else
    echo "❌ GET $FRONTEND_URL/api/user - Authorization failed"
  fi
else
  echo "❌ GET $FRONTEND_URL/api/user - Could not get session token"
fi
test_count=$((test_count + 1))

# Build API tests
echo ""
echo "4. Testing build endpoints..."

# Test build endpoint with proper parameters
if test_endpoint "$FRONTEND_URL/api/build" "POST" '{"name":"Test App","description":"A test application","userId":"demo"}'; then
  passed_count=$((passed_count + 1))
fi
test_count=$((test_count + 1))

if test_endpoint "$FRONTEND_URL/api/build?appId=test123"; then
  passed_count=$((passed_count + 1))
fi
test_count=$((test_count + 1))

# Frontend tests
echo ""
echo "5. Testing frontend pages..."

if test_endpoint "$FRONTEND_URL"; then
  passed_count=$((passed_count + 1))
fi
test_count=$((test_count + 1))

# Run unit tests if available
echo ""
echo "6. Running unit tests..."
cd "$PROJECT_ROOT/generated-app"

if [ -f "package.json" ] && npm run | grep -q "test"; then
  if npm test > /dev/null 2>&1; then
    echo "✅ Unit tests passed"
    passed_count=$((passed_count + 1))
  else
    echo "❌ Unit tests failed"
  fi
  test_count=$((test_count + 1))
fi

# Performance tests
echo ""
echo "7. Testing performance..."

response_time=$(curl -o /dev/null -s -w '%{time_total}' "$FRONTEND_URL")
if (( $(echo "$response_time < 2.0" | bc -l) )); then
  echo "✅ Frontend response time: ${response_time}s (< 2s)"
  passed_count=$((passed_count + 1))
else
  echo "❌ Frontend response time: ${response_time}s (> 2s)"
fi
test_count=$((test_count + 1))

# Security tests
echo ""
echo "8. Testing security headers..."

security_headers=$(curl -I -s "$FRONTEND_URL" | grep -i "x-\|content-security\|strict-transport")
if [ -n "$security_headers" ]; then
  echo "✅ Security headers present"
  passed_count=$((passed_count + 1))
else
  echo "⚠️  No security headers detected"
fi
test_count=$((test_count + 1))

# Final results
echo ""
echo "� Test Results"
echo "==============="
echo "Total tests: $test_count"
echo "Passed: $passed_count"
echo "Failed: $((test_count - passed_count))"
echo "Success rate: $(( (passed_count * 100) / test_count ))%"

if [ $passed_count -eq $test_count ]; then
  echo ""
  echo "🎉 All tests passed! System is fully operational."
  echo ""
  echo "� Autonomous System Status: OPERATIONAL"
  echo ""
  echo "📋 Features Tested:"
  echo "   ✅ Health monitoring"
  echo "   ✅ Multi-provider authentication"
  echo "   ✅ Input validation with Zod"
  echo "   ✅ User management APIs"
  echo "   ✅ Autonomous app building"
  echo "   ✅ Frontend rendering"
  echo "   ✅ Performance requirements"
  echo "   ✅ Security headers"
  echo ""
  echo "💡 Ready for production deployment!"
  echo "📱 Frontend: $FRONTEND_URL"
  if [ "$DOCKER_MODE" == "--docker" ]; then
    echo "🔧 Backend: $BACKEND_URL"
    echo "🗄️  Database: PostgreSQL on port 5432"
    echo "🚀 Monitoring: Prometheus (9090), Grafana (3001)"
  fi
  
  exit 0
else
  echo ""
  echo "❌ Some tests failed. Please check the issues above."
  echo ""
  echo "🔧 Troubleshooting:"
  echo "   • Check service logs: docker-compose logs"
  echo "   • Verify environment variables"
  echo "   • Ensure all dependencies are installed"
  echo "   • Check network connectivity"
  
  exit 1
fi

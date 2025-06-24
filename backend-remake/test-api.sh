#!/bin/bash

# API Testing Script for Bookstore Backend
# Requires curl and jq (optional for pretty JSON)

BASE_URL="http://localhost:3001/api/v1"
TOKEN=""

echo "🧪 Testing Bookstore Backend API"
echo "================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print section headers
print_section() {
    echo -e "\n${BLUE}$1${NC}"
    echo "----------------------------------------"
}

# Function to make API calls
api_call() {
    local method=$1
    local endpoint=$2
    local data=$3
    local auth_header=""
    
    if [ ! -z "$TOKEN" ]; then
        auth_header="-H 'Authorization: Bearer $TOKEN'"
    fi
    
    echo -e "${YELLOW}$method $endpoint${NC}"
    
    if [ -z "$data" ]; then
        eval "curl -s -X $method $BASE_URL$endpoint $auth_header" | jq . 2>/dev/null || eval "curl -s -X $method $BASE_URL$endpoint $auth_header"
    else
        eval "curl -s -X $method -H 'Content-Type: application/json' $BASE_URL$endpoint -d '$data' $auth_header" | jq . 2>/dev/null || eval "curl -s -X $method -H 'Content-Type: application/json' $BASE_URL$endpoint -d '$data' $auth_header"
    fi
    echo -e "\n"
}

# Test 1: Health Check
print_section "1. Health Check"
api_call "GET" "/health"

# Test 2: Initialize Admin
print_section "2. Initialize Admin User"
api_call "POST" "/admin/init"

# Test 3: Login as Admin
print_section "3. Admin Login"
LOGIN_RESPONSE=$(curl -s -X POST -H 'Content-Type: application/json' "$BASE_URL/auth/login" -d '{"username":"admin@admin.com","password":"admin123"}')
echo "$LOGIN_RESPONSE" | jq . 2>/dev/null || echo "$LOGIN_RESPONSE"

# Extract token if jq is available
if command -v jq &> /dev/null; then
    TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.access_token // empty')
    if [ ! -z "$TOKEN" ] && [ "$TOKEN" != "null" ]; then
        echo -e "${GREEN}✅ Login successful! Token extracted.${NC}"
    else
        echo -e "${RED}❌ Failed to extract token${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  jq not found. Please extract token manually.${NC}"
fi

# Test 4: Get Admin Profile
if [ ! -z "$TOKEN" ]; then
    print_section "4. Get Admin Profile"
    api_call "GET" "/auth/account"
    
    # Test 5: Seed Sample Data
    print_section "5. Seed Sample Data"
    api_call "POST" "/admin/seed"
    
    # Test 6: Get Books
    print_section "6. Get Books"
    api_call "GET" "/book"
    
    # Test 7: Get Categories
    print_section "7. Get Categories"
    api_call "GET" "/database/category"
    
    # Test 8: Get Dashboard Stats
    print_section "8. Dashboard Statistics"
    api_call "GET" "/database/dashboard"
    
    # Test 9: Get Users (Admin)
    print_section "9. Get Users"
    api_call "GET" "/user"
    
    # Test 10: System Stats
    print_section "10. System Statistics"
    api_call "GET" "/admin/stats"
    
else
    echo -e "${RED}❌ Cannot continue tests without authentication token${NC}"
fi

# Test User Registration (No auth required)
print_section "11. User Registration Test"
api_call "POST" "/user/register" '{"fullName":"Test User","email":"test@example.com","password":"123456","phone":"0123456789"}'

echo -e "\n${GREEN}🎉 API Testing Complete!${NC}"
echo "================================="
echo -e "${BLUE}Useful endpoints for frontend:${NC}"
echo "• Login: POST /api/v1/auth/login"
echo "• Books: GET /api/v1/book"
echo "• Categories: GET /api/v1/database/category"
echo "• Orders: GET/POST /api/v1/order"
echo "• Upload: POST /api/v1/file/upload"
echo ""
echo -e "${YELLOW}Admin credentials:${NC}"
echo "• Email: admin@admin.com"
echo "• Password: admin123"

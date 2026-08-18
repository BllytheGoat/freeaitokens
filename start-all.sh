#!/bin/bash

# Complete startup script for FreeAITokens ecosystem

echo "🚀 FreeAITokens Complete Startup"
echo "================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check prerequisites
echo "Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm not found"
    exit 1
fi

echo -e "${GREEN}✅ Node.js ${NC}$(node --version)"
echo -e "${GREEN}✅ npm ${NC}$(npm --version)"
echo ""

# Start FreeAITokens server
echo "Starting FreeAITokens Server (port 5000)..."
cd /tmp/freeaitokens 2>/dev/null || cd ~ || cd .
npm run start &
SERVER_PID=$!
sleep 2

if ! ps -p $SERVER_PID > /dev/null; then
    echo "❌ Failed to start FreeAITokens server"
    exit 1
fi
echo -e "${GREEN}✅ Server started (PID: $SERVER_PID)${NC}"

# Start Dashboard
echo "Starting Dashboard (port 5500)..."
cd /tmp/freeaitokens_gui 2>/dev/null || cd ~ || cd .
npm run dev &
DASHBOARD_PID=$!
sleep 2

if ! ps -p $DASHBOARD_PID > /dev/null; then
    echo "❌ Failed to start Dashboard"
    kill $SERVER_PID
    exit 1
fi
echo -e "${GREEN}✅ Dashboard started (PID: $DASHBOARD_PID)${NC}"

# Start Cloudflare Tunnel (optional)
echo ""
read -p "Start Cloudflare Tunnel? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if [ -f ~/.cloudflared/freeaitokens-dashboard.json ]; then
        echo "Starting Cloudflare Tunnel..."
        /tmp/cloudflared tunnel run freeaitokens-dashboard &
        TUNNEL_PID=$!
        sleep 2
        echo -e "${GREEN}✅ Tunnel started (PID: $TUNNEL_PID)${NC}"
    else
        echo -e "${YELLOW}⚠️  Tunnel credentials not found. Run cloudflare-auth.sh first.${NC}"
    fi
fi

echo ""
echo "================================="
echo -e "${GREEN}✅ All services running!${NC}"
echo "================================="
echo ""
echo "📍 Access Points:"
echo "   API: http://localhost:5000/v1"
echo "   Dashboard: http://localhost:5500"
if [ ! -z "$TUNNEL_PID" ]; then
    echo "   Public: https://freeaitokens.YOUR-DOMAIN.com"
fi
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Trap Ctrl+C to cleanup
trap "echo ''; echo 'Stopping all services...'; kill $SERVER_PID $DASHBOARD_PID $TUNNEL_PID 2>/dev/null; echo 'Done'; exit 0" INT

wait

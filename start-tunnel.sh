#!/bin/bash

# Start FreeAITokens with Cloudflare Tunnel

echo "🚀 Starting FreeAITokens + Cloudflare Tunnel"
echo "============================================"
echo ""

# Check if tunnel credentials exist
if [ ! -f ~/.cloudflared/freeaitokens-dashboard.json ]; then
    echo "❌ Tunnel credentials not found."
    echo "Run: ./cloudflare-auth.sh first"
    exit 1
fi

# Start the tunnel in the background
echo "Starting Cloudflare Tunnel..."
/tmp/cloudflared tunnel run freeaitokens-dashboard &
TUNNEL_PID=$!

# Give tunnel time to start
sleep 3

echo ""
echo "✅ Services started:"
echo "   - API Server: http://localhost:5000/v1"
echo "   - Dashboard: http://localhost:5500"
echo "   - Tunnel: Running (PID: $TUNNEL_PID)"
echo ""
echo "📡 Your public URL will be:"
echo "   https://freeaitokens.YOUR-DOMAIN.com"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Wait for interrupt
wait $TUNNEL_PID

#!/bin/bash

# FreeAITokens + Cloudflare Tunnel Setup Script
# Run this to authenticate with Cloudflare

echo "🔐 Cloudflare Tunnel Authentication"
echo "===================================="
echo ""
echo "This will authenticate cloudflared with your Cloudflare account."
echo "You'll be redirected to https://dash.cloudflare.com/ to authorize."
echo ""

# Authenticate
/tmp/cloudflared tunnel login

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Authentication successful!"
    echo ""
    echo "Next, run: ./start-tunnel.sh"
else
    echo "❌ Authentication failed. Please try again."
    exit 1
fi

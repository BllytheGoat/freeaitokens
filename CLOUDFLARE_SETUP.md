# 🌐 Cloudflare Tunnel Setup for FreeAITokens

**Expose your local FreeAITokens dashboard to the internet using Cloudflare's free tunnel service.**

---

## ✨ What This Does

✅ **Secure Tunnel** — Access your local server from anywhere  
✅ **No Port Forwarding** — Cloudflare handles NAT traversal  
✅ **Free** — Uses Cloudflare's free tier  
✅ **HTTPS** — Automatic SSL/TLS encryption  
✅ **Custom Domain** — Use your own domain  
✅ **API Routing** — Separate subdomains for dashboard & API  

---

## 📋 Prerequisites

1. **Cloudflare Account** — Free at https://dash.cloudflare.com/
2. **Domain** — Must be managed by Cloudflare (or you can migrate it)
3. **cloudflared** — Already downloaded & ready

---

## 🚀 Quick Start (5 Minutes)

### Step 1: Authenticate with Cloudflare

```bash
chmod +x cloudflare-setup.sh
./cloudflare-setup.sh
```

This opens Cloudflare dashboard in your browser. You'll authorize and get redirected back.

**Result:** Creates `~/.cloudflared/freeaitokens-dashboard.json`

### Step 2: Configure Your Domain

Edit `~/.cloudflared/config.yml`:

```yaml
tunnel: freeaitokens-dashboard
credentials-file: /root/.cloudflared/freeaitokens-dashboard.json
protocol: http2

ingress:
  - hostname: freeaitokens.yourdomain.com      # ← Change this
    service: http://localhost:5500
  - hostname: api.freeaitokens.yourdomain.com  # ← Change this
    service: http://localhost:5000
  - service: http_status:404
```

### Step 3: Add DNS Records in Cloudflare

1. Go to https://dash.cloudflare.com/
2. Select your domain
3. Go to **DNS** → **Records**
4. Click **Add record**

Add two CNAME records:

| Type | Name | Target | Proxy |
|------|------|--------|-------|
| CNAME | `freeaitokens` | `freeaitokens-dashboard.cfargotunnel.com` | Proxied |
| CNAME | `api.freeaitokens` | `freeaitokens-dashboard.cfargotunnel.com` | Proxied |

### Step 4: Start the Tunnel

```bash
chmod +x start-tunnel.sh
./start-tunnel.sh
```

Or start everything at once:

```bash
chmod +x start-all.sh
./start-all.sh
```

### Step 5: Access Your Dashboard

**Public URL:** `https://freeaitokens.yourdomain.com`  
**API URL:** `https://api.freeaitokens.yourdomain.com/v1`

---

## 🔧 Advanced Configuration

### Multiple Services

Edit `~/.cloudflared/config.yml` to route different paths:

```yaml
ingress:
  - hostname: freeaitokens.yourdomain.com
    path: /api/*
    service: http://localhost:5000
  - hostname: freeaitokens.yourdomain.com
    path: /
    service: http://localhost:5500
  - service: http_status:404
```

### Custom Rules

```yaml
ingress:
  # Only allow specific IPs
  - hostname: freeaitokens.yourdomain.com
    service: http://localhost:5500
    originRequest:
      access:
        required: true
  
  # Add headers
  - hostname: api.freeaitokens.yourdomain.com
    service: http://localhost:5000
    originRequest:
      headers:
        add:
          X-Custom-Header: "FreeAITokens"
```

---

## 🛡️ Security Best Practices

### Enable Authentication

Create `~/.warp/config/warp-identity.json`:

```json
{
  "aud": ["login.example.com"],
  "sub": "your-email@example.com"
}
```

Then in `config.yml`:

```yaml
originRequest:
  access:
    audTag: "login.example.com"
    required: true
```

### Rate Limiting

```yaml
originRequest:
  http2Origin: true
  http:
    maxIdleConnections: 256
    keepAliveTimeout: 120
```

### CORS Headers

```yaml
originRequest:
  headers:
    add:
      Access-Control-Allow-Origin: "*"
      Access-Control-Allow-Methods: "GET, POST, PUT, DELETE, OPTIONS"
```

---

## 📊 Monitoring & Logs

### View Tunnel Status

```bash
/tmp/cloudflared tunnel info freeaitokens-dashboard
```

### Check Active Connections

```bash
/tmp/cloudflared tunnel route ip
```

### Enable Debug Logging

```bash
/tmp/cloudflared --loglevel debug tunnel run freeaitokens-dashboard
```

### Cloudflare Analytics

1. Go to https://dash.cloudflare.com/
2. Select your domain
3. Navigate to **Analytics & Logs** → **Analytics**
4. View tunnel traffic, errors, and latency

---

## 🐛 Troubleshooting

### "Tunnel not found"
```bash
# List all tunnels
/tmp/cloudflared tunnel list

# If missing, create it again
/tmp/cloudflared tunnel create freeaitokens-dashboard
```

### "DNS CNAME not resolving"
- Wait 5-10 minutes for DNS propagation
- Verify CNAME in Cloudflare dashboard
- Clear your browser cache

### "Connection refused"
- Ensure FreeAITokens server is running on `localhost:5000`
- Ensure Dashboard is running on `localhost:5500`
- Check firewall isn't blocking local ports

### "Certificate errors"
- Cloudflare handles SSL automatically
- Try clearing browser cache
- Try incognito/private window

### Slow Responses
```bash
# Increase tunneling performance
/tmp/cloudflared tunnel run freeaitokens-dashboard --protocol http2
```

---

## 🔄 Restart Services

### Stop Tunnel
```bash
pkill -f cloudflared
```

### Stop All Services
```bash
pkill -f "cloudflared|npm run"
```

### Restart Everything
```bash
./start-all.sh
```

---

## 📈 Performance Tips

1. **Use Cloudflare Edge Caching**
   - Enable in Cloudflare dashboard under Caching

2. **Optimize Workers**
   - Create Cloudflare Workers for custom logic

3. **Monitor Bandwidth**
   - Check Cloudflare Analytics for optimization opportunities

4. **Load Balancing**
   - Route to multiple local services via tunnel

---

## 💰 Pricing

| Feature | Free | Pro | Business |
|---------|------|-----|----------|
| Tunnel | ✅ | ✅ | ✅ |
| Bandwidth | Unlimited | Unlimited | Unlimited |
| Domains | 1 | Unlimited | Unlimited |
| Support | Community | Priority | Priority |

**You're on the FREE tier. No charges!**

---

## 🔐 Environment Variables

Create `.env` for sensitive data:

```bash
CLOUDFLARE_ZONE_ID=your_zone_id
CLOUDFLARE_API_TOKEN=your_api_token
TUNNEL_DOMAIN=freeaitokens.yourdomain.com
API_DOMAIN=api.freeaitokens.yourdomain.com
```

Then in your scripts:

```bash
source .env
/tmp/cloudflared tunnel run $TUNNEL_DOMAIN
```

---

## 📚 Official Documentation

- **Cloudflare Tunnel Docs:** https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/
- **CLI Reference:** https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/tunnel-guide/
- **Troubleshooting:** https://developers.cloudflare.com/cloudflare-one/troubleshooting/

---

## 🎯 Next Steps

1. ✅ Run `./cloudflare-setup.sh` to authenticate
2. ✅ Update `~/.cloudflared/config.yml` with your domain
3. ✅ Add DNS CNAME records in Cloudflare
4. ✅ Run `./start-all.sh` to start everything
5. ✅ Visit `https://freeaitokens.yourdomain.com`

---

**Your FreeAITokens dashboard is now accessible from anywhere! 🌍**

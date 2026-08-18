# 🎨 FreeAITokens Professional GUI Dashboard

**A sleek, production-ready web interface for FreeAITokens** — featuring real-time chat, model management, server monitoring, and statistics.

![Design](https://img.shields.io/badge/Design-Vercel%20System-0070f3)
![Status](https://img.shields.io/badge/Status-Production%20Ready-10b981)
![React](https://img.shields.io/badge/React-18.2-61dafb)

---

## ✨ Features

✅ **Real-time Chat Interface** — Stream responses from OpenAI-compatible local inference  
✅ **Model Management** — Switch between ChatGPT, Gemini, Google AI Studio  
✅ **Server Monitoring** — Live status, uptime, request counts  
✅ **Vercel Design System** — Professional, minimalist aesthetics  
✅ **Fully Responsive** — Works on desktop, tablet, mobile  
✅ **Dark/Light Ready** — CSS variables for easy theming  
✅ **Production-Ready** — Optimized for deployment  

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd gui
npm install
```

### 2. Start FreeAITokens Server

In a separate terminal (FreeAITokens root):

```bash
npm run start
# Starts API on localhost:5000
```

### 3. Run GUI Development Server

```bash
npm run dev
# Starts on localhost:5500
```

### 4. Open Dashboard

Navigate to: **http://localhost:5500**

---

## 📁 Project Structure

```
freeaitokens-gui/
├── Dashboard.jsx           # Main component
├── Dashboard.css           # All styling
├── main.jsx               # Entry point
├── index.html             # HTML template
├── vite.config.js         # Vite configuration
├── package.json           # Dependencies
└── README.md              # This file
```

---

## 🎯 Features Breakdown

### **Chat Tab**
- Stream responses in real-time
- Select from available models
- Message history
- Markdown support
- Connection status

### **Models Tab**
- View all available models
- Status indicators (Active/Planned)
- Quick-switch model selection
- Model metadata

### **Settings Tab**
- Server configuration
- Browser settings
- API endpoint info
- Timeout configuration

### **Stats Tab**
- Request counter
- Server uptime
- Active models count
- Connection status

---

## 🔌 API Integration

The dashboard communicates with FreeAITokens via:

```
http://localhost:5000/v1/chat/completions
http://localhost:5000/v1/models
```

**Supported Models:**
- `chatgpt-web` — ChatGPT web interface
- `gemini-web` — Google Gemini
- `aistudio-web` — Google AI Studio
- `claude-web` — Claude (planned)

---

## 🎨 Design System

Built with Vercel's design tokens:

```css
--canvas: #ffffff
--canvas-soft: #fafafa
--canvas-soft-2: #f5f5f5
--ink: #171717
--body: #4d4d4d
--mute: #888888
--link: #0070f3
--gradient-start: #007cf0
--gradient-end: #00dfd8
```

All easily customizable via CSS variables.

---

## 📦 Build & Deploy

### Build for Production

```bash
npm run build
# Creates optimized dist/ folder
```

### Deploy to Vercel

```bash
vercel deploy
```

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build
EXPOSE 5500
CMD ["npm", "run", "preview"]
```

---

## 🔧 Configuration

Edit `vite.config.js` to customize:

```javascript
server: {
  port: 5500,           // Dashboard port
  host: '0.0.0.0',      // Bind address
  proxy: {
    '/v1': {
      target: 'http://localhost:5000'  // API server
    }
  }
}
```

---

## 🌟 Advanced Features

### Real-time Streaming
```javascript
// Supports streaming responses
const response = await fetch('http://localhost:5000/v1/chat/completions', {
  method: 'POST',
  body: JSON.stringify({
    stream: true,  // Enable streaming
    messages: [...],
    model: 'chatgpt-web'
  })
});
```

### Custom Themes
Modify CSS variables in `Dashboard.css`:

```css
:root {
  --link: #your-color;
  --canvas: #your-color;
  /* ... */
}
```

### Error Handling
Built-in error display with user-friendly messages:

```
❌ Error: API Error
```

---

## 🐛 Troubleshooting

### "Cannot connect to server"
- Ensure FreeAITokens is running on `localhost:5000`
- Check server status with: `curl http://localhost:5000/v1/models`

### "Models not loading"
- Verify Chrome/Chromium is installed
- Check browser profiles in `.playwright/chrome-cdp-profile`

### "Slow responses"
- Increase `DEFAULT_TIMEOUT_MS` in FreeAITokens config
- Check browser resource usage

---

## 📊 Stats Tracking

The dashboard tracks:
- ✅ Total API requests
- ✅ Server uptime
- ✅ Active model count
- ✅ Connection status (online/offline/connecting)

---

## 🔐 Security Considerations

- API runs on `localhost:5000` (local only)
- No credentials stored in browser
- CORS enabled for local development
- For production: use authentication middleware

---

## 🎓 Example Use Cases

### 1. Local AI Development
```bash
# Terminal 1: Start FreeAITokens
npm run start

# Terminal 2: Start Dashboard
npm run dev

# Then chat with local AI via web UI
```

### 2. Compare Models
- Switch between ChatGPT, Gemini, AI Studio
- Test same prompt across models
- Analyze response quality

### 3. Monitor Server
- Watch real-time request count
- Monitor uptime
- Check model availability

---

## 📝 License

ISC — Same as FreeAITokens

---

## 🤝 Contributing

Found a bug? Have a feature idea?

1. Fork the repo
2. Create your feature branch
3. Submit a PR

---

## 📞 Support

- **Issues:** GitHub Issues
- **Discussions:** GitHub Discussions
- **Docs:** See README in FreeAITokens root

---

**Built with ❤️ for local AI development.**

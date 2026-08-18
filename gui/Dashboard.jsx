import React, { useState, useEffect, useRef } from 'react';
import './Dashboard.css';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('chat');
  const [selectedModel, setSelectedModel] = useState('chatgpt-web');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [serverStatus, setServerStatus] = useState('connecting');
  const [stats, setStats] = useState({ requests: 0, uptime: '0s', models: [] });
  const messagesEndRef = useRef(null);
  
  const models = [
    { id: 'chatgpt-web', name: 'ChatGPT', status: 'active' },
    { id: 'gemini-web', name: 'Gemini', status: 'active' },
    { id: 'aistudio-web', name: 'Google AI Studio', status: 'active' },
    { id: 'claude-web', name: 'Claude (Coming Soon)', status: 'planned' },
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    checkServerStatus();
    const interval = setInterval(checkServerStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const checkServerStatus = async () => {
    try {
      const response = await fetch('http://localhost:5000/v1/models');
      if (response.ok) {
        setServerStatus('online');
        const data = await response.json();
        setStats(prev => ({
          ...prev,
          models: data.data || []
        }));
      }
    } catch (error) {
      setServerStatus('offline');
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: selectedModel,
          messages: [...messages, userMessage],
          stream: true
        })
      });

      if (!response.ok) throw new Error('API Error');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = { role: 'assistant', content: '' };
      setMessages(prev => [...prev, assistantMessage]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(l => l.trim());
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const json = JSON.parse(line.slice(6));
              const content = json.choices?.[0]?.delta?.content || '';
              assistantMessage.content += content;
              setMessages(prev => [...prev.slice(0, -1), { ...assistantMessage }]);
            } catch (e) {}
          }
        }
      }
      
      setStats(prev => ({ ...prev, requests: prev.requests + 1 }));
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `❌ Error: ${error.message}`
      }]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'online': return '#10b981';
      case 'offline': return '#ef4444';
      case 'connecting': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="header">
        <div className="logo">⚡ FreeAITokens</div>
        <div className="status-badge" style={{ borderColor: getStatusColor(serverStatus) }}>
          <span className="status-dot" style={{ backgroundColor: getStatusColor(serverStatus) }}></span>
          {serverStatus.charAt(0).toUpperCase() + serverStatus.slice(1)}
        </div>
      </div>

      {/* Main Content */}
      <div className="container">
        {/* Sidebar */}
        <div className="sidebar">
          <div className="nav-section">
            <h3>Navigation</h3>
            <button 
              className={`nav-item ${activeTab === 'chat' ? 'active' : ''}`}
              onClick={() => setActiveTab('chat')}
            >
              💬 Chat
            </button>
            <button 
              className={`nav-item ${activeTab === 'models' ? 'active' : ''}`}
              onClick={() => setActiveTab('models')}
            >
              🤖 Models
            </button>
            <button 
              className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              ⚙️ Settings
            </button>
            <button 
              className={`nav-item ${activeTab === 'stats' ? 'active' : ''}`}
              onClick={() => setActiveTab('stats')}
            >
              📊 Stats
            </button>
          </div>

          <div className="nav-section">
            <h3>Quick Stats</h3>
            <div className="stat-card">
              <div className="stat-label">Requests</div>
              <div className="stat-value">{stats.requests}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Uptime</div>
              <div className="stat-value">{stats.uptime}</div>
            </div>
          </div>
        </div>

        {/* Main Panel */}
        <div className="main-panel">
          {/* Chat Tab */}
          {activeTab === 'chat' && (
            <div className="tab-content chat-tab">
              <div className="chat-header">
                <h2>AI Chat Interface</h2>
                <select 
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="model-selector"
                >
                  {models.map(model => (
                    <option key={model.id} value={model.id} disabled={model.status === 'planned'}>
                      {model.name} {model.status === 'planned' ? '(Coming Soon)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="messages-container">
                {messages.length === 0 && (
                  <div className="empty-state">
                    <div className="empty-icon">💭</div>
                    <p>Start a conversation with your local AI model</p>
                  </div>
                )}
                {messages.map((msg, idx) => (
                  <div key={idx} className={`message ${msg.role}`}>
                    <div className="message-avatar">
                      {msg.role === 'user' ? '👤' : '🤖'}
                    </div>
                    <div className="message-content">
                      {msg.content}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="message assistant">
                    <div className="message-avatar">🤖</div>
                    <div className="typing-indicator">
                      <span></span><span></span><span></span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="input-area">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !loading && sendMessage()}
                  placeholder="Type your message..."
                  disabled={loading || serverStatus !== 'online'}
                  className="message-input"
                />
                <button 
                  onClick={sendMessage}
                  disabled={loading || !input.trim() || serverStatus !== 'online'}
                  className="send-button"
                >
                  {loading ? '⏳' : '📤'}
                </button>
              </div>
            </div>
          )}

          {/* Models Tab */}
          {activeTab === 'models' && (
            <div className="tab-content models-tab">
              <h2>Available Models</h2>
              <div className="models-grid">
                {models.map(model => (
                  <div key={model.id} className={`model-card ${model.status}`}>
                    <div className="model-header">
                      <h3>{model.name}</h3>
                      <span className={`status-badge-small ${model.status}`}>
                        {model.status === 'active' ? '🟢 Active' : '⚪ Planned'}
                      </span>
                    </div>
                    <p>{model.id}</p>
                    <button 
                      className="use-model-btn"
                      onClick={() => {
                        setSelectedModel(model.id);
                        setActiveTab('chat');
                      }}
                      disabled={model.status === 'planned'}
                    >
                      Use Model
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="tab-content settings-tab">
              <h2>Configuration</h2>
              <div className="settings-group">
                <h3>Server Settings</h3>
                <div className="setting-item">
                  <label>Server Host</label>
                  <input type="text" value="localhost:5000" readOnly />
                </div>
                <div className="setting-item">
                  <label>API Endpoint</label>
                  <input type="text" value="/v1/chat/completions" readOnly />
                </div>
              </div>
              <div className="settings-group">
                <h3>Browser Settings</h3>
                <div className="setting-item">
                  <label>Headless Mode</label>
                  <select defaultValue="true">
                    <option value="true">Enabled</option>
                    <option value="false">Disabled</option>
                  </select>
                </div>
                <div className="setting-item">
                  <label>Request Timeout (ms)</label>
                  <input type="number" defaultValue="300000" />
                </div>
              </div>
            </div>
          )}

          {/* Stats Tab */}
          {activeTab === 'stats' && (
            <div className="tab-content stats-tab">
              <h2>Statistics & Analytics</h2>
              <div className="stats-grid">
                <div className="stat-card-large">
                  <div className="stat-title">Total Requests</div>
                  <div className="stat-big-value">{stats.requests}</div>
                </div>
                <div className="stat-card-large">
                  <div className="stat-title">Server Uptime</div>
                  <div className="stat-big-value">{stats.uptime}</div>
                </div>
                <div className="stat-card-large">
                  <div className="stat-title">Active Models</div>
                  <div className="stat-big-value">{models.filter(m => m.status === 'active').length}</div>
                </div>
                <div className="stat-card-large">
                  <div className="stat-title">Server Status</div>
                  <div className="stat-big-value" style={{ color: getStatusColor(serverStatus) }}>
                    {serverStatus.toUpperCase()}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

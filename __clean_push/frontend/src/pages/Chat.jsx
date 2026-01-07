import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import chatService from '../services/chat.service';
import './Chat.css';
import ChatStats from '../components/ui/ChatStats';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

export default function Chat() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showNewChat, setShowNewChat] = useState(false);
  const [newChatForm, setNewChatForm] = useState({
    subject: '',
    category: 'general',
    message: ''
  });
  const [respondingChart, setRespondingChart] = useState(null);
  const [chartResponseText, setChartResponseText] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadChats();
  }, [user, navigate]);

  const loadChats = async () => {
    try {
      setLoading(true);
      const data = await chatService.getUserChats();
      setChats(data.chats);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load chats');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateChat = async (e) => {
    e.preventDefault();
    if (!newChatForm.subject.trim() || !newChatForm.message.trim()) {
      setError('Subject and message are required');
      return;
    }

    try {
      const chat = await chatService.createChat(
        newChatForm.subject,
        newChatForm.category,
        newChatForm.message
      );
      setChats([chat, ...chats]);
      setSelectedChat(chat);
      setNewChatForm({ subject: '', category: 'general', message: '' });
      setShowNewChat(false);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to create chat');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;

    try {
      const updatedChat = await chatService.addMessage(selectedChat._id, newMessage);
      setSelectedChat(updatedChat);
      // Update in chats list
      setChats(chats.map(c => c._id === updatedChat._id ? updatedChat : c));
      setNewMessage('');
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to send message');
    }
  };

  if (loading) {
    return (
      <div className="chat-page">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading chats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-page">
      <div className="chat-container">
        {/* Sidebar: Chat List */}
        <div className="chat-sidebar">
          <div className="sidebar-header">
            <h2>💬 Support Chat</h2>
            <button 
              className="btn-new-chat"
              onClick={() => setShowNewChat(!showNewChat)}
            >
              ➕ New
            </button>
          </div>

          {/* Chat statistics chart */}
          <ChatStats chats={chats} />

          {error && <div className="error-message">{error}</div>}

          {showNewChat && (
            <form onSubmit={handleCreateChat} className="new-chat-form">
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Subject"
                  value={newChatForm.subject}
                  onChange={(e) => setNewChatForm({ ...newChatForm, subject: e.target.value })}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <select
                  value={newChatForm.category}
                  onChange={(e) => setNewChatForm({ ...newChatForm, category: e.target.value })}
                  className="form-select"
                >
                  <option value="general">General Inquiry</option>
                  <option value="order">Order Related</option>
                  <option value="product">Product Question</option>
                  <option value="shipping">Shipping</option>
                  <option value="return">Return/Exchange</option>
                  <option value="payment">Payment Issue</option>
                  <option value="complaint">Complaint</option>
                </select>
              </div>
              <div className="form-group">
                <textarea
                  placeholder="Your message..."
                  value={newChatForm.message}
                  onChange={(e) => setNewChatForm({ ...newChatForm, message: e.target.value })}
                  className="form-textarea"
                  rows="3"
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-primary">Send</button>
                <button type="button" className="btn-secondary" onClick={() => setShowNewChat(false)}>Cancel</button>
              </div>
            </form>
          )}

          <div className="chats-list">
            {chats.length === 0 ? (
              <p className="no-chats">No conversations yet</p>
            ) : (
              chats.map(chat => (
                <div
                  key={chat._id}
                  className={`chat-item ${selectedChat?._id === chat._id ? 'active' : ''}`}
                  onClick={() => setSelectedChat(chat)}
                >
                  <div className="chat-item-header">
                    <h4>{chat.subject}</h4>
                    <span className={`status-badge ${chat.status}`}>{chat.status}</span>
                  </div>
                  <p className="chat-item-preview">
                    {chat.messages[chat.messages.length - 1]?.content.substring(0, 40)}...
                  </p>
                  <small className="chat-item-time">
                    {new Date(chat.lastMessage).toLocaleDateString()}
                  </small>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Main: Chat View */}
        <div className="chat-main">
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="chat-header">
                <div className="chat-header-info">
                  <h2>{selectedChat.subject}</h2>
                  <div className="chat-meta">
                    <span className={`badge ${selectedChat.status}`}>{selectedChat.status}</span>
                    <span className={`priority ${selectedChat.priority}`}>Priority: {selectedChat.priority}</span>
                    {selectedChat.assignedAgent && (
                      <span className="agent">Agent: {selectedChat.assignedAgent?.name || 'Assigned'}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Messages */}
              {/* Charts (auto-generated) */}
              {selectedChat.charts && selectedChat.charts.length > 0 && (
                <div className="chat-charts">
                  {selectedChat.charts.map((ch, i) => (
                    <div key={i} className="chat-chart-card">
                      <h4>{ch.title}</h4>
                      {user && (user.role === 'admin' || user.role === 'agent') && (
                        <div className="chart-actions">
                          <button className="btn-sm" onClick={() => { setRespondingChart(i); setChartResponseText(''); }}>Annotate/Respond</button>
                        </div>
                      )}
                      {ch.type === 'line' && (
                        <ResponsiveContainer width="100%" height={200}>
                          <LineChart data={ch.data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="sales" stroke="#8884d8" strokeWidth={2} />
                            <Line type="monotone" dataKey="orders" stroke="#82ca9d" strokeWidth={2} />
                          </LineChart>
                        </ResponsiveContainer>
                      )}
                      {/* existing responses for this chart */}
                      {ch.responses && ch.responses.length > 0 && (
                        <div className="chart-responses">
                          {ch.responses.map((r, ri) => (
                            <div key={ri} className="chart-response">
                              <strong>{r.sender}:</strong> {r.content}
                              <div className="response-time">{new Date(r.createdAt).toLocaleString()}</div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* annotation form shown when admin is responding to this chart */}
                      {respondingChart === i && (
                        <form className="chart-respond-form" onSubmit={async (e) => {
                          e.preventDefault();
                          try {
                            const updated = await chatService.respondToChart(selectedChat._id, i, chartResponseText);
                            setSelectedChat(updated);
                            setChartResponseText('');
                            setRespondingChart(null);
                            // update list in sidebar
                            setChats(chats.map(c => c._id === updated._id ? updated : c));
                          } catch (err) {
                            setError(err.message || 'Failed to send chart response');
                          }
                        }}>
                          <textarea value={chartResponseText} onChange={(e) => setChartResponseText(e.target.value)} placeholder="Write annotation or reply to this chart..." rows={3} />
                          <div className="form-actions">
                            <button type="submit" className="btn-primary">Send Response</button>
                            <button type="button" className="btn-secondary" onClick={() => { setRespondingChart(null); setChartResponseText(''); }}>Cancel</button>
                          </div>
                        </form>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Messages */}
              <div className="chat-messages">
                {selectedChat.messages.map((msg, idx) => (
                  <div key={idx} className={`message ${msg.sender}`}>
                    <div className="message-content">
                      <p>{msg.content}</p>
                      <small className="message-time">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </small>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              {selectedChat.status !== 'closed' && (
                <form onSubmit={handleSendMessage} className="chat-input-form">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="chat-input"
                    rows="2"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                  />
                  <button type="submit" className="btn-send">Send 📤</button>
                </form>
              )}
              {selectedChat.status === 'closed' && (
                <div className="closed-message">This conversation is closed</div>
              )}
            </>
          ) : (
            <div className="chat-empty">
              <div className="empty-icon">💬</div>
              <h2>Select a conversation or start a new one</h2>
              <p>Click "New" to create your first inquiry or select from the list</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

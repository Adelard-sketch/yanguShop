import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import './AgentOnboard.css';
import { createAgent } from '../services/admin.service';

export default function AgentOnboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    whatsapp: '',
  });

  // Check admin access
  React.useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
  }, [user, navigate]);

  const generatePromoCode = (name) => {
    const initials = name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
    const randomNum = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `AGENT-${initials}-${randomNum}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.name || !formData.email || !formData.phone) {
      setError('Name, email, and phone are required');
      return;
    }

    try {
      setLoading(true);
      const promoCode = generatePromoCode(formData.name);
      
      const agentData = {
        ...formData,
        promoCode,
        role: 'agent'
      };
      
      await createAgent(agentData);
      setSuccess(`Agent created! Promo code: ${promoCode}`);
      
      setTimeout(() => {
        navigate('/admin/agents');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create agent');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="agent-onboard">
      <div className="onboard-header">
        <h1>Create New Agent</h1>
        <p>Add a new agent to help customers buy items on the platform</p>
      </div>

      <div className="onboard-container">
        <form onSubmit={handleSubmit} className="onboard-form simple">
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <div className="form-group">
            <label htmlFor="name">Agent Name *</label>
            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address *</label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="john@example.com"
              required
            />
          </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number *</label>
              <input
                id="phone"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+256 7XX XXX XXX"
                required
              />
            </div>

          <div className="form-group">
            <label htmlFor="address">Address</label>
            <input
              id="address"
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Street address, city, region"
            />
          </div>

            <div className="form-group">
              <label htmlFor="whatsapp">WhatsApp Number</label>
              <input
                id="whatsapp"
                type="tel"
                name="whatsapp"
                value={formData.whatsapp}
                onChange={handleChange}
                placeholder="+256 7XX XXX XXX or same as phone"
              />
            </div>

          <div className="info-box">
            <p>✓ Agent will receive a unique promo code automatically</p>
            <p>✓ Customers using the code get 20% discount on first purchase</p>
            <p>✓ Agent can log in and track their earnings</p>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/admin/agents')}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Agent'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

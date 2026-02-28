import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import './AgentDashboard.css';

export default function AgentDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [agentData, setAgentData] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    promoCode: 'AGENT-JD-2024',
    phone: '024 123 4567',
    businessName: 'John\'s Shoe Store',
    status: 'active',
    joinDate: new Date('2024-01-15'),
    totalReferrals: 24,
    totalEarnings: 1850.50,
    pendingEarnings: 450.75,
    commissionRate: 10, // percentage
  });

  const [referrals, setReferrals] = useState([
    {
      _id: '1',
      customerName: 'Ama Asante',
      customerEmail: 'ama@example.com',
      orderAmount: 299.99,
      commission: 30.00,
      status: 'paid',
      date: new Date('2024-01-10'),
    },
    {
      _id: '2',
      customerName: 'Kofi Mensah',
      customerEmail: 'kofi@example.com',
      orderAmount: 899.98,
      commission: 90.00,
      status: 'paid',
      date: new Date('2024-01-12'),
    },
    {
      _id: '3',
      customerName: 'Yaa Owusu',
      customerEmail: 'yaa@example.com',
      orderAmount: 189.99,
      commission: 19.00,
      status: 'pending',
      date: new Date('2024-01-15'),
    },
    {
      _id: '4',
      customerName: 'Kwame Boateng',
      customerEmail: 'kwame@example.com',
      orderAmount: 549.99,
      commission: 55.00,
      status: 'pending',
      date: new Date('2024-01-16'),
    },
    {
      _id: '5',
      customerName: 'Abena Appiah',
      customerEmail: 'abena@example.com',
      orderAmount: 425.96,
      commission: 42.60,
      status: 'paid',
      date: new Date('2024-01-18'),
    },
  ]);

  const [copiedCode, setCopiedCode] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if user is agent
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role === 'admin') {
      navigate('/admin/dashboard');
      return;
    }
    // Simulate loading agent data
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, [user, navigate]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(agentData.promoCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  if (loading) {
    return <div className="agent-dashboard loading">Loading your dashboard...</div>;
  }

  const paidCommissions = referrals
    .filter(r => r.status === 'paid')
    .reduce((sum, r) => sum + r.commission, 0);
  const pendingCommissions = referrals
    .filter(r => r.status === 'pending')
    .reduce((sum, r) => sum + r.commission, 0);

  return (
    <div className="agent-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Agent Dashboard</h1>
          <p>Manage your referrals and track your earnings</p>
        </div>
        <div className="header-profile">
          <div className="profile-badge">AG</div>
          <div className="profile-info">
            <p className="profile-name">{agentData.name}</p>
            <p className="profile-status">Active Agent</p>
          </div>
        </div>
      </div>

      {/* Promo Code Section */}
      <div className="promo-section">
        <div className="promo-box">
          <h2>Your Unique Promo Code</h2>
          <p className="promo-description">Share this code with customers to earn commissions on their purchases</p>
          
          <div className="promo-code-display">
            <div className="code-value">{agentData.promoCode}</div>
            <button 
              className={`btn-copy ${copiedCode ? 'copied' : ''}`}
              onClick={handleCopyCode}
              title="Copy promo code"
            >
              {copiedCode ? '✓ Copied!' : '📋 Copy Code'}
            </button>
          </div>

          <div className="promo-details">
            <div className="detail">
              <span className="label">Commission Rate:</span>
              <span className="value">{agentData.commissionRate}% per sale</span>
            </div>
            <div className="detail">
              <span className="label">Business:</span>
              <span className="value">{agentData.businessName}</span>
            </div>
            <div className="detail">
              <span className="label">Member Since:</span>
              <span className="value">{agentData.joinDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </div>
          </div>

          <div className="share-methods">
            <h3>Share Your Code</h3>
            <div className="share-buttons">
              <a href={`whatsapp://send?text=Use my promo code ${agentData.promoCode} on YanguShop to get a discount!`} className="share-btn whatsapp" title="Share on WhatsApp">
                <span>💬</span>
              </a>
              <a href={`sms:?body=Use my promo code ${agentData.promoCode} on YanguShop to get a discount!`} className="share-btn sms" title="Share via SMS">
                <span>📱</span>
              </a>
              <button className="share-btn email" title="Share via Email" onClick={() => alert(`Share this code: ${agentData.promoCode}`)}>
                <span>📧</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>Total Referrals</h3>
            <p className="stat-value">{agentData.totalReferrals}</p>
            <span className="stat-subtext">customers referred</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>Total Earnings</h3>
            <p className="stat-value">UGX {paidCommissions.toFixed(2)}</p>
            <span className="stat-subtext">paid commissions</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>Pending Earnings</h3>
            <p className="stat-value">UGX {pendingCommissions.toFixed(2)}</p>
            <span className="stat-subtext">waiting payout</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <h3>Avg Commission</h3>
            <p className="stat-value">UGX {(agentData.totalReferrals > 0 ? agentData.totalEarnings / agentData.totalReferrals : 0).toFixed(2)}</p>
            <span className="stat-subtext">per referral</span>
          </div>
        </div>
      </div>

      {/* Referrals Table */}
      <div className="referrals-section">
        <div className="section-header">
          <h2>Your Referral Sales</h2>
          <p>Track customers who used your promo code</p>
        </div>

        {referrals.length > 0 ? (
          <div className="referrals-table-container">
            <table className="referrals-table">
              <thead>
                <tr>
                  <th>Customer Name</th>
                  <th>Email</th>
                  <th>Order Amount</th>
                  <th>Commission</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {referrals.map((referral) => (
                  <tr key={referral._id} className={`referral-row ${referral.status}`}>
                    <td className="customer-name">{referral.customerName}</td>
                    <td className="customer-email">{referral.customerEmail}</td>
                    <td className="amount">UGX {referral.orderAmount.toFixed(2)}</td>
                    <td className="commission">
                      <span className="commission-badge">UGX {referral.commission.toFixed(2)}</span>
                    </td>
                    <td className="status">
                      <span className={`status-badge ${referral.status}`}>
                        {referral.status === 'paid' ? '✓ Paid' : '⏳ Pending'}
                      </span>
                    </td>
                    <td className="date">
                      {new Date(referral.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric'
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="empty-state">No referrals yet. Start sharing your code to earn commissions!</p>
        )}
      </div>

      {/* How It Works */}
      <div className="how-it-works">
        <h2>How It Works</h2>
        <div className="steps-grid">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Share Your Code</h3>
            <p>Share your unique promo code with customers via WhatsApp, SMS, or email</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Customer Uses Code</h3>
            <p>Customers enter your code at checkout to get a discount</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Earn Commission</h3>
            <p>You earn {agentData.commissionRate}% commission on the order amount</p>
          </div>
          <div className="step">
            <div className="step-number">4</div>
            <h3>Get Paid</h3>
            <p>Commissions are verified and paid to your account monthly</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        <a href="/shop" className="btn btn-primary">
          🛍️ Browse Products
        </a>
        <a href="/dashboard" className="btn btn-secondary">
          📋 My Orders
        </a>
      </div>
    </div>
  );
}

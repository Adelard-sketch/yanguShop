import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import './AdminDashboard.css';
import { getOrderStats, getAllOrders, getAgents } from '../services/admin.service';
import OrdersTrend from '../components/ui/OrdersTrend';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    totalRevenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [pendingAgents, setPendingAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeAction, setActiveAction] = useState('');
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      setErrorMsg(null);
      const [statsRes, ordersRes, agentsRes] = await Promise.all([
        getOrderStats(),
        getAllOrders({ limit: 5 }),
        getAgents({ status: 'pending', limit: 5 }),
      ]);

      setStats(statsRes || {});
      setRecentOrders(Array.isArray(ordersRes) ? ordersRes : ordersRes?.data || []);
      setPendingAgents(Array.isArray(agentsRes) ? agentsRes : agentsRes?.data || []);
    } catch (err) {
      console.error('Error fetching dashboard data', err);
      setErrorMsg(err?.response?.data?.message || err.message || 'Failed to load dashboard data.');
      setStats({});
      setRecentOrders([]);
      setPendingAgents([]);
    } finally {
      setLoading(false);
    }
  };

  const [actionLoading, setActionLoading] = useState(null);

  const handleApprove = async (agent) => {
    try {
      const promoInput = window.prompt('Enter a promo code to assign (leave blank to auto-generate):');
      const payload = {};
      if (promoInput && promoInput.trim()) {
        payload.promo = { code: promoInput.trim() };
      }
      setActionLoading(agent._id);
      await (await import('../services/admin.service')).approveAgent(agent._id, payload);
      // optimistic update: remove agent from pending list
      setPendingAgents(prev => prev.filter(a => a._id !== agent._id));
      setErrorMsg(null);
      // After approval, go to promo assignment for this agent
      navigate(`/admin/promo?assignAgent=${agent._id}`);
    } catch (err) {
      console.error('Failed to approve agent', err);
      setErrorMsg(err?.response?.data?.message || err.message || 'Failed to approve agent');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (agent) => {
    try {
      const reason = window.prompt('Provide a reason for rejecting this application (required):');
      if (!reason || !reason.trim()) return alert('Rejection reason is required');
      setActionLoading(agent._id);
      await (await import('../services/admin.service')).rejectAgent(agent._id, reason.trim());
      setPendingAgents(prev => prev.filter(a => a._id !== agent._id));
      setErrorMsg(null);
    } catch (err) {
      console.error('Failed to reject agent', err);
      setErrorMsg(err?.response?.data?.message || err.message || 'Failed to reject agent');
    } finally {
      setActionLoading(null);
    }
  };

  const renderOrdersPanel = () => (
    <div className="dashboard-section">
      <div className="section-header">
        <h2>Recent Orders</h2>
        <Link to="/admin/orders" className="view-all">View All →</Link>
      </div>

      {errorMsg ? <p className="error-msg">{errorMsg}</p> : null}

      {recentOrders && recentOrders.length > 0 ? (
        <div className="orders-table">
          <table>
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order._id} className="order-row">
                  <td className="order-id">#{order._id?.slice(-6)}</td>
                  <td className="customer-name">{order.user?.name || 'N/A'}</td>
                  <td className="items-count">{order.items?.length || 0} item(s)</td>
                  <td className="amount">UGX {(order.total || 0).toFixed(2)}</td>
                  <td className="status">
                    <span className={`status-badge ${order.status}`}>{order.status}</span>
                  </td>
                  <td className="date">
                    {order.createdAt ? new Date(order.createdAt).toLocaleString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="empty-state">No orders yet</p>
      )}

      {/* Orders trend shown only inside Orders panel */}
      <div style={{marginTop: 16}}>
        <OrdersTrend stats={stats} />
      </div>
    </div>
  );

  const renderAgentsPanel = () => (
    <div className="dashboard-section">
      <div className="section-header">
        <h2>Pending Agent Applications</h2>
        <Link to="/admin/agents" className="view-all">View All →</Link>
      </div>

      {pendingAgents.length > 0 ? (
        <div className="agents-list">
          {pendingAgents.map((agent) => (
            <div key={agent._id} className="agent-item">
              <div className="agent-info">
                <p className="agent-name">{agent.name}</p>
                <p className="agent-email">{agent.email}</p>
                <p className="agent-phone">{agent.phone}</p>
              </div>
              <div className="agent-action">
                <Link to={`/admin/agents`} className="btn-view">Review</Link>
                <button className="btn-approve" onClick={() => navigate(`/admin/agents?reviewAgent=${agent._id}`)}>Review & Decide</button>
                <button className="btn-reject" onClick={() => navigate(`/admin/agents?reviewAgent=${agent._id}`)}>Review & Decide</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="empty-state">No pending applications</p>
      )}
    </div>
  );

  const renderPromoPanel = () => (
    <div className="dashboard-section">
      <div className="section-header">
        <h2>Assign Promo Code</h2>
        <Link to="/admin/promo" className="view-all">Open Promo Manager →</Link>
      </div>

      <div style={{padding: '8px 0'}}>
        <p className="empty-state">Select an agent from the list below to assign a promo code.</p>
        {pendingAgents.length > 0 && (
          <div className="agents-list">
            {pendingAgents.map((agent) => (
              <div key={agent._id} className="agent-item">
                <div className="agent-info">
                  <p className="agent-name">{agent.name}</p>
                  <p className="agent-email">{agent.email}</p>
                </div>
                <div className="agent-action">
                  <Link to={`/admin/agents/${agent._id}`} className="btn-view">Assign Code</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderPaymentsPanel = () => (
    <div className="dashboard-section">
      <div className="section-header">
        <h2>Payments</h2>
        <Link to="/admin/payments" className="view-all">View Payments →</Link>
      </div>
      <div style={{padding: '12px 0'}}>
        <p className="empty-state">Total revenue: UGX {(stats.totalRevenue || 0).toFixed(2)}</p>
        <p style={{marginTop:8}}>Pending orders: <strong>{stats.pendingOrders}</strong></p>
      </div>
    </div>
  );

  const renderReportsPanel = () => (
    <div className="dashboard-section">
      <div className="section-header">
        <h2>Reports</h2>
        <Link to="/admin/reports" className="view-all">Open Reports →</Link>
      </div>
      <div style={{padding: '12px 0'}}>
        <p className="empty-state">Generate sales, revenue and agent performance reports from the Reports page.</p>
      </div>
    </div>
  );

  if (loading) {
    return <div className="admin-dashboard loading">Loading dashboard...</div>;
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p className="subtitle">Manage orders, agents, and platform analytics</p>
      </div>

      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="actions-grid">
          <button type="button" aria-pressed={activeAction === 'orders'} className={`action-btn ${activeAction === 'orders' ? 'active' : ''}`} onClick={() => setActiveAction(activeAction === 'orders' ? '' : 'orders')}>
            <span className="action-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 7h18M3 12h18M3 17h18" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            <span className="action-text">View Orders</span>
          </button>

          <button type="button" aria-pressed={activeAction === 'agents'} className={`action-btn ${activeAction === 'agents' ? 'active' : ''}`} onClick={() => setActiveAction(activeAction === 'agents' ? '' : 'agents')}>
            <span className="action-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 11c1.657 0 3-1.567 3-3.5S17.657 4 16 4s-3 1.567-3 3.5S14.343 11 16 11zM8 11c1.657 0 3-1.567 3-3.5S9.657 4 8 4 5 5.567 5 7.5 6.343 11 8 11z" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 20a6 6 0 0 1 12 0" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            <span className="action-text">Pending Agents</span>
          </button>

          <button type="button" aria-pressed={activeAction === 'promo'} className={`action-btn ${activeAction === 'promo' ? 'active' : ''}`} onClick={() => setActiveAction(activeAction === 'promo' ? '' : 'promo')}>
            <span className="action-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 10V6a2 2 0 0 0-2-2h-4" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3 14v4a2 2 0 0 0 2 2h4" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="12" r="3" stroke="white" strokeWidth="1.4"/>
              </svg>
            </span>
            <span className="action-text">Assign Promo Code</span>
          </button>

          <button type="button" aria-pressed={activeAction === 'payments'} className={`action-btn ${activeAction === 'payments' ? 'active' : ''}`} onClick={() => setActiveAction(activeAction === 'payments' ? '' : 'payments')}>
            <span className="action-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="5" width="20" height="14" rx="2" stroke="white" strokeWidth="1.4"/>
                <path d="M2 10h20" stroke="white" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
            </span>
            <span className="action-text">View Payments</span>
          </button>

          <button type="button" aria-pressed={activeAction === 'reports'} className={`action-btn ${activeAction === 'reports' ? 'active' : ''}`} onClick={() => setActiveAction(activeAction === 'reports' ? '' : 'reports')}>
            <span className="action-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 3v18h18" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 14v-4M12 14v-7M16 14v-2" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            <span className="action-text">View Reports</span>
          </button>

          <button type="button" aria-pressed={activeAction === 'add_product'} className={`action-btn ${activeAction === 'add_product' ? 'active' : ''}`} onClick={() => navigate('/admin/products')}>
            <span className="action-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 5v14M5 12h14" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            <span className="action-text">Add Product</span>
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon total">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 7h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 3v4M8 3v4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="stat-content">
            <h3>Total Orders</h3>
            <p className="stat-value">{stats.totalOrders}</p>
            <p className="stat-subtext">All time</p>
          </div>
          <div className="stat-delta positive">+4.2%</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon pending">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.2"/>
            </svg>
          </div>
          <div className="stat-content">
            <h3>Pending Orders</h3>
            <p className="stat-value">{stats.pendingOrders}</p>
            <p className="stat-subtext">Awaiting processing</p>
          </div>
          <div className="stat-delta neutral">0.0%</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon completed">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="stat-content">
            <h3>Completed Orders</h3>
            <p className="stat-value">{stats.completedOrders}</p>
            <p className="stat-subtext">Delivered</p>
          </div>
          <div className="stat-delta positive">+12.8%</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon revenue">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 1v22" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              <path d="M17 5H7a3 3 0 0 0 0 6h8a3 3 0 0 1 0 6H7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="stat-content">
            <h3>Total Revenue</h3>
            <p className="stat-value">UGX{(stats.totalRevenue || 0).toFixed(2)}</p>
            <p className="stat-subtext">Total amount sold</p>
          </div>
          <div className="stat-delta positive">+6.4%</div>
        </div>
      </div>

      <div className="dashboard-grid">
        {activeAction === 'orders' ? (
          renderOrdersPanel()
        ) : activeAction === 'agents' ? (
          renderAgentsPanel()
        ) : activeAction === 'promo' ? (
          renderPromoPanel()
        ) : activeAction === 'payments' ? (
          renderPaymentsPanel()
        ) : activeAction === 'reports' ? (
          renderReportsPanel()
        ) : (
          <>
            {renderOrdersPanel()}
            {renderAgentsPanel()}
          </>
        )}
      </div>
    </div>
  );

}
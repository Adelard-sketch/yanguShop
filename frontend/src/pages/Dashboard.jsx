import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import orderService from '../services/order.service';
import { Link } from 'react-router-dom';
import './Dashboard.css';

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('newest');
  const [agentStats, setAgentStats] = useState(null);
  const [showCategories, setShowCategories] = useState(false);

  // Redirect agents to agent dashboard or show both views
  useEffect(() => {
    // If user is agent, show agent stats on this dashboard
    if (user && user.role === 'agent') {
      // For now, let agents see both their customer orders AND agent dashboard
      // In real app, would fetch agent stats from backend
      setAgentStats({
        promoCode: 'AGENT-JD-2024',
        totalReferrals: 0,
        totalEarnings: 0,
        pendingEarnings: 0,
      });
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    loadOrders();
  }, [user]);

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'phones', label: 'Phones & Tablets' },
    { value: 'men', label: "Men's Fashion" },
    { value: 'women', label: "Women's Fashion" },
    { value: 'shoes', label: 'Shoes & Sneakers' },
    { value: 'accessories', label: 'Accessories' },
    { value: 'sportswear', label: 'Sportswear' },
    { value: 'bags', label: 'Bags & Luggage' },
    { value: 'electronics', label: 'Electronics' },
  ];

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await orderService.getUserOrders?.() || [];
      if (Array.isArray(data) && data.length > 0) {
        setOrders(data);
      } else {
        // Load sample orders for demo
        setSampleOrders();
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
      // Load sample orders on error for demo
      setSampleOrders();
    } finally {
      setLoading(false);
    }
  };

  const setSampleOrders = () => {
    const sampleData = [
      {
        _id: 'ord-001',
        orderNumber: '#ORD-2026-001',
        items: [
          { name: 'Premium Sneakers', qty: 1, price: 299.99 },
          { name: 'Cotton T-Shirt', qty: 2, price: 45.00 }
        ],
        total: 389.99,
        status: 'delivered',
        paymentMethod: 'card',
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        shippingAddress: { name: user?.name || 'You', address: '123 Main Street, Accra' }
      },
      {
        _id: 'ord-002',
        orderNumber: '#ORD-2026-002',
        items: [
          { name: 'Vintage Watch', qty: 1, price: 199.99 }
        ],
        total: 199.99,
        status: 'shipped',
        paymentMethod: 'mobile_money',
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        shippingAddress: { name: user?.name || 'You', address: '456 Oak Avenue, Kumasi' }
      },
      {
        _id: 'ord-003',
        orderNumber: '#ORD-2026-003',
        items: [
          { name: 'Designer Jacket', qty: 1, price: 449.99 }
        ],
        total: 449.99,
        status: 'confirmed',
        paymentMethod: 'card',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        shippingAddress: { name: user?.name || 'You', address: '789 Pine Road, Takoradi' }
      },
      {
        _id: 'ord-004',
        orderNumber: '#ORD-2026-004',
        items: [
          { name: 'Running Shoes', qty: 1, price: 279.99 }
        ],
        total: 279.99,
        status: 'pending',
        paymentMethod: 'mobile_money',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        shippingAddress: { name: user?.name || 'You', address: '321 Elm Street, Tema' }
      },
      {
        _id: 'ord-005',
        orderNumber: '#ORD-2026-005',
        items: [
          { name: 'Casual Shirt', qty: 1, price: 89.99 }
        ],
        total: 89.99,
        status: 'cancelled',
        paymentMethod: 'card',
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        shippingAddress: { name: user?.name || 'You', address: '654 Birch Lane, Cape Coast' },
        cancelledReason: 'Item out of stock'
      }
    ];
    setOrders(sampleData);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return '#fbbf24';
      case 'confirmed': return '#3b82f6';
      case 'shipped': return '#8b5cf6';
      case 'delivered': return '#10b981';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'pending': return '⏳';
      case 'confirmed': return '✓';
      case 'shipped': return '📦';
      case 'delivered': return '✓✓';
      case 'cancelled': return '✕';
      default: return '•';
    }
  };

  const getFilteredAndSortedOrders = () => {
    let filtered = filter === 'all' 
      ? orders 
      : orders.filter(o => o.status === filter);

    // Sort orders
    return filtered.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else if (sortBy === 'oldest') {
        return new Date(a.createdAt) - new Date(b.createdAt);
      } else if (sortBy === 'highest') {
        return b.total - a.total;
      } else if (sortBy === 'lowest') {
        return a.total - b.total;
      }
      return 0;
    });
  };

  const filteredOrders = getFilteredAndSortedOrders();

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>My Dashboard</h1>
          {user?.role === 'agent' ? (
            <p>Welcome back, Agent {user?.name || 'Agent'} - You can purchase and earn commissions!</p>
          ) : (
            <p>Welcome back, {user?.name || 'Customer'}</p>
          )}
        </div>
        <div className="header-action">
          {user?.role === 'agent' && (
            <Link to="/agent/dashboard" className="btn-agent-portal">
              📊 Agent Portal
            </Link>
          )}
          <Link to="/shop" className="btn-shop">
            Continue Shopping
          </Link>
          <button
            className="btn-quick-options"
            onClick={() => setShowCategories(!showCategories)}
            aria-expanded={showCategories}
            style={{ marginLeft: '12px' }}
          >
            ⚡ Quick Options
          </button>
        </div>
      </div>

      {showCategories && (
        <div className="quick-categories-overlay">
          <div className="quick-categories-card">
            <h4>Categories</h4>
            <div className="quick-categories-list">
              {categories.map(cat => (
                <a
                  key={cat.value}
                  href={`/search?category=${encodeURIComponent(cat.value)}`}
                  className="quick-cat-item"
                  onClick={() => setShowCategories(false)}
                >
                  {cat.label}
                </a>
              ))}
            </div>
            <button className="close-quick-categories" onClick={() => setShowCategories(false)}>Close</button>
          </div>
        </div>
      )}

      {/* Agent Stats Section */}
      {user?.role === 'agent' && agentStats && (
        <div className="agent-stats-section">
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-icon">🔑</span>
              <div className="stat-content">
                <p className="stat-label">Your Promo Code</p>
                <p className="stat-value">{agentStats.promoCode}</p>
              </div>
            </div>
            <div className="stat-card">
              <span className="stat-icon">👥</span>
              <div className="stat-content">
                <p className="stat-label">Referrals</p>
                <p className="stat-value">{agentStats.totalReferrals}</p>
              </div>
            </div>
            <div className="stat-card">
              <span className="stat-icon">💰</span>
              <div className="stat-content">
                <p className="stat-label">Earned</p>
                <p className="stat-value">UGX {agentStats.totalEarnings.toFixed(2)}</p>
              </div>
            </div>
          </div>
          <p className="agent-help-text">
            ℹ️ As an agent, you can purchase items just like any customer AND earn commissions when customers use your promo code!
          </p>
        </div>
      )}

      <div className="dashboard-container">
        {/* User Profile Card */}
        <div className="profile-section">
          <div className="profile-card">
            <div className="profile-header">
              <div className="profile-avatar">
                {user?.name?.charAt(0).toUpperCase() || 'C'}
              </div>
              <div className="profile-info">
                <h2>{user?.name}</h2>
                <p>{user?.email}</p>
              </div>
            </div>
            <div className="profile-stats">
              <div className="stat">
                <span className="stat-value">{orders.length}</span>
                <span className="stat-label">Total Orders</span>
              </div>
              <div className="stat">
                <span className="stat-value">
                  UGX {orders.reduce((sum, o) => sum + (o.total || 0), 0).toFixed(2)}
                </span>
                <span className="stat-label">Total Spent</span>
              </div>
              <div className="stat">
                <span className="stat-value">
                  {orders.filter(o => o.status === 'delivered').length}
                </span>
                <span className="stat-label">Delivered</span>
              </div>
            </div>
          </div>
        </div>

        {/* Orders Section */}
        <div className="orders-section">
          <div className="section-header">
            <div className="section-title">
              <h2>Your Orders</h2>
              <p>Track and manage all your orders</p>
            </div>
            <div className="header-controls">
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-select"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="highest">Highest Price</option>
                <option value="lowest">Lowest Price</option>
              </select>
            </div>
          </div>

          <div className="filter-tabs">
            <button 
              className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              <span className="tab-label">All Orders</span>
              <span className="tab-count">{orders.length}</span>
            </button>
            <button 
              className={`filter-tab ${filter === 'pending' ? 'active' : ''}`}
              onClick={() => setFilter('pending')}
            >
              <span className="tab-icon">⏳</span>
              <span className="tab-label">Pending</span>
              <span className="tab-count">{orders.filter(o => o.status === 'pending').length}</span>
            </button>
            <button 
              className={`filter-tab ${filter === 'confirmed' ? 'active' : ''}`}
              onClick={() => setFilter('confirmed')}
            >
              <span className="tab-icon">✓</span>
              <span className="tab-label">Confirmed</span>
              <span className="tab-count">{orders.filter(o => o.status === 'confirmed').length}</span>
            </button>
            <button 
              className={`filter-tab ${filter === 'shipped' ? 'active' : ''}`}
              onClick={() => setFilter('shipped')}
            >
              <span className="tab-icon">📦</span>
              <span className="tab-label">Shipped</span>
              <span className="tab-count">{orders.filter(o => o.status === 'shipped').length}</span>
            </button>
            <button 
              className={`filter-tab ${filter === 'delivered' ? 'active' : ''}`}
              onClick={() => setFilter('delivered')}
            >
              <span className="tab-icon">✓✓</span>
              <span className="tab-label">Delivered</span>
              <span className="tab-count">{orders.filter(o => o.status === 'delivered').length}</span>
            </button>
            <button 
              className={`filter-tab ${filter === 'cancelled' ? 'active' : ''}`}
              onClick={() => setFilter('cancelled')}
            >
              <span className="tab-icon">✕</span>
              <span className="tab-label">Cancelled</span>
              <span className="tab-count">{orders.filter(o => o.status === 'cancelled').length}</span>
            </button>
          </div>

          {loading && (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading your orders...</p>
            </div>
          )}

          {error && (
            <div className="error-state">
              <span className="error-icon">⚠️</span>
              <p>{error}</p>
            </div>
          )}

          {!loading && filteredOrders.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">📦</div>
              <h3>No orders yet</h3>
              <p>
                {filter === 'all' 
                  ? "You haven't placed any orders. Start shopping to see them here!"
                  : `No ${filter} orders found.`}
              </p>
              <Link to="/shop" className="btn-start-shopping">
                Start Shopping
              </Link>
            </div>
          )}

          {!loading && filteredOrders.length > 0 && (
            <div className="orders-list">
              {filteredOrders.map(order => (
                <div key={order._id} className="order-card">
                  <div className="order-header">
                    <div className="order-id-section">
                      <span className="label">Order ID</span>
                      <span className="value">{order.orderNumber || order._id.slice(-8).toUpperCase()}</span>
                    </div>
                    <div className="order-date">
                      <span className="label">Order Date</span>
                      <span className="value">
                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className="order-total">
                      <span className="label">Total Amount</span>
                      <span className="value highlight">UGX {(order.total || 0).toFixed(2)}</span>
                    </div>
                    <div className="order-status">
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(order.status) }}
                      >
                        <span className="status-icon">{getStatusIcon(order.status)}</span>
                        <span className="status-text">{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
                      </span>
                    </div>
                  </div>

                  <div className="order-items">
                    <div className="items-count">
                      📦 {order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}
                    </div>
                    <div className="items-preview">
                      {order.items?.slice(0, 3).map((item, idx) => (
                        <div key={idx} className="item-preview">
                          <span className="item-name">{item.name}</span>
                          <span className="item-qty">×{item.qty}</span>
                          <span className="item-price">UGX {(item.price * item.qty).toFixed(2)}</span>
                        </div>
                      ))}
                      {order.items?.length > 3 && (
                        <div className="item-preview more">
                          +{order.items.length - 3} more item{order.items.length - 3 !== 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="order-details">
                    <div className="detail-item">
                      <span className="detail-icon">💳</span>
                      <div className="detail-content">
                        <p className="detail-label">Payment Method</p>
                        <p className="detail-value">
                          {order.paymentMethod === 'mobile_money' ? '📱 Mobile Money' : '💳 Card Payment'}
                        </p>
                      </div>
                    </div>
                    <div className="detail-item">
                      <span className="detail-icon">📍</span>
                      <div className="detail-content">
                        <p className="detail-label">Shipping Address</p>
                        <p className="detail-value">{order.shippingAddress?.address || 'N/A'}</p>
                      </div>
                    </div>
                    {order.cancelledReason && (
                      <div className="detail-item cancelled-info">
                        <span className="detail-icon">ℹ️</span>
                        <div className="detail-content">
                          <p className="detail-label">Cancellation Reason</p>
                          <p className="detail-value">{order.cancelledReason}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="order-footer">
                    <button className="btn-view-details">
                      View Details →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

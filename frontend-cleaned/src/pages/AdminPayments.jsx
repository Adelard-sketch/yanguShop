import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import adminService from '../services/admin.service';
import './AdminPayments.css';

export default function AdminPayments() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    // Check if user is logged in and is admin
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    loadPayments();
    loadStats();
  }, [user, navigate, filter, methodFilter, page]);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 20,
        ...(filter !== 'all' && { status: filter }),
        ...(methodFilter !== 'all' && { method: methodFilter })
      };
      const data = await adminService.getAllPayments(params);
      setPayments(data.payments || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError('Failed to load payments');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await adminService.getPaymentStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats', err);
    }
  };

  const handleStatusChange = async (paymentId, newStatus) => {
    try {
      setUpdating(true);
      await adminService.updatePaymentStatus(paymentId, newStatus);
      setPayments(payments.map(p => 
        p._id === paymentId ? { ...p, status: newStatus } : p
      ));
      setSelectedPayment(null);
      loadStats();
    } catch (err) {
      alert('Failed to update payment status');
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return '#fbbf24';
      case 'completed': return '#10b981';
      case 'failed': return '#ef4444';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const totalRevenue = stats?.byStatus?.reduce((sum, s) => sum + (s.total || 0), 0) || 0;
  const completedPayments = stats?.byStatus?.find(s => s._id === 'completed')?.total || 0;

  return (
    <div className="admin-payments-page">
      <div className="page-header">
        <h1>💳 Payments Management</h1>
        <p>Track and manage all payment transactions</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <span className="stat-label">Total Revenue</span>
              <span className="stat-value">UGX {totalRevenue.toFixed(2)}</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <span className="stat-label">Completed</span>
              <span className="stat-value">UGX {completedPayments.toFixed(2)}</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⏳</div>
            <div className="stat-content">
              <span className="stat-label">Pending</span>
              <span className="stat-value">
                {payments.filter(p => p.status === 'pending').length} txns
              </span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💳</div>
            <div className="stat-content">
              <span className="stat-label">Payment Methods</span>
              <span className="stat-value">{stats.byMethod?.length || 0}</span>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-group">
          <label>Status</label>
          <select value={filter} onChange={(e) => { setFilter(e.target.value); setPage(1); }}>
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Payment Method</label>
          <select value={methodFilter} onChange={(e) => { setMethodFilter(e.target.value); setPage(1); }}>
            <option value="all">All Methods</option>
            <option value="card">Card</option>
            <option value="mobile">Mobile Money</option>
          </select>
        </div>
      </div>

      {/* Payments Table */}
      {loading ? (
        <div className="loading"><div className="spinner"></div> Loading payments...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : payments.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <p>No payments found</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="payments-table">
            <thead>
              <tr>
                <th>Payment ID</th>
                <th>Order</th>
                <th>User</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.map(payment => (
                <tr key={payment._id}>
                  <td className="id-cell">
                    <code>{payment._id.slice(-8)}</code>
                  </td>
                  <td>
                    <span className="order-id">
                      {payment.order?._id?.slice(-6)?.toUpperCase() || 'N/A'}
                    </span>
                  </td>
                  <td className="user-cell">
                    <div className="user-info">
                      <p className="user-name">{payment.user?.name}</p>
                      <p className="user-email">{payment.user?.email}</p>
                    </div>
                  </td>
                  <td className="amount-cell">
                    <span className="amount">UGX {payment.amount?.toFixed(2)}</span>
                  </td>
                  <td>
                    <span className="method-badge">
                      {payment.method === 'card' ? '💳 Card' : '📱 Mobile'}
                    </span>
                  </td>
                  <td>
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(payment.status) }}
                    >
                      {payment.status?.toUpperCase()}
                    </span>
                  </td>
                  <td className="date-cell">
                    {new Date(payment.createdAt).toLocaleDateString()}
                  </td>
                  <td className="actions-cell">
                    <button 
                      className="btn-action"
                      onClick={() => setSelectedPayment(payment)}
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {total > 20 && (
            <div className="pagination">
              <button 
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="btn-prev"
              >
                ← Previous
              </button>
              <span className="page-info">Page {page} of {Math.ceil(total / 20)}</span>
              <button 
                disabled={page >= Math.ceil(total / 20)}
                onClick={() => setPage(page + 1)}
                className="btn-next"
              >
                Next →
              </button>
            </div>
          )}
        </div>
      )}

      {/* Detail Modal */}
      {selectedPayment && (
        <div className="modal-overlay" onClick={() => setSelectedPayment(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Payment Details</h2>
              <button className="btn-close" onClick={() => setSelectedPayment(null)}>✕</button>
            </div>

            <div className="payment-details">
              <div className="detail-row">
                <span className="label">Payment ID</span>
                <span className="value" style={{fontFamily: 'monospace'}}>
                  {selectedPayment._id}
                </span>
              </div>
              <div className="detail-row">
                <span className="label">Amount</span>
                <span className="value highlight">
                  UGX {selectedPayment.amount?.toFixed(2)}
                </span>
              </div>
              <div className="detail-row">
                <span className="label">Method</span>
                <span className="value">
                  {selectedPayment.method === 'card' ? '💳 Credit Card' : '📱 Mobile Money'}
                </span>
              </div>
              <div className="detail-row">
                <span className="label">Status</span>
                <span className="value">
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(selectedPayment.status) }}
                  >
                    {selectedPayment.status?.toUpperCase()}
                  </span>
                </span>
              </div>
              <div className="detail-row">
                <span className="label">User</span>
                <span className="value">{selectedPayment.user?.name} ({selectedPayment.user?.email})</span>
              </div>
              <div className="detail-row">
                <span className="label">Order</span>
                <span className="value">
                  {selectedPayment.order?._id} - UGX {selectedPayment.order?.total?.toFixed(2)}
                </span>
              </div>
              <div className="detail-row">
                <span className="label">Date</span>
                <span className="value">{new Date(selectedPayment.createdAt).toLocaleString()}</span>
              </div>
              {selectedPayment.reference && (
                <div className="detail-row">
                  <span className="label">Reference</span>
                  <span className="value">{selectedPayment.reference}</span>
                </div>
              )}
            </div>

            {/* Status Update */}
            <div className="status-update">
              <label>Update Status</label>
              <div className="status-buttons">
                {['pending', 'completed', 'failed', 'cancelled'].map(status => (
                  <button
                    key={status}
                    className={`status-btn ${selectedPayment.status === status ? 'active' : ''}`}
                    onClick={() => handleStatusChange(selectedPayment._id, status)}
                    disabled={updating || selectedPayment.status === status}
                    style={{ 
                      backgroundColor: selectedPayment.status === status ? getStatusColor(status) : 'transparent',
                      color: selectedPayment.status === status ? 'white' : '#333',
                      borderColor: getStatusColor(status)
                    }}
                  >
                    {status.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn-close-modal" onClick={() => setSelectedPayment(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
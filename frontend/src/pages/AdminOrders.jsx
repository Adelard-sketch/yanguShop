import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import './AdminOrders.css';
import { getAllOrders, updateOrderStatus } from '../services/admin.service';

export default function AdminOrders() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    limit: 10,
    page: 1,
  });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');

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
    fetchOrders();
  }, [user, navigate, filters]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = {
        limit: filters.limit,
        page: filters.page,
        ...(filters.status && { status: filters.status }),
      };
      const response = await getAllOrders(params);
      setOrders(response.data.orders);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async () => {
    if (!newStatus || !selectedOrder) return;

    try {
      await updateOrderStatus(selectedOrder._id, newStatus);
      setShowStatusModal(false);
      setSelectedOrder(null);
      setNewStatus('');
      fetchOrders();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update order status');
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value, page: 1 });
  };

  const handlePageChange = (newPage) => {
    setFilters({ ...filters, page: newPage });
  };

  if (loading && orders.length === 0) {
    return <div className="admin-orders loading">Loading orders...</div>;
  }

  return (
    <div className="admin-orders">
      {/* Header */}
      <div className="orders-header">
        <h1>Order Management</h1>
        <p>Manage and track all customer orders</p>
      </div>

      {/* Filters */}
      <div className="orders-filters">
        <div className="filter-group">
          <label htmlFor="status-filter">Status</label>
          <select
            id="status-filter"
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="filter-select"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="limit-filter">Per Page</label>
          <select
            id="limit-filter"
            value={filters.limit}
            onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
            className="filter-select"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="orders-table-container">
        {orders.length > 0 ? (
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td className="order-id">#{order._id?.slice(-6)}</td>
                  <td>
                    <div className="customer-info">
                      <p className="name">{order.user?.name}</p>
                      <p className="email">{order.user?.email}</p>
                    </div>
                  </td>
                  <td className="items-count">{order.items?.length || 0} items</td>
                  <td className="amount">UGX {order.total?.toFixed(2)}</td>
                  <td>
                    <span className={`status-badge ${order.status}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="date">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <div className="actions">
                      <button
                        className="btn-view"
                        onClick={() => {
                          setSelectedOrder(order);
                          setNewStatus(order.status);
                          setShowStatusModal(true);
                        }}
                      >
                        Update
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <p>No orders found</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="pagination">
          <button
            disabled={pagination.currentPage === 1}
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            className="btn-page"
          >
            Previous
          </button>

          <span className="page-info">
            Page {pagination.currentPage} of {pagination.pages}
          </span>

          <button
            disabled={pagination.currentPage === pagination.pages}
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            className="btn-page"
          >
            Next
          </button>
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusModal && selectedOrder && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Update Order Status</h2>
              <button
                className="modal-close"
                onClick={() => setShowStatusModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <p>Order #{selectedOrder._id?.slice(-6)}</p>
              <p className="customer-name">{selectedOrder.user?.name}</p>

              <div className="form-group">
                <label htmlFor="status-select">New Status</label>
                <select
                  id="status-select"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="form-select"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn-cancel"
                onClick={() => setShowStatusModal(false)}
              >
                Cancel
              </button>
              <button className="btn-update" onClick={handleStatusChange}>
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

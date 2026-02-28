import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getAgentById, createPromo, assignPromoToAgent } from '../services/admin.service';
import useAuth from '../hooks/useAuth';
import './AdminPromo.css';

export default function AdminPromo() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'percentage', // percentage or fixed
    discountValue: '',
    maxUses: '',
    currentUses: 0,
    startDate: '',
    endDate: '',
    minPurchaseAmount: '',
    applicableCategories: 'all', // all or specific categories
    status: 'active',
  });

  const [assigningAgent, setAssigningAgent] = useState(null);

  // Check admin access
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    loadPromos();
  }, [user, navigate]);

  // If opened with ?assignAgent=<id>, prefetch agent and open form for assignment
  const location = useLocation();
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const assignAgent = params.get('assignAgent');
    if (assignAgent) {
      // open form and fetch agent details
      setShowForm(true);
      (async () => {
        try {
          const res = await getAgentById(assignAgent);
          const agent = res?.data || res;
          setFormData(prev => ({ ...prev, code: prev.code || '', description: `Promo for agent ${agent?.data?.name || agent?.name || assignAgent}` }));
          setEditingId(null);
          // store assigning agent in state for submit
          setAssigningAgent(agent?.data || agent);
        } catch (err) {
          console.error('Failed to fetch agent for promo assignment', err);
        }
      })();
    }
  }, [location.search]);

  const loadPromos = () => {
    // Load sample promo data
    const samplePromos = [
      {
        _id: '1',
        code: 'WELCOME20',
        description: 'Welcome discount for new customers',
        discountType: 'percentage',
        discountValue: 20,
        maxUses: 100,
        currentUses: 45,
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        minPurchaseAmount: 50,
        applicableCategories: 'all',
        status: 'active',
        createdAt: new Date('2024-01-01'),
      },
      {
        _id: '2',
        code: 'SAVE50',
        description: 'Save UGX 50 on orders above UGX 200',
        discountType: 'fixed',
        discountValue: 50,
        maxUses: 200,
        currentUses: 120,
        startDate: '2024-02-01',
        endDate: '2024-06-30',
        minPurchaseAmount: 200,
        applicableCategories: 'all',
        status: 'active',
        createdAt: new Date('2024-02-01'),
      },
      {
        _id: '3',
        code: 'FLASH30',
        description: 'Flash sale - 30% off shoes',
        discountType: 'percentage',
        discountValue: 30,
        maxUses: 50,
        currentUses: 50,
        startDate: '2024-01-15',
        endDate: '2024-01-20',
        minPurchaseAmount: 0,
        applicableCategories: 'shoes',
        status: 'expired',
        createdAt: new Date('2024-01-15'),
      },
    ];
    setPromos(samplePromos);
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

    // Validation
    if (!formData.code || !formData.discountValue) {
      setError('Promo code and discount value are required');
      return;
    }

    if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
      setError('End date must be after start date');
      return;
    }

    try {
      setLoading(true);
      let createdPromo = null;
      if (editingId) {
        // Update existing promo (local update for now)
        setPromos(promos.map(p => p._id === editingId ? { ...formData, _id: editingId } : p));
        setSuccess('Promo code updated successfully!');
        createdPromo = { ...formData, _id: editingId };
      } else {
        // Create promo via API
        try {
          const payload = {
            code: formData.code,
            description: formData.description,
            discountPercent: formData.discountType === 'percentage' ? Number(formData.discountValue) : undefined,
            startsAt: formData.startDate || undefined,
            endsAt: formData.endDate || undefined,
          };
          const res = await createPromo(payload);
          createdPromo = res?.data || res;
          // update local list
          const newPromo = { ...formData, _id: createdPromo._id || createdPromo.id || (Date.now().toString()), createdAt: createdPromo.createdAt || new Date(), status: 'active' };
          setPromos([newPromo, ...promos]);
          setSuccess('Promo code created successfully!');
        } catch (err) {
          console.error('Failed to create promo via API', err);
          setError('Failed to create promo code');
          return;
        }
      }

      // If this page was opened to assign to an agent, call assign API
      if (assigningAgent && createdPromo) {
        try {
          const promoId = createdPromo._id || createdPromo.id || createdPromo._id;
          await assignPromoToAgent(assigningAgent._id || assigningAgent.id, promoId);
          setSuccess('Promo created and assigned to agent successfully!');
          // clear the assigningAgent so subsequent submits are normal
          setAssigningAgent(null);
        } catch (err) {
          console.error('Failed to assign promo to agent', err);
          setError('Promo created but failed to assign to agent');
        }
      }

      // Reset form
      setTimeout(() => {
        setShowForm(false);
        setEditingId(null);
        setFormData({
          code: '',
          description: '',
          discountType: 'percentage',
          discountValue: '',
          maxUses: '',
          currentUses: 0,
          startDate: '',
          endDate: '',
          minPurchaseAmount: '',
          applicableCategories: 'all',
          status: 'active',
        });
        setSuccess('');
      }, 1500);
    } catch (err) {
      setError('Failed to save promo code');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (promo) => {
    setFormData(promo);
    setEditingId(promo._id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this promo code?')) {
      setPromos(promos.filter(p => p._id !== id));
      setSuccess('Promo code deleted successfully!');
      setTimeout(() => setSuccess(''), 2000);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      code: '',
      description: '',
      discountType: 'percentage',
      discountValue: '',
      maxUses: '',
      currentUses: 0,
      startDate: '',
      endDate: '',
      minPurchaseAmount: '',
      applicableCategories: 'all',
      status: 'active',
    });
  };

  return (
    <div className="admin-promo">
      {/* Header */}
      <div className="promo-header">
        <div className="header-content">
          <h1>Manage Promo Codes</h1>
          <p>Create and manage promotional discount codes</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
          disabled={showForm}
        >
          + New Promo Code
        </button>
      </div>

      {/* Error/Success Messages */}
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Form */}
      {showForm && (
        <div className="promo-form-container">
          <form onSubmit={handleSubmit} className="promo-form">
            <h2>{editingId ? 'Edit Promo Code' : 'Create New Promo Code'}</h2>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="code">Promo Code *</label>
                <input
                  id="code"
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  placeholder="WELCOME20"
                  required
                  style={{ textTransform: 'uppercase' }}
                />
              </div>

              <div className="form-group">
                <label htmlFor="discountType">Discount Type</label>
                <select
                  id="discountType"
                  name="discountType"
                  value={formData.discountType}
                  onChange={handleChange}
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (UGX)</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="discountValue">
                  Discount Value {formData.discountType === 'percentage' ? '(%)' : '(UGX)'} *
                </label>
                <input
                  id="discountValue"
                  type="number"
                  name="discountValue"
                  value={formData.discountValue}
                  onChange={handleChange}
                  placeholder="20"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="minPurchaseAmount">Min. Purchase Amount (UGX)</label>
                <input
                  id="minPurchaseAmount"
                  type="number"
                  name="minPurchaseAmount"
                  value={formData.minPurchaseAmount}
                  onChange={handleChange}
                  placeholder="0"
                />
              </div>

              <div className="form-group full-width">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="What is this promo for?"
                  rows="2"
                ></textarea>
              </div>

              <div className="form-group">
                <label htmlFor="maxUses">Max Uses (blank = unlimited)</label>
                <input
                  id="maxUses"
                  type="number"
                  name="maxUses"
                  value={formData.maxUses}
                  onChange={handleChange}
                  placeholder="100"
                />
              </div>

              <div className="form-group">
                <label htmlFor="startDate">Start Date</label>
                <input
                  id="startDate"
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="endDate">End Date</label>
                <input
                  id="endDate"
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="applicableCategories">Applicable To</label>
                <select
                  id="applicableCategories"
                  name="applicableCategories"
                  value={formData.applicableCategories}
                  onChange={handleChange}
                >
                  <option value="all">All Products</option>
                  <option value="shoes">Shoes Only</option>
                  <option value="accessories">Accessories Only</option>
                  <option value="clothing">Clothing Only</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="status">Status</label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Saving...' : editingId ? 'Update Code' : 'Create Code'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Promo List */}
      <div className="promos-container">
        {promos.length > 0 ? (
          <div className="promos-grid">
            {promos.map((promo) => (
              <div key={promo._id} className={`promo-card ${promo.status}`}>
                <div className="promo-header-card">
                  <div className="promo-code">{promo.code}</div>
                  <span className={`status-badge ${promo.status}`}>{promo.status}</span>
                </div>

                <p className="promo-description">{promo.description}</p>

                <div className="promo-details">
                  <div className="detail">
                    <span className="label">Discount:</span>
                    <span className="value">
                      {promo.discountType === 'percentage'
                        ? `${promo.discountValue}%`
                        : `UGX ${promo.discountValue}`} 
                    </span>
                  </div>
                  <div className="detail">
                    <span className="label">Uses:</span>
                    <span className="value">
                      {promo.currentUses}
                      {promo.maxUses ? `/${promo.maxUses}` : '/∞'}
                    </span>
                  </div>
                  <div className="detail">
                    <span className="label">Min Amount:</span>
                    <span className="value">
                      {promo.minPurchaseAmount ? `UGX ${promo.minPurchaseAmount}` : 'None'}
                    </span>
                  </div>
                  <div className="detail">
                    <span className="label">Valid:</span>
                    <span className="value">
                      {promo.startDate && promo.endDate
                        ? `${new Date(promo.startDate).toLocaleDateString()} - ${new Date(promo.endDate).toLocaleDateString()}`
                        : 'No date limit'}
                    </span>
                  </div>
                </div>

                <div className="promo-actions">
                  <button
                    className="btn btn-small btn-secondary"
                    onClick={() => handleEdit(promo)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-small btn-danger"
                    onClick={() => handleDelete(promo._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>No promo codes yet. Create one to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
}

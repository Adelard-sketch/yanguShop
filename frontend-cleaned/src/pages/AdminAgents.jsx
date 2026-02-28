import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import './AdminAgents.css';
import { getAgents, approveAgent, rejectAgent, updateAgent, getAgentById } from '../services/admin.service';

export default function AdminAgents() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [actionType, setActionType] = useState(''); // 'approve' or 'reject'
  const [reason, setReason] = useState('');

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
    fetchAgents();
  }, [user, navigate, filter]);

  // auto-open review modal if ?reviewAgent=<id> is present
  const location = useLocation();
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const reviewAgentId = params.get('reviewAgent');
    if (reviewAgentId && agents.length > 0) {
      const found = agents.find(a => a._id === reviewAgentId);
      if (found) {
        setSelectedAgent(found);
        setShowDetailModal(true);
      } else {
        (async () => {
          try {
            const res = await getAgentById(reviewAgentId);
            const agent = res?.data || res;
            setSelectedAgent(agent?.data || agent);
            setShowDetailModal(true);
          } catch (err) {
            console.error('Failed to fetch agent for review', err);
          }
        })();
      }
    }
  }, [location.search, agents]);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const params = filter !== 'all' ? { status: filter } : {};
      const response = await getAgents(params);
      setAgents(response.data);
    } catch (error) {
      console.error('Error fetching agents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedAgent) return;

    try {
      await approveAgent(selectedAgent._id, reason);
      setShowDetailModal(false);
      setSelectedAgent(null);
      setActionType('');
      setReason('');
      fetchAgents();
      // after approval, open promo manager to assign promo to agent
      navigate(`/admin/promo?assignAgent=${selectedAgent._id}`);
    } catch (error) {
      console.error('Error approving agent:', error);
      alert('Failed to approve agent');
    }
  };

  const handleReject = async () => {
    if (!selectedAgent || !reason) {
      alert('Please provide a rejection reason');
      return;
    }

    try {
      await rejectAgent(selectedAgent._id, reason);
      setShowDetailModal(false);
      setSelectedAgent(null);
      setActionType('');
      setReason('');
      fetchAgents();
    } catch (error) {
      console.error('Error rejecting agent:', error);
      alert('Failed to reject agent');
    }
  };

  const filteredAgents = agents;

  if (loading && agents.length === 0) {
    return <div className="admin-agents loading">Loading agents...</div>;
  }

  return (
    <div className="admin-agents">
      {/* Header */}
      <div className="agents-header">
        <h1>Agent Management</h1>
        <p>Manage agent applications and assign promo codes upon approval</p>
      </div>

      {/* Status Filter */}
      <div className="agents-filters">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({agents.length})
        </button>
        <button
          className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          Pending ({agents.filter((a) => a.status === 'pending').length})
        </button>
        <button
          className={`filter-btn ${filter === 'approved' ? 'active' : ''}`}
          onClick={() => setFilter('approved')}
        >
          Approved ({agents.filter((a) => a.status === 'approved').length})
        </button>
        <button
          className={`filter-btn ${filter === 'rejected' ? 'active' : ''}`}
          onClick={() => setFilter('rejected')}
        >
          Rejected ({agents.filter((a) => a.status === 'rejected').length})
        </button>
      </div>

      {/* Agents Grid */}
      <div className="agents-grid">
        {filteredAgents.length > 0 ? (
          filteredAgents.map((agent) => (
            <div key={agent._id} className="agent-card">
              <div className="card-header">
                <h3>{agent.name}</h3>
                <span className={`status-badge ${agent.status}`}>{agent.status}</span>
              </div>

              <div className="card-body">
                <div className="agent-field">
                  <label>Email</label>
                  <p>{agent.email}</p>
                </div>

                <div className="agent-field">
                  <label>Phone</label>
                  <p>{agent.phone}</p>
                </div>

                <div className="agent-field">
                  <label>WhatsApp</label>
                  <p>{agent.whatsapp || 'Not specified'}</p>
                </div>

                <div className="agent-field">
                  <label>Address</label>
                  <p>{agent.address || 'Not specified'}</p>
                </div>

                <div className="agent-field">
                  <label>City</label>
                  <p>{agent.city || 'Not specified'}</p>
                </div>

                <div className="agent-field">
                  <label>Business</label>
                  <p>{agent.businessName || 'Not specified'}</p>
                </div>

                {agent.status === 'approved' && (
                  <>
                    <div className="agent-field">
                      <label>Promo Code</label>
                      <p><code style={{backgroundColor: '#f0fdf4', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold', color: '#059669'}}>{agent.code || 'Generating...'}</code></p>
                    </div>
                    <div className="agent-field">
                      <label>Commission Rate</label>
                      <p>{agent.commissionRate}%</p>
                    </div>
                    <div className="agent-field">
                      <label>Status</label>
                      <p>{agent.active ? 'Active' : 'Inactive'}</p>
                    </div>
                  </>
                )}

                {agent.status === 'rejected' && agent.rejectionReason && (
                  <div className="agent-field rejection-reason">
                    <label>Rejection Reason</label>
                    <p>{agent.rejectionReason}</p>
                  </div>
                )}
              </div>

              <div className="card-footer">
                {agent.status === 'pending' && (
                  <button
                    className="btn-review"
                    onClick={() => {
                      setSelectedAgent(agent);
                      setActionType('');
                      setReason('');
                      setShowDetailModal(true);
                    }}
                  >
                    Review Application
                  </button>
                )}
                {agent.status === 'approved' && (
                  <button className="btn-approved" disabled>
                    ✓ Approved
                  </button>
                )}
                {agent.status === 'rejected' && (
                  <button className="btn-rejected" disabled>
                    ✕ Rejected
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <p>No agents found</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedAgent && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Review Agent Application</h2>
              <button
                className="modal-close"
                onClick={() => setShowDetailModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              {/* Agent Details */}
              <div className="detail-section">
                <h3>Personal Information</h3>
                <div className="detail-field">
                  <label>Name</label>
                  <p>{selectedAgent.name}</p>
                </div>
                <div className="detail-field">
                  <label>Email</label>
                  <p>{selectedAgent.email}</p>
                </div>
                <div className="detail-field">
                  <label>Phone</label>
                  <p>{selectedAgent.phone}</p>
                </div>
                <div className="detail-field">
                  <label>WhatsApp Number</label>
                  <p>{selectedAgent.whatsapp ? (
                    <a href={`https://wa.me/${selectedAgent.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">
                      {selectedAgent.whatsapp} 📱
                    </a>
                  ) : 'Not provided'}</p>
                </div>
                <div className="detail-field">
                  <label>Address</label>
                  <p>{selectedAgent.address || 'Not provided'}</p>
                </div>
              </div>

              <div className="detail-section">
                <h3>Business Information</h3>
                <div className="detail-field">
                  <label>Business Name</label>
                  <p>{selectedAgent.businessName || 'Not provided'}</p>
                </div>
                <div className="detail-field">
                  <label>City</label>
                  <p>{selectedAgent.city || 'Not provided'}</p>
                </div>
                <div className="detail-field">
                  <label>State</label>
                  <p>{selectedAgent.state || 'Not provided'}</p>
                </div>
                <div className="detail-field">
                  <label>Address</label>
                  <p>{selectedAgent.address || 'Not provided'}</p>
                </div>
              </div>

              {/* Promo Code Section (if approved) */}
              {selectedAgent.status === 'approved' && selectedAgent.code && (
                <div className="detail-section">
                  <h3>Promo Code</h3>
                  <div className="detail-field">
                    <label>Assigned Code</label>
                    <p>
                      <code style={{
                        backgroundColor: '#f0fdf4',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        fontWeight: 'bold',
                        fontSize: '16px',
                        color: '#059669',
                        letterSpacing: '1px'
                      }}>
                        {selectedAgent.code}
                      </code>
                    </p>
                  </div>
                  <div className="detail-field">
                    <label>Benefits</label>
                    <p>✓ 20% discount for first-time customers<br/>✓ Unlimited uses<br/>✓ Direct referral tracking</p>
                  </div>
                </div>
              )}

              {/* Action Selection */}
              {actionType === '' && (
                <div className="action-selection">
                  <p className="action-prompt">What would you like to do?</p>
                  <div className="action-buttons">
                    <button
                      className="btn-action btn-approve"
                      onClick={() => setActionType('approve')}
                    >
                      ✓ Approve
                    </button>
                    <button
                      className="btn-action btn-reject"
                      onClick={() => setActionType('reject')}
                    >
                      ✕ Reject
                    </button>
                  </div>
                </div>
              )}

              {/* Rejection Reason Form */}
              {actionType === 'reject' && (
                <div className="form-group">
                  <label htmlFor="rejection-reason">Rejection Reason*</label>
                  <textarea
                    id="rejection-reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Please provide a reason for rejection"
                    rows={4}
                  />
                </div>
              )}

              {/* Approval Confirmation */}
              {actionType === 'approve' && (
                <div className="approval-confirm">
                  <p>Are you sure you want to approve this agent?</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            {actionType !== '' && (
              <div className="modal-footer">
                <button
                  className="btn-cancel"
                  onClick={() => {
                    setActionType('');
                    setReason('');
                  }}
                >
                  Back
                </button>
                {actionType === 'approve' && (
                  <button className="btn-confirm btn-approve-action" onClick={handleApprove}>
                    Approve Agent
                  </button>
                )}
                {actionType === 'reject' && (
                  <button className="btn-confirm btn-reject-action" onClick={handleReject}>
                    Reject Application
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

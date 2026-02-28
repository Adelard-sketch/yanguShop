import React, { useContext, useState } from 'react';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import orderService from '../services/order.service';
import { useNavigate, Link } from 'react-router-dom';
import './Checkout.css';
import { formatUGX } from '../utils/formatCurrency';

export default function Checkout() {
  const { items, total, clear } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || '');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState(user?.email || '');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  if (!user) return (
    <div className="auth-required">
      <div className="auth-required-card">
        <div className="auth-icon">🔐</div>
        <h2>Sign In Required</h2>
        <p>Please sign in to complete your purchase</p>
        <Link to="/login" className="btn-signin">
          Go to Login
        </Link>
      </div>
    </div>
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!items.length) return setError('Your cart is empty');
    if (!name || !address || !phone) return setError('Please fill in all shipping details');
    setLoading(true);
    setError(null);

    try {
      // Navigate to Payment page with order data
      navigate('/payment', {
        state: {
          orderData: {
            items,
            total,
            shippingAddress: { name, address, phone, email },
            paymentMethod,
            _id: 'temp-' + Date.now()
          }
        }
      });
    } catch (err) {
      setError('Failed to proceed to payment');
    } finally {
      setLoading(false);
    }
  };

  if (success) return (
    <div className="checkout-page">
      <div className="success-container">
        <div className="success-card">
          <div className="success-icon">✓</div>
          <h2>Order Confirmed!</h2>
          <p className="success-message">Thank you for your purchase. Your order has been placed successfully.</p>
          
          <div className="order-details">
            <div className="detail-row">
              <span className="detail-label">Order ID</span>
              <span className="detail-value">{success._id}</span>
            </div>
                <div className="detail-row">
                  <span className="detail-label">Total Amount</span>
                  <span className="detail-amount">{formatUGX(total)}</span>
                </div>
            <div className="detail-row">
              <span className="detail-label">Status</span>
              <span className="status-badge pending">Pending</span>
            </div>
          </div>

          <p className="confirmation-text">A confirmation email has been sent to {email}</p>

          <div className="success-actions">
            <Link to="/" className="btn-home">
              Back to Home
            </Link>
            <Link to="/dashboard" className="btn-orders">
              View My Orders
            </Link>
          </div>
        </div>
      </div>
    </div>
  );

  if (items.length === 0) return (
    <div className="checkout-page">
      <div className="empty-checkout">
        <div className="empty-icon">🛒</div>
        <h2>Your cart is empty</h2>
        <p>Add some products before checking out</p>
        <Link to="/shop" className="btn-continue-shopping">
          Continue Shopping
        </Link>
      </div>
    </div>
  );

  return (
    <div className="checkout-page">
      <div className="checkout-header">
        <h1>Checkout</h1>
        <p>Complete your purchase</p>
      </div>

      <div className="checkout-container">
        {/* Main Checkout Form */}
        <div className="checkout-main">
          {/* Shipping Information */}
          <div className="checkout-section">
            <h2 className="section-title">Shipping Information</h2>
            
            <form onSubmit={handleSubmit} className="checkout-form">
              <div className="form-group">
                <label htmlFor="name">Full Name *</label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="John Doe"
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number *</label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+256 7XX XXX XXX"
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="address">Delivery Address *</label>
                <textarea
                  id="address"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="Enter your complete delivery address"
                  required
                  className="form-textarea"
                  rows={4}
                />
              </div>

              {/* Payment Method */}
              <div className="checkout-section">
                <h2 className="section-title">Payment Method</h2>

                <div className="payment-options">
                  <label className={`payment-option ${paymentMethod === 'card' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={e => setPaymentMethod(e.target.value)}
                    />
                    <div className="payment-content">
                      <span className="payment-icon">💳</span>
                      <span className="payment-text">Credit/Debit Card</span>
                    </div>
                  </label>

                  <label className={`payment-option ${paymentMethod === 'mobile' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      value="mobile"
                      checked={paymentMethod === 'mobile'}
                      onChange={e => setPaymentMethod(e.target.value)}
                    />
                    <div className="payment-content">
                      <span className="payment-icon">📱</span>
                      <span className="payment-text">Mobile Money</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="error-message">
                  <span className="error-icon">⚠️</span>
                  <p>{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="btn-place-order"
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Processing...
                  </>
                ) : (
                  <>
                    Proceed to Payment
                  </>
                )}
              </button>

              <p className="terms-text">
                By placing an order, you agree to our <a href="/">Terms & Conditions</a>
              </p>
            </form>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="checkout-sidebar">
          <div className="order-summary">
            <h3 className="summary-title">Order Summary</h3>

            <div className="items-summary">
              {items.map(it => (
                <div key={it._id} className="item-summary-row">
                  <div className="item-info">
                    <p className="item-name">{it.name}</p>
                    <p className="item-qty">Qty: {it.qty}</p>
                  </div>
                  <p className="item-total">UGX {((it.price || 0) * (it.qty || 1)).toFixed(2)}</p>
                </div>
              ))}
            </div>

            <div className="summary-divider"></div>

            <div className="summary-section">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>UGX {total.toFixed(2)}</span>
              </div>

              <div className="summary-row">
                <span>Shipping</span>
                <span className="free-shipping">Free</span>
              </div>

              <div className="summary-row">
                <span>Tax</span>
                <span>UGX 0.00</span>
              </div>
            </div>

            <div className="summary-divider"></div>

            <div className="total-section">
              <span className="total-label">Total</span>
              <span className="total-value">UGX {total.toFixed(2)}</span>
            </div>

            {/* Trust Badges */}
            <div className="trust-badges">
              <div className="badge">
                <span className="badge-icon">🛡️</span>
                <p>Secure</p>
              </div>
              <div className="badge">
                <span className="badge-icon">📦</span>
                <p>Fast</p>
              </div>
              <div className="badge">
                <span className="badge-icon">↩️</span>
                <p>Easy Return</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

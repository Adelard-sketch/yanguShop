import React, { useState, useContext, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import './Payment.css';
import paymentService from '../services/payment.service';
import { formatUGX } from '../utils/formatCurrency';

export default function Payment() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(AuthContext);
  const { clear: clearCart } = useContext(CartContext);
  
  const [cardDetails, setCardDetails] = useState({
    number: '',
    holder: '',
    expiry: '',
    cvc: ''
  });
  
  const [mobileNumber, setMobileNumber] = useState('');
  const [processingStep, setProcessingStep] = useState('input'); // input, processing, success
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');

  const orderData = location.state?.orderData;

  useEffect(() => {
    if (!orderData) {
      navigate('/checkout');
    }
  }, [orderData, navigate]);

  if (!orderData) return null;

  const handleCardChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === 'number') {
      formattedValue = value.replace(/\D/g, '').slice(0, 16);
      formattedValue = formattedValue.replace(/(\d{4})/g, '$1 ').trim();
    }
    if (name === 'expiry') {
      formattedValue = value.replace(/\D/g, '').slice(0, 4);
      if (formattedValue.length >= 2) {
        formattedValue = `${formattedValue.slice(0, 2)}/${formattedValue.slice(2)}`;
      }
    }
    if (name === 'cvc') {
      formattedValue = value.replace(/\D/g, '').slice(0, 3);
    }

    setCardDetails(prev => ({ ...prev, [name]: formattedValue }));
  };

  const validateCard = () => {
    if (!cardDetails.number || cardDetails.number.replace(/\s/g, '').length !== 16) {
      setError('Invalid card number');
      return false;
    }
    if (!cardDetails.holder.trim()) {
      setError('Cardholder name is required');
      return false;
    }
    if (!cardDetails.expiry || cardDetails.expiry.length !== 5) {
      setError('Invalid expiry date');
      return false;
    }
    if (!cardDetails.cvc || cardDetails.cvc.length !== 3) {
      setError('Invalid CVC');
      return false;
    }
    return true;
  };

  const validateMobileNumber = () => {
    const cleaned = mobileNumber.replace(/\D/g, '');
    if (cleaned.length < 9) {
      setError('Invalid mobile number');
      return false;
    }
    return true;
  };

  const handlePayment = async () => {
    setError('');

    if (paymentMethod === 'card') {
      if (!validateCard()) return;
    } else {
      if (!validateMobileNumber()) return;
    }

    try {
      setProcessingStep('processing');
      const resp = await paymentService.initiatePayment({ amount: orderData.total, currency: 'UGX', order: orderData._id, redirectUrl: window.location.origin + '/payment/complete' });
      // store pending payment id so the completion page can poll
      if (resp && resp.paymentId) sessionStorage.setItem('pendingPaymentId', String(resp.paymentId));
      // redirect user to Flutterwave hosted checkout
      if (resp && resp.checkoutUrl) {
        window.location.href = resp.checkoutUrl;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (err) {
      setError(err.message || 'Failed to initiate payment');
      setProcessingStep('input');
    }
  };

  return (
    <div className="payment-page">
      <div className="payment-container">
        {/* Left: Payment Form */}
        <div className="payment-form-section">
          <div className="form-header">
            <h1>Complete Payment</h1>
            <p>Secure payment powered by Stripe & Flutterwave</p>
          </div>

          {processingStep === 'input' && (
            <div className="payment-form">
              {/* Payment Method Tabs */}
              <div className="payment-tabs">
                <button
                  className={`tab ${paymentMethod === 'card' ? 'active' : ''}`}
                  onClick={() => { setPaymentMethod('card'); setError(''); }}
                >
                  💳 Card Payment
                </button>
                <button
                  className={`tab ${paymentMethod === 'mobile' ? 'active' : ''}`}
                  onClick={() => { setPaymentMethod('mobile'); setError(''); }}
                >
                  📱 Mobile Money
                </button>
              </div>

              {/* Card Payment Form */}
              {paymentMethod === 'card' && (
                <div className="card-form">
                  <div className="card-preview">
                    <div className="card-chip">💳</div>
                    <div className="card-number">
                      {cardDetails.number || '•••• •••• •••• ••••'}
                    </div>
                    <div className="card-details">
                      <div className="card-holder">
                        <small>Card Holder</small>
                        <div>{cardDetails.holder || 'NAME'}</div>
                      </div>
                      <div className="card-expiry">
                        <small>Expires</small>
                        <div>{cardDetails.expiry || 'MM/YY'}</div>
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Cardholder Name *</label>
                    <input
                      type="text"
                      name="holder"
                      value={cardDetails.holder}
                      onChange={handleCardChange}
                      placeholder="John Doe"
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>Card Number *</label>
                    <input
                      type="text"
                      name="number"
                      value={cardDetails.number}
                      onChange={handleCardChange}
                      placeholder="1234 5678 9012 3456"
                      className="form-input"
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Expiry Date *</label>
                      <input
                        type="text"
                        name="expiry"
                        value={cardDetails.expiry}
                        onChange={handleCardChange}
                        placeholder="MM/YY"
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label>CVC *</label>
                      <input
                        type="text"
                        name="cvc"
                        value={cardDetails.cvc}
                        onChange={handleCardChange}
                        placeholder="123"
                        className="form-input"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Mobile Money Form */}
              {paymentMethod === 'mobile' && (
                <div className="mobile-form">
                  <div className="providers">
                    <p className="providers-label">Select Mobile Provider:</p>
                    <div className="provider-options">
                      <button className="provider-btn active">
                        <span className="provider-icon">📱</span>
                        <span>Vodafone Cash</span>
                      </button>
                      <button className="provider-btn">
                        <span className="provider-icon">📱</span>
                        <span>MTN Mobile Money</span>
                      </button>
                      <button className="provider-btn">
                        <span className="provider-icon">📱</span>
                        <span>AirtelTigo Money</span>
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Mobile Money Number *</label>
                      <input
                      type="tel"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      placeholder="+256 7XX XXX XXX"
                      className="form-input"
                    />
                  </div>

                  <div className="info-box">
                    <p>💡 You will receive a prompt on your phone to authorize the payment.</p>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="error-alert">
                  <span className="error-icon">⚠️</span>
                  <p>{error}</p>
                </div>
              )}

              {/* Security Info */}
              <div className="security-info">
                <p>🔒 Your payment information is encrypted and secure</p>
              </div>

              {/* Pay Button */}
              <button className="btn-pay" onClick={handlePayment}>
                Pay {formatUGX(orderData.total)}
              </button>

              <p className="terms">
                By clicking Pay, you agree to our payment terms
              </p>
            </div>
          )}

          {processingStep === 'processing' && (
            <div className="processing-state">
              <div className="spinner-large"></div>
              <h2>Processing Payment...</h2>
              <p>Please do not close this page</p>
            </div>
          )}

          {processingStep === 'success' && (
            <div className="success-state">
              <div className="success-icon">✓</div>
              <h2>Payment Successful!</h2>
              <p>Your payment has been processed. Redirecting...</p>
            </div>
          )}
        </div>

        {/* Right: Order Summary */}
        <div className="payment-summary-section">
          <div className="order-summary">
            <h3>Order Summary</h3>

            <div className="items-list">
              {orderData.items?.map((item, i) => (
                <div key={i} className="item-row">
                  <div className="item-info">
                    <p className="item-name">{item.name || `Item ${i + 1}`}</p>
                    <p className="item-qty">Qty: {item.qty}</p>
                  </div>
                  <p className="item-price">UGX {((item.price || 0) * (item.qty || 1)).toFixed(2)}</p>
                </div>
              ))}
            </div>

            <div className="summary-divider"></div>

            <div className="summary-breakdown">
              <div className="breakdown-row">
                <span>Subtotal</span>
                <span>UGX {orderData.total?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="breakdown-row">
                <span>Shipping</span>
                <span className="free">Free</span>
              </div>
              <div className="breakdown-row">
                <span>Tax</span>
                <span>UGX 0.00</span>
              </div>
            </div>

            <div className="summary-divider"></div>

            <div className="total-row">
              <span className="total-label">Total Due</span>
              <span className="total-amount">UGX {orderData.total?.toFixed(2) || '0.00'}</span>
            </div>

            {/* Trust Signals */}
            <div className="trust-signals">
              <div className="signal">
                <span>🔒</span>
                <p>Secure</p>
              </div>
              <div className="signal">
                <span>⚡</span>
                <p>Fast</p>
              </div>
              <div className="signal">
                <span>✓</span>
                <p>Verified</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

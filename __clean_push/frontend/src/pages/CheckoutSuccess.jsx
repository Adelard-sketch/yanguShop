import React, { useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import orderService from '../services/order.service';
import './CheckoutSuccess.css';

export default function CheckoutSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const { clear } = useContext(CartContext);
  const [order, setOrder] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    const createOrder = async () => {
      const orderData = location.state?.orderData;
      if (!orderData) {
        navigate('/');
        return;
      }

      try {
        const payload = {
          items: orderData.items.map(i => ({ product: i._id, qty: i.qty })),
          total: orderData.total,
          shippingAddress: orderData.shippingAddress,
          paymentMethod: orderData.paymentMethod
        };

        const createdOrder = await orderService.createOrder(payload);
        setOrder(createdOrder);
        clear();
      } catch (err) {
        console.error('Order creation failed:', err);
      } finally {
        setLoading(false);
      }
    };

    createOrder();
  }, [location.state, navigate, clear]);

  if (loading) {
    return (
      <div className="success-page">
        <div className="success-container">
          <div className="spinner"></div>
          <p>Completing your order...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="success-page">
        <div className="success-container">
          <div className="error-card">
            <div className="error-icon">⚠️</div>
            <h2>Something went wrong</h2>
            <p>We couldn't complete your order. Please try again.</p>
            <button onClick={() => navigate('/checkout')} className="btn-retry">
              Go Back to Checkout
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="success-page">
      <div className="success-container">
        <div className="success-card">
          <div className="success-icon">✓</div>
          <h1>Payment Successful!</h1>
          <p className="success-message">Thank you for your purchase</p>

          <div className="order-confirmation">
            <div className="confirmation-section">
              <h3>Order Details</h3>
              <div className="detail-item">
                <span className="label">Order ID:</span>
                <span className="value">{order._id}</span>
              </div>
              <div className="detail-item">
                <span className="label">Amount:</span>
                <span className="amount">UGX {order.total?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="detail-item">
                <span className="label">Status:</span>
                <span className="status-badge">Confirmed</span>
              </div>
            </div>

            <div className="confirmation-section">
              <h3>What's Next?</h3>
              <ul className="next-steps">
                <li>📧 A confirmation email will be sent shortly</li>
                <li>📦 Your order will be prepared for dispatch</li>
                <li>📱 You'll receive tracking updates via SMS</li>
                <li>🚚 Expected delivery: 2-3 business days</li>
              </ul>
            </div>
          </div>

          <div className="success-actions">
            <button onClick={() => navigate('/dashboard')} className="btn-primary">
              View Order Details
            </button>
            <button onClick={() => navigate('/')} className="btn-secondary">
              Continue Shopping
            </button>
          </div>

          <p className="support-text">
            Need help? <a href="mailto:support@yangushop.com">Contact our support team</a>
          </p>
        </div>
      </div>
    </div>
  );
}

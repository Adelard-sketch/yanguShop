import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import paymentService from '../services/payment.service';
import './Payment.css';

export default function PaymentComplete() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('checking');
  const [error, setError] = useState('');

  useEffect(() => {
    const pid = sessionStorage.getItem('pendingPaymentId');
    if (!pid) {
      setError('Missing payment reference');
      setStatus('failed');
      return;
    }

    let attempts = 0;
    const poll = async () => {
      attempts += 1;
      try {
        const res = await paymentService.getPaymentStatus(pid);
        if (res.status === 'paid') {
          sessionStorage.removeItem('pendingPaymentId');
          navigate('/checkout-success', { state: { orderId: res.order || null } });
          return;
        }
        if (res.status === 'failed') {
          setStatus('failed');
          setError('Payment failed. Please try again.');
          return;
        }
        // continue polling up to 20 attempts
        if (attempts < 20) setTimeout(poll, 2000);
        else {
          setStatus('timeout');
          setError('Payment pending — verification timed out.');
        }
      } catch (err) {
        setError(err.message || 'Failed to check payment');
        setStatus('failed');
      }
    };

    poll();
  }, [navigate]);

  return (
    <div className="payment-page">
      <div className="payment-container">
        <div className="payment-form-section">
          <div className="form-header">
            <h1>Checking Payment Status</h1>
            <p>Please wait while we confirm your payment</p>
          </div>

          {status === 'checking' && (
            <div className="processing-state">
              <div className="spinner-large"></div>
              <h2>Verifying...</h2>
            </div>
          )}

          {status === 'failed' && (
            <div className="error-alert">
              <p>{error}</p>
              <button className="btn-primary" onClick={() => navigate('/checkout')}>Return to Checkout</button>
            </div>
          )}

          {status === 'timeout' && (
            <div className="error-alert">
              <p>{error}</p>
              <button className="btn-primary" onClick={() => navigate('/orders')}>View Orders</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

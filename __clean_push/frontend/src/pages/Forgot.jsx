import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/auth.css';
import authService from '../services/auth.service';

export default function Forgot() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    if (!email || !email.includes('@')) return setError('Please enter a valid email');
    setLoading(true);
    try {
      const res = await authService.forgotPassword({ email });
      setMessage(res.message || 'Check your email for reset instructions');
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Request failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-left" aria-hidden />
      <div className="auth-right">
        <div className="auth-card">
          <h2>Forgot password</h2>
          <p className="lead">Enter your email and we'll send reset instructions.</p>

          <form onSubmit={submit}>
            <div className="form-group">
              <label>Email Address *</label>
              <input
                className="form-control"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>

            {error && <div className="alert-error">⚠️ {error}</div>}
            {message && <div className="alert-success">{message}</div>}

            <button className="btn-primary-pink" type="submit" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Email'}
            </button>

            <div className="auth-help">
              <small style={{ color: 'var(--muted)' }}>Remembered your password?</small>
              <Link to="/login" className="auth-link">Sign in</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

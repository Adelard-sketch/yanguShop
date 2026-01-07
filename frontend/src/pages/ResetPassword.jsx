import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import '../styles/auth.css';
import authService from '../services/auth.service';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const qEmail = searchParams.get('email') || '';
    const qToken = searchParams.get('token') || '';
    setEmail(decodeURIComponent(qEmail));
    setToken(qToken);
  }, [searchParams]);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!email || !token) return setError('Missing token or email');
    if (!password) return setError('Enter a new password');
    if (password !== confirm) return setError('Passwords do not match');
    setLoading(true);
    try {
      const res = await authService.resetPassword({ email, token, password });
      // Optionally navigate to home or login
      navigate('/login');
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Reset failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-left" aria-hidden />
      <div className="auth-right">
        <div className="auth-card">
          <h2>Reset password</h2>
          <p className="lead">Enter a new password for your account.</p>

          <form onSubmit={submit}>
            <div className="form-group">
              <label>Email Address *</label>
              <input className="form-control" type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
            </div>

            <div className="form-group">
              <label>New Password *</label>
              <input className="form-control" type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
            </div>

            <div className="form-group">
              <label>Confirm Password *</label>
              <input className="form-control" type="password" value={confirm} onChange={e=>setConfirm(e.target.value)} required />
            </div>

            {error && <div className="alert-error">⚠️ {error}</div>}

            <button className="btn-primary-pink" type="submit" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import '../styles/auth.css';
import people from '../assets/banner1.jpeg';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!email.includes('@')) {
      setError('Please enter a valid email');
      return;
    }

    if (!password) {
      setError('Please enter your password');
      return;
    }

    setLoading(true);
    try {
      const res = await login({ email, password });
      const role = res?.user?.role || res?.role || (res?.user && res.user.role);
      if (role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) { 
      setError(err?.response?.data?.message || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left" aria-hidden>
        <img src={people} alt="promo" />
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <h2>Welcome Back</h2>
          <p className="lead">Sign in to your account to continue shopping</p>

          <form onSubmit={submit}>
            <div className="form-group">
              <label>Email Address *</label>
              <input 
                className="form-control" 
                type="email"
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                placeholder="Enter your email"
                autoComplete="email"
                required 
              />
            </div>

            <div className="form-group">
              <label>Password *</label>
              <div className="password-input-wrapper">
                <input 
                  className="form-control" 
                  type={showPassword ? "text" : "password"} 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required 
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex="-1"
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            {error && (
              <div className="alert-error">
                <span>⚠️</span> {error}
              </div>
            )}

            <button 
              className="btn-primary-pink" 
              type="submit"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            <div className="auth-help">
              <small style={{color:'var(--muted)'}}>Don't have an account?</small>
              <Link to="/register" className="auth-link">Create one</Link>
            </div>

            <div className="auth-footer-help" style={{marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <Link to="/forgot" style={{color: 'var(--accent-solid)', textDecoration: 'none', fontSize: '13px'}}>Forgot password?</Link>
              <Link to="/help" style={{color: 'var(--accent-solid)', textDecoration: 'none', fontSize: '12px'}}>Need help signing in?</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

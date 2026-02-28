import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import '../styles/auth.css';
import people from '../assets/banner1.jpeg';

export default function Login() {
  const { login, verifyLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [needCode, setNeedCode] = useState(false);
  const [code, setCode] = useState('');
  const [codeLoading, setCodeLoading] = useState(false);
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Show message passed from register (e.g. redirect + verify notice)
  React.useEffect(() => {
    if (location && location.state && location.state.message) {
      setInfo({ message: location.state.message, isVerified: !!location.state.isVerified });
    }
  }, [location]);

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
      if (res && res.needCode) {
        setNeedCode(true);
        setError(null);
        if (res.isVerified === false) setInfo({ message: 'Your email is not verified. A verification code was sent to your email.', isVerified: false });
        return;
      }
      const role = res?.user?.role || res?.role || (res?.user && res.user.role);
      if (role === 'admin') navigate('/admin'); else navigate('/');
    } catch (err) { 
      setError(err?.response?.data?.message || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const submitCode = async (e) => {
    e.preventDefault();
    setCodeLoading(true);
    try {
      const res = await verifyLogin({ email, code });
      const role = res?.user?.role || res?.role || (res?.user && res.user.role);
      if (role === 'admin') navigate('/admin'); else navigate('/');
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Code verification failed');
    } finally {
      setCodeLoading(false);
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

          <form onSubmit={needCode ? submitCode : submit}>
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

            {!needCode && (
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
            )}

            {needCode && (
              <div className="form-group">
                <label>Enter Code *</label>
                <input
                  className="form-control"
                  type="text"
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  placeholder="6-digit code"
                  required
                />
                <small style={{color:'var(--muted)'}}>A login code was sent to your email.</small>
              </div>
            )}

            {error && (
              <div className="alert-error">
                <span>⚠️</span> {error}
              </div>
            )}

            {info && (
              <div className="alert-info" style={{marginBottom: '12px'}}>
                {info.message} {info.isVerified === false && <small style={{display:'block', color:'#666'}}>Please check your email for the verification code.</small>}
              </div>
            )}

            <button 
              className="btn-primary-pink" 
              type="submit"
              disabled={loading || codeLoading}
            >
              {needCode ? (codeLoading ? 'Verifying...' : 'Verify Code') : (loading ? 'Signing in...' : 'Sign In')}
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

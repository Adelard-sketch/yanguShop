import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import '../styles/auth.css';
import people from '../assets/banner1.jpeg';

export default function Register() {
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  // Password strength validator
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: '', color: '' };
    
    let score = 0;
    const feedback = [];
    
    if (pwd.length >= 8) score++;
    else feedback.push('At least 8 characters');
    
    if (pwd.length >= 12) score++;
    else if (pwd.length < 8) feedback.push('At least 12 for strong');
    
    if (/[a-z]/.test(pwd)) score++;
    else feedback.push('Add lowercase letters');
    
    if (/[A-Z]/.test(pwd)) score++;
    else feedback.push('Add uppercase letters');
    
    if (/[0-9]/.test(pwd)) score++;
    else feedback.push('Add numbers');
    
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)) score++;
    else feedback.push('Add special characters');

    const levels = [
      { label: '', color: '' },
      { label: 'Weak', color: '#e74c3c' },
      { label: 'Fair', color: '#f39c12' },
      { label: 'Good', color: '#f1c40f' },
      { label: 'Strong', color: '#27ae60' },
      { label: 'Very Strong', color: '#27ae60' },
      { label: 'Very Strong', color: '#27ae60' }
    ];

    return { score, label: levels[score].label, color: levels[score].color, feedback };
  };

  const strength = getPasswordStrength(password);

  const submit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    if (!/^[0-9+\-\s()]{7,20}$/.test(String(phone))) {
      setError('Please enter a valid phone number');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email');
      return;
    }

    if (strength.score < 4) {
      setError('Password is not strong enough. It must include uppercase, lowercase, numbers, and special characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      await register({ email, password, name, phone });
      navigate('/');
    } catch (err) { 
      setError(err?.response?.data?.message || err.message || 'Registration failed'); 
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left" aria-hidden>
        <img src={people} alt="promo" />
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <h2>Create Account</h2>
          <p className="lead">Join us to get orders and exclusive offers</p>

          <form onSubmit={submit}>
            <div className="form-group">
              <label>Full Name *</label>
              <input 
                className="form-control" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                placeholder="Enter your full name"
                required 
              />
            </div>

            <div className="form-group">
              <label>Phone Number *</label>
              <input 
                className="form-control" 
                value={phone} 
                onChange={e => setPhone(e.target.value)} 
                placeholder="e.g. +233 24 000 0000" 
                required 
              />
              <small style={{color: '#999', marginTop: '4px'}}>Format: +country code followed by number</small>
            </div>

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

            <div className="form-group">
              <label>Password *</label>
              <div className="password-input-wrapper">
                <input 
                  className="form-control" 
                  type={showPassword ? "text" : "password"} 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  placeholder="Create a strong password"
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
              
              {password && (
                <div className="password-strength">
                  <div className="strength-bar">
                    <div 
                      className="strength-fill" 
                      style={{
                        width: `${(strength.score / 6) * 100}%`,
                        backgroundColor: strength.color
                      }}
                    />
                  </div>
                  <span style={{color: strength.color, fontSize: '12px', fontWeight: '600'}}>
                    {strength.label && `Strength: ${strength.label}`}
                  </span>
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Confirm Password *</label>
              <div className="password-input-wrapper">
                <input 
                  className="form-control" 
                  type={showConfirmPassword ? "text" : "password"} 
                  value={confirmPassword} 
                  onChange={e => setConfirmPassword(e.target.value)} 
                  placeholder="Re-enter your password"
                  required 
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  tabIndex="-1"
                >
                  {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {confirmPassword && password === confirmPassword && (
                <small style={{color: '#27ae60', marginTop: '4px', fontWeight: '600'}}>✓ Passwords match</small>
              )}
              {confirmPassword && password !== confirmPassword && (
                <small style={{color: '#e74c3c', marginTop: '4px'}}>✗ Passwords do not match</small>
              )}
            </div>

            {error && (
              <div className="alert-error">
                <span>⚠️</span> {error}
              </div>
            )}

            <button 
              className="btn-primary-pink" 
              type="submit"
              disabled={strength.score < 4 || password !== confirmPassword || !name || !phone || !email}
            >
              Create Account
            </button>

            <div className="auth-help">
              <small style={{color:'var(--muted)'}}>Already have an account?</small>
              <Link to="/login" className="auth-link">Sign in</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

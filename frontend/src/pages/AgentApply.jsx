import React, { useState, useContext, useEffect } from 'react';
import { createAgent } from '../services/admin.service';
import { AuthContext } from '../context/AuthContext';
import './AgentApply.css';
import people from '../assets/banner1.jpeg';

export default function AgentApply() {
  const { user } = useContext(AuthContext);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [occupation, setOccupation] = useState('');
  const [socialLinks, setSocialLinks] = useState('');
  const [about, setAbout] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // validate passwords when user is not logged in
      if (!user) {
        if (!password || password.length < 6) throw new Error('Password must be at least 6 characters');
        if (password !== confirm) throw new Error('Passwords do not match');
      }
      const payload = { name, email, phone, about, address, occupation };
      if (socialLinks) payload.socialLinks = socialLinks.split(',').map(s => s.trim()).filter(Boolean);
      if (!user && password) payload.password = password;
      await createAgent(payload);
      setMessage('Application submitted. We will review and contact you shortly.');
      setName(''); setEmail(''); setPhone(''); setAbout('');
      setPassword(''); setConfirm('');
      setAddress(''); setOccupation(''); setSocialLinks('');
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to submit');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setAddress(user.address || '');
      setOccupation(user.occupation || '');
      setSocialLinks(user.socialLinks ? user.socialLinks.join(', ') : '');
    }
  }, [user]);

  return (
    <div className="agent-apply-page container">
      <div className="agent-apply-card">
        <div className="agent-apply-side" aria-hidden>
          <img src={people} alt="agents" />
        </div>
        <div className="agent-apply-main">
          <header className="agent-apply-header">
            <h2>Apply to Become an Agent</h2>
            <p>Complete the form below and we will review your application.</p>
          </header>

          {message && <div className="alert success">{message}</div>}
          {error && <div className="alert error">{error}</div>}

          <form onSubmit={handleSubmit} className="agent-apply-form">
            <div className="row">
              <div className="col">
                <label>Full name</label>
                <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" />
              </div>
              <div className="col">
                <label>Email</label>
                <input required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
              </div>
            </div>

            <div className="row">
              <div className="col">
                <label>Phone</label>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone number" />
              </div>
              <div className="col">
                <label>Address</label>
                <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Full address where you'll operate" />
              </div>
            </div>

              {!user && (
                <div className="row">
                  <div className="col">
                    <label>Password</label>
                    <input required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Create a password (min 6 chars)" type="password" />
                  </div>
                  <div className="col">
                    <label>Confirm Password</label>
                    <input required value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Confirm password" type="password" />
                  </div>
                </div>
              )}

              <div className="row">
                <div className="col">
                  <label>Occupation</label>
                  <input value={occupation} onChange={(e) => setOccupation(e.target.value)} placeholder="e.g. Retailer / Distributor" />
                </div>
                <div className="col">
                  <label>Social Links</label>
                  <input value={socialLinks} onChange={(e) => setSocialLinks(e.target.value)} placeholder="Comma-separated URLs (Facebook, Instagram...)" />
                </div>
              </div>

              <div className="field">
                <label>About / Experience</label>
                <textarea value={about} onChange={(e) => setAbout(e.target.value)} placeholder="Tell us about your experience or why you'd like to be an agent" rows={10} />
              </div>

            <div className="form-actions">
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? 'Submitting...' : 'Apply to Become an Agent'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useContext, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import logo from '../../assets/yanguShopLogo.png';
import './Header.css';
import { AuthContext } from '../../context/AuthContext';
import { CartContext } from '../../context/CartContext';

export default function Header() {
  const { user, logout } = useContext(AuthContext);
  const { items } = useContext(CartContext);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const navRef = useRef(null);
  const categoryRef = useRef(null);
  const helpRef = useRef(null);
  const navigate = useNavigate();

  const categories = [
    { value: 'all',         label: 'All Categories' },
    { value: 'phones',      label: 'Phones & Tablets' },
    { value: 'men',         label: "Men's Fashion" },
    { value: 'women',       label: "Women's Fashion" },
    { value: 'shoes',       label: 'Shoes & Sneakers' },
    { value: 'accessories', label: 'Accessories' },
    { value: 'sportswear',  label: 'Sportswear' },
    { value: 'bags',        label: 'Bags & Luggage' },
    { value: 'electronics', label: 'Electronics' },
  ];

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setMobileOpen(false);
        setCategoryDropdownOpen(false);
        setHelpOpen(false);
      }
    };
    const onClickOutside = (e) => {
      if (categoryRef.current && !categoryRef.current.contains(e.target)) {
        setCategoryDropdownOpen(false);
      }
      if (helpRef.current && !helpRef.current.contains(e.target)) {
        setHelpOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClickOutside);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClickOutside);
    };
  }, []);

  const toggleMobile = () => setMobileOpen((s) => !s);

  const handleSearch = (e) => {
    e.preventDefault();
    const q = (query || '').trim();
    if (!q) return;
    const searchParams = new URLSearchParams();
    searchParams.set('query', q);
    if (selectedCategory !== 'all') searchParams.set('category', selectedCategory);
    setQuery('');
    navigate(`/search?${searchParams.toString()}`);
    setMobileOpen(false);
  };

  const handleCategorySelect = (categoryValue) => {
    setSelectedCategory(categoryValue);
    setCategoryDropdownOpen(false);
    setQuery('');
    const params = new URLSearchParams();
    if (categoryValue && categoryValue !== 'all') params.set('category', categoryValue);
    navigate(`/search?${params.toString()}`);
    setMobileOpen(false);
  };

  const selectedCategoryLabel =
    categories.find((cat) => cat.value === selectedCategory)?.label || 'All Categories';

  const cartCount = items ? items.reduce((acc, it) => acc + (it.qty || 1), 0) : 0;

  return (
    <header className="site-header" role="banner">

      {/* ── PROMO STRIP ───────────────────────────────────────── */}
      <div className="promo-strip" role="complementary" aria-label="Promotional offer">
        <div className="container promo-inner">
          <span className="promo-left">HOLIDAY SALE</span>
          <span className="promo-center">UP TO 50% OFF — LIMITED TIME</span>
          <div className="promo-right">
            <Link to="/deals" className="promo-cta">Shop Deals</Link>
          </div>
        </div>
      </div>

      {/* ── TOP BAR ───────────────────────────────────────────── */}
      <div className="topbar">
        <div className="container topbar-inner">

          <p className="topbar-left">
            {/* Shield SVG icon */}
            <svg className="topbar-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z" clipRule="evenodd" />
            </svg>
            Shop With Confidence
          </p>

          <div className="topbar-center">
            <Link to="/chat" className="btn-chat" aria-label="Chat with us">
              {/* Chat SVG icon */}
              <svg className="chat-ico" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
              </svg>
              <span className="chat-label">Live Chat</span>
            </Link>
          </div>

          <nav className="topbar-right" aria-label="Support navigation">
            <Link to="/contact">Contact</Link>

            <div className="help-dropdown" ref={helpRef}>
              <button
                className="topbar-link-btn"
                onClick={() => setHelpOpen(!helpOpen)}
                aria-expanded={helpOpen}
                aria-haspopup="true"
              >
                Help
                <svg className="chevron-icon" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
                  <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                </svg>
              </button>

              {helpOpen && (
                <div className="help-menu" role="menu">
                  <div className="help-item">
                    <strong>Customer Support</strong>
                    <p>support@yangushop.com</p>
                    <p>+233 XX XXX XXXX &bull; Mon–Sat, 9AM–6PM GMT</p>
                  </div>
                  <div className="help-item">
                    <strong>Live Chat</strong>
                    <Link to="/chat" className="help-link" role="menuitem">Open Chat Support →</Link>
                    <p>Ask anything about orders, products &amp; more</p>
                  </div>
                  <div className="help-item">
                    <strong>Common Questions</strong>
                    <p>How do I track my order?</p>
                    <p>What is your return policy?</p>
                    <p>How long does shipping take?</p>
                  </div>
                  <div className="help-item">
                    <strong>Account &amp; Security</strong>
                    <p>Reset password &bull; Privacy policy &bull; Terms of service</p>
                  </div>
                </div>
              )}
            </div>

            <Link to="/track">Track Order</Link>

            <div className="topbar-icons" aria-hidden="true">
              {/* Wishlist */}
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"/>
              </svg>
              {/* Bell */}
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 17H5a1 1 0 010-2h10a1 1 0 010 2zM10 2a6 6 0 00-6 6v3l-1 2h14l-1-2V8a6 6 0 00-6-6z"/>
              </svg>
              {/* Envelope */}
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="16" height="12" rx="2"/>
                <path d="M2 7l8 5 8-5"/>
              </svg>
            </div>
          </nav>

        </div>
      </div>

      {/* ── MAIN HEADER ───────────────────────────────────────── */}
      <div className="mainbar">
        <div className="container main-inner">

          {/* Logo + Hamburger */}
          <div className="logo-group">
            <button
              className={`hamburger ${mobileOpen ? 'open' : ''}`}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              onClick={toggleMobile}
            >
              <span></span>
              <span></span>
              <span></span>
            </button>

            <Link to="/" className="logo" aria-label="YanguShop — go to homepage">
              <img src={logo} alt="YanguShop" className="site-logo" />
            </Link>
          </div>

          {/* Nav Links */}
          <nav
            className={`main-nav ${mobileOpen ? 'show' : ''}`}
            ref={navRef}
            aria-label="Main navigation"
          >
            <NavLink to="/" end onClick={() => setMobileOpen(false)}>Home</NavLink>
          </nav>

          {/* Search */}
          <div className="search-center">
            <form className="search-form search-pill" role="search" onSubmit={handleSearch}>
              <div className="category-dropdown" ref={categoryRef}>
                <button
                  type="button"
                  className="search-cat"
                  onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                  aria-label="Select product category"
                  aria-expanded={categoryDropdownOpen}
                  aria-haspopup="listbox"
                >
                  {selectedCategoryLabel}
                  <svg className="chevron-icon" viewBox="0 0 12 12" aria-hidden="true">
                    <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  </svg>
                </button>

                {categoryDropdownOpen && (
                  <ul className="category-menu" role="listbox" aria-label="Product categories">
                    {categories.map((cat) => (
                      <li key={cat.value} role="option" aria-selected={selectedCategory === cat.value}>
                        <button
                          type="button"
                          className={`category-item ${selectedCategory === cat.value ? 'active' : ''}`}
                          onClick={() => handleCategorySelect(cat.value)}
                        >
                          {cat.label}
                          {selectedCategory === cat.value && (
                            <svg className="check-mark" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true">
                              <path d="M2 7l4 4 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                            </svg>
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <input
                aria-label="Search products"
                placeholder="Search products, brands..."
                className="search-input"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                name="q"
                autoComplete="off"
              />

              <button type="submit" className="search-btn" aria-label="Submit search">
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="9" cy="9" r="6"/>
                  <path d="M13.5 13.5L18 18"/>
                </svg>
              </button>

              {(query || selectedCategory !== 'all') && (
                <button
                  type="button"
                  className="btn-clear"
                  aria-label="Clear search and filters"
                  onClick={() => { setQuery(''); setSelectedCategory('all'); setCategoryDropdownOpen(false); }}
                >
                  <span className="clear-label">Clear</span>
                  <svg className="clear-icon" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                    <path d="M2 2l8 8M10 2l-8 8"/>
                  </svg>
                </button>
              )}
            </form>
          </div>

          {/* Actions */}
          <div className="header-actions" role="navigation" aria-label="Account and cart">

            {user ? (
              <div className="user-section">
                <div className="user-pill">
                  <div className="avatar" aria-hidden="true">{user.name.charAt(0).toUpperCase()}</div>
                  <div className="user-info">
                    <span className="username">{user.name}</span>
                    {user.role && (
                      <span className="user-role">
                        {user.role === 'agent' ? 'Agent' : user.role === 'admin' ? 'Admin' : 'Customer'}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  className="btn-logout"
                  onClick={() => { logout(); navigate('/'); }}
                  aria-label="Log out of your account"
                >
                  Log Out
                </button>
              </div>
            ) : (
              <div className="auth-links">
                <Link to="/login" className="auth-link">Log In</Link>
                <Link to="/register" className="btn-primary">Sign Up</Link>
              </div>
            )}

            {/* Agent portal — only for agents */}
            {user?.role === 'agent' && (
              <Link to="/agent/dashboard" className="action-link agent-link" title="Agent Portal">
                <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path d="M2 10a8 8 0 1116 0A8 8 0 012 10zm5-1a1 1 0 000 2h6a1 1 0 000-2H7z"/>
                </svg>
                <span className="action-label">Portal</span>
              </Link>
            )}

            {/* Become an agent — only for logged-in non-agents (not guests, not admins) */}
            {user && user.role !== 'agent' && user.role !== 'admin' && (
              <Link to="/agent/apply" className="action-link agent-apply" title="Become an Agent">
                Become an Agent
              </Link>
            )}

            {/* Admin panel */}
            {user?.role === 'admin' && (
              <Link to="/admin/dashboard" className="action-link admin-link" title="Admin Panel">
                <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/>
                </svg>
                <span className="action-label">Admin</span>
              </Link>
            )}

            <Link to="/dashboard" className="action-link orders-link">
              <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
              </svg>
              <span className="action-label">My Orders</span>
            </Link>

            <Link to="/cart" className="action-link cart" aria-label={`Shopping cart — ${cartCount} item${cartCount !== 1 ? 's' : ''}`}>
              <svg className="cart-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 01-8 0"/>
              </svg>
              {cartCount > 0 && <span className="cart-badge">{cartCount > 99 ? '99+' : cartCount}</span>}
            </Link>

          </div>

        </div>
      </div>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="mobile-overlay"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

    </header>
  );
}

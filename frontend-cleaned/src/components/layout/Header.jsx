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
    { value: 'all', label: 'All Categories' },
    { value: 'phones', label: 'Phones & Tablets' },
    { value: 'men', label: 'Men\'s Fashion' },
    { value: 'women', label: 'Women\'s Fashion' },
    { value: 'shoes', label: 'Shoes & Sneakers' },
    { value: 'accessories', label: 'Accessories' },
    { value: 'sportswear', label: 'Sportswear' },
    { value: 'bags', label: 'Bags & Luggage' },
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

  const toggleMobile = () => setMobileOpen(s => !s);

  const handleSearch = (e) => {
    e.preventDefault();
    const q = (query || '').trim();
    if (!q) return;
    
    const searchParams = new URLSearchParams();
    searchParams.set('query', q);
    if (selectedCategory !== 'all') {
      searchParams.set('category', selectedCategory);
    }
    
    setQuery('');
    navigate(`/search?${searchParams.toString()}`);
    setMobileOpen(false);
  };

  const handleCategorySelect = (categoryValue) => {
    // select category and navigate to search page showing that category
    setSelectedCategory(categoryValue);
    setCategoryDropdownOpen(false);
    setQuery('');
    const params = new URLSearchParams();
    if (categoryValue && categoryValue !== 'all') params.set('category', categoryValue);
    navigate(`/search?${params.toString()}`);
    setMobileOpen(false);
  };

  const selectedCategoryLabel = categories.find(cat => cat.value === selectedCategory)?.label || 'All Categories';

  const cartCount = items ? items.reduce((acc, it) => acc + (it.qty || 1), 0) : 0;

  return (
    <header className="site-header" role="banner">

      {/* PROMO STRIP */}
      <div className="promo-strip">
        <div className="container promo-inner">
          <div className="promo-left">HOLIDAY SALE</div>
          <div className="promo-center">UP TO 50% OFF</div>
          <div className="promo-right">
            <span>Limited Time Only</span>
            <Link to="/deals" className="promo-cta">Shop Now</Link>
          </div>
        </div>
      </div>

      {/* TOP BAR */}
      <div className="topbar">
        <div className="container topbar-inner">
          <div className="topbar-left">Shop With Confidence</div>

          {/* center area for compact controls (Chat) */}
          <div className="topbar-center">
            <Link to="/chat" className="btn-chat" title="Chat with us" aria-label="Open chat - Chat with us">
              <span className="chat-ico" aria-hidden="true">💬</span>
              <span className="chat-label">Chat with us</span>
            </Link>
          </div>

          <div className="topbar-right">
            <Link to="/contact">Contact</Link>
            <div className="help-dropdown" ref={helpRef}>
              <button 
                className="topbar-link-btn"
                onClick={() => setHelpOpen(!helpOpen)}
              >
                Help
              </button>
              {helpOpen && (
                <div className="help-menu">
                  <div className="help-item">
                    <strong>📞 Customer Support</strong>
                    <p>Email: support@yangushop.com</p>
                    <p>Phone: +233 XX XXX XXXX</p>
                    <p>Available 9AM - 6PM GMT</p>
                  </div>
                  <div className="help-item">
                    <strong>💬 Live Chat</strong>
                    <Link to="/chat" className="help-link">Open Chat Support →</Link>
                    <p>Ask anything about orders, products & more</p>
                  </div>
                  <div className="help-item">
                    <strong>❓ Frequently Asked Questions</strong>
                    <p>• How do I track my order?</p>
                    <p>• What's your return policy?</p>
                    <p>• How long is shipping?</p>
                  </div>
                  <div className="help-item">
                    <strong>🔐 Account & Security</strong>
                    <p>Reset password • Privacy policy • Terms</p>
                  </div>
                </div>
              )}
            </div>
            <Link to="/track">Track Order</Link>
            <span className="top-icons">♡ 🔔 ✉️</span>
          </div>
        </div>
      </div>

      {/* MAIN HEADER */}
      <div className="mainbar">
        <div className="container main-inner">

          {/* LOGO & HAMBURGER */}
          <div style={{display:'flex', alignItems:'center', gap:12}}>
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

            <Link to="/" className="logo" aria-label="YanguShop home">
              <img src={logo} alt="YanguShop" className="site-logo" />
            </Link>
          </div>

          {/* NAV LINKS */}
          <nav
            className={`main-nav ${mobileOpen ? 'show' : ''}`}
            ref={navRef}
            aria-label="Main navigation"
          >
            <NavLink to="/" onClick={() => setMobileOpen(false)} className={({isActive}) => isActive ? 'active' : ''}>Home</NavLink>
          </nav>

          {/* SEARCH WITH CATEGORY */}
          <div className="search-center">
            <form className="search-form search-pill" role="search" onSubmit={handleSearch}>
              <div className="category-dropdown" ref={categoryRef}>
                <button
                  type="button"
                  className="search-cat"
                  onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                  aria-label="Select category"
                  aria-expanded={categoryDropdownOpen}
                >
                  {selectedCategoryLabel} ▾
                </button>
                
                {categoryDropdownOpen && (
                  <div className="category-menu">
                    {categories.map((cat) => (
                      <button
                        key={cat.value}
                        type="button"
                        className={`category-item ${selectedCategory === cat.value ? 'active' : ''}`}
                        onClick={() => handleCategorySelect(cat.value)}
                      >
                        {cat.label}
                        {selectedCategory === cat.value && <span className="check-mark">✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <input
                aria-label="Search products"
                placeholder="Search products, brands..."
                className="search-input"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                name="q"
              />
              
              <button type="submit" className="search-btn" aria-label="Search">🔍</button>
              {(query || selectedCategory !== 'all') && (
                <button
                  type="button"
                  className="btn-clear"
                  aria-label="Clear filters"
                  title="Clear filters"
                  onClick={() => { setQuery(''); setSelectedCategory('all'); setCategoryDropdownOpen(false); }}
                >
                  <span className="clear-label">Clear</span>
                  <span className="clear-icon">✕</span>
                </button>
              )}
            </form>
          </div>

          {/* ACTIONS */}
          <div className="actions header-actions">
            {user ? (
              <div className="user-section">
                <div className="user-pill">
                  <div className="avatar">{user.name.charAt(0).toUpperCase()}</div>
                  <div className="user-info">
                    <div className="username">{user.name}</div>
                    {user.role && <div className="user-role">{user.role === 'agent' ? '👤 Agent' : user.role === 'admin' ? '🔐 Admin' : 'Customer'}</div>}
                  </div>
                </div>
                <button
                  className="btn-logout"
                  onClick={() => { logout(); navigate('/'); }}
                  aria-label="Logout"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="auth-links">
                <Link to="/login" className="auth-link">Login</Link>
                <Link to="/register" className="btn-primary">Sign Up</Link>
              </div>
            )}

            {user?.role === 'agent' && (
              <Link to="/agent/dashboard" className="action-link agent-link" title="Agent Portal">
                📊
              </Link>
            )}

            {/* Agent apply / portal link for non-agents */}
            {user?.role !== 'agent' && (
              <Link to="/agent/apply" className="action-link agent-apply" title="Become an Agent">
                Agent
              </Link>
            )}

            {/* Chat button moved to topbar */}

            {user?.role === 'admin' && (
              <Link to="/admin/dashboard" className="action-link admin-link" title="Admin Panel">
                ⚙️
              </Link>
            )}

            <Link to="/dashboard" className="action-link">My Orders</Link>

            <Link to="/cart" className="action-link cart" aria-label={`Cart with ${cartCount} items`}>
              <span className="cart-icon">🛒</span>
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </Link>
          </div>

        </div>
      </div>

      {/* MOBILE OVERLAY */}
      {mobileOpen && <div className="mobile-overlay" onClick={() => setMobileOpen(false)}></div>}

    </header>
  );
}
import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import heroLeftImg    from '../../assets/shoe4.jpg';
import heroCenterImg  from '../../assets/maleBest.jpg';
import heroRightImg   from '../../assets/airforce.jpg';
import mainPic        from '../../assets/banner1.jpeg';
import heroCenter2Img from '../../assets/shoe6.jpg';
import { AuthContext } from '../../context/AuthContext';
import './Banner.css';

const CATEGORIES = [
  { value: 'all',         label: 'All',         icon: '◈' },
  { value: 'men',         label: "Men's",        icon: '♟' },
  { value: 'women',       label: "Women's",      icon: '◇' },
  { value: 'shoes',       label: 'Shoes',        icon: '◉' },
  { value: 'accessories', label: 'Accessories',  icon: '◈' },
  { value: 'sportswear',  label: 'Sport',        icon: '▷' },
  { value: 'bags',        label: 'Bags',         icon: '⬡' },
  { value: 'phones',      label: 'Phones',       icon: '▣' },
  { value: 'electronics', label: 'Electronics',  icon: '◎' },
];

export default function Banner({ onCategorySelect }) {
  const { user } = useContext(AuthContext);
  const [revealed, setRevealed] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setRevealed(true), 80);
    return () => clearTimeout(timer);
  }, []);

  const handleCategoryClick = (value) => {
    setActiveCategory(value);
    if (onCategorySelect) onCategorySelect(value);
    setTimeout(() => {
      const el = document.querySelector('.products-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <section className="banner-section" aria-label="Featured products and categories">

      {/* ── CATEGORY RAIL ──────────────────────────────────── */}
      <nav className="category-rail" aria-label="Shop by category">
        <div className="category-rail-inner">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              className={`cat-chip ${activeCategory === cat.value ? 'active' : ''}`}
              onClick={() => handleCategoryClick(cat.value)}
              aria-pressed={activeCategory === cat.value}
            >
              <span className="cat-chip-icon" aria-hidden="true">{cat.icon}</span>
              <span className="cat-chip-label">{cat.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* ── HERO GRID ──────────────────────────────────────── */}
      <div className="hero-grid">

        {/* COLUMN 1 — Promo card + thumbnails */}
        <div className={`hero-col col-promo reveal ${revealed ? 'in' : ''}`}>

          {/* Main promo card */}
          <div className="promo-card" onClick={() => navigate('/deals')}>
            <div className="promo-card-bg" aria-hidden="true" />
            <div className="promo-card-content">
              <span className="promo-eyebrow">New Arrivals</span>
              <h2 className="promo-headline">Latest<br/>Styles</h2>
              <p className="promo-offer">
                <span className="promo-offer-num">50</span>
                <span className="promo-offer-rest">%<br/>OFF</span>
              </p>
              <button
                className="promo-cta"
                onClick={(e) => { e.stopPropagation(); navigate('/deals'); }}
                aria-label="Shop new arrivals with up to 50% off"
              >
                Shop Now
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M3 8h10M9 4l4 4-4 4"/>
                </svg>
              </button>
            </div>
            <div className="promo-card-visual">
              <img src={heroRightImg} alt="Featured sneaker" loading="eager" />
            </div>
          </div>

          {/* Thumbnail row */}
          <div className="thumb-row">
            <button
              className="thumb-card"
              onClick={() => handleCategoryClick('shoes')}
              aria-label="Browse shoes"
            >
              <img src={heroCenter2Img} alt="Sneaker style 1" loading="lazy" />
              <span className="thumb-label">Sneakers</span>
            </button>
            <button
              className="thumb-card"
              onClick={() => handleCategoryClick('shoes')}
              aria-label="Browse shoes"
            >
              <img src={heroLeftImg} alt="Sneaker style 2" loading="lazy" />
              <span className="thumb-label">Footwear</span>
            </button>
          </div>
        </div>

        {/* COLUMN 2 — Tall center image */}
        <div
          className={`hero-col col-tall reveal ${revealed ? 'in' : ''}`}
          style={{ transitionDelay: '0.12s' }}
          onClick={() => handleCategoryClick('men')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && handleCategoryClick('men')}
          aria-label="Shop Men's Fashion"
        >
          <div className="tall-card">
            <img src={heroCenterImg} alt="Men's fashion lookbook" loading="eager" />
            <div className="tall-card-overlay">
              <div className="tall-card-tag">Men's Fashion</div>
              <p className="tall-card-sub">Explore the collection</p>
            </div>
          </div>
        </div>

        {/* COLUMN 3 — Tall right image */}
        <div
          className={`hero-col col-tall reveal ${revealed ? 'in' : ''}`}
          style={{ transitionDelay: '0.22s' }}
          onClick={() => handleCategoryClick('women')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && handleCategoryClick('women')}
          aria-label="Shop Women's Fashion"
        >
          <div className="tall-card">
            <img src={mainPic} alt="Women's fashion lookbook" loading="eager" />
            <div className="tall-card-overlay">
              <div className="tall-card-tag">Women's Fashion</div>
              <p className="tall-card-sub">Discover new looks</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

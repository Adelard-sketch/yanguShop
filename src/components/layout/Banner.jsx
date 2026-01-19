import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import heroLeftImg from '../../assets/shoe4.jpg';
import heroCenterImg from '../../assets/maleBest.jpg';
import heroRightImg from '../../assets/airforce.jpg';
import mainPic from '../../assets/banner1.jpeg';
import heroCenter2Img from '../../assets/shoe6.jpg';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import './Banner.css';

export default function Banner({ onCategorySelect }) {
  const { user } = useContext(AuthContext);
  const [revealed, setRevealed] = useState(false);
  const navigate = useNavigate();

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'men', label: 'Men\'s Fashion' },
    { value: 'women', label: 'Women\'s Fashion' },
    { value: 'shoes', label: 'Shoes & Sneakers' },
    { value: 'accessories', label: 'Accessories' },
    { value: 'sportswear', label: 'Sportswear' },
    { value: 'bags', label: 'Bags & Luggage' },
    { value: 'phones', label: 'Phones' },
    { value: 'electronics', label: 'Electronics' },
  ];

  useEffect(() => {
    const timer = setTimeout(() => setRevealed(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleCategoryClick = (categoryValue) => {
    if (onCategorySelect) {
      onCategorySelect(categoryValue);
    }
    // Scroll to products section
    setTimeout(() => {
      const element = document.querySelector('.products-section');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <section className="hero-section container">
      <div className="banner-wrapper">
        <div className="categories-sidebar">
          <h3 className="categories-title">Categories</h3>
          <div className="categories-list">
            {categories.map((cat) => (
              <button
                key={cat.value}
                className="category-btn"
                onClick={() => handleCategoryClick(cat.value)}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="banner-grid">
          <div className={`promo-left reveal ${revealed ? 'in' : ''}`}>
            <div className="promo-card">
              <div className="promo-copy">
                <h4 className="promo-sub">NEW ARRIVALS</h4>
                <h2 className="promo-title">Latest Styles</h2>
                <p className="promo-desc">Up to 50% off</p>
                <button className="promo-btn">Shop Now</button>
              </div>
              <img 
                src={heroRightImg} 
                alt="Featured sneaker" 
                className="promo-visual" 
              />
            </div>

            <div className="promo-thumbs">
              <div className="thumb">
                <img 
                  src={heroCenter2Img} 
                  alt="Sneaker 1" 
                />
              </div>
              <div className="thumb">
                <img 
                  src={heroLeftImg} 
                  alt="Sneaker 2" 
                />
              </div>
            </div>
          </div>

          <div className={`promo-tall promo-center reveal ${revealed ? 'in' : ''}`} style={{ transitionDelay: '0.1s' }}>
            <img 
              src={heroCenterImg} 
              alt="Fashion model center" 
            />
          </div>

          <div className={`promo-tall promo-right reveal ${revealed ? 'in' : ''}`} style={{ transitionDelay: '0.2s' }}>
            <img 
              src={mainPic} 
              alt="Fashion model right" 
            />
          </div>
        </div>
      </div>
    </section>
  );
}
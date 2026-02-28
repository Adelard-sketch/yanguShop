import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../common/ProductCard';
import { CartContext } from '../../context/CartContext';
import './DealsCarousel.css';

export default function DealsCarousel({ products = [] }) {
  const [timeLeft, setTimeLeft] = useState({ hours: 20, minutes: 45, seconds: 12 });
  const { add: addToCart } = useContext(CartContext);
  const trackRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        let { hours, minutes, seconds } = prev;
        
        if (seconds > 0) {
          seconds--;
        } else if (minutes > 0) {
          minutes--;
          seconds = 59;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
          seconds = 59;
        } else {
          // Reset timer
          hours = 23;
          minutes = 59;
          seconds = 59;
        }
        
        return { hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Auto-scroll animation
  useEffect(() => {
    const track = trackRef.current;
    if (!track || products.length === 0) return;

    let scrollPosition = 0;
    const scrollSpeed = 1; // pixels per interval
    const scrollInterval = setInterval(() => {
      scrollPosition += scrollSpeed;
      
      // Reset to beginning when reaching the end
      if (scrollPosition >= track.scrollWidth - track.clientWidth) {
        scrollPosition = 0;
      }
      
      track.scrollLeft = scrollPosition;
    }, 30);

    // Pause animation on hover
    const handleMouseEnter = () => clearInterval(scrollInterval);
    const handleMouseLeave = () => {
      clearInterval(scrollInterval);
      // Resume animation after hover
      let newScrollPosition = track.scrollLeft;
      const resumeInterval = setInterval(() => {
        newScrollPosition += scrollSpeed;
        
        if (newScrollPosition >= track.scrollWidth - track.clientWidth) {
          newScrollPosition = 0;
        }
        
        track.scrollLeft = newScrollPosition;
      }, 30);
      
      return () => clearInterval(resumeInterval);
    };

    track.addEventListener('mouseenter', handleMouseEnter);
    track.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      clearInterval(scrollInterval);
      track.removeEventListener('mouseenter', handleMouseEnter);
      track.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [products.length]);

  const formatTime = (num) => String(num).padStart(2, '0');

  if (!products || products.length === 0) return null;

  return (
    <section className="deals-root container">
      <div className="deals-header">
        <h3> Flash Deals of the Day</h3>
        <div className="deals-timer">
          {formatTime(timeLeft.hours)} : {formatTime(timeLeft.minutes)} : {formatTime(timeLeft.seconds)} Left
        </div>
      </div>

      <div className="deals-track" ref={trackRef}>
        {products.map(p => (
          <div 
            key={p._id || p.id} 
            className="deals-item"
          >
            <ProductCard product={p} onAdd={addToCart} />
          </div>
        ))}
      </div>

      <p className="deals-hint">⬅️ Scroll to see more deals ➡️</p>
    </section>
  );
}

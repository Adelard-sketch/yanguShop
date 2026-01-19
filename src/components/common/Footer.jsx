import React from 'react';
import './Footer.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3 className="footer-title">YanguShop</h3>
          <p className="footer-description">
            Your trusted platform for quality products and seamless shopping experience.
          </p>
        </div>

        <div className="footer-section">
          <h4 className="footer-heading">Quick Links</h4>
          <ul className="footer-links">
            <li><a href="/">Home</a></li>
            <li><a href="/shop">Shop</a></li>
            <li><a href="/about">About Us</a></li>
            <li><a href="/contact">Contact</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4 className="footer-heading">Customer Service</h4>
          <ul className="footer-links">
            <li><a href="/faq">FAQ</a></li>
            <li><a href="/shipping">Shipping Info</a></li>
            <li><a href="/returns">Returns & Exchange</a></li>
            <li><a href="/support">Support</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4 className="footer-heading">Legal</h4>
          <ul className="footer-links">
            <li><a href="/privacy">Privacy Policy</a></li>
            <li><a href="/terms">Terms & Conditions</a></li>
            <li><a href="/cookies">Cookie Policy</a></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {currentYear} YanguShop. All rights reserved.</p>
        <div className="footer-social">
          <a href="#" className="social-link">Facebook</a>
          <a href="#" className="social-link">Twitter</a>
          <a href="#" className="social-link">Instagram</a>
        </div>
      </div>
    </footer>
  );
}

import React, { useContext } from 'react';
import './HomePage.css';
import bannerImg from '../../assets/banner1.jpeg';
import SAMPLE_PRODUCTS from '../../data/sampleProducts';
import { Link } from 'react-router-dom';
import { CartContext } from '../../context/CartContext';
import { resolveImageUrl } from '../../services/product.service';

export default function HomePage() {
  const { add } = useContext(CartContext);

  return (
    <div className="homepage">
      {/* Holiday Sale Banner */}
      <section className="holiday-sale">
        <div className="banner">
          <div className="banner-content">
            <h1>Holiday Sale</h1>
            <p>Up to 60% off on selected items!</p>
            <button className="btn-primary">Shop Now</button>
          </div>

          <div className="banner-media" aria-hidden>
            <img src={bannerImg} alt="Holiday offers" />
          </div>
        </div>
      </section>

      {/* Products grid after banner */}
      <section className="product-grid store">
        <h2>Products</h2>
        <div className="store-grid">
          {SAMPLE_PRODUCTS.map((p) => (
            <div className="store-card" key={p._id}>
              <Link to={`/product/${p._id}`} className="store-media">
                <img src={resolveImageUrl(p.image)} alt={p.name} className="store-image" />
              </Link>

              <div className="store-meta">
                <button className="add-link" onClick={() => add(p)} disabled={!p.inStock}>{p.inStock ? 'Add to Cart' : 'Out of stock'}</button>
                <h3 className="store-title">{p.name || 'Product'}</h3>

                <div className="store-prices">
                  <span className="store-price">UGX {p.price}</span>
                  {p.originalPrice && <span className="store-old">UGX {p.originalPrice}</span>}
                </div>

                <div className="store-meta-extra">
                  <span className="rating">★ {p.rating} ({p.reviews})</span>
                  <span className="stock">{p.stockCount > 0 ? `${p.stockCount} left` : 'Out of stock'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>&copy; 2025 YanguShop. All rights reserved.</p>
        <div className="social-links">
          <a href="/facebook">Facebook</a>
          <a href="/twitter">Twitter</a>
          <a href="/instagram">Instagram</a>
        </div>
      </footer>
    </div>
  );
}

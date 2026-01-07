import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';

import './Home.css';
import Banner from '../components/layout/Banner';
import DealsCarousel from '../components/layout/DealsCarousel';

import SAMPLE_PRODUCTS from '../data/sampleProducts';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { resolveImageUrl } from '../services/product.service';

export default function Home() {
  const [products, setProducts] = useState(SAMPLE_PRODUCTS);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const { add: addToCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let isMounted = true;

    async function loadProducts() {
      try {
        // Use SAMPLE_PRODUCTS by default - they have proper webpack-bundled images
        // Only fetch from API if you need real-time product updates
        // const service = require('../services/product.service')?.default;
        // if (!service?.listProducts) return;
        // setIsLoading(true);
        // const result = await service.listProducts();
        // if (isMounted) {
        //   const products = Array.isArray(result) ? result : result?.data || [];
        //   if (products.length) {
        //     setProducts(products);
        //   }
        // }
      } catch (err) {
        console.error('Failed to load products:', err);
        // fallback to SAMPLE_PRODUCTS silently
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadProducts();
    return () => {
      isMounted = false;
    };
  }, []);

  // Scroll to products when category changes (from banner)
  useEffect(() => {
    if (selectedCategory !== 'all') {
      setTimeout(() => {
        const element = document.querySelector('.products-section');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, [selectedCategory]);

  // Filter products by selected category (case-insensitive). 'all' shows everything.
  const filteredProducts = (selectedCategory === 'all' || !selectedCategory)
    ? products
    : products.filter(p => (p.category || '').toLowerCase() === (selectedCategory || '').toLowerCase());

  const getCategoryLabel = () => {
    if (selectedCategory === 'all') return 'All Products';
    const labels = {
      shoes: 'Shoes & Sneakers',
      fashion: 'Fashion & Apparel',
      electronics: 'Electronics',
      accessories: 'Accessories',
      bags: 'Bags & Luggage',
      home: 'Home & Living'
    };
    return labels[selectedCategory] || 'Products';
  };

  return (
    <div className="home">
      <Banner onCategorySelect={setSelectedCategory} />

      <DealsCarousel products={products.slice(0, 8)} />

      <section className="products-section catalog container">
        <main className="catalog-content">
          <header className="catalog-header">
            <div className="header-top">
              <h2>{getCategoryLabel()}</h2>
              {selectedCategory !== 'all' && (
                <button 
                  className="clear-filter"
                  onClick={() => setSelectedCategory('all')}
                >
                  ✕ Clear Filter
                </button>
              )}
            </div>
          </header>

          {isLoading ? (
            <div className="loading">Loading products…</div>
          ) : filteredProducts.length === 0 ? (
            <div className="no-products">
              <p>No products found in this category</p>
            </div>
          ) : (
            <div className="store-grid">
              {filteredProducts.map(product => {
                const id = product._id || product.id;

                return (
                  <article className="store-card" key={id}>
                    <Link to={`/product/${id}`} className="store-media">
                      <img
                        src={resolveImageUrl(product.image)}
                        alt={product.name}
                        className="store-image"
                        loading="lazy"
                      />
                    </Link>

                    <div className="store-meta">
                      <button
                        className="add-link"
                        onClick={() => {
                          if (!user) return navigate('/login', { state: { from: location.pathname } });
                          addToCart?.(product);
                        }}
                        disabled={!product.inStock}
                      >
                        {product.inStock ? 'Add to Cart' : 'Out of stock'}
                      </button>

                      <h3 className="store-title">
                        {product.name || 'Product'}
                      </h3>

                      <div className="store-prices">
                        <span className="store-price">
                          UGX {product.price}
                        </span>

                        {product.originalPrice && (
                          <span className="store-old">
                            UGX {product.originalPrice}
                          </span>
                        )}
                      </div>

                      <div className="store-meta-extra">
                        <span className="rating">★ {product.rating} ({product.reviews})</span>
                        <span className="stock">{product.stockCount > 0 ? `${product.stockCount} left` : 'Out of stock'}</span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </main>
      </section>
    </div>
  );
}

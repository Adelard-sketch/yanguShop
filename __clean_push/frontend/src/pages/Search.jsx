import React, { useState, useEffect, useContext } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import './Search.css';
import SAMPLE_PRODUCTS from '../data/sampleProducts';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { resolveImageUrl } from '../services/product.service';

export default function Search() {
  const [searchParams] = useSearchParams();
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const query = searchParams.get('query') || '';
  const categoryParam = searchParams.get('category') || 'all';

  const { add: addToCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);

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
    setSelectedCategory(categoryParam);
  }, [categoryParam]);

  useEffect(() => {
    setIsLoading(true);

    // Simulate loading delay
    const timer = setTimeout(() => {
      // Allow category-only filtering: if no query but category selected, show products in that category
      const queryLower = (query || '').toLowerCase();

      let results = SAMPLE_PRODUCTS.filter(product => {
        const prodName = (product.name || '').toLowerCase();
        const prodDesc = (product.description || '').toLowerCase();
        const prodCat = (product.category || '').toLowerCase();

        const matchesQuery = queryLower
          ? (prodName.includes(queryLower) || prodDesc.includes(queryLower) || prodCat.includes(queryLower))
          : true;

        // special mapping for phones category to include electronics/phone names
        let matchesCategory = true;
        if (selectedCategory && selectedCategory !== 'all') {
          if (selectedCategory === 'phones') {
            matchesCategory = prodCat === 'electronics' || prodName.includes('phone') || prodName.includes('iphone');
          } else {
            matchesCategory = prodCat === selectedCategory;
          }
        }

        return matchesQuery && matchesCategory;
      });

      setFilteredProducts(results);
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, selectedCategory]);

  const handleCategoryChange = (newCategory) => {
    setSelectedCategory(newCategory);
    const params = new URLSearchParams();
    params.set('query', query);
    if (newCategory !== 'all') {
      params.set('category', newCategory);
    }
    navigate(`/search?${params.toString()}`);
  };

  const handleAddToCart = (product) => {
    if (!user) {
      navigate('/login', { state: { from: '/search' } });
      return;
    }
    addToCart?.(product);
  };

  return (
    <div className="search-page">
      <div className="container">
        {/* Search Results Header */}
        <div className="search-header">
          <h1>Search Results</h1>
          {query && (
            <p className="search-query">
              Results for "<strong>{query}</strong>"
              {selectedCategory !== 'all' && (
                <span> in <strong>{categories.find(c => c.value === selectedCategory)?.label}</strong></span>
              )}
            </p>
          )}
        </div>

        {/* Filters + Results (side-by-side) */}
        <div className="search-filters">
          <div className="filter-section">
            <h3>Categories</h3>
            <div className="category-list">
              {categories.map(category => (
                <label key={category.value} className="category-checkbox">
                  <input
                    type="radio"
                    name="category"
                    value={category.value}
                    checked={selectedCategory === category.value}
                    onChange={() => handleCategoryChange(category.value)}
                  />
                  <span className="checkbox-label">{category.label}</span>
                  {selectedCategory === category.value && (
                    <span className="check-mark">✓</span>
                  )}
                </label>
              ))}
            </div>
          </div>

          <div className="search-results">
          {isLoading ? (
            <div className="loading">Searching products…</div>
          ) : filteredProducts.length === 0 ? (
            <div className="no-products">
              <div className="no-products-icon">📭</div>
              <h2>Product Not Available</h2>
              <p>
                {query
                  ? `No products found matching "${query}"`
                  : 'Please enter a search query'}
              </p>
              <Link to="/shop" className="btn-back">
                Continue Shopping
              </Link>
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
                        onClick={() => handleAddToCart(product)}
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

          {filteredProducts.length > 0 && (
            <div className="results-info">
              Found {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}

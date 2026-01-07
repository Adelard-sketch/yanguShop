import React, { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './ProductCard.css';
import defaultImg from '../../assets/iphones.jpg';
import { AuthContext } from '../../context/AuthContext';
import { resolveImageUrl } from '../../services/product.service';

export default function ProductCard({ product, onAdd }) {
  const image = resolveImageUrl(product.image || product.imageUrl) || defaultImg;
  // Debug: log resolved image URL for Dr Martens variants to help diagnose broken images
  if (product && product.name && product.name.toLowerCase().includes('dr martens')) {
    // eslint-disable-next-line no-console
    console.log('Resolved product image for', product._id, product.name, image);
  }
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleAdd = () => {
    if (!user) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    onAdd && onAdd(product);
  };

  return (
    <div className="product-card">
      <Link to={`/product/${product._id}`} className="product-media">
        <img
          src={image}
          alt={product.name}
          className="product-image"
          onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = defaultImg; }}
        />
      </Link>

      <div className="product-info">
        <h3 className="product-title"><Link to={`/product/${product._id}`}>{product.name}</Link></h3>
        {product.description && <p className="product-desc">{product.description}</p>}

        <div className="product-meta">
          <div className="price-row">
            <span className="price">UGX {product.price}</span>
            {product.originalPrice && <span className="old-price">UGX {product.originalPrice}</span>}
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="discount-badge">-{Math.round((1 - product.price / product.originalPrice) * 100)}%</span>
            )}
          </div>

          <div className="meta-row">
            <span className="rating">★ {product.rating} ({product.reviews})</span>
            <span className="stock-count">{product.stockCount > 0 ? `${product.stockCount} left` : 'Out of stock'}</span>
          </div>

          <div className="actions-row">
            <button className="btn-add" onClick={handleAdd} disabled={!product.inStock}>
              <span style={{fontSize:14}}>{product.inStock ? 'Add to cart' : 'Notify me'}</span>
            </button>
            <Link to={`/product/${product._id}`} className="btn-view">View</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

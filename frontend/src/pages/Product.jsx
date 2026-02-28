import React, { useEffect, useState, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import productService from '../services/product.service';
import { CartContext } from '../context/CartContext';

export default function Product() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const { add } = useContext(CartContext);

  useEffect(() => {
    let mounted = true;
    productService.getProduct(id)
      .then(p => { if (mounted) setProduct(p); })
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false };
  }, [id]);

  if (loading) return <div style={{padding:20}}>Loading...</div>;
  if (!product) return <div style={{padding:20}}>Product not found</div>;

  const imageUrl = productService.resolveImageUrl(product.image || product.images?.[0]);
  const shop = product.shop || {};

  const addToCart = () => {
    const item = { ...product, qty };
    add(item);
  };

  return (
    <div style={{ padding: 20, display: 'flex', gap: 24, alignItems: 'flex-start' }}>
      <div style={{ flex: '0 0 420px' }}>
        {imageUrl ? (
          <img src={imageUrl} alt={product.name} style={{ width: '100%', borderRadius: 8 }} />
        ) : (
          <div style={{ width: '100%', height: 300, background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>No image</div>
        )}
        {product.images && product.images.length > 1 && (
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            {product.images.map((img, i) => (
              <img key={i} src={productService.resolveImageUrl(img)} alt={`${product.name}-${i}`} style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 4 }} />
            ))}
          </div>
        )}
      </div>

      <div style={{ flex: 1, maxWidth: 720 }}>
        <h1 style={{ marginTop: 0 }}>{product.name}</h1>
        <div style={{ color: '#666', marginBottom: 8 }}>{product.shortDescription || ''}</div>
        <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>UGX {product.price?.toLocaleString()}</div>
        {product.originalPrice && <div style={{ textDecoration: 'line-through', color: '#999' }}>UGX {product.originalPrice.toLocaleString()}</div>}

        <div style={{ marginTop: 12, marginBottom: 12 }}>
          <strong>Shop:</strong> {shop.name ? <Link to={`/shop/${shop._id}`}>{shop.name}</Link> : 'Marketplace'}
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>Quantity: </label>
          <input type="number" min={1} value={qty} onChange={e => setQty(Math.max(1, parseInt(e.target.value || '1')))} style={{ width: 80, marginLeft: 8 }} />
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button onClick={addToCart} style={{ padding: '10px 16px' }}>Add to cart</button>
          <button onClick={() => { add({ ...product, qty }); window.location.href = '/checkout'; }} style={{ padding: '10px 16px' }}>Buy now</button>
        </div>

        <section style={{ marginTop: 20 }}>
          <h3>Description</h3>
          <div style={{ whiteSpace: 'pre-wrap', color: '#333' }}>{product.description}</div>
        </section>

        {product.reviews && product.reviews.length > 0 && (
          <section style={{ marginTop: 20 }}>
            <h3>Reviews</h3>
            <ul style={{ paddingLeft: 16 }}>
              {product.reviews.map((r, i) => (
                <li key={i} style={{ marginBottom: 8 }}>
                  <strong>{r.userName || r.user || 'User'}</strong> — <span style={{ color: '#666' }}>{r.rating}★</span>
                  <div style={{ color: '#333' }}>{r.comment}</div>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import productService from '../services/product.service';
import ProductCard from '../components/common/ProductCard';
import Footer from '../components/common/Footer';
import './Home.css';
import SAMPLE_PRODUCTS from '../data/sampleProducts';

export default function Category() {
  const { slug } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    productService.listProducts({ category: slug })
      .then(list => { if (mounted) setProducts(list || []); })
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false };
  }, [slug]);

  const title = slug ? slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'Category';

  // Determine which products to show: prefer fetched `products`, otherwise fallback
  // to SAMPLE_PRODUCTS. Matching is case-insensitive and `all` shows everything.
  const displayProducts = (products && products.length)
    ? products
    : (slug === 'all' || !slug)
      ? SAMPLE_PRODUCTS
      : SAMPLE_PRODUCTS.filter(s => (s.category || '').toLowerCase() === (slug || '').toLowerCase());

  return (
    <div className="home-root">
      <div className="container" style={{padding:'16px 24px', maxWidth:1200}}>
        <h2>{title}</h2>
        {loading ? <div>Loading...</div> : (
          <div className="product-grid">
            {displayProducts.map(p => <ProductCard key={p._id} product={p} />)}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

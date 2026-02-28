import React, { useEffect, useState } from 'react';
import productService from '../services/product.service';
import ProductCard from '../components/common/ProductCard';
import Footer from '../components/common/Footer';
import './Home.css';
import shoesHero from '../assets/iphones.jpg';
import SAMPLE_PRODUCTS from '../data/sampleProducts';

export default function Shoes() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    // request products in category 'shoes' or 'footwear'
    productService.listProducts({ category: 'shoes' })
      .then(list => { if (mounted) setProducts(list || []); })
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false };
  }, []);

  return (
    <div className="home-root">
      <section className="shoes-hero">
        <div className="container" style={{maxWidth:1200, margin:'0 auto', display:'flex', alignItems:'center', gap:24}}>
          <div style={{flex:1}}>
            <h1 style={{fontSize:56, margin:0}}>Summer Kicks</h1>
            <p style={{color:'var(--muted)'}}>New arrivals and curated picks — step up your game.</p>
            <a href="/shop" className="btn-primary" style={{marginTop:12, display:'inline-block'}}>View Collection</a>
          </div>
          <div style={{width:420}}>
            <img src={shoesHero} alt="shoes-hero" style={{width:'100%', borderRadius:8}} />
          </div>
        </div>
      </section>

      <section className="container" style={{maxWidth:1200, margin:'20px auto'}}>
        <h2>New Arrivals</h2>
        {loading ? <div>Loading...</div> : (
          <div className="product-grid" style={{marginTop:12}}>
            {(products.length ? products : SAMPLE_PRODUCTS.filter(s=>s.category==='shoes' || s.category==='footwear')).map(p => <ProductCard key={p._id} product={p} />)}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}

import React, { useEffect, useState, useContext } from 'react';
import productService from '../services/product.service';
import ProductCard from '../components/common/ProductCard';
import { CartContext } from '../context/CartContext';
import SAMPLE_PRODUCTS from '../data/sampleProducts';

export default function Shop() {
  const [products, setProducts] = useState(SAMPLE_PRODUCTS);
  const [loading, setLoading] = useState(false);
  const { add } = useContext(CartContext);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    
    // Use SAMPLE_PRODUCTS with proper webpack-bundled images
    // API call disabled - sample products have better image handling
    // productService.listProducts()
    //   .then(data => { 
    //     if (mounted && data && data.length > 0) {
    //       setProducts(data); 
    //     }
    //   })
    //   .catch(() => {
    //     if (mounted) console.log('Using sample products');
    //   })
    //   .finally(() => mounted && setLoading(false));
    
    setLoading(false);
    return () => { mounted = false };
  }, []);

  return (
    <div style={{padding:20}}>
      <h1>Shop</h1>
      {loading && <div>Loading...</div>}
      <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))', gap:12}}>
        {products.map(p => (
          <ProductCard key={p._id} product={p} onAdd={() => add(p)} />
        ))}
      </div>
    </div>
  );
}

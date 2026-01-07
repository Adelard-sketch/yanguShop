import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import productService from '../services/product.service';
import { CartContext } from '../context/CartContext';

export default function Product() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const { add } = useContext(CartContext);

  useEffect(() => {
    let mounted = true;
    productService.getProduct(id).then(p => { if (mounted) setProduct(p); }).finally(() => mounted && setLoading(false));
    return () => { mounted = false };
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!product) return <div>Product not found</div>;

  return (
    <div style={{padding:20}}>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      <div><strong>UGX {product.price}</strong></div>
      <div style={{marginTop:12}}>
        <button onClick={() => add(product)}>Add to cart</button>
      </div>
    </div>
  );
}

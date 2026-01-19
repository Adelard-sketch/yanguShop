import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import productService from '../services/product.service';
import './AdminProducts.css';

export default function AdminProducts() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'admin') navigate('/login');
  }, [user, navigate]);

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('phones');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const categories = [
    { value: 'phones', label: 'Phones & Tablets' },
    { value: 'men', label: "Men's Fashion" },
    { value: 'women', label: "Women's Fashion" },
    { value: 'shoes', label: 'Shoes & Sneakers' },
    { value: 'accessories', label: 'Accessories' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'bags', label: 'Bags & Luggage' }
  ];

  const submit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) return setError('Product name is required');
    if (!price || Number.isNaN(Number(price))) return setError('Valid price is required');

    try {
      setLoading(true);
      const fd = new FormData();
      fd.append('name', name);
      fd.append('price', Number(price));
      fd.append('category', category);
      if (description) fd.append('description', description);
      if (imageFile) fd.append('image', imageFile);

      const res = await productService.createProduct(fd);
      // navigate to product page or list
      navigate(`/product/${res._id}`);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-products-page">
      <div className="admin-products-header">
        <h1>Add New Product</h1>
        <p className="muted">Create and upload product details for the storefront</p>
      </div>

      <form className="product-form" onSubmit={submit} encType="multipart/form-data">
        {error && <div className="form-error">{error}</div>}

        <div className="form-row">
          <label>Product Name</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Premium Running Shoes" />
        </div>

        <div className="form-row">
          <label>Category</label>
          <select value={category} onChange={e => setCategory(e.target.value)}>
            {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>

        <div className="form-row">
          <label>Price</label>
          <input type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} placeholder="0.00" />
        </div>

        <div className="form-row">
          <label>Description (optional)</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} />
        </div>

        <div className="form-row">
          <label>Image</label>
          <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0] || null)} />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Uploading...' : 'Create Product'}</button>
        </div>
      </form>
    </div>
  );
}

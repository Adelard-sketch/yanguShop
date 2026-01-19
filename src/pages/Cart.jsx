import React, { useContext } from 'react';
import { CartContext } from '../context/CartContext';
import { Link } from 'react-router-dom';
import { resolveImageUrl } from '../services/product.service';
import './Cart.css';
import { formatUGX } from '../utils/formatCurrency';

export default function Cart() {
  const { items, remove, updateQty, total, clear } = useContext(CartContext);

  return (
    <div className="cart-page">
      {/* Header */}
      <div className="cart-header">
        <h1>Shopping Cart</h1>
        <p className="cart-count">{items.length} {items.length === 1 ? 'item' : 'items'}</p>
      </div>

      <div className="cart-container">
        {/* Cart Items */}
        <div className="cart-items-section">
          {items.length === 0 ? (
            <div className="empty-cart">
              <div className="empty-icon">🛒</div>
              <h2>Your cart is empty</h2>
              <p>Add some products to get started!</p>
              <Link to="/shop" className="btn-continue-shopping">
                Continue Shopping
              </Link>
            </div>
          ) : (
            <>
              <div className="items-list">
                {items.map(it => (
                  <div key={it._id} className="cart-item">
                    <div className="item-image">
                      <img src={resolveImageUrl(it.image || it.imageUrl) || 'https://via.placeholder.com/100'} alt={it.name} />
                    </div>

                    <div className="item-details">
                      <h3 className="item-name">{it.name}</h3>
                      <p className="item-description">{it.description && it.description.substring(0, 60)}</p>
                      <p className="item-price">{formatUGX((it.price || 0))}</p>
                    </div>

                    <div className="item-quantity">
                      <label htmlFor={`qty-${it._id}`}>Qty:</label>
                      <div className="qty-control">
                        <button
                          className="qty-btn"
                          onClick={() => updateQty(it._id, Math.max(1, (it.qty || 1) - 1))}
                        >
                          −
                        </button>
                        <input
                          id={`qty-${it._id}`}
                          type="number"
                          value={it.qty}
                          min={1}
                          onChange={e => updateQty(it._id, Math.max(1, parseInt(e.target.value || '1')))}
                          className="qty-input"
                        />
                        <button
                          className="qty-btn"
                          onClick={() => updateQty(it._id, (it.qty || 1) + 1)}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="item-subtotal">
                      <p className="subtotal-label">Subtotal</p>
                      <p className="subtotal-value">UGX {((it.price || 0) * (it.qty || 1)).toFixed(2)}</p>
                    </div>

                    <button
                      className="btn-remove"
                      onClick={() => remove(it._id)}
                      title="Remove from cart"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Order Summary */}
        {items.length > 0 && (
          <div className="cart-summary">
            <div className="summary-card">
              <h2>Order Summary</h2>

              <div className="summary-row">
                <span>Subtotal</span>
                <span>{formatUGX(total)}</span>
              </div>

              <div className="summary-row">
                <span>Shipping</span>
                <span className="shipping-cost">Free</span>
              </div>

              <div className="summary-row">
                <span>Tax</span>
                <span>{formatUGX(0)}</span>
              </div>

              <div className="summary-divider"></div>

              <div className="summary-row total-row">
                <span>Total</span>
                <span className="total-amount">{formatUGX(total)}</span>
              </div>

              <Link to="/checkout" className="btn-checkout">
                Proceed to Checkout
              </Link>

              <Link to="/shop" className="btn-continue">
                Continue Shopping
              </Link>

              <button onClick={clear} className="btn-clear-cart">
                Clear Cart
              </button>
            </div>

            {/* Promo Code */}
            <div className="promo-section">
              <h3>Promo Code</h3>
              <div className="promo-input-group">
                <input
                  type="text"
                  placeholder="Enter promo code"
                  className="promo-input"
                />
                <button className="btn-apply">Apply</button>
              </div>
              <p className="promo-hint">Enter a promo code if you have one</p>
            </div>
          </div>
        )}
      </div>

      {/* Trust Badges */}
      {items.length > 0 && (
        <div className="trust-section">
          <div className="trust-item">
            <span className="trust-icon">🛡️</span>
            <p>Secure Checkout</p>
          </div>
          <div className="trust-item">
            <span className="trust-icon">📦</span>
            <p>Fast Shipping</p>
          </div>
          <div className="trust-item">
            <span className="trust-icon">↩️</span>
            <p>Easy Returns</p>
          </div>
          <div className="trust-item">
            <span className="trust-icon">💬</span>
            <p>24/7 Support</p>
          </div>
        </div>
      )}
    </div>
  );
}

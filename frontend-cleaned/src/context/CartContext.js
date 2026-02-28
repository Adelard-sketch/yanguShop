import React, { createContext, useState } from 'react';

export const CartContext = createContext();

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const add = (product) => setItems((s) => {
    const existing = s.find(i => i._id === product._id);
    if (existing) return s.map(i => i._id === product._id ? { ...i, qty: (i.qty||1)+1 } : i);
    return [...s, { ...product, qty: 1 }];
  });
  const remove = (productId) => setItems((s) => s.filter(i => i._id !== productId));
  const updateQty = (productId, qty) => setItems((s) => s.map(i => i._id === productId ? { ...i, qty } : i));
  const clear = () => setItems([]);
  const total = items.reduce((sum, it) => sum + (it.price || 0) * (it.qty || 1), 0);

  return (
    <CartContext.Provider value={{ items, add, remove, updateQty, clear, total }}>
      {children}
    </CartContext.Provider>
  );
}

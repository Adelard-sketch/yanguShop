import React from 'react';
import './LeftRail.css';

const icons = [
  { key: 'categories', label: 'Categories' },
  { key: 'account', label: 'Account' },
  { key: 'orders', label: 'Orders' },
  { key: 'favorites', label: 'Wishlist' },
  { key: 'gift', label: 'Gifts' },
  { key: 'help', label: 'Help' },
];

export default function LeftRail() {
  return (
    <aside className="left-rail" aria-hidden>
      <ul>
        {icons.map(i => (
          <li key={i.key} title={i.label}>
            <button className="rail-btn">{i.label}</button>
          </li>
        ))}
      </ul>
    </aside>
  );
}

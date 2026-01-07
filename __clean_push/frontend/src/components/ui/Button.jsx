import React from 'react';

export default function Button({ children, ...props }) {
  return (
    <button style={{padding:'8px 12px',borderRadius:4}} {...props}>
      {children}
    </button>
  );
}

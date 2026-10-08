import React from 'react';

export default function Card({ children, className = '' }) {
  return (
    <div className={`glass-panel p-6 ${className}`}>
      {children}
    </div>
  );
}

import React from 'react';

export default function GlassCard({ children, className = '' }) {
  return (
    <div 
      className={`bg-white bg-opacity-5 border border-white border-opacity-10 rounded-lg backdrop-blur-md shadow-lg ${className}`}
    >
      {children}
    </div>
  );
}
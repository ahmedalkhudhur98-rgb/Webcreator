import React from 'react';

function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
}

export default function Avatar({ name, color = '#3b82f6', size = 36, className = '' }) {
  const fontSize = Math.floor(size * 0.36);
  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: color + '22',
        border: `1.5px solid ${color}55`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize,
        fontWeight: 700,
        color,
        flexShrink: 0,
        userSelect: 'none',
        letterSpacing: '0.02em',
      }}
    >
      {getInitials(name)}
    </div>
  );
}

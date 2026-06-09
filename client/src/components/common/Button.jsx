import React from 'react';

const VARIANTS = {
  primary: {
    background: 'var(--accent)', color: '#fff',
    border: 'none',
  },
  secondary: {
    background: 'var(--bg-tertiary)', color: 'var(--text-primary)',
    border: '1px solid var(--border)',
  },
  ghost: {
    background: 'none', color: 'var(--text-secondary)',
    border: 'none',
  },
  danger: {
    background: 'var(--danger-dim)', color: 'var(--danger)',
    border: '1px solid rgba(239,68,68,0.2)',
  },
};

export default function Button({ variant = 'primary', size = 'md', children, disabled, loading, style, ...props }) {
  const v = VARIANTS[variant] || VARIANTS.primary;
  const sz = size === 'sm' ? { padding: '5px 12px', fontSize: 12 } : { padding: '8px 16px', fontSize: 13.5 };

  return (
    <button
      disabled={disabled || loading}
      style={{
        ...v, ...sz,
        borderRadius: 'var(--radius)',
        fontWeight: 600,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'all var(--transition)',
        whiteSpace: 'nowrap',
        fontFamily: 'inherit',
        ...style,
      }}
      {...props}
    >
      {loading ? <span style={{ width: 14, height: 14, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} /> : null}
      {children}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </button>
  );
}

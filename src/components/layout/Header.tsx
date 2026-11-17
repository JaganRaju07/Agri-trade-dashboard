import React from 'react';

interface HeaderProps {
  onOpenMeasures: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMeasures }) => {
  return (
    <header
      style={{
        height: 'var(--header-height)',
        backgroundColor: 'var(--surface)',
        borderBottom: '1px solid var(--hairline)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '16px' }}>
        <span
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '18px',
            fontWeight: 600,
            letterSpacing: '0.02em',
            color: 'var(--ink)',
          }}
        >
          Agri Trade Ledger
        </span>
        <span
          style={{
            fontSize: '13px',
            color: 'var(--muted-ink)',
            fontFamily: 'var(--font-sans)',
          }}
        >
          Global Agricultural Trade Yearbook
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <button
          onClick={onOpenMeasures}
          style={{
            fontSize: '13px',
            color: 'var(--color-export)',
            fontWeight: 500,
            padding: '4px 8px',
            border: '1px solid var(--hairline)',
            borderRadius: 'var(--radius-subtle)',
            backgroundColor: 'var(--bg-paper)',
          }}
          title="Press 'M' to open Measures drawer"
        >
          Measures & DAX
        </button>

        <span
          className="mono"
          style={{
            fontSize: '12px',
            color: 'var(--muted-ink)',
            letterSpacing: '0.04em',
          }}
        >
          FAOSTAT • 2000–2024
        </span>
      </div>
    </header>
  );
};

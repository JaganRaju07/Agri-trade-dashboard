import React from 'react';

export interface PageItem {
  id: string;
  number: string;
  title: string;
}

export const PAGES: PageItem[] = [
  { id: '01', number: '01', title: 'Trade Overview' },
  { id: '02', number: '02', title: 'Area Analysis' },
  { id: '03', number: '03', title: 'Product Analysis' },
  { id: '04', number: '04', title: 'Trade Balance' },
  { id: '05', number: '05', title: 'Data Quality' },
  { id: '06', number: '06', title: 'Quantity Analysis' },
  { id: '07', number: '07', title: 'Growth and Share' },
  { id: '08', number: '08', title: 'Trade Composition' },
  { id: '09', number: '09', title: 'Area Trade Position' },
  { id: '10', number: '10', title: 'Import Analysis' },
  { id: '11', number: '11', title: 'Area Trends' },
  { id: '12', number: '12', title: 'Product Deep Dive' },
];

interface LeftRailProps {
  activePageId: string;
  onSelectPage: (id: string) => void;
}

export const LeftRail: React.FC<LeftRailProps> = ({ activePageId, onSelectPage }) => {
  return (
    <aside
      style={{
        width: 'var(--left-rail-width)',
        minWidth: 'var(--left-rail-width)',
        backgroundColor: 'var(--surface)',
        borderRight: '1px solid var(--hairline)',
        height: 'calc(100vh - var(--header-height))',
        position: 'sticky',
        top: 'var(--header-height)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '16px 0',
        overflowY: 'auto',
      }}
    >
      <div>
        <div
          style={{
            padding: '0 20px 12px 20px',
            fontSize: '11px',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--muted-ink)',
            fontWeight: 600,
            borderBottom: '1px solid var(--hairline)',
            marginBottom: '8px',
          }}
        >
          Contents
        </div>

        <nav>
          {PAGES.map((p) => {
            const isActive = activePageId === p.id;
            return (
              <button
                key={p.id}
                onClick={() => onSelectPage(p.id)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '9px 20px',
                  textAlign: 'left',
                  fontSize: '13.5px',
                  fontWeight: isActive ? 500 : 400,
                  color: isActive ? 'var(--ink)' : 'var(--muted-ink)',
                  backgroundColor: isActive ? 'var(--bg-paper)' : 'transparent',
                  borderLeft: isActive ? '2px solid var(--color-export)' : '2px solid transparent',
                  cursor: 'pointer',
                  transition: 'background-color 120ms ease, color 120ms ease',
                }}
              >
                <span
                  className="mono"
                  style={{
                    fontSize: '12px',
                    color: isActive ? 'var(--color-export)' : 'var(--muted-ink)',
                    minWidth: '18px',
                  }}
                >
                  {p.number}
                </span>
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {p.title}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      <div
        style={{
          padding: '16px 20px 4px 20px',
          borderTop: '1px solid var(--hairline)',
          fontSize: '11px',
          color: 'var(--muted-ink)',
          lineHeight: '1.4',
        }}
      >
        <div>Keyboard nav:</div>
        <div className="mono" style={{ fontSize: '10.5px', marginTop: '4px' }}>
          [ / ] : Switch page<br />
          1 - 9 : Jump to 1–9<br />
          R : Reset filters<br />
          M : View measures
        </div>
      </div>
    </aside>
  );
};

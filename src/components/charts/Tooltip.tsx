import React from 'react';

export interface TooltipData {
  x: number;
  y: number;
  title: string;
  items: Array<{ label: string; value: string | number; color?: string }>;
}

export const Tooltip: React.FC<{ tooltip: TooltipData | null }> = ({ tooltip }) => {
  if (!tooltip) return null;

  return (
    <div
      className="chart-tooltip"
      style={{
        left: `${tooltip.x + 12}px`,
        top: `${tooltip.y - 12}px`,
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: '4px', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '2px' }}>
        {tooltip.title}
      </div>
      {tooltip.items.map((it, idx) => (
        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', margin: '2px 0' }}>
          {it.color && (
            <span
              style={{
                width: '8px',
                height: '8px',
                backgroundColor: it.color,
                display: 'inline-block',
                borderRadius: '1px',
              }}
            />
          )}
          <span style={{ color: '#D9D4C7' }}>{it.label}:</span>
          <span className="mono" style={{ fontWeight: 500, color: '#FBFAF5' }}>
            {it.value}
          </span>
        </div>
      ))}
    </div>
  );
};

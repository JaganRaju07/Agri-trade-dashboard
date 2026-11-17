import React, { useState } from 'react';
import { scaleLinear, scaleSqrt } from 'd3-scale';
import { Tooltip, TooltipData } from './Tooltip';

export interface ScatterPoint {
  id: string;
  label: string;
  x: number; // Export Value
  y: number; // Import Value
  size: number; // Total Trade
}

interface ScatterChartProps {
  data: ScatterPoint[];
  title?: string;
  unit?: string;
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  height?: number;
}

export const ScatterChart: React.FC<ScatterChartProps> = ({
  data,
  title,
  unit = 'USD bn',
  selectedId = null,
  onSelect,
  height = 420,
}) => {
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="card" style={{ height: `${height}px`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--muted-ink)' }}>No data available.</p>
      </div>
    );
  }

  const margin = { top: 30, right: 40, bottom: 44, left: 60 };
  const width = 640;
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const maxVal = Math.max(...data.map((d) => Math.max(d.x, d.y)), 10) * 1.08;
  const maxSize = Math.max(...data.map((d) => d.size), 1);

  const xScale = scaleLinear().domain([0, maxVal]).range([0, innerWidth]);
  const yScale = scaleLinear().domain([0, maxVal]).range([innerHeight, 0]);
  const sizeScale = scaleSqrt().domain([0, maxSize]).range([5, 24]);

  const ticks = xScale.ticks(6);

  return (
    <div className="card" style={{ position: 'relative' }}>
      {title && (
        <div style={{ marginBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink)' }}>{title}</h3>
          <span style={{ fontSize: '11px', color: 'var(--muted-ink)' }}>Parity line (x = y) • {unit}</span>
        </div>
      )}

      <div style={{ width: '100%', overflowX: 'auto' }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          style={{ width: '100%', height: `${height}px`, overflow: 'visible' }}
          onMouseLeave={() => setTooltip(null)}
        >
          <g transform={`translate(${margin.left}, ${margin.top})`}>
            {/* Gridlines */}
            {ticks.map((t) => (
              <g key={t}>
                {/* Horizontal */}
                <line x1={0} x2={innerWidth} y1={yScale(t)} y2={yScale(t)} stroke="var(--hairline)" strokeWidth={1} strokeDasharray="3 3" />
                <text x={-10} y={yScale(t) + 4} textAnchor="end" className="mono" style={{ fontSize: '11px', fill: 'var(--muted-ink)' }}>
                  {t}
                </text>
                {/* Vertical */}
                <line x1={xScale(t)} x2={xScale(t)} y1={0} y2={innerHeight} stroke="var(--hairline)" strokeWidth={1} strokeDasharray="3 3" />
                <text x={xScale(t)} y={innerHeight + 18} textAnchor="middle" className="mono" style={{ fontSize: '11px', fill: 'var(--muted-ink)' }}>
                  {t}
                </text>
              </g>
            ))}

            {/* Diagonal parity line x = y */}
            <line
              x1={xScale(0)}
              y1={yScale(0)}
              x2={xScale(maxVal)}
              y2={yScale(maxVal)}
              stroke="var(--hairline-dark)"
              strokeWidth={1.5}
              strokeDasharray="4 4"
            />
            <text
              x={xScale(maxVal * 0.85)}
              y={yScale(maxVal * 0.85) - 6}
              style={{ fontSize: '10px', fill: 'var(--muted-ink)', fontStyle: 'italic' }}
            >
              Balanced Trade Line (Export = Import)
            </text>

            {/* Quadrant labels */}
            <text x={12} y={16} style={{ fontSize: '11px', fill: 'var(--color-import)', fontWeight: 500 }}>
              ↖ Net Importers (Deficit)
            </text>
            <text x={innerWidth - 12} y={innerHeight - 12} textAnchor="end" style={{ fontSize: '11px', fill: 'var(--color-export)', fontWeight: 500 }}>
              Net Exporters (Surplus) ↘
            </text>

            {/* Axis labels */}
            <text
              x={innerWidth / 2}
              y={innerHeight + 36}
              textAnchor="middle"
              style={{ fontSize: '12px', fill: 'var(--ink)', fontWeight: 500 }}
            >
              Export Value ({unit}) →
            </text>
            <text
              transform={`rotate(-90)`}
              x={-innerHeight / 2}
              y={-40}
              textAnchor="middle"
              style={{ fontSize: '12px', fill: 'var(--ink)', fontWeight: 500 }}
            >
              ← Import Value ({unit})
            </text>

            {/* Points */}
            {data.map((d) => {
              const cx = xScale(d.x);
              const cy = yScale(d.y);
              const r = sizeScale(d.size);
              const isSurplus = d.x >= d.y;
              const pointColor = isSurplus ? 'var(--color-surplus)' : 'var(--color-deficit)';
              const isSelected = selectedId === d.id;
              const hasSelection = selectedId !== null;
              const opacity = hasSelection ? (isSelected ? 1 : 0.25) : 0.85;

              return (
                <g
                  key={d.id}
                  style={{ cursor: onSelect ? 'pointer' : 'default' }}
                  onClick={() => onSelect && onSelect(d.id)}
                  onMouseEnter={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setTooltip({
                      x: rect.left + rect.width / 2,
                      y: rect.top,
                      title: d.label,
                      items: [
                        { label: 'Export Value', value: `${d.x.toFixed(2)} ${unit}`, color: 'var(--color-export)' },
                        { label: 'Import Value', value: `${d.y.toFixed(2)} ${unit}`, color: 'var(--color-import)' },
                        { label: 'Trade Balance', value: `${(d.x - d.y).toFixed(2)} ${unit}`, color: pointColor },
                        { label: 'Total Turnover', value: `${d.size.toFixed(2)} ${unit}` },
                      ],
                    });
                  }}
                >
                  <circle
                    cx={cx}
                    cy={cy}
                    r={r}
                    fill={pointColor}
                    fillOpacity={opacity * 0.6}
                    stroke={pointColor}
                    strokeWidth={isSelected ? 2.5 : 1.5}
                  />

                  {/* Label */}
                  <text
                    x={cx}
                    y={cy - r - 4}
                    textAnchor="middle"
                    style={{
                      fontSize: '11px',
                      fontWeight: isSelected ? 600 : 500,
                      fill: 'var(--ink)',
                      pointerEvents: 'none',
                    }}
                  >
                    {d.label}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      <Tooltip tooltip={tooltip} />
    </div>
  );
};

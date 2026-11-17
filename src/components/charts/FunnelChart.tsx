import React, { useState } from 'react';
import { scaleLinear } from 'd3-scale';
import { Tooltip, TooltipData } from './Tooltip';

const EARTH_COLORS = ['#2F5D45', '#4A5D4E', '#5E7464', '#8C9A7A', '#A2AD92', '#C2B69D', '#B58D70', '#A47551', '#6D7973', '#8E8279'];

export interface FunnelItem {
  id: string;
  label: string;
  value: number;
}

interface FunnelChartProps {
  data: FunnelItem[];
  title?: string;
  unit?: string;
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  height?: number;
}

export const FunnelChart: React.FC<FunnelChartProps> = ({
  data,
  title,
  unit = 'USD bn',
  selectedId = null,
  onSelect,
  height = 360,
}) => {
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);

  const top10 = data.slice(0, 10);
  if (!top10 || top10.length === 0) {
    return (
      <div className="card" style={{ height: `${height}px`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--muted-ink)' }}>No data available.</p>
      </div>
    );
  }

  const maxVal = Math.max(...top10.map((d) => d.value), 0.1);
  const width = 640;
  const margin = { top: 16, right: 90, bottom: 16, left: 160 };
  const innerWidth = width - margin.left - margin.right;
  const rowHeight = (height - margin.top - margin.bottom - 40) / top10.length;

  const widthScale = scaleLinear().domain([0, maxVal]).range([20, innerWidth]);

  return (
    <div className="card" style={{ position: 'relative' }}>
      {title && (
        <div style={{ marginBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink)' }}>{title}</h3>
          <span style={{ fontSize: '11px', color: 'var(--muted-ink)' }}>Top 10 Commodities • {unit}</span>
        </div>
      )}

      <div style={{ width: '100%', overflowX: 'auto' }}>
        <svg
          viewBox={`0 0 ${width} ${height - 40}`}
          style={{ width: '100%', height: `${height - 40}px`, overflow: 'visible' }}
          onMouseLeave={() => setTooltip(null)}
        >
          <g transform={`translate(${margin.left}, ${margin.top})`}>
            {top10.map((d, i) => {
              const barW = widthScale(d.value);
              const y = i * rowHeight;
              const color = EARTH_COLORS[i % EARTH_COLORS.length];
              const pctOfTop = (d.value / maxVal) * 100;
              const isSelected = selectedId === d.id;
              const hasSelection = selectedId !== null;
              const opacity = hasSelection ? (isSelected ? 1 : 0.3) : 0.9;

              return (
                <g
                  key={d.id}
                  style={{ cursor: onSelect ? 'pointer' : 'default' }}
                  onClick={() => onSelect && onSelect(d.id)}
                  onMouseEnter={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setTooltip({
                      x: rect.left + barW,
                      y: rect.top,
                      title: `#${i + 1} ${d.label}`,
                      items: [
                        { label: 'Export Value', value: `${d.value.toFixed(2)} ${unit}`, color },
                        { label: 'Share of #1 Lead', value: `${pctOfTop.toFixed(1)}%` },
                      ],
                    });
                  }}
                >
                  {/* Rank and Name */}
                  <text
                    x={-8}
                    y={y + rowHeight * 0.65}
                    textAnchor="end"
                    style={{
                      fontSize: '11.5px',
                      fill: isSelected ? 'var(--ink)' : 'var(--muted-ink)',
                      fontWeight: isSelected ? 600 : 400,
                    }}
                  >
                    #{i + 1} {d.label.length > 18 ? d.label.slice(0, 17) + '…' : d.label}
                  </text>

                  {/* Funnel segment bar */}
                  <rect
                    x={0}
                    y={y + 2}
                    width={barW}
                    height={rowHeight - 4}
                    fill={color}
                    opacity={opacity}
                    rx={2}
                  />

                  {/* Value and pct label */}
                  <text
                    x={barW + 8}
                    y={y + rowHeight * 0.65}
                    className="mono"
                    style={{
                      fontSize: '11px',
                      fill: 'var(--ink)',
                      fontWeight: 500,
                    }}
                  >
                    {d.value.toFixed(2)} ({pctOfTop.toFixed(0)}%)
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

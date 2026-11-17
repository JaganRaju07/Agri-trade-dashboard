import React, { useState } from 'react';
import { pie as d3Pie, arc as d3Arc } from 'd3-shape';
import { Tooltip, TooltipData } from './Tooltip';

const EARTH_COLORS = ['#4A5D4E', '#8C9A7A', '#C2B69D', '#A47551', '#6D7973', '#8E8279'];

export interface SliceItem {
  id: string;
  label: string;
  value: number;
  sublabel?: string;
  color?: string;
}

interface DonutChartProps {
  data: SliceItem[];
  title?: string;
  centerLabel?: string;
  centerValue?: string;
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  height?: number;
}

export const DonutChart: React.FC<DonutChartProps> = ({
  data,
  title,
  centerLabel,
  centerValue,
  selectedId = null,
  onSelect,
  height = 280,
}) => {
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);

  const total = data.reduce((acc, d) => acc + d.value, 0);
  if (!data || data.length === 0 || total === 0) {
    return (
      <div className="card" style={{ height: `${height}px`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--muted-ink)' }}>No data available.</p>
      </div>
    );
  }

  const radius = Math.min(height, 260) / 2 - 16;
  const innerRadius = radius * 0.62;

  const pieGen = d3Pie<SliceItem>()
    .value((d) => d.value)
    .sort(null);

  const arcGen = d3Arc<any>()
    .innerRadius(innerRadius)
    .outerRadius(radius);

  const arcs = pieGen(data);

  return (
    <div className="card" style={{ position: 'relative' }}>
      {title && (
        <div style={{ marginBottom: '14px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink)' }}>{title}</h3>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', gap: '16px' }}>
        <svg
          width={radius * 2 + 32}
          height={radius * 2 + 32}
          style={{ overflow: 'visible' }}
          onMouseLeave={() => setTooltip(null)}
        >
          <g transform={`translate(${radius + 16}, ${radius + 16})`}>
            {arcs.map((arc, i) => {
              const d = arc.data;
              const color = d.color || EARTH_COLORS[i % EARTH_COLORS.length];
              const isSelected = selectedId === d.id;
              const hasSelection = selectedId !== null;
              const opacity = hasSelection ? (isSelected ? 1 : 0.35) : 0.92;
              const pathStr = arcGen(arc);
              const pct = total > 0 ? (d.value / total) * 100 : 0;

              return (
                <path
                  key={d.id}
                  d={pathStr || ''}
                  fill={color}
                  opacity={opacity}
                  stroke="var(--surface)"
                  strokeWidth={2}
                  style={{ cursor: onSelect ? 'pointer' : 'default' }}
                  onClick={() => onSelect && onSelect(d.id)}
                  onMouseEnter={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setTooltip({
                      x: rect.left + rect.width / 2,
                      y: rect.top,
                      title: d.label,
                      items: [
                        { label: 'Count', value: `${d.value.toLocaleString()}`, color },
                        { label: 'Share', value: `${pct.toFixed(1)}%` },
                        ...(d.sublabel ? [{ label: 'Detail', value: d.sublabel }] : []),
                      ],
                    });
                  }}
                />
              );
            })}

            {/* Center Text */}
            {centerValue && (
              <text
                textAnchor="middle"
                y={centerLabel ? -4 : 6}
                className="mono"
                style={{ fontSize: '18px', fontWeight: 600, fill: 'var(--ink)' }}
              >
                {centerValue}
              </text>
            )}
            {centerLabel && (
              <text
                textAnchor="middle"
                y={16}
                style={{ fontSize: '11px', fill: 'var(--muted-ink)', textTransform: 'uppercase' }}
              >
                {centerLabel}
              </text>
            )}
          </g>
        </svg>

        {/* Legend */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '150px' }}>
          {data.map((d, i) => {
            const color = d.color || EARTH_COLORS[i % EARTH_COLORS.length];
            const pct = total > 0 ? (d.value / total) * 100 : 0;
            const isSelected = selectedId === d.id;
            return (
              <div
                key={d.id}
                onClick={() => onSelect && onSelect(d.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                  fontSize: '12px',
                  cursor: onSelect ? 'pointer' : 'default',
                  opacity: selectedId && !isSelected ? 0.4 : 1,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '8px', height: '8px', backgroundColor: color, borderRadius: '1px' }} />
                  <span style={{ fontWeight: isSelected ? 600 : 400 }}>{d.label}</span>
                </div>
                <span className="mono" style={{ color: 'var(--muted-ink)' }}>
                  {pct.toFixed(1)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <Tooltip tooltip={tooltip} />
    </div>
  );
};

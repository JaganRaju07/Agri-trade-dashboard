import React, { useState } from 'react';
import { pie as d3Pie, arc as d3Arc } from 'd3-shape';
import { Tooltip, TooltipData } from './Tooltip';

const EARTH_COLORS = ['#4A5D4E', '#8C9A7A', '#C2B69D', '#A47551', '#6D7973', '#8E8279', '#3D4F44', '#7C6A59'];

export interface PieItem {
  id: string;
  label: string;
  value: number;
  color?: string;
}

interface PieChartProps {
  data: PieItem[];
  title?: string;
  unit?: string;
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  height?: number;
}

export const PieChart: React.FC<PieChartProps> = ({
  data,
  title,
  unit = 'USD bn',
  selectedId = null,
  onSelect,
  height = 340,
}) => {
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);

  const total = data.reduce((acc, d) => acc + d.value, 0);
  if (!data || data.length === 0 || total === 0) {
    return (
      <div className="card" style={{ height: `${height}px`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--muted-ink)' }}>No data available for current selection.</p>
      </div>
    );
  }

  const radius = Math.min(height, 300) / 2 - 40;
  const pieGen = d3Pie<PieItem>()
    .value((d) => d.value)
    .sort(null);

  const arcGen = d3Arc<any>()
    .innerRadius(0)
    .outerRadius(radius);

  const labelArcGen = d3Arc<any>()
    .innerRadius(radius * 0.7)
    .outerRadius(radius * 0.7);

  const arcs = pieGen(data);

  return (
    <div className="card" style={{ position: 'relative' }}>
      {title && (
        <div style={{ marginBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink)' }}>{title}</h3>
          <span style={{ fontSize: '11px', color: 'var(--muted-ink)' }}>{unit}</span>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg
          width={radius * 2 + 160}
          height={radius * 2 + 80}
          style={{ overflow: 'visible' }}
          onMouseLeave={() => setTooltip(null)}
        >
          <g transform={`translate(${radius + 80}, ${radius + 40})`}>
            {arcs.map((arc, i) => {
              const d = arc.data;
              const color = d.color || EARTH_COLORS[i % EARTH_COLORS.length];
              const isSelected = selectedId === d.id;
              const hasSelection = selectedId !== null;
              const opacity = hasSelection ? (isSelected ? 1 : 0.35) : 0.92;
              const pct = total > 0 ? (d.value / total) * 100 : 0;
              const [labelX, labelY] = labelArcGen.centroid(arc);

              return (
                <g key={d.id}>
                  <path
                    d={arcGen(arc) || ''}
                    fill={color}
                    opacity={opacity}
                    stroke="var(--surface)"
                    strokeWidth={1.5}
                    style={{ cursor: onSelect ? 'pointer' : 'default' }}
                    onClick={() => onSelect && onSelect(d.id)}
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setTooltip({
                        x: rect.left + rect.width / 2,
                        y: rect.top,
                        title: d.label,
                        items: [
                          { label: 'Value', value: `${d.value.toFixed(2)} ${unit}`, color },
                          { label: 'Share', value: `${pct.toFixed(1)}%` },
                        ],
                      });
                    }}
                  />
                  {pct >= 4 && (
                    <text
                      x={labelX}
                      y={labelY}
                      textAnchor="middle"
                      className="mono"
                      style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        fill: '#FBFAF5',
                        pointerEvents: 'none',
                        textShadow: '0 1px 2px rgba(0,0,0,0.4)',
                      }}
                    >
                      {pct >= 6 ? `${d.label.slice(0, 8)} ${pct.toFixed(0)}%` : `${pct.toFixed(0)}%`}
                    </text>
                  )}
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

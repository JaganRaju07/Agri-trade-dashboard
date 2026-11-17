import React, { useState } from 'react';
import { scaleLinear } from 'd3-scale';
import { line as d3Line, curveBumpX } from 'd3-shape';
import { Tooltip, TooltipData } from './Tooltip';

const EARTH_COLORS = [
  '#2F5D45', '#4A5D4E', '#8C9A7A', '#C2B69D', '#A47551', '#B5532D',
  '#6D7973', '#8E8279', '#3D4F44', '#7C6A59', '#546A60', '#A89278'
];

export interface RibbonPoint {
  year: number;
  area: string;
  value: number; // Export value
}

interface RibbonChartProps {
  data: RibbonPoint[];
  title?: string;
  selectedArea?: string | null;
  onSelectArea?: (area: string) => void;
  height?: number;
}

export const RibbonChart: React.FC<RibbonChartProps> = ({
  data,
  title,
  selectedArea = null,
  onSelectArea,
  height = 380,
}) => {
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="card" style={{ height: `${height}px`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--muted-ink)' }}>No data available.</p>
      </div>
    );
  }

  // Group by year and rank
  const years = Array.from(new Set(data.map((d) => d.year))).sort((a, b) => a - b);
  const areas = Array.from(new Set(data.map((d) => d.area))).sort();

  // area -> year -> { rank, value }
  const yearRankings = new Map<number, Map<string, { rank: number; value: number }>>();
  years.forEach((y) => {
    const yearItems = data.filter((d) => d.year === y).sort((a, b) => b.value - a.value);
    const m = new Map<string, { rank: number; value: number }>();
    yearItems.forEach((it, idx) => {
      m.set(it.area, { rank: idx + 1, value: it.value });
    });
    yearRankings.set(y, m);
  });

  const margin = { top: 30, right: 110, bottom: 30, left: 36 };
  const width = 640;
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const maxRank = Math.min(areas.length, 12);
  const xScale = scaleLinear().domain([0, years.length - 1]).range([0, innerWidth]);
  const yScale = scaleLinear().domain([1, maxRank]).range([0, innerHeight]);

  const lineGen = d3Line<{ x: number; y: number }>()
    .x((d) => d.x)
    .y((d) => d.y)
    .curve(curveBumpX);

  return (
    <div className="card" style={{ position: 'relative' }}>
      {title && (
        <div style={{ marginBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink)' }}>{title}</h3>
          <span style={{ fontSize: '11px', color: 'var(--muted-ink)' }}>Rank 1 (Top) to {maxRank}</span>
        </div>
      )}

      <div style={{ width: '100%', overflowX: 'auto' }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          style={{ width: '100%', height: `${height}px`, overflow: 'visible' }}
          onMouseLeave={() => setTooltip(null)}
        >
          <g transform={`translate(${margin.left}, ${margin.top})`}>
            {/* Rank gridlines */}
            {Array.from({ length: maxRank }, (_, i) => i + 1).map((r) => (
              <g key={r} transform={`translate(0, ${yScale(r)})`}>
                <line x1={0} x2={innerWidth} stroke="var(--hairline)" strokeWidth={1} strokeDasharray="2 4" />
                <text x={-8} y={4} textAnchor="end" className="mono" style={{ fontSize: '10px', fill: 'var(--muted-ink)' }}>
                  #{r}
                </text>
              </g>
            ))}

            {/* Year labels */}
            {years.map((y, idx) => (
              <text
                key={y}
                x={xScale(idx)}
                y={innerHeight + 20}
                textAnchor="middle"
                className="mono"
                style={{ fontSize: '11px', fill: 'var(--muted-ink)' }}
              >
                {y}
              </text>
            ))}

            {/* Ribbon lines per area */}
            {areas.map((areaName, aIdx) => {
              const points: { x: number; y: number; rank: number; value: number; year: number }[] = [];
              years.forEach((y, idx) => {
                const info = yearRankings.get(y)?.get(areaName);
                if (info) {
                  points.push({
                    x: xScale(idx),
                    y: yScale(info.rank),
                    rank: info.rank,
                    value: info.value,
                    year: y,
                  });
                }
              });

              if (points.length === 0) return null;

              const isSelected = selectedArea === areaName;
              const hasSelection = selectedArea !== null;
              const color = EARTH_COLORS[aIdx % EARTH_COLORS.length];
              const opacity = hasSelection ? (isSelected ? 1 : 0.15) : 0.8;
              const strokeWidth = isSelected ? 4 : 2;
              const lastPoint = points[points.length - 1];

              return (
                <g key={areaName} style={{ cursor: onSelectArea ? 'pointer' : 'default' }} onClick={() => onSelectArea && onSelectArea(areaName)}>
                  <path
                    d={lineGen(points) || ''}
                    fill="none"
                    stroke={color}
                    strokeWidth={strokeWidth}
                    opacity={opacity}
                  />

                  {/* Nodes */}
                  {points.map((p, pIdx) => (
                    <circle
                      key={pIdx}
                      cx={p.x}
                      cy={p.y}
                      r={isSelected ? 4 : 2.5}
                      fill={color}
                      opacity={opacity}
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setTooltip({
                          x: rect.left,
                          y: rect.top,
                          title: `${areaName} (${p.year})`,
                          items: [
                            { label: 'Rank', value: `#${p.rank}`, color },
                            { label: 'Export Value', value: `${p.value.toFixed(2)} USD bn` },
                          ],
                        });
                      }}
                    />
                  ))}

                  {/* End label */}
                  {lastPoint && (
                    <text
                      x={lastPoint.x + 8}
                      y={lastPoint.y + 4}
                      style={{
                        fontSize: isSelected ? '11.5px' : '10.5px',
                        fontWeight: isSelected ? 600 : 400,
                        fill: isSelected ? 'var(--ink)' : color,
                        opacity: hasSelection ? (isSelected ? 1 : 0.3) : 1,
                      }}
                    >
                      {areaName}
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

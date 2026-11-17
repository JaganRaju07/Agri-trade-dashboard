import React, { useState } from 'react';
import { scaleLinear, scaleBand } from 'd3-scale';
import { Tooltip, TooltipData } from './Tooltip';

export interface BarItem {
  id: string; // Area or Item identifier
  label: string;
  value: number;
  color?: string;
  sublabel?: string;
}

interface BarChartProps {
  data: BarItem[];
  title?: string;
  unit?: string;
  diverging?: boolean;
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  height?: number;
  maxBars?: number;
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  title,
  unit = 'USD bn',
  diverging = false,
  selectedId = null,
  onSelect,
  height,
  maxBars = 15,
}) => {
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);

  const displayData = data.slice(0, maxBars);
  if (!displayData || displayData.length === 0) {
    return (
      <div className="card" style={{ height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--muted-ink)' }}>No data available for current filters.</p>
      </div>
    );
  }

  const calculatedHeight = height || Math.max(220, displayData.length * 28 + 60);
  const margin = { top: 20, right: 70, bottom: 20, left: 140 };
  const width = 640;
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = calculatedHeight - margin.top - margin.bottom;

  const minVal = Math.min(...displayData.map((d) => d.value), 0);
  const maxVal = Math.max(...displayData.map((d) => d.value), 0.1);

  const xScale = scaleLinear()
    .domain(diverging ? [minVal * 1.1, maxVal * 1.1] : [0, maxVal * 1.1])
    .range([0, innerWidth]);

  const yScale = scaleBand()
    .domain(displayData.map((d) => d.id))
    .range([0, innerHeight])
    .padding(0.25);

  const zeroX = xScale(0);

  return (
    <div className="card" style={{ position: 'relative' }}>
      {title && (
        <div style={{ marginBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink)' }}>{title}</h3>
          <span style={{ fontSize: '11px', color: 'var(--muted-ink)' }}>{unit}</span>
        </div>
      )}

      <div style={{ width: '100%', overflowX: 'auto' }}>
        <svg
          viewBox={`0 0 ${width} ${calculatedHeight}`}
          style={{ width: '100%', height: `${calculatedHeight}px`, overflow: 'visible' }}
          onMouseLeave={() => setTooltip(null)}
        >
          <g transform={`translate(${margin.left}, ${margin.top})`}>
            {/* Zero vertical baseline */}
            <line
              x1={zeroX}
              x2={zeroX}
              y1={0}
              y2={innerHeight}
              stroke="var(--hairline-dark)"
              strokeWidth={1}
            />

            {displayData.map((d) => {
              const y = yScale(d.id) ?? 0;
              const barHeight = yScale.bandwidth();
              const isSelected = selectedId === d.id;
              const hasSelection = selectedId !== null;

              let barX = zeroX;
              let barW = 0;
              let barColor = d.color || 'var(--color-export)';

              if (diverging) {
                if (d.value >= 0) {
                  barX = zeroX;
                  barW = xScale(d.value) - zeroX;
                  barColor = 'var(--color-surplus)';
                } else {
                  barX = xScale(d.value);
                  barW = zeroX - xScale(d.value);
                  barColor = 'var(--color-deficit)';
                }
              } else {
                barX = 0;
                barW = xScale(d.value);
              }

              const opacity = hasSelection ? (isSelected ? 1 : 0.35) : 0.9;

              return (
                <g
                  key={d.id}
                  style={{ cursor: onSelect ? 'pointer' : 'default' }}
                  onClick={() => onSelect && onSelect(d.id)}
                  onMouseEnter={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setTooltip({
                      x: rect.left + barX + barW,
                      y: rect.top,
                      title: d.label,
                      items: [
                        { label: 'Value', value: `${d.value.toFixed(2)} ${unit}`, color: barColor },
                        ...(d.sublabel ? [{ label: 'Detail', value: d.sublabel }] : []),
                      ],
                    });
                  }}
                >
                  {/* Category label */}
                  <text
                    x={-8}
                    y={y + barHeight / 2 + 4}
                    textAnchor="end"
                    style={{
                      fontSize: '12px',
                      fill: isSelected ? 'var(--ink)' : 'var(--muted-ink)',
                      fontWeight: isSelected ? 600 : 400,
                    }}
                  >
                    {d.label.length > 20 ? `${d.label.slice(0, 19)}…` : d.label}
                  </text>

                  {/* Bar */}
                  <rect
                    x={barX}
                    y={y}
                    width={Math.max(barW, 1)}
                    height={barHeight}
                    fill={barColor}
                    opacity={opacity}
                    rx={1}
                  />

                  {/* Direct value label */}
                  <text
                    x={d.value >= 0 ? barX + barW + 6 : barX - 6}
                    y={y + barHeight / 2 + 4}
                    textAnchor={d.value >= 0 ? 'start' : 'end'}
                    className="mono"
                    style={{
                      fontSize: '11px',
                      fill: 'var(--ink)',
                      fontWeight: 500,
                    }}
                  >
                    {d.value.toFixed(2)}
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

import React, { useState } from 'react';
import { scaleLinear, scaleBand } from 'd3-scale';
import { Tooltip, TooltipData } from './Tooltip';

export interface ColumnItem {
  id: string | number;
  label: string;
  value: number;
  color?: string;
  sublabel?: string;
}

interface ColumnChartProps {
  data: ColumnItem[];
  title?: string;
  unit?: string;
  diverging?: boolean;
  selectedId?: string | number | null;
  onSelect?: (id: string | number) => void;
  height?: number;
  isPercent?: boolean;
}

export const ColumnChart: React.FC<ColumnChartProps> = ({
  data,
  title,
  unit = 'USD bn',
  diverging = false,
  selectedId = null,
  onSelect,
  height = 280,
  isPercent = false,
}) => {
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="card" style={{ height: `${height}px`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--muted-ink)' }}>No data available for current selection.</p>
      </div>
    );
  }

  const margin = { top: 24, right: 24, bottom: 36, left: 50 };
  const width = 640;
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const minVal = Math.min(...data.map((d) => d.value), 0);
  const maxVal = Math.max(...data.map((d) => d.value), 0.1);

  const yScale = scaleLinear()
    .domain(diverging ? [minVal * 1.1, maxVal * 1.1] : [0, isPercent ? 100 : maxVal * 1.1])
    .range([innerHeight, 0]);

  const xScale = scaleBand()
    .domain(data.map((d) => String(d.id)))
    .range([0, innerWidth])
    .padding(0.28);

  const zeroY = yScale(0);
  const yTicks = yScale.ticks(5);

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
          viewBox={`0 0 ${width} ${height}`}
          style={{ width: '100%', height: `${height}px`, overflow: 'visible' }}
          onMouseLeave={() => setTooltip(null)}
        >
          <g transform={`translate(${margin.left}, ${margin.top})`}>
            {/* Gridlines */}
            {yTicks.map((tick) => (
              <g key={tick} transform={`translate(0, ${yScale(tick)})`}>
                <line x1={0} x2={innerWidth} stroke="var(--hairline)" strokeWidth={1} strokeDasharray="3 3" />
                <text
                  x={-8}
                  y={4}
                  textAnchor="end"
                  className="mono"
                  style={{ fontSize: '11px', fill: 'var(--muted-ink)' }}
                >
                  {isPercent ? `${tick}%` : tick}
                </text>
              </g>
            ))}

            {/* Zero horizontal baseline */}
            <line x1={0} x2={innerWidth} y1={zeroY} y2={zeroY} stroke="var(--hairline-dark)" strokeWidth={1} />

            {/* Columns */}
            {data.map((d) => {
              const x = xScale(String(d.id)) ?? 0;
              const colWidth = xScale.bandwidth();
              const isSelected = selectedId === d.id;
              const hasSelection = selectedId !== null;

              let colY = zeroY;
              let colH = 0;
              let colColor = d.color || 'var(--color-export)';

              if (diverging) {
                if (d.value >= 0) {
                  colY = yScale(d.value);
                  colH = zeroY - yScale(d.value);
                  colColor = 'var(--color-surplus)';
                } else {
                  colY = zeroY;
                  colH = yScale(d.value) - zeroY;
                  colColor = 'var(--color-deficit)';
                }
              } else {
                colY = yScale(d.value);
                colH = innerHeight - yScale(d.value);
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
                      x: rect.left + colWidth / 2,
                      y: rect.top,
                      title: d.label,
                      items: [
                        {
                          label: 'Value',
                          value: isPercent ? `${d.value.toFixed(1)}%` : `${d.value.toFixed(2)} ${unit}`,
                          color: colColor,
                        },
                        ...(d.sublabel ? [{ label: 'Detail', value: d.sublabel }] : []),
                      ],
                    });
                  }}
                >
                  <rect
                    x={x}
                    y={colY}
                    width={colWidth}
                    height={Math.max(colH, 1)}
                    fill={colColor}
                    opacity={opacity}
                    rx={1}
                  />

                  {/* X label */}
                  <text
                    x={x + colWidth / 2}
                    y={innerHeight + 16}
                    textAnchor="middle"
                    className="mono"
                    style={{
                      fontSize: '11px',
                      fill: isSelected ? 'var(--ink)' : 'var(--muted-ink)',
                      fontWeight: isSelected ? 600 : 400,
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

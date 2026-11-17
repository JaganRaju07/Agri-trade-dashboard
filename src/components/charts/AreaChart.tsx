import React, { useState } from 'react';
import { scaleLinear } from 'd3-scale';
import { area as d3Area, curveMonotoneX } from 'd3-shape';
import { Tooltip, TooltipData } from './Tooltip';

export interface AreaDataPoint {
  x: number; // Year
  exportVal: number;
  importVal: number;
}

interface AreaChartProps {
  data: AreaDataPoint[];
  title?: string;
  unit?: string;
  height?: number;
}

export const AreaChart: React.FC<AreaChartProps> = ({
  data,
  title,
  unit = 'USD bn',
  height = 300,
}) => {
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="card" style={{ height: `${height}px`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--muted-ink)' }}>No data available.</p>
      </div>
    );
  }

  const margin = { top: 24, right: 80, bottom: 32, left: 50 };
  const width = 640;
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const xExtent = [Math.min(...data.map((d) => d.x)), Math.max(...data.map((d) => d.x))];
  const maxVal = Math.max(...data.flatMap((d) => [d.exportVal, d.importVal]), 1);

  const xScale = scaleLinear().domain(xExtent).range([0, innerWidth]);
  const yScale = scaleLinear().domain([0, maxVal * 1.05]).range([innerHeight, 0]);

  const exportAreaGen = d3Area<AreaDataPoint>()
    .x((d) => xScale(d.x))
    .y0(innerHeight)
    .y1((d) => yScale(d.exportVal))
    .curve(curveMonotoneX);

  const importAreaGen = d3Area<AreaDataPoint>()
    .x((d) => xScale(d.x))
    .y0(innerHeight)
    .y1((d) => yScale(d.importVal))
    .curve(curveMonotoneX);

  const yTicks = yScale.ticks(5);
  const xTicks = data.map((d) => d.x).filter((_, idx, arr) => arr.length <= 12 || idx % 2 === 0);

  const lastPoint = data[data.length - 1];

  return (
    <div className="card" style={{ position: 'relative' }}>
      {title && (
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
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
                  {tick}
                </text>
              </g>
            ))}

            {/* X-axis */}
            {xTicks.map((xVal) => (
              <text
                key={xVal}
                x={xScale(xVal)}
                y={innerHeight + 20}
                textAnchor="middle"
                className="mono"
                style={{ fontSize: '11px', fill: 'var(--muted-ink)' }}
              >
                {xVal}
              </text>
            ))}

            {/* Area Paths */}
            <path
              d={exportAreaGen(data) || ''}
              fill="var(--color-export)"
              fillOpacity={0.25}
              stroke="var(--color-export)"
              strokeWidth={2}
            />
            <path
              d={importAreaGen(data) || ''}
              fill="var(--color-import)"
              fillOpacity={0.2}
              stroke="var(--color-import)"
              strokeWidth={2}
              strokeDasharray="4 2"
            />

            {/* End Labels */}
            {lastPoint && (
              <>
                <text
                  x={xScale(lastPoint.x) + 8}
                  y={yScale(lastPoint.exportVal) + 4}
                  style={{ fontSize: '11px', fontWeight: 600, fill: 'var(--color-export)' }}
                >
                  Export
                </text>
                <text
                  x={xScale(lastPoint.x) + 8}
                  y={yScale(lastPoint.importVal) + 4}
                  style={{ fontSize: '11px', fontWeight: 600, fill: 'var(--color-import)' }}
                >
                  Import
                </text>
              </>
            )}

            {/* Interactive Points */}
            {data.map((d, i) => (
              <g key={i}>
                <rect
                  x={xScale(d.x) - 12}
                  y={0}
                  width={24}
                  height={innerHeight}
                  fill="transparent"
                  onMouseEnter={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setTooltip({
                      x: rect.left + 12,
                      y: rect.top,
                      title: `Year ${d.x}`,
                      items: [
                        { label: 'Export', value: `${d.exportVal.toFixed(2)} ${unit}`, color: 'var(--color-export)' },
                        { label: 'Import', value: `${d.importVal.toFixed(2)} ${unit}`, color: 'var(--color-import)' },
                        { label: 'Balance', value: `${(d.exportVal - d.importVal).toFixed(2)} ${unit}` },
                      ],
                    });
                  }}
                />
              </g>
            ))}
          </g>
        </svg>
      </div>

      <Tooltip tooltip={tooltip} />
    </div>
  );
};

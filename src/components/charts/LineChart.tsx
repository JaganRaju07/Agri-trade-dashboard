import React, { useState } from 'react';
import { scaleLinear } from 'd3-scale';
import { line as d3Line, curveMonotoneX } from 'd3-shape';
import { Tooltip, TooltipData } from './Tooltip';

export interface LinePoint {
  x: number; // e.g. Year
  y: number; // e.g. Value
  y2?: number; // optional second series
}

interface LineChartProps {
  data: LinePoint[];
  title?: string;
  series1Name?: string;
  series2Name?: string;
  series1Color?: string;
  series2Color?: string;
  unit?: string;
  height?: number;
}

export const LineChart: React.FC<LineChartProps> = ({
  data,
  title,
  series1Name = 'Export',
  series2Name = 'Import',
  series1Color = 'var(--color-export)',
  series2Color = 'var(--color-import)',
  unit = 'USD bn',
  height = 300,
}) => {
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="card" style={{ height: `${height}px`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--muted-ink)' }}>No data available for the current filter selection.</p>
      </div>
    );
  }

  const margin = { top: 24, right: 90, bottom: 32, left: 50 };
  const width = 640;
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const xExtent = [Math.min(...data.map((d) => d.x)), Math.max(...data.map((d) => d.x))];
  const allYVals = data.flatMap((d) => (d.y2 !== undefined ? [d.y, d.y2] : [d.y]));
  const maxY = Math.max(...allYVals, 1);
  const minY = Math.min(0, ...allYVals);

  const xScale = scaleLinear().domain(xExtent).range([0, innerWidth]);
  const yScale = scaleLinear().domain([minY, maxY * 1.05]).range([innerHeight, 0]);

  const line1Gen = d3Line<LinePoint>()
    .x((d) => xScale(d.x))
    .y((d) => yScale(d.y))
    .curve(curveMonotoneX);

  const line2Gen = d3Line<LinePoint>()
    .x((d) => xScale(d.x))
    .y((d) => yScale(d.y2 ?? 0))
    .curve(curveMonotoneX);

  const yTicks = yScale.ticks(5);
  const xTicks = data.map((d) => d.x).filter((_, idx, arr) => arr.length <= 12 || idx % 2 === 0);

  const lastPoint = data[data.length - 1];
  const hasSeries2 = data.some((d) => d.y2 !== undefined);

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
            {/* Horizontal Gridlines */}
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

            {/* X-axis labels */}
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

            {/* Baseline at 0 */}
            <line x1={0} x2={innerWidth} y1={yScale(0)} y2={yScale(0)} stroke="var(--hairline-dark)" strokeWidth={1} />

            {/* Series 1 Line */}
            <path
              d={line1Gen(data) || ''}
              fill="none"
              stroke={series1Color}
              strokeWidth={2}
              strokeLinecap="round"
            />

            {/* Series 2 Line */}
            {hasSeries2 && (
              <path
                d={line2Gen(data) || ''}
                fill="none"
                stroke={series2Color}
                strokeWidth={2}
                strokeLinecap="round"
                strokeDasharray="4 2"
              />
            )}

            {/* End direct labels */}
            {lastPoint && (
              <>
                <text
                  x={xScale(lastPoint.x) + 8}
                  y={yScale(lastPoint.y) + 4}
                  style={{ fontSize: '11px', fontWeight: 600, fill: series1Color }}
                >
                  {series1Name}
                </text>
                {hasSeries2 && lastPoint.y2 !== undefined && (
                  <text
                    x={xScale(lastPoint.x) + 8}
                    y={yScale(lastPoint.y2) + 4}
                    style={{ fontSize: '11px', fontWeight: 600, fill: series2Color }}
                  >
                    {series2Name}
                  </text>
                )}
              </>
            )}

            {/* Hover Points and Interaction overlays */}
            {data.map((d, i) => (
              <g key={i}>
                <circle
                  cx={xScale(d.x)}
                  cy={yScale(d.y)}
                  r={3.5}
                  fill="var(--surface)"
                  stroke={series1Color}
                  strokeWidth={1.5}
                />
                {d.y2 !== undefined && (
                  <circle
                    cx={xScale(d.x)}
                    cy={yScale(d.y2)}
                    r={3.5}
                    fill="var(--surface)"
                    stroke={series2Color}
                    strokeWidth={1.5}
                  />
                )}
                {/* Invisible hit area for tooltip */}
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
                        { label: series1Name, value: `${d.y.toFixed(2)} ${unit}`, color: series1Color },
                        ...(d.y2 !== undefined
                          ? [{ label: series2Name, value: `${d.y2.toFixed(2)} ${unit}`, color: series2Color }]
                          : []),
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

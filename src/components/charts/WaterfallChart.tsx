import React, { useState } from 'react';
import { scaleLinear, scaleBand } from 'd3-scale';
import { Tooltip, TooltipData } from './Tooltip';

export interface WaterfallItem {
  id: string;
  label: string;
  value: number; // positive = surplus, negative = deficit
}

interface WaterfallChartProps {
  data: WaterfallItem[];
  title?: string;
  unit?: string;
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  height?: number;
}

export const WaterfallChart: React.FC<WaterfallChartProps> = ({
  data,
  title,
  unit = 'USD bn',
  selectedId = null,
  onSelect,
  height = 360,
}) => {
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="card" style={{ height: `${height}px`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--muted-ink)' }}>No data available.</p>
      </div>
    );
  }

  // Compute waterfall steps
  let running = 0;
  const steps: Array<{
    id: string;
    label: string;
    start: number;
    end: number;
    delta: number;
    isTotal: boolean;
  }> = [];

  data.forEach((d) => {
    const start = running;
    const end = running + d.value;
    steps.push({
      id: d.id,
      label: d.label,
      start,
      end,
      delta: d.value,
      isTotal: false,
    });
    running = end;
  });

  // Final closing total
  steps.push({
    id: '__total__',
    label: 'Net Balance',
    start: 0,
    end: running,
    delta: running,
    isTotal: true,
  });

  const margin = { top: 30, right: 24, bottom: 64, left: 60 };
  const width = 640;
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const allVals = steps.flatMap((s) => [s.start, s.end, 0]);
  const minVal = Math.min(...allVals) * 1.1;
  const maxVal = Math.max(...allVals) * 1.1;

  const yScale = scaleLinear().domain([minVal, maxVal]).range([innerHeight, 0]);
  const xScale = scaleBand()
    .domain(steps.map((s) => s.id))
    .range([0, innerWidth])
    .padding(0.24);

  const zeroY = yScale(0);
  const yTicks = yScale.ticks(6);

  return (
    <div className="card" style={{ position: 'relative' }}>
      {title && (
        <div style={{ marginBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink)' }}>{title}</h3>
          <span style={{ fontSize: '11px', color: 'var(--muted-ink)' }}>Surplus (+) / Deficit (-) • {unit}</span>
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
            {yTicks.map((t) => (
              <g key={t} transform={`translate(0, ${yScale(t)})`}>
                <line x1={0} x2={innerWidth} stroke="var(--hairline)" strokeWidth={1} strokeDasharray="3 3" />
                <text x={-8} y={4} textAnchor="end" className="mono" style={{ fontSize: '11px', fill: 'var(--muted-ink)' }}>
                  {t}
                </text>
              </g>
            ))}

            {/* Zero Baseline */}
            <line x1={0} x2={innerWidth} y1={zeroY} y2={zeroY} stroke="var(--hairline-dark)" strokeWidth={1} />

            {/* Steps */}
            {steps.map((step, idx) => {
              const x = xScale(step.id) ?? 0;
              const barWidth = xScale.bandwidth();
              const isSelected = selectedId === step.id;
              const hasSelection = selectedId !== null && selectedId !== '__total__';

              const topY = yScale(Math.max(step.start, step.end));
              const botY = yScale(Math.min(step.start, step.end));
              const barH = Math.max(botY - topY, 2);

              let barColor = 'var(--ink)';
              if (!step.isTotal) {
                barColor = step.delta >= 0 ? 'var(--color-surplus)' : 'var(--color-deficit)';
              }

              const opacity = hasSelection ? (isSelected ? 1 : 0.3) : step.isTotal ? 0.75 : 0.9;

              // Connector line to next step
              const nextStep = steps[idx + 1];

              return (
                <g
                  key={step.id}
                  style={{ cursor: step.isTotal ? 'default' : onSelect ? 'pointer' : 'default' }}
                  onClick={() => !step.isTotal && onSelect && onSelect(step.id)}
                  onMouseEnter={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setTooltip({
                      x: rect.left + barWidth / 2,
                      y: rect.top,
                      title: step.label,
                      items: [
                        {
                          label: step.isTotal ? 'Closing Total' : 'Net Contribution',
                          value: `${step.delta >= 0 ? '+' : ''}${step.delta.toFixed(2)} ${unit}`,
                          color: barColor,
                        },
                        { label: 'Running Balance', value: `${step.end.toFixed(2)} ${unit}` },
                      ],
                    });
                  }}
                >
                  <rect
                    x={x}
                    y={topY}
                    width={barWidth}
                    height={barH}
                    fill={barColor}
                    opacity={opacity}
                    rx={1}
                  />

                  {/* Connector line */}
                  {nextStep && (
                    <line
                      x1={x + barWidth}
                      x2={xScale(nextStep.id) ?? 0}
                      y1={yScale(step.end)}
                      y2={yScale(step.end)}
                      stroke="var(--hairline-dark)"
                      strokeWidth={1}
                      strokeDasharray="2 2"
                    />
                  )}

                  {/* Rotated label below */}
                  <text
                    transform={`translate(${x + barWidth / 2}, ${innerHeight + 12}) rotate(-35)`}
                    textAnchor="end"
                    style={{
                      fontSize: '10.5px',
                      fill: isSelected ? 'var(--ink)' : 'var(--muted-ink)',
                      fontWeight: isSelected || step.isTotal ? 600 : 400,
                    }}
                  >
                    {step.label.length > 14 ? step.label.slice(0, 13) + '…' : step.label}
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

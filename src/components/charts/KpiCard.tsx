import React from 'react';
import { scaleLinear } from 'd3-scale';
import { line as d3Line } from 'd3-shape';

interface KpiCardProps {
  label: string;
  value: string | number;
  unit?: string;
  subtext?: string;
  sparklineData?: number[];
  color?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  label,
  value,
  unit,
  subtext,
  sparklineData,
  color = 'var(--ink)'
}) => {
  let sparklineSvg: React.ReactNode = null;

  if (sparklineData && sparklineData.length > 1) {
    const w = 80;
    const h = 26;
    const minVal = Math.min(...sparklineData);
    const maxVal = Math.max(...sparklineData);
    const range = maxVal - minVal || 1;

    const xScale = scaleLinear().domain([0, sparklineData.length - 1]).range([2, w - 2]);
    const yScale = scaleLinear().domain([minVal - range * 0.1, maxVal + range * 0.1]).range([h - 2, 2]);

    const lineGen = d3Line<number>()
      .x((_, i) => xScale(i))
      .y((d) => yScale(d));

    const pathStr = lineGen(sparklineData);

    sparklineSvg = (
      <svg width={w} height={h} style={{ overflow: 'visible' }}>
        {pathStr && (
          <path
            d={pathStr}
            fill="none"
            stroke={color}
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
        <circle
          cx={xScale(sparklineData.length - 1)}
          cy={yScale(sparklineData[sparklineData.length - 1])}
          r={2}
          fill={color}
        />
      </svg>
    );
  }

  return (
    <div
      className="card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: '94px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span
          style={{
            fontSize: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'var(--muted-ink)',
            fontWeight: 600,
          }}
        >
          {label}
        </span>
        {sparklineSvg}
      </div>

      <div style={{ marginTop: '8px', display: 'flex', alignItems: 'baseline', gap: '6px' }}>
        <span
          className="mono"
          style={{
            fontSize: '26px',
            fontWeight: 600,
            color: color,
            lineHeight: 1.1,
          }}
        >
          {value}
        </span>
        {unit && (
          <span style={{ fontSize: '12px', color: 'var(--muted-ink)' }}>
            {unit}
          </span>
        )}
      </div>

      {subtext && (
        <div style={{ fontSize: '11.5px', color: 'var(--muted-ink)', marginTop: '4px' }}>
          {subtext}
        </div>
      )}
    </div>
  );
};

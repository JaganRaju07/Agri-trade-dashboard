import React, { useState } from 'react';
import { hierarchy, treemap, treemapSquarify, HierarchyRectangularNode } from 'd3-hierarchy';
import { Tooltip, TooltipData } from './Tooltip';

const EARTH_COLORS = ['#4A5D4E', '#8C9A7A', '#C2B69D', '#A47551', '#6D7973', '#8E8279', '#5B6E60', '#9A8C78'];

export interface TreemapItem {
  id: string;
  label: string;
  value: number;
  sublabel?: string;
  color?: string;
}

interface TreemapChartProps {
  data: TreemapItem[];
  title?: string;
  unit?: string;
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  height?: number;
}

export const TreemapChart: React.FC<TreemapChartProps> = ({
  data,
  title,
  unit = 'USD bn',
  selectedId = null,
  onSelect,
  height = 360,
}) => {
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);

  const validData = data.filter((d) => d.value > 0);
  if (!validData || validData.length === 0) {
    return (
      <div className="card" style={{ height: `${height}px`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--muted-ink)' }}>No data available.</p>
      </div>
    );
  }

  const width = 640;
  const root = hierarchy<{ children: TreemapItem[] }>({ children: validData })
    .sum((d: any) => d.value)
    .sort((a, b) => (b.value || 0) - (a.value || 0));

  const treemapLayout = treemap<{ children: TreemapItem[] }>()
    .size([width, height - 50])
    .tile(treemapSquarify.ratio(1.3))
    .paddingInner(2);

  treemapLayout(root);

  const leaves = root.leaves() as HierarchyRectangularNode<any>[];
  const total = root.value || 1;

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
          viewBox={`0 0 ${width} ${height - 50}`}
          style={{ width: '100%', height: `${height - 50}px`, overflow: 'hidden' }}
          onMouseLeave={() => setTooltip(null)}
        >
          {leaves.map((leaf, idx) => {
            const d = leaf.data as any as TreemapItem;
            const w = leaf.x1 - leaf.x0;
            const h = leaf.y1 - leaf.y0;
            const isSelected = selectedId === d.id;
            const hasSelection = selectedId !== null;
            const color = d.color || EARTH_COLORS[idx % EARTH_COLORS.length];
            const opacity = hasSelection ? (isSelected ? 1 : 0.35) : 0.92;
            const pct = (d.value / total) * 100;

            return (
              <g
                key={d.id}
                transform={`translate(${leaf.x0}, ${leaf.y0})`}
                style={{ cursor: onSelect ? 'pointer' : 'default' }}
                onClick={() => onSelect && onSelect(d.id)}
                onMouseEnter={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setTooltip({
                    x: rect.left + w / 2,
                    y: rect.top,
                    title: d.label,
                    items: [
                      { label: 'Value', value: `${d.value.toFixed(2)} ${unit}`, color },
                      { label: 'Share', value: `${pct.toFixed(1)}%` },
                      ...(d.sublabel ? [{ label: 'Detail', value: d.sublabel }] : []),
                    ],
                  });
                }}
              >
                <rect
                  width={Math.max(w, 0)}
                  height={Math.max(h, 0)}
                  fill={color}
                  opacity={opacity}
                  stroke="var(--surface)"
                  strokeWidth={1}
                />
                {w > 45 && h > 24 && (
                  <text
                    x={6}
                    y={16}
                    style={{
                      fontSize: w > 80 ? '11.5px' : '10px',
                      fontWeight: 600,
                      fill: '#FBFAF5',
                      pointerEvents: 'none',
                    }}
                  >
                    {w < 70 ? d.label.slice(0, 6) + '…' : d.label.length > 15 ? d.label.slice(0, 14) + '…' : d.label}
                  </text>
                )}
                {w > 45 && h > 40 && (
                  <text
                    x={6}
                    y={32}
                    className="mono"
                    style={{
                      fontSize: '10.5px',
                      fill: '#D9D4C7',
                      pointerEvents: 'none',
                    }}
                  >
                    {d.value.toFixed(1)}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      <Tooltip tooltip={tooltip} />
    </div>
  );
};

import React, { useState } from 'react';
import { scaleSequential } from 'd3-scale';
import { Tooltip, TooltipData } from './Tooltip';
import { AreaYearCell } from '../../lib/aggregation';

interface MatrixHeatmapProps {
  data: AreaYearCell[];
  title?: string;
  selectedArea?: string | null;
  onSelectArea?: (area: string) => void;
  unit?: string;
}

export const MatrixHeatmap: React.FC<MatrixHeatmapProps> = ({
  data,
  title,
  selectedArea = null,
  onSelectArea,
  unit = 'USD bn',
}) => {
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="card" style={{ height: '320px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--muted-ink)' }}>No data available.</p>
      </div>
    );
  }

  const areas = Array.from(new Set(data.map((d) => d.area))).sort();
  const years = Array.from(new Set(data.map((d) => d.year))).sort((a, b) => a - b);

  // Map area_year -> exportValueBn
  const cellMap = new Map<string, number>();
  let maxVal = 0.1;
  data.forEach((d) => {
    cellMap.set(`${d.area}_${d.year}`, d.exportValueBn);
    if (d.exportValueBn > maxVal) maxVal = d.exportValueBn;
  });

  // Light paper green to deep forest green interpolator
  const colorScale = scaleSequential((t) => {
    // interpolate between #F5F2EA and #2F5D45
    const r = Math.round(245 - t * (245 - 47));
    const g = Math.round(242 - t * (242 - 93));
    const b = Math.round(234 - t * (234 - 69));
    return `rgb(${r}, ${g}, ${b})`;
  }).domain([0, maxVal]);

  return (
    <div className="card" style={{ position: 'relative' }}>
      {title && (
        <div style={{ marginBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink)' }}>{title}</h3>
          <span style={{ fontSize: '11px', color: 'var(--muted-ink)' }}>Export Value Heatmap • {unit}</span>
        </div>
      )}

      <div style={{ overflowX: 'auto', width: '100%' }}>
        <table className="ledger-table" style={{ fontSize: '11px', minWidth: '700px' }}>
          <thead>
            <tr>
              <th style={{ width: '150px' }}>Reporting Nation</th>
              {years.map((y) => (
                <th key={y} className="num" style={{ textAlign: 'center', padding: '4px' }}>
                  {String(y).slice(2)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {areas.map((areaName) => {
              const isSelected = selectedArea === areaName;
              return (
                <tr
                  key={areaName}
                  style={{
                    backgroundColor: isSelected ? 'rgba(47, 93, 69, 0.08)' : 'transparent',
                    fontWeight: isSelected ? 600 : 400,
                  }}
                >
                  <td
                    style={{
                      cursor: onSelectArea ? 'pointer' : 'default',
                      whiteSpace: 'nowrap',
                      borderRight: '1px solid var(--hairline)',
                      color: isSelected ? 'var(--color-export)' : 'var(--ink)',
                    }}
                    onClick={() => onSelectArea && onSelectArea(areaName)}
                  >
                    {areaName}
                  </td>
                  {years.map((y) => {
                    const val = cellMap.get(`${areaName}_${y}`) ?? 0;
                    const bg = colorScale(val);
                    const isDark = val > maxVal * 0.55;

                    return (
                      <td
                        key={y}
                        className="num"
                        style={{
                          backgroundColor: bg,
                          color: isDark ? '#FBFAF5' : 'var(--ink)',
                          textAlign: 'center',
                          padding: '6px 2px',
                          border: '1px solid rgba(217, 212, 199, 0.4)',
                          cursor: 'pointer',
                        }}
                        onMouseEnter={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setTooltip({
                            x: rect.left,
                            y: rect.top,
                            title: `${areaName} (${y})`,
                            items: [
                              { label: 'Export Value', value: `${val.toFixed(2)} ${unit}`, color: 'var(--color-export)' },
                            ],
                          });
                        }}
                        onMouseLeave={() => setTooltip(null)}
                      >
                        {val >= 0.1 ? val.toFixed(1) : ''}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Tooltip tooltip={tooltip} />
    </div>
  );
};

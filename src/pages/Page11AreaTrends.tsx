import React from 'react';
import { YearAggregate, AreaYearCell } from '../types/data';
import { AreaChart, RibbonChart, ColumnChart } from '../components/charts';
import { useFilters } from '../lib/filterStore';

interface Page11Props {
  yearAggs: YearAggregate[];
  matrixData: AreaYearCell[];
}

export const Page11AreaTrends: React.FC<Page11Props> = ({ yearAggs, matrixData }) => {
  const [filters, store] = useFilters();

  const areaChartData = yearAggs.map((d) => ({
    x: d.year,
    exportVal: d.exportValueBn,
    importVal: d.importValueBn,
  }));

  const ribbonData = matrixData.map((d) => ({
    year: d.year,
    area: d.area,
    value: d.exportValueBn,
  }));

  // Column chart data: Export by Year (colored by cross-filtered Area or overall)
  const colData = yearAggs.map((d) => ({
    id: d.year,
    label: String(d.year),
    value: d.exportValueBn,
    color: 'var(--color-export)',
    sublabel: `Export: USD ${d.exportValueBn.toFixed(2)} bn`,
  }));

  const findingText = filters.crossFilterArea
    ? `Tracking historical trajectories for ${filters.crossFilterArea} across 2000–2024.`
    : `Historical trade trajectory showcases steady multi-decade expansion, with rank shifts captured in the national export ribbon.`;

  return (
    <div>
      <h1 className="page-title">11 Area Trends</h1>
      <p className="page-finding">{findingText}</p>

      {/* Area chart: Export vs Import by Year */}
      <div>
        <AreaChart
          title="Agricultural Trade Growth: Gross Export vs Import Volume (USD bn)"
          data={areaChartData}
          unit="USD bn"
          height={320}
        />
      </div>

      {/* Ribbon chart: Area rank by Export over Year */}
      <div style={{ marginTop: '24px' }}>
        <RibbonChart
          title="National Export Rank Dynamics (Ribbon Bump Chart)"
          data={ribbonData}
          selectedArea={filters.crossFilterArea}
          onSelectArea={(a) => store.setCrossFilterArea(a)}
          height={400}
        />
      </div>

      {/* Column chart: Export by Year */}
      <div style={{ marginTop: '24px' }}>
        <ColumnChart
          title="Annual National Export Volume (USD bn)"
          data={colData}
          unit="USD bn"
          height={280}
        />
      </div>
    </div>
  );
};

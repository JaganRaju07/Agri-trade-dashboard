import React from 'react';
import { CoreAggregates, YearAggregate, AreaAggregate, ItemAggregate, AreaYearCell } from '../types/data';
import { KpiCard, MatrixHeatmap, BarChart, LineChart, TreemapChart } from '../components/charts';
import { useFilters } from '../lib/filterStore';

interface Page07Props {
  core: CoreAggregates;
  yearAggs: YearAggregate[];
  areaAggs: AreaAggregate[];
  itemAggs: ItemAggregate[];
  matrixData: AreaYearCell[];
}

export const Page07GrowthAndShare: React.FC<Page07Props> = ({
  core,
  yearAggs,
  areaAggs,
  itemAggs,
  matrixData,
}) => {
  const [filters, store] = useFilters();

  const findingText = `Total agricultural trade turnover reached USD ${core.totalTradeBn.toFixed(2)} bn with dynamic year-over-year fluctuations and trade market concentration.`;

  // Bar data: Country Share %
  const sortedCountryShare = [...areaAggs].sort((a, b) => b.countrySharePct - a.countrySharePct);
  const countryShareBars = sortedCountryShare.map((a) => ({
    id: a.area,
    label: a.area,
    value: a.countrySharePct,
    color: 'var(--color-export)',
    sublabel: `Export: USD ${a.exportValueBn.toFixed(2)} bn`,
  }));

  // Line data: YoY % comparison
  const yoyLineData = yearAggs
    .filter((d) => d.exportYoY !== null || d.importYoY !== null)
    .map((d) => ({
      x: d.year,
      y: d.exportYoY ?? 0,
      y2: d.importYoY ?? 0,
    }));

  // Treemap data: Item by Total Trade Value
  const sortedItems = [...itemAggs].sort((a, b) => b.totalTradeBn - a.totalTradeBn);
  const treemapData = sortedItems.map((it) => ({
    id: it.item,
    label: it.item,
    value: it.totalTradeBn,
    sublabel: `Turnover: USD ${it.totalTradeBn.toFixed(2)} bn`,
  }));

  return (
    <div>
      <h1 className="page-title">07 Growth and Share</h1>
      <p className="page-finding">{findingText}</p>

      {/* KPI Cards Row */}
      <div className="kpi-grid">
        <KpiCard
          label="Total Trade Value"
          value={core.totalTradeBn.toFixed(2)}
          unit="USD bn"
          subtext="Gross agricultural trade turnover (Export + Import)"
          sparklineData={yearAggs.map((d) => d.totalTradeBn)}
          color="var(--ink)"
        />
        <KpiCard
          label="Export YoY (Latest)"
          value={
            yearAggs.length > 0 && yearAggs[yearAggs.length - 1].exportYoY !== null
              ? `${yearAggs[yearAggs.length - 1].exportYoY! >= 0 ? '+' : ''}${yearAggs[yearAggs.length - 1].exportYoY!.toFixed(1)}%`
              : '—'
          }
          unit="annual change"
          subtext={`Year ${yearAggs[yearAggs.length - 1]?.year ?? '—'} vs prior period`}
          color="var(--color-export)"
        />
        <KpiCard
          label="Import YoY (Latest)"
          value={
            yearAggs.length > 0 && yearAggs[yearAggs.length - 1].importYoY !== null
              ? `${yearAggs[yearAggs.length - 1].importYoY! >= 0 ? '+' : ''}${yearAggs[yearAggs.length - 1].importYoY!.toFixed(1)}%`
              : '—'
          }
          unit="annual change"
          subtext={`Year ${yearAggs[yearAggs.length - 1]?.year ?? '—'} vs prior period`}
          color="var(--color-import)"
        />
        <KpiCard
          label="Dominant Nation Share"
          value={sortedCountryShare[0] ? `${sortedCountryShare[0].countrySharePct.toFixed(1)}%` : '—'}
          unit={sortedCountryShare[0]?.area ?? ''}
          subtext="Leading export market share"
          color="var(--color-export)"
        />
      </div>

      {/* Matrix Heatmap */}
      <div style={{ marginTop: '24px' }}>
        <MatrixHeatmap
          title="Export Heatmap: Reporting Nation × Year (USD bn)"
          data={matrixData}
          selectedArea={filters.crossFilterArea}
          onSelectArea={(a) => store.setCrossFilterArea(a)}
        />
      </div>

      {/* 2-column: Country Share Bar & YoY Line */}
      <div style={{ marginTop: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div>
          <BarChart
            title="Country Share of Exports %"
            data={countryShareBars}
            unit="%"
            selectedId={filters.crossFilterArea}
            onSelect={(id) => store.setCrossFilterArea(id)}
            height={360}
            maxBars={12}
          />
        </div>

        <div>
          <LineChart
            title="Annual Growth Rates: Export YoY % vs Import YoY %"
            data={yoyLineData}
            series1Name="Export YoY %"
            series2Name="Import YoY %"
            series1Color="var(--color-export)"
            series2Color="var(--color-import)"
            unit="%"
            height={360}
          />
        </div>
      </div>

      {/* Treemap */}
      <div style={{ marginTop: '24px' }}>
        <TreemapChart
          title="Commodity Distribution by Total Trade Value (USD bn)"
          data={treemapData}
          unit="USD bn"
          selectedId={filters.crossFilterItem}
          onSelect={(id) => store.setCrossFilterItem(id)}
          height={380}
        />
      </div>
    </div>
  );
};

import React from 'react';
import { CoreAggregates, YearAggregate, ItemAggregate } from '../types/data';
import { LineChart, BarChart, KpiCard } from '../components/charts';
import { useFilters } from '../lib/filterStore';

interface Page06Props {
  core: CoreAggregates;
  yearAggs: YearAggregate[];
  itemAggs: ItemAggregate[];
}

export const Page06QuantityAnalysis: React.FC<Page06Props> = ({
  core,
  yearAggs,
  itemAggs,
}) => {
  const [filters, store] = useFilters();

  const sortedItems = [...itemAggs].sort((a, b) => b.exportQuantityMt - a.exportQuantityMt);
  const topQtyProduct = sortedItems[0];

  const netQtyMt = core.exportQuantityMt - core.importQuantityMt;

  const findingText = `Global physical export volume totaled ${core.exportQuantityMt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Mt against import demand of ${core.importQuantityMt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Mt (${netQtyMt >= 0 ? '+' : ''}${netQtyMt.toFixed(2)} Mt net volume).`;

  const lineData = yearAggs.map((d) => ({
    x: d.year,
    y: d.exportQuantityMt,
    y2: d.importQuantityMt,
  }));

  const barData = sortedItems.slice(0, 15).map((it) => ({
    id: it.item,
    label: it.item,
    value: it.exportQuantityMt,
    color: 'var(--color-export)',
    sublabel: `Physical volume: ${it.exportQuantityMt.toFixed(2)} Mt`,
  }));

  return (
    <div>
      <h1 className="page-title">06 Quantity Analysis</h1>
      <p className="page-finding">{findingText}</p>

      {/* Cards: full numbers */}
      <div className="kpi-grid">
        <KpiCard
          label="Export Quantity"
          value={core.exportQuantityMt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          unit="Mt"
          subtext="Total physical export volume in Million tonnes"
          sparklineData={yearAggs.map((d) => d.exportQuantityMt)}
          color="var(--color-export)"
        />
        <KpiCard
          label="Import Quantity"
          value={core.importQuantityMt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          unit="Mt"
          subtext="Total physical import receipts in Million tonnes"
          sparklineData={yearAggs.map((d) => d.importQuantityMt)}
          color="var(--color-import)"
        />
        <KpiCard
          label="Net Physical Balance"
          value={`${netQtyMt >= 0 ? '+' : ''}${netQtyMt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          unit="Mt"
          subtext={netQtyMt >= 0 ? 'Net volume surplus' : 'Net volume deficit'}
          color={netQtyMt >= 0 ? 'var(--color-surplus)' : 'var(--color-deficit)'}
        />
        <KpiCard
          label="Top Volume Commodity"
          value={topQtyProduct ? topQtyProduct.item : '—'}
          unit={topQtyProduct ? `${topQtyProduct.exportQuantityMt.toFixed(1)} Mt` : ''}
          subtext="Largest bulk agricultural export"
          color="var(--ink)"
        />
      </div>

      <div style={{ marginTop: '24px' }}>
        <LineChart
          title="Physical Trade Trajectory: Export vs Import Quantity (2000–2024)"
          data={lineData}
          series1Name="Export Quantity"
          series2Name="Import Quantity"
          series1Color="var(--color-export)"
          series2Color="var(--color-import)"
          unit="Mt"
          height={320}
        />
      </div>

      <div style={{ marginTop: '24px' }}>
        <BarChart
          title="Top 15 Commodities by Physical Export Quantity (Mt)"
          data={barData}
          unit="Mt"
          selectedId={filters.crossFilterItem}
          onSelect={(id) => store.setCrossFilterItem(id)}
          height={420}
          maxBars={15}
        />
      </div>
    </div>
  );
};

import React from 'react';
import { AreaAggregate } from '../types/data';
import { BarChart, KpiCard } from '../components/charts';
import { useFilters } from '../lib/filterStore';

interface Page02Props {
  areaAggs: AreaAggregate[];
}

export const Page02AreaAnalysis: React.FC<Page02Props> = ({ areaAggs }) => {
  const [filters, store] = useFilters();

  const sortedAreas = [...areaAggs].sort((a, b) => b.exportValueBn - a.exportValueBn);
  const topExporter = sortedAreas[0];
  const activeCount = sortedAreas.filter((a) => a.exportValueBn > 0).length;

  const findingText = topExporter
    ? `${topExporter.area} leads national exports with USD ${topExporter.exportValueBn.toFixed(2)} bn (${topExporter.countrySharePct.toFixed(1)}% of total selected exports).`
    : 'No active trade recorded for the selected filter combination.';

  const barData = sortedAreas.map((a) => ({
    id: a.area,
    label: a.area,
    value: a.exportValueBn,
    color: 'var(--color-export)',
    sublabel: `Share: ${a.countrySharePct.toFixed(1)}% | Balance: ${a.tradeBalanceBn >= 0 ? '+' : ''}${a.tradeBalanceBn.toFixed(2)} bn`,
  }));

  return (
    <div>
      <h1 className="page-title">02 Area Analysis</h1>
      <p className="page-finding">{findingText}</p>

      <div className="kpi-grid">
        <KpiCard
          label="Leading Exporter"
          value={topExporter ? topExporter.area : '—'}
          unit={topExporter ? `${topExporter.exportValueBn.toFixed(1)} bn` : ''}
          subtext={topExporter ? `${topExporter.countrySharePct.toFixed(1)}% national share` : ''}
          color="var(--color-export)"
        />
        <KpiCard
          label="Reporting Nations"
          value={activeCount}
          unit="countries"
          subtext="Active in current selection"
          color="var(--ink)"
        />
        <KpiCard
          label="Export Concentration"
          value={
            sortedAreas.length >= 2
              ? `${((sortedAreas.slice(0, 2).reduce((s, a) => s + a.exportValueBn, 0) / (sortedAreas.reduce((s, a) => s + a.exportValueBn, 0) || 1)) * 100).toFixed(1)}%`
              : '100%'
          }
          unit="Top 2 share"
          subtext="Share of USA & Brazil combined"
          color="var(--ink)"
        />
      </div>

      <div style={{ marginTop: '24px' }}>
        <BarChart
          title="Export Value by Reporting Nation (USD bn)"
          data={barData}
          unit="USD bn"
          selectedId={filters.crossFilterArea}
          onSelect={(id) => store.setCrossFilterArea(id)}
          height={420}
          maxBars={12}
        />
      </div>
    </div>
  );
};

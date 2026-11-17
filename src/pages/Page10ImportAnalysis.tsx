import React from 'react';
import { CoreAggregates, YearAggregate, AreaAggregate, ItemAggregate } from '../types/data';
import { KpiCard, TreemapChart, BarChart, LineChart } from '../components/charts';
import { useFilters } from '../lib/filterStore';

interface Page10Props {
  core: CoreAggregates;
  yearAggs: YearAggregate[];
  areaAggs: AreaAggregate[];
  itemAggs: ItemAggregate[];
}

export const Page10ImportAnalysis: React.FC<Page10Props> = ({
  core,
  yearAggs,
  areaAggs,
  itemAggs,
}) => {
  const [filters, store] = useFilters();

  const sortedAreas = [...areaAggs].sort((a, b) => b.importValueBn - a.importValueBn);
  const sortedItems = [...itemAggs].sort((a, b) => b.importValueBn - a.importValueBn);

  const topImporter = sortedAreas[0];
  const topImportItem = sortedItems[0];

  const findingText = topImporter && topImportItem
    ? `${topImporter.area} dominates global import demand with USD ${topImporter.importValueBn.toFixed(2)} bn, with ${topImportItem.item} representing the primary inbound commodity.`
    : 'No import records found for active criteria.';

  const treemapData = sortedItems
    .filter((it) => it.importValueBn > 0)
    .map((it) => ({
      id: it.item,
      label: it.item,
      value: it.importValueBn,
      sublabel: `Import: USD ${it.importValueBn.toFixed(2)} bn`,
    }));

  const barData = sortedAreas.map((a) => ({
    id: a.area,
    label: a.area,
    value: a.importValueBn,
    color: 'var(--color-import)',
    sublabel: `Import: USD ${a.importValueBn.toFixed(2)} bn | Volume: ${a.importQuantityMt.toFixed(2)} Mt`,
  }));

  const lineData = yearAggs.map((d) => ({
    x: d.year,
    y: d.importValueBn,
  }));

  return (
    <div>
      <h1 className="page-title">10 Import Analysis</h1>
      <p className="page-finding">{findingText}</p>

      {/* Cards: Full numbers */}
      <div className="kpi-grid">
        <KpiCard
          label="Import Value"
          value={core.importValueBn.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          unit="USD bn"
          subtext="Total inbound agricultural receipts"
          sparklineData={yearAggs.map((d) => d.importValueBn)}
          color="var(--color-import)"
        />
        <KpiCard
          label="Import Quantity"
          value={core.importQuantityMt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          unit="Mt"
          subtext="Total inbound physical volume in Million tonnes"
          sparklineData={yearAggs.map((d) => d.importQuantityMt)}
          color="var(--color-import)"
        />
        <KpiCard
          label="Top Importer Nation"
          value={topImporter ? topImporter.area : '—'}
          unit={topImporter ? `${topImporter.importValueBn.toFixed(1)} bn` : ''}
          subtext="Largest agricultural importer"
          color="var(--color-import)"
        />
        <KpiCard
          label="Top Imported Commodity"
          value={topImportItem ? topImportItem.item : '—'}
          unit={topImportItem ? `${topImportItem.importValueBn.toFixed(1)} bn` : ''}
          subtext="Highest value import product"
          color="var(--ink)"
        />
      </div>

      <div style={{ marginTop: '24px' }}>
        <TreemapChart
          title="Commodity Import Allocation (USD bn)"
          data={treemapData}
          unit="USD bn"
          selectedId={filters.crossFilterItem}
          onSelect={(id) => store.setCrossFilterItem(id)}
          height={380}
        />
      </div>

      <div style={{ marginTop: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div>
          <BarChart
            title="Import Value by Reporting Nation"
            data={barData}
            unit="USD bn"
            selectedId={filters.crossFilterArea}
            onSelect={(id) => store.setCrossFilterArea(id)}
            height={380}
            maxBars={12}
          />
        </div>

        <div>
          <LineChart
            title="Import Value Trajectory by Year (2000–2024)"
            data={lineData}
            series1Name="Import Value"
            series1Color="var(--color-import)"
            unit="USD bn"
            height={380}
          />
        </div>
      </div>
    </div>
  );
};

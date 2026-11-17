import React from 'react';
import { AreaAggregate } from '../types/data';
import { PieChart, KpiCard, DataTable, ColumnDef } from '../components/charts';
import { useFilters } from '../lib/filterStore';

interface Page08Props {
  areaAggs: AreaAggregate[];
}

export const Page08TradeComposition: React.FC<Page08Props> = ({ areaAggs }) => {
  const [filters, store] = useFilters();

  const sortedAreas = [...areaAggs].sort((a, b) => b.exportValueBn - a.exportValueBn);
  const totalExp = sortedAreas.reduce((acc, a) => acc + a.exportValueBn, 0);

  const top1 = sortedAreas[0];
  const top2 = sortedAreas[1];
  const top2Share = totalExp > 0 && top1 && top2 ? ((top1.exportValueBn + top2.exportValueBn) / totalExp) * 100 : 0;

  const findingText = top1 && top2
    ? `Agricultural export composition is heavily anchored by ${top1.area} (${top1.countrySharePct.toFixed(1)}%) and ${top2.area} (${top2.countrySharePct.toFixed(1)}%), collectively comprising ${top2Share.toFixed(1)}% of total export trade.`
    : 'No export records available for current selection.';

  const pieData = sortedAreas.map((a) => ({
    id: a.area,
    label: a.area,
    value: a.exportValueBn,
  }));

  const columns: ColumnDef<AreaAggregate>[] = [
    {
      key: 'area',
      header: 'Reporting Nation',
      render: (r) => r.area,
      sortValue: (r) => r.area,
    },
    {
      key: 'export',
      header: 'Export (USD bn)',
      align: 'right',
      render: (r) => r.exportValueBn.toFixed(2),
      sortValue: (r) => r.exportValueBn,
    },
    {
      key: 'share',
      header: 'Composition Share %',
      align: 'right',
      render: (r) => `${r.countrySharePct.toFixed(1)}%`,
      sortValue: (r) => r.countrySharePct,
      inlineBarPct: (r) => r.countrySharePct,
      barColor: 'rgba(47, 93, 69, 0.2)',
    },
  ];

  return (
    <div>
      <h1 className="page-title">08 Trade Composition</h1>
      <p className="page-finding">{findingText}</p>

      <div className="kpi-grid">
        <KpiCard
          label="Total Export Value"
          value={totalExp.toFixed(2)}
          unit="USD bn"
          subtext="Aggregate export trade pool"
          color="var(--color-export)"
        />
        <KpiCard
          label="Top 1 Nation Share"
          value={top1 ? `${top1.countrySharePct.toFixed(1)}%` : '—'}
          unit={top1?.area}
          subtext="Single largest exporter"
          color="var(--color-export)"
        />
        <KpiCard
          label="Top 2 Concentration"
          value={`${top2Share.toFixed(1)}%`}
          unit="combined"
          subtext="USA and Brazil combined export share"
          color="var(--ink)"
        />
      </div>

      <div style={{ marginTop: '24px', display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
        <div>
          <PieChart
            title="National Share of Global Agricultural Exports"
            data={pieData}
            unit="USD bn"
            selectedId={filters.crossFilterArea}
            onSelect={(id) => store.setCrossFilterArea(id)}
            height={400}
          />
        </div>

        <div>
          <DataTable
            title="National Export Composition Breakdown"
            data={sortedAreas}
            columns={columns}
            rowKey={(r) => r.area}
            selectedId={filters.crossFilterArea}
            onSelectRow={(id) => store.setCrossFilterArea(id)}
            maxRows={12}
          />
        </div>
      </div>
    </div>
  );
};

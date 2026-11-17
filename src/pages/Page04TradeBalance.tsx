import React from 'react';
import { YearAggregate, AreaAggregate } from '../types/data';
import { ColumnChart, BarChart, DataTable, ColumnDef, KpiCard } from '../components/charts';
import { useFilters } from '../lib/filterStore';

interface Page04Props {
  yearAggs: YearAggregate[];
  areaAggs: AreaAggregate[];
}

export const Page04TradeBalance: React.FC<Page04Props> = ({ yearAggs, areaAggs }) => {
  const [filters, store] = useFilters();

  const totalBal = areaAggs.reduce((acc, a) => acc + a.tradeBalanceBn, 0);
  const isSurplus = totalBal >= 0;

  const findingText = isSurplus
    ? `Agricultural trade generated a cumulative surplus of USD ${totalBal.toFixed(2)} bn across the active selection.`
    : `Agricultural trade yielded a net cumulative deficit of USD ${Math.abs(totalBal).toFixed(2)} bn across the active selection.`;

  // Column chart data: Balance by Year
  const colData = yearAggs.map((d) => ({
    id: d.year,
    label: String(d.year),
    value: d.tradeBalanceBn,
    color: d.tradeBalanceBn >= 0 ? 'var(--color-surplus)' : 'var(--color-deficit)',
  }));

  // Bar chart data: Area x Trade Balance (diverging)
  const sortedAreas = [...areaAggs].sort((a, b) => b.tradeBalanceBn - a.tradeBalanceBn);
  const barData = sortedAreas.map((a) => ({
    id: a.area,
    label: a.area,
    value: a.tradeBalanceBn,
    color: a.tradeBalanceBn >= 0 ? 'var(--color-surplus)' : 'var(--color-deficit)',
    sublabel: `Ratio: ${a.ratio !== null ? a.ratio.toFixed(2) : '—'}`,
  }));

  // Table columns: Area x (Export, Import, Balance, Ratio)
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
      key: 'import',
      header: 'Import (USD bn)',
      align: 'right',
      render: (r) => r.importValueBn.toFixed(2),
      sortValue: (r) => r.importValueBn,
    },
    {
      key: 'balance',
      header: 'Balance (USD bn)',
      align: 'right',
      render: (r) => {
        const isPos = r.tradeBalanceBn >= 0;
        return (
          <span style={{ color: isPos ? 'var(--color-surplus)' : 'var(--color-deficit)', fontWeight: 600 }}>
            {isPos ? '+' : ''}{r.tradeBalanceBn.toFixed(2)}
          </span>
        );
      },
      sortValue: (r) => r.tradeBalanceBn,
    },
    {
      key: 'ratio',
      header: 'Exp/Imp Ratio',
      align: 'right',
      render: (r) => (r.ratio !== null ? r.ratio.toFixed(2) : '—'),
      sortValue: (r) => r.ratio ?? 0,
    },
  ];

  return (
    <div>
      <h1 className="page-title">04 Trade Balance</h1>
      <p className="page-finding">{findingText}</p>

      <div className="kpi-grid">
        <KpiCard
          label="Cumulative Balance"
          value={`${isSurplus ? '+' : ''}${totalBal.toFixed(2)}`}
          unit="USD bn"
          subtext={isSurplus ? 'Net export surplus' : 'Net import deficit'}
          color={isSurplus ? 'var(--color-surplus)' : 'var(--color-deficit)'}
        />
        <KpiCard
          label="Top Surplus Country"
          value={sortedAreas[0]?.area || '—'}
          unit={sortedAreas[0] ? `+${sortedAreas[0].tradeBalanceBn.toFixed(1)} bn` : ''}
          subtext="Largest net exporter"
          color="var(--color-surplus)"
        />
        <KpiCard
          label="Top Deficit Country"
          value={sortedAreas[sortedAreas.length - 1]?.area || '—'}
          unit={sortedAreas[sortedAreas.length - 1] ? `${sortedAreas[sortedAreas.length - 1].tradeBalanceBn.toFixed(1)} bn` : ''}
          subtext="Largest net importer"
          color="var(--color-deficit)"
        />
      </div>

      <div style={{ marginTop: '24px' }}>
        <ColumnChart
          title="Net Trade Balance by Year (2000–2024)"
          data={colData}
          unit="USD bn"
          diverging
          height={280}
        />
      </div>

      <div style={{ marginTop: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div>
          <BarChart
            title="Trade Balance by Nation (Surplus vs Deficit)"
            data={barData}
            unit="USD bn"
            diverging
            selectedId={filters.crossFilterArea}
            onSelect={(id) => store.setCrossFilterArea(id)}
            height={400}
            maxBars={12}
          />
        </div>

        <div>
          <DataTable
            title="National Trade Balance Ledger"
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
